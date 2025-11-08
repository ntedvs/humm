"use server"

import { companyTable, uploadTable } from "@/drizzle/app"
import { db } from "@/lib/drizzle"
import { storage } from "@/lib/storage"
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

  if (!hasPermission) throw Error("Insufficient permissions to delete this file")

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

  // Revalidate company page to show updated file list
  revalidatePath(`/${companySlug}`)
}
