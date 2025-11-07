import { companyTable } from "@/drizzle/app"
import { db } from "@/lib/drizzle"
import { getRole, requireCompanyAccess } from "@/utils/permissions"
import { protect } from "@/utils/server"
import { eq } from "drizzle-orm"
import Link from "next/link"
import { notFound } from "next/navigation"
import File from "./file"
import SummaryModal from "./summary-modal"

type Props = { params: Promise<{ slug: string }> }

export default async function Company({ params }: Props) {
  const session = await protect()

  const { slug } = await params

  const company = await db.query.companyTable.findFirst({
    where: eq(companyTable.slug, slug),
    with: { uploads: { with: { user: true } } },
  })

  if (!company) notFound()

  await requireCompanyAccess(session.user.id, company.id)
  const role = await getRole(session.user.id, company.id)

  const materials = company.uploads.filter(
    (upload) => upload.type === "material",
  )
  const work = company.uploads.filter((upload) => upload.type === "work")

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text">{company.name}</h1>
        <div className="flex gap-2">
          {role === "owner" && (
            <Link
              href={`/${company.slug}/members`}
              className="btn btn-secondary"
            >
              Team
            </Link>
          )}
          <Link href={`/${company.slug}/upload`} className="btn btn-primary">
            Upload
          </Link>
        </div>
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
                <div className="flex justify-end gap-2">
                  {upload.extension === "pdf" && (
                    <>
                      {upload.summary && <SummaryModal upload={upload} />}
                      {!upload.summary && !upload.error && (
                        <span className="text-sm text-text-muted">
                          Analyzing...
                        </span>
                      )}
                      {upload.error && (
                        <span
                          className="text-sm text-red-500"
                          title={upload.error}
                        >
                          Analysis failed
                        </span>
                      )}
                    </>
                  )}
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
                <div className="flex justify-end gap-2">
                  {upload.extension === "pdf" && (
                    <>
                      {upload.summary && <SummaryModal upload={upload} />}
                      {!upload.summary && !upload.error && (
                        <span className="text-sm text-text-muted">
                          Analyzing...
                        </span>
                      )}
                      {upload.error && (
                        <span
                          className="text-sm text-red-500"
                          title={upload.error}
                        >
                          Analysis failed
                        </span>
                      )}
                    </>
                  )}
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
