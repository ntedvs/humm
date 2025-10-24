import { companyTable } from "@/drizzle/app"
import { db } from "@/lib/drizzle"
import { protect } from "@/utils/server"
import { eq } from "drizzle-orm"
import Link from "next/link"
import { notFound } from "next/navigation"
import File from "./file"

type Props = { params: Promise<{ slug: string }> }

export default async function Company({ params }: Props) {
  await protect()

  const { slug } = await params

  const company = await db.query.companyTable.findFirst({
    where: eq(companyTable.slug, slug),
    with: { uploads: { with: { user: true } } },
  })

  if (!company) notFound()

  const materials = company.uploads.filter((upload) => upload.type === "material")
  const work = company.uploads.filter((upload) => upload.type === "work")

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text">{company.name}</h1>
        <Link href={"/" + company.slug + "/upload"} className="btn btn-primary">
          Upload
        </Link>
      </div>

      {/* Materials Section */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-text">Materials</h2>
        {materials.length === 0 ? (
          <p className="text-text-muted">No materials yet</p>
        ) : (
          <div className="rounded-lg border border-border bg-background">
            {materials.map((upload, index) => (
              <div
                key={upload.id}
                className={`grid grid-cols-3 items-center gap-4 px-6 py-4 transition-colors hover:bg-surface ${
                  index !== materials.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <p className="font-medium text-text">{upload.name}</p>
                <p className="text-sm text-text-muted">
                  {upload.user ? upload.user.name : "Deleted"}
                </p>
                <div className="flex justify-end">
                  <File upload={upload} companySlug={company.slug} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Work Section */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-text">Work</h2>
        {work.length === 0 ? (
          <p className="text-text-muted">No work files yet</p>
        ) : (
          <div className="rounded-lg border border-border bg-background">
            {work.map((upload, index) => (
              <div
                key={upload.id}
                className={`grid grid-cols-3 items-center gap-4 px-6 py-4 transition-colors hover:bg-surface ${
                  index !== work.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <p className="font-medium text-text">{upload.name}</p>
                <p className="text-sm text-text-muted">
                  {upload.user ? upload.user.name : "Deleted"}
                </p>
                <div className="flex justify-end">
                  <File upload={upload} companySlug={company.slug} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
