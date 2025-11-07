import { companyTable, relationTable } from "@/drizzle/app"
import { userTable } from "@/drizzle/auth"
import { db } from "@/lib/drizzle"
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
    <div>
      <div className="mb-8">
        <Link
          href={`/${slug}`}
          className="text-sm text-text-muted hover:text-text"
        >
          ← Back to {company.name}
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-text">Team Members</h1>
      </div>

      {/* Add Member Form */}
      <div className="card mb-8">
        <h2 className="mb-4 text-lg font-semibold text-text">Add Member</h2>
        <form
          action={async (fd) => {
            "use server"

            const session = await protect()
            const email = fd.get("email") as string
            const role = fd.get("role") as "owner" | "editor" | "viewer"

            await requireCompanyAccess(session.user.id, company.id, "owner")

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

            redirect(`/${slug}/members`)
          }}
          className="grid grid-cols-[1fr_auto_auto] gap-2"
        >
          <input
            name="email"
            type="email"
            placeholder="user@example.com"
            required
            className="input"
          />
          <select name="role" className="select">
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="owner">Owner</option>
          </select>
          <button className="btn btn-primary whitespace-nowrap">
            Add Member
          </button>
        </form>
      </div>

      {/* Members List */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-text">
          Members ({company.members.length})
        </h2>
        <div className="space-y-2">
          {company.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded border border-border p-4"
            >
              <div>
                <p className="font-medium text-text">{member.user.name}</p>
                <p className="text-sm text-text-muted">{member.user.email}</p>
              </div>
              <div className="flex items-center gap-4">
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

                    await db
                      .delete(relationTable)
                      .where(eq(relationTable.id, member.id))

                    redirect(`/${slug}/members`)
                  }}
                >
                  <button className="btn btn-secondary">Remove</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
