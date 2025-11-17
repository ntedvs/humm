import { auth } from "@/lib/auth"
import { protect } from "@/utils/server"
import { redirect } from "next/navigation"

export default async function Invite() {
  await protect(true)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-semibold text-gray-900">
            Invite User
          </h1>
          <p className="text-gray-600">Create a new user account</p>
        </div>
        <div className="card">
          <form
            action={async (fd) => {
              "use server"

              const { email, name, password } = Object.fromEntries(fd) as {
                [k: string]: string
              }

              await auth.api.createUser({ body: { email, password, name } })
              redirect("/")
            }}
            className="space-y-5"
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

            <div className="flex gap-3 pt-4">
              <a href="/" className="btn btn-secondary">
                Cancel
              </a>
              <button className="btn btn-primary flex-1">Create User</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
