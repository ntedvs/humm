import { companyTable, uploadTable } from "@/drizzle/app"
import { analyzePitchDeck } from "@/lib/ai"
import { db } from "@/lib/drizzle"
import { storage } from "@/lib/storage"
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
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold text-text">
        Upload to {company.name}
      </h1>

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
        className="card space-y-4"
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
            <option value="material">Material</option>
            <option value="work">Work</option>
          </select>
        </div>

        <button className="btn btn-primary w-full">Upload</button>
      </form>
    </div>
  )
}
