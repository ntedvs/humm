import { userTable } from "@/drizzle/auth"
import { db } from "@/lib/drizzle"
import { protect } from "@/utils/server"
import { desc } from "drizzle-orm"
import RoleSelect from "./role-select"

export default async function Admin() {
  await protect(true)

  const users = await db.query.userTable.findMany({
    orderBy: desc(userTable.createdAt),
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back
            </a>
            <h1 className="text-2xl font-semibold text-gray-900">
              User Management
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <RoleSelect userId={user.id} currentRole={user.role} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
