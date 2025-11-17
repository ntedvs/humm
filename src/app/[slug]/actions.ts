"use server"

import { companyTable, uploadTable } from "@/drizzle/app"
import { db } from "@/lib/drizzle"
import { storage } from "@/lib/storage"
import { logActivity } from "@/utils/activity"
import { canDelete, requireCompanyAccess } from "@/utils/permissions"
import { protect } from "@/utils/server"
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export const sign = async (key: string) => {
  const session = await protect()
  const slug = key.split("/")[0]

  const company = await db.query.companyTable.findFirst({
    where: eq(companyTable.slug, slug),
  })

  if (!company) throw Error("Company not found")

  await requireCompanyAccess(session.user.id, company.id)

  const command = new GetObjectCommand({
    Bucket: "humm-bucket",
    Key: key,
  })

  return await getSignedUrl(storage, command, { expiresIn: 3600 })
}

export const deleteFile = async (uploadId: string, companySlug: string) => {
  const session = await protect()

  // Query upload with company data
  const upload = await db.query.uploadTable.findFirst({
    where: eq(uploadTable.id, uploadId),
    with: { company: true },
  })

  if (!upload) throw Error("File not found")
  if (upload.company.slug !== companySlug) throw Error("Company mismatch")

  // Verify company access
  await requireCompanyAccess(session.user.id, upload.companyId)

  // Check delete permission (owner or uploader)
  const hasPermission = await canDelete(
    session.user.id,
    upload.companyId,
    upload.userId,
  )

  if (!hasPermission)
    throw Error("Insufficient permissions to delete this file")

  // Delete from S3 first
  const s3Key = `${companySlug}/${uploadId}.${upload.extension}`

  try {
    await storage.send(
      new DeleteObjectCommand({
        Bucket: "humm-bucket",
        Key: s3Key,
      }),
    )
  } catch (error) {
    // Log S3 error but continue if file doesn't exist (404)
    console.error("S3 deletion error:", error)
    // If it's not a 404, re-throw
    if (error instanceof Error && !error.message.includes("NoSuchKey")) {
      throw Error("Failed to delete file from storage")
    }
    // File doesn't exist in S3, continue to DB deletion
  }

  // Delete from database
  await db.delete(uploadTable).where(eq(uploadTable.id, uploadId))

  // Log activity
  await logActivity("file_delete", upload.companyId, session.user.id, {
    fileName: upload.name,
  })

  // Revalidate company page to show updated file list
  revalidatePath(`/${companySlug}`)
}

export const retryAnalysis = async (uploadId: string, companySlug: string) => {
  const session = await protect()

  // Query upload with company data
  const upload = await db.query.uploadTable.findFirst({
    where: eq(uploadTable.id, uploadId),
    with: { company: true },
  })

  if (!upload) throw Error("File not found")
  if (upload.company.slug !== companySlug) throw Error("Company mismatch")
  if (upload.extension !== "pdf") throw Error("Only PDFs can be analyzed")
  if (!upload.error) throw Error("Upload has no error to retry")

  // Verify company access (editor required)
  await requireCompanyAccess(session.user.id, upload.companyId, "editor")

  // Get file from S3
  const s3Key = `${companySlug}/${uploadId}.${upload.extension}`
  const command = new GetObjectCommand({
    Bucket: "humm-bucket",
    Key: s3Key,
  })

  const { Body } = await storage.send(command)
  if (!Body) throw Error("File not found in storage")

  // Convert stream to buffer
  const chunks: Uint8Array[] = []
  for await (const chunk of Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk)
  }
  const buffer = Buffer.concat(chunks)

  // Clear error and retry analysis
  await db
    .update(uploadTable)
    .set({ error: null })
    .where(eq(uploadTable.id, uploadId))

  // Import analyzePitchDeck
  const { analyzePitchDeck } = await import("@/lib/ai")

  try {
    const result = await analyzePitchDeck(buffer, upload.name)

    // Update with success
    await db
      .update(uploadTable)
      .set({ summary: result.summary, processed: new Date() })
      .where(eq(uploadTable.id, uploadId))

    // Update company fields if needed
    const company = upload.company
    const updates: {
      description?: string
      stage?: string
      valuation?: string
      askingAmount?: string
    } = {}

    if (company.description === null && result.description !== null) {
      updates.description = result.description
    }
    if (company.stage === null && result.stage !== null) {
      updates.stage = result.stage
    }
    if (company.valuation === null && result.valuation !== null) {
      updates.valuation = result.valuation
    }
    if (company.askingAmount === null && result.askingAmount !== null) {
      updates.askingAmount = result.askingAmount
    }

    if (Object.keys(updates).length > 0) {
      await db
        .update(companyTable)
        .set(updates)
        .where(eq(companyTable.id, company.id))
    }
  } catch (error) {
    // Update with new error
    await db
      .update(uploadTable)
      .set({
        error: error instanceof Error ? error.message : "Analysis failed",
      })
      .where(eq(uploadTable.id, uploadId))
  }

  revalidatePath(`/${companySlug}`)
}
