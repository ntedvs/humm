import { companyTable, uploadTable } from "@/drizzle/app"
import { auth } from "@/lib/auth"
import { db } from "@/lib/drizzle"
import { storage } from "@/lib/storage"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { eq } from "drizzle-orm"
import { fileTypeFromBuffer } from "file-type"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"

type Props = { params: Promise<{ slug: string }> }

export default async function Upload({ params }: Props) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/")

  const { slug } = await params

  const company = await db.query.companyTable.findFirst({
    where: eq(companyTable.slug, slug),
  })

  if (!company) notFound()

  return (
    <>
      <h1>Upload</h1>

      <form
        action={async (fd) => {
          "use server"

          const file = fd.get("file") as File
          const type = fd.get("type") as "material" | "work"

          const [upload] = await db
            .insert(uploadTable)
            .values({
              name: file.name,
              type,
              companyId: company.id,
              userId: session.user.id,
            })
            .returning()

          const buffer = Buffer.from(await file.arrayBuffer())
          const { ext, mime } = (await fileTypeFromBuffer(buffer))!

          await storage.send(
            new PutObjectCommand({
              Bucket: "humm-bucket",
              Key: slug + "/" + upload.id + "." + ext,
              Body: buffer,
              ContentType: mime,
            }),
          )

          redirect("/" + slug)
        }}
      >
        <label htmlFor="file">File</label>
        <input id="file" name="file" type="file" required />

        <label htmlFor="type">Type</label>
        <select id="type" name="type">
          <option value="material">Material</option>
          <option value="work">Work</option>
        </select>

        <button>Upload</button>
      </form>
    </>
  )
}
