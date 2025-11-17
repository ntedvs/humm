import { userTable } from "@/drizzle/auth"
import { auth } from "@/lib/auth"
import { db } from "@/lib/drizzle"
import { protect } from "@/utils/server"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import Link from "next/link"

export default async function Settings() {
  const session = await protect()

  const user = await db.query.userTable.findFirst({
    where: eq(userTable.id, session.user.id),
  })

  if (!user) throw Error("User not found")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to dashboard
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">
              Account Settings
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl space-y-8 px-6 py-12">
        {/* Name Section */}
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Name</h2>
          <form
            action={async (fd) => {
              "use server"

              const session = await protect()
              const name = fd.get("name") as string

              if (!name.trim()) throw Error("Name cannot be empty")

              await db
                .update(userTable)
                .set({ name: name.trim() })
                .where(eq(userTable.id, session.user.id))

              revalidatePath("/settings")
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="name" className="label">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                defaultValue={user.name}
                required
                className="input"
              />
            </div>
            <button className="btn btn-primary">Update Name</button>
          </form>
        </div>

        {/* Email Section */}
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Email</h2>
          <form
            action={async (fd) => {
              "use server"

              const session = await protect()
              const email = fd.get("email") as string

              if (!email.trim()) throw Error("Email cannot be empty")

              // Check if email already exists
              const existing = await db.query.userTable.findFirst({
                where: eq(userTable.email, email.trim().toLowerCase()),
              })

              if (existing && existing.id !== session.user.id) {
                throw Error("Email already in use")
              }

              await db
                .update(userTable)
                .set({ email: email.trim().toLowerCase() })
                .where(eq(userTable.id, session.user.id))

              revalidatePath("/settings")
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                required
                className="input"
              />
            </div>
            <button className="btn btn-primary">Update Email</button>
          </form>
        </div>

        {/* Password Section */}
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Password</h2>
          <form
            action={async (fd) => {
              "use server"

              const session = await protect()
              const currentPassword = fd.get("currentPassword") as string
              const newPassword = fd.get("newPassword") as string
              const confirmPassword = fd.get("confirmPassword") as string

              if (newPassword !== confirmPassword) {
                throw Error("New passwords do not match")
              }

              if (newPassword.length < 8) {
                throw Error("Password must be at least 8 characters")
              }

              // Use better-auth API to change password
              try {
                await auth.api.changePassword({
                  body: {
                    currentPassword,
                    newPassword,
                    revokeOtherSessions: false,
                  },
                  headers: new Headers({
                    cookie: `better-auth.session_token=${session.session.token}`,
                  }),
                })
              } catch (error) {
                throw Error(
                  error instanceof Error
                    ? error.message
                    : "Failed to change password. Check your current password.",
                )
              }

              revalidatePath("/settings")
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="currentPassword" className="label">
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                className="input"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="label">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={8}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                className="input"
              />
            </div>
            <button className="btn btn-primary">Change Password</button>
          </form>
        </div>
      </main>
    </div>
  )
}
