import { companyTable, relationTable } from "@/drizzle/app"
import { db } from "@/lib/drizzle"
import { protect } from "@/utils/server"
import slugify from "@sindresorhus/slugify"
import { redirect } from "next/navigation"

export default async function New() {
  await protect(true)

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold text-text">Create Company</h1>

      <form
        action={async (fd) => {
          "use server"

          const session = await protect(true)
          const name = fd.get("name") as string

          const [company] = await db
            .insert(companyTable)
            .values({ slug: slugify(name), name })
            .returning()

          await db.insert(relationTable).values({
            companyId: company.id,
            userId: session.user.id,
            role: "owner",
          })

          redirect("/" + company.slug)
        }}
        className="card space-y-4"
      >
        <div>
          <label htmlFor="name" className="label">
            Company Name
          </label>
          <input id="name" name="name" required className="input" />
        </div>

        <button className="btn btn-primary w-full">Create</button>
      </form>
    </div>
  )
}
