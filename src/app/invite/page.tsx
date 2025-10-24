import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function Invite() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "admin") redirect("/")

  return (
    <>
      <h1>Invite</h1>

      <form
        action={async (fd) => {
          "use server"

          const { email, name, password } = Object.fromEntries(fd) as {
            [k: string]: string
          }

          await auth.api.createUser({ body: { email, password, name } })
          redirect("/")
        }}
      >
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />

        <label htmlFor="name">Name</label>
        <input id="name" name="name" required />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" required />

        <button>Create</button>
      </form>
    </>
  )
}
