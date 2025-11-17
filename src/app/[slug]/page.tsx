import { companyTable, uploadTable } from "@/drizzle/app"
import { db } from "@/lib/drizzle"
import { canDelete, getRole, requireCompanyAccess } from "@/utils/permissions"
import { protect } from "@/utils/server"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { notFound } from "next/navigation"
import ActivityFeed from "./activity-feed"
import CompanyInfo from "./company-info"
import FilterableUploads from "./filterable-uploads"

type Props = { params: Promise<{ slug: string }> }

export default async function Company({ params }: Props) {
  const session = await protect()

  const { slug } = await params

  const company = await db.query.companyTable.findFirst({
    where: eq(companyTable.slug, slug),
    with: {
      uploads: {
        with: { user: true },
        orderBy: desc(uploadTable.createdAt),
      },
    },
  })

  if (!company) notFound()

  await requireCompanyAccess(session.user.id, company.id)
  const role = await getRole(session.user.id, company.id)

  // Build canDelete map for all uploads
  const canDeleteMap: Record<string, boolean> = {}
  for (const upload of company.uploads) {
    canDeleteMap[upload.id] = await canDelete(
      session.user.id,
      company.id,
      upload.userId,
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">
              {company.name}
            </h1>
          </div>
          <nav className="flex items-center gap-3">
            {role === "owner" && (
              <Link
                href={`/${company.slug}/members`}
                className="btn btn-ghost btn-sm"
              >
                Team
              </Link>
            )}
            <Link
              href={`/${company.slug}/upload`}
              className="btn btn-primary btn-sm"
            >
              Upload
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Company Info & Activity */}
          <div className="space-y-6 lg:col-span-1">
            <CompanyInfo
              company={company}
              isOwner={role === "owner"}
              updateAction={async (formData) => {
                "use server"

                const session = await protect()
                await requireCompanyAccess(session.user.id, company.id, "owner")

                const description = formData.get("description") as string
                const stage = formData.get("stage") as string
                const valuationStr = formData.get("valuation") as string
                const askingAmountStr = formData.get("askingAmount") as string

                const updates: {
                  description?: string | null
                  stage?: string | null
                  valuation?: string | null
                  askingAmount?: string | null
                } = {}

                updates.description = description.trim() || null
                updates.stage = stage.trim() || null
                updates.valuation = valuationStr.trim() || null
                updates.askingAmount = askingAmountStr.trim() || null

                await db
                  .update(companyTable)
                  .set(updates)
                  .where(eq(companyTable.id, company.id))

                revalidatePath(`/${company.slug}`)
              }}
            />

            {role === "owner" && (
              <div className="card">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Recent Activity
                </h2>
                <ActivityFeed companyId={company.id} limit={10} />
              </div>
            )}
          </div>

          {/* Right Column - Files */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="mb-6 text-lg font-semibold text-gray-900">
                Files
              </h2>
              <FilterableUploads
                uploads={company.uploads}
                companySlug={company.slug}
                userId={session.user.id}
                canDeleteMap={canDeleteMap}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
