import { companyTable } from "@/drizzle/app"
import { db } from "@/lib/drizzle"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import File from "./file"

type Props = { params: Promise<{ slug: string }> }

export default async function Company({ params }: Props) {
  const { slug } = await params

  const company = await db.query.companyTable.findFirst({
    where: eq(companyTable.slug, slug),
    with: { uploads: { with: { user: true } } },
  })

  if (!company) notFound()

  return (
    <>
      <h1>{company.name}</h1>

      <p>Materials</p>
      <div>
        {company.uploads
          .filter((upload) => upload.type === "material")
          .map((upload) => {
            return (
              <div key={upload.id} className="grid grid-cols-3">
                <p>{upload.name}</p>
                <p>{upload.user ? upload.user.name : "Deleted"}</p>

                <File
                  upload={upload}
                  companySlug={company.slug}
                  key={upload.id}
                />
              </div>
            )
          })}
      </div>
    </>
  )
}
