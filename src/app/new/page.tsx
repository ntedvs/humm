import { companyTable } from "@/drizzle/app"
import { db } from "@/lib/drizzle"
import { protect } from "@/utils/server"
import slugify from "@sindresorhus/slugify"
import { redirect } from "next/navigation"

export default async function New() {
  await protect()

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold text-text">Create Company</h1>

      <form
        action={async (fd) => {
          "use server"

          const name = fd.get("name") as string

          const [company] = await db
            .insert(companyTable)
            .values({ slug: slugify(name), name })
            .returning()

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
