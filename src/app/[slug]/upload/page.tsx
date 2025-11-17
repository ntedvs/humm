import { companyTable, uploadTable } from "@/drizzle/app"
import { analyzePitchDeck } from "@/lib/ai"
import { db } from "@/lib/drizzle"
import { storage } from "@/lib/storage"
import { logActivity } from "@/utils/activity"
import { end } from "@/utils/client"
import { requireCompanyAccess } from "@/utils/permissions"
import { protect } from "@/utils/server"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { eq } from "drizzle-orm"
import { fileTypeFromBuffer } from "file-type"
import { notFound, redirect } from "next/navigation"
import FileInput from "./file-input"

type Props = { params: Promise<{ slug: string }> }

export default async function Upload({ params }: Props) {
  const session = await protect()

  const { slug } = await params

  const company = await db.query.companyTable.findFirst({
    where: eq(companyTable.slug, slug),
  })

  if (!company) notFound()

  await requireCompanyAccess(session.user.id, company.id, "editor")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center gap-6">
            <a
              href={`/${slug}`}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back
            </a>
            <h1 className="text-2xl font-semibold text-gray-900">
              Upload File
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="card mx-auto max-w-2xl">
          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Upload to {company.name}
            </h2>
            <p className="text-sm text-gray-600">Maximum file size: 50 MB</p>
          </div>

          <form
            action={async (fd) => {
              "use server"

              const session = await protect()
              await requireCompanyAccess(session.user.id, company.id, "editor")

              const file = fd.get("file") as File
              const type = fd.get("type") as "material" | "work"

              const buffer = Buffer.from(await file.arrayBuffer())
              const detected = await fileTypeFromBuffer(buffer)

              const [ext, mime] = detected
                ? [detected.ext, detected.mime]
                : [end(file.name), file.type]

              const [upload] = await db
                .insert(uploadTable)
                .values({
                  name: file.name,
                  type,
                  extension: ext,
                  companyId: company.id,
                  userId: session.user.id,
                })
                .returning()

              await storage.send(
                new PutObjectCommand({
                  Bucket: "humm-bucket",
                  Key: slug + "/" + upload.id + "." + ext,
                  Body: buffer,
                  ContentType: mime,
                }),
              )

              // Log activity
              await logActivity("file_upload", company.id, session.user.id, {
                fileName: file.name,
                fileType: type,
              })

              // Run PDF analysis async after redirect
              if (ext === "pdf" && type === "material") {
                analyzePitchDeck(buffer, file.name)
                  .then(async (result) => {
                    // Update upload with summary
                    await db
                      .update(uploadTable)
                      .set({ summary: result.summary, processed: new Date() })
                      .where(eq(uploadTable.id, upload.id))

                    // Conditionally update company fields (only if currently null)
                    const updates: {
                      description?: string
                      stage?: string
                      valuation?: string
                      askingAmount?: string
                    } = {}

                    if (
                      company.description === null &&
                      result.description !== null
                    ) {
                      updates.description = result.description
                    }
                    if (company.stage === null && result.stage !== null) {
                      updates.stage = result.stage
                    }
                    if (
                      company.valuation === null &&
                      result.valuation !== null
                    ) {
                      updates.valuation = result.valuation
                    }
                    if (
                      company.askingAmount === null &&
                      result.askingAmount !== null
                    ) {
                      updates.askingAmount = result.askingAmount
                    }

                    // Only update company if there are fields to update
                    if (Object.keys(updates).length > 0) {
                      await db
                        .update(companyTable)
                        .set(updates)
                        .where(eq(companyTable.id, company.id))
                    }
                  })
                  .catch((error) => {
                    return db
                      .update(uploadTable)
                      .set({
                        error:
                          error instanceof Error
                            ? error.message
                            : "Analysis failed",
                      })
                      .where(eq(uploadTable.id, upload.id))
                  })
              }

              redirect("/" + slug)
            }}
            className="space-y-5"
          >
            <div>
              <label className="label">File</label>
              <FileInput />
            </div>

            <div>
              <label htmlFor="type" className="label">
                Type
              </label>
              <select id="type" name="type" className="select">
                <option value="material">Material (Pitch Deck)</option>
                <option value="work">Work (Internal File)</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <a href={`/${slug}`} className="btn btn-secondary">
                Cancel
              </a>
              <button className="btn btn-primary">Upload</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
