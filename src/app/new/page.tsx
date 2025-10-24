import { companyTable } from "@/drizzle/app"
import { db } from "@/lib/drizzle"
import slugify from "@sindresorhus/slugify"
import { redirect } from "next/navigation"

export default function New() {
  return (
    <>
      <h1>Home</h1>

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
      >
        <label htmlFor="name">Company Name</label>
        <input id="name" name="name" required />

        <button>Create</button>
      </form>
    </>
  )
}
