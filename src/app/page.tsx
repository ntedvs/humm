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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Humm</h1>
          <nav className="flex items-center gap-4">
            <Link href="/settings" className="btn btn-ghost btn-sm">
              Settings
            </Link>
            {session.user.role === "admin" && (
              <>
                <Link href="/admin" className="btn btn-ghost btn-sm">
                  Manage Users
                </Link>
                <Link href="/new" className="btn btn-primary btn-sm">
                  Create Company
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-semibold text-gray-900">
            My Companies
          </h2>
          <p className="text-gray-600">
            Select a company to view and manage pitch decks
          </p>
        </div>

        {relations.length === 0 ? (
          <div className="card py-12 text-center">
            <p className="mb-4 text-gray-600">
              You're not a member of any companies yet.
            </p>
            {session.user.role === "admin" && (
              <Link href="/new" className="btn btn-primary">
                Create Your First Company
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relations.map(({ company, role }) => (
              <Link
                key={company.id}
                href={`/${company.slug}`}
                className="card-hover group"
              >
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 transition-colors group-hover:text-primary-600">
                    {company.name}
                  </h3>
                  <span className="badge badge-primary">{role}</span>
                </div>
                <p className="text-sm text-gray-600">View dashboard →</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
