import { companyTable, relationTable } from "@/drizzle/app"
import { db } from "@/lib/drizzle"
import { protect } from "@/utils/server"
import slugify from "@sindresorhus/slugify"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

export default async function New() {
  await protect(true)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-semibold text-gray-900">
            Create Company
          </h1>
          <p className="text-gray-600">
            Set up a new workspace for pitch deck management
          </p>
        </div>
        <div className="card">
          <form
            action={async (fd) => {
              "use server"

              const session = await protect(true)
              const name = fd.get("name") as string

              // Generate unique slug with collision handling
              let baseSlug = slugify(name)
              let slug = baseSlug
              let counter = 2

              // Check for existing slug and increment until unique
              while (true) {
                const existing = await db.query.companyTable.findFirst({
                  where: eq(companyTable.slug, slug),
                })

                if (!existing) break

                slug = `${baseSlug}-${counter}`
                counter++
              }

              const [company] = await db
                .insert(companyTable)
                .values({ slug, name })
                .returning()

              await db.insert(relationTable).values({
                companyId: company.id,
                userId: session.user.id,
                role: "owner",
              })

              redirect("/" + company.slug)
            }}
            className="space-y-5"
          >
            <div>
              <label htmlFor="name" className="label">
                Company Name
              </label>
              <input
                id="name"
                name="name"
                required
                className="input"
                placeholder="Acme Inc."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <a href="/" className="btn btn-secondary">
                Cancel
              </a>
              <button className="btn btn-primary flex-1">Create</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
