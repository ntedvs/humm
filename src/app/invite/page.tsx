import { auth } from "@/lib/auth"
import { protect } from "@/utils/server"
import { redirect } from "next/navigation"

export default async function Invite() {
  await protect(true)

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold text-text">Invite User</h1>

      <form
        action={async (fd) => {
          "use server"

          const { email, name, password } = Object.fromEntries(fd) as {
            [k: string]: string
          }

          await auth.api.createUser({ body: { email, password, name } })
          redirect("/")
        }}
        className="card space-y-4"
      >
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input"
          />
        </div>

        <div>
          <label htmlFor="name" className="label">
            Name
          </label>
          <input id="name" name="name" required className="input" />
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input id="password" name="password" required className="input" />
        </div>

        <button className="btn btn-primary w-full">Create User</button>
      </form>
    </div>
  )
}
