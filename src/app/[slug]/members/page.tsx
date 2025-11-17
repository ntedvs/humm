import { companyTable, relationTable } from "@/drizzle/app"
import { userTable } from "@/drizzle/auth"
import { db } from "@/lib/drizzle"
import { logActivity } from "@/utils/activity"
import { requireCompanyAccess } from "@/utils/permissions"
import { protect } from "@/utils/server"
import { and, eq } from "drizzle-orm"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import RoleSelect from "./role-select"

type Props = { params: Promise<{ slug: string }> }

export default async function Members({ params }: Props) {
  const session = await protect()
  const { slug } = await params

  const company = await db.query.companyTable.findFirst({
    where: eq(companyTable.slug, slug),
    with: {
      members: {
        with: { user: true },
        orderBy: (relations, { desc }) => [desc(relations.role)],
      },
    },
  })

  if (!company) notFound()

  await requireCompanyAccess(session.user.id, company.id, "owner")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-6">
            <Link
              href={`/${slug}`}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to {company.name}
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">
              Team Members
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Add Member Form */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Add Member
              </h2>
              <form
                action={async (fd) => {
                  "use server"

                  const session = await protect()
                  const email = fd.get("email") as string
                  const role = fd.get("role") as "owner" | "editor" | "viewer"

                  await requireCompanyAccess(
                    session.user.id,
                    company.id,
                    "owner",
                  )

                  const user = await db.query.userTable.findFirst({
                    where: eq(userTable.email, email),
                  })

                  if (!user) throw Error("User not found")

                  const existing = await db.query.relationTable.findFirst({
                    where: and(
                      eq(relationTable.userId, user.id),
                      eq(relationTable.companyId, company.id),
                    ),
                  })

                  if (existing) throw Error("User is already a member")

                  await db.insert(relationTable).values({
                    companyId: company.id,
                    userId: user.id,
                    role,
                  })

                  // Log activity
                  await logActivity("member_add", company.id, session.user.id, {
                    targetUserName: user.name,
                    targetUserEmail: user.email,
                    role,
                  })

                  redirect(`/${slug}/members`)
                }}
                className="space-y-4"
              >
                <div>
                  <label className="label">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="user@example.com"
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Role</label>
                  <select name="role" className="select">
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
                <button className="btn btn-primary w-full">Add Member</button>
              </form>
            </div>
          </div>

          {/* Members List */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="mb-6 text-lg font-semibold text-gray-900">
                Members ({company.members.length})
              </h2>
              <div className="space-y-3">
                {company.members.map((member) => (
                  <div
                    key={member.id}
                    className="card-flat flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {member.user.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {member.user.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <RoleSelect
                        slug={slug}
                        memberId={member.id}
                        currentRole={member.role}
                      />

                      <form
                        action={async () => {
                          "use server"

                          const session = await protect()
                          await requireCompanyAccess(
                            session.user.id,
                            company.id,
                            "owner",
                          )

                          const ownerCount = company.members.filter(
                            (m) => m.role === "owner",
                          ).length

                          if (member.role === "owner" && ownerCount === 1) {
                            throw Error("Cannot remove last owner")
                          }

                          // Log activity before deletion
                          await logActivity(
                            "member_remove",
                            company.id,
                            session.user.id,
                            {
                              targetUserName: member.user.name,
                              role: member.role,
                            },
                          )

                          await db
                            .delete(relationTable)
                            .where(eq(relationTable.id, member.id))

                          redirect(`/${slug}/members`)
                        }}
                      >
                        <button className="btn btn-danger btn-sm">
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
