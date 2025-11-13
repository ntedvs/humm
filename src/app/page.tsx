import { relationTable } from "@/drizzle/app"
import { db } from "@/lib/drizzle"
import { protect } from "@/utils/server"
import { eq } from "drizzle-orm"
import Link from "next/link"

export default async function Home() {
  const session = await protect()

  const relations = await db.query.relationTable.findMany({
    where: eq(relationTable.userId, session.user.id),
    with: { company: true },
    orderBy: (relations, { desc }) => [desc(relations.role)],
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text">My Companies</h1>
        {session.user.role === "admin" && (
          <div className="flex gap-2">
            <Link href="/admin" className="btn">
              Manage Users
            </Link>
            <Link href="/new" className="btn btn-primary">
              Create Company
            </Link>
          </div>
        )}
      </div>

      {relations.length === 0 ? (
        <p className="text-text-muted">
          You're not a member of any companies yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {relations.map(({ company, role }) => (
            <Link
              key={company.id}
              href={`/${company.slug}`}
              className="card transition-colors hover:border-accent"
            >
              <h2 className="text-xl font-semibold text-text">
                {company.name}
              </h2>
              <p className="mt-2 text-sm text-text-muted capitalize">{role}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
