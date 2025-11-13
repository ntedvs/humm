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
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold text-text">User Management</h1>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-sm font-semibold text-text">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text">
                Role
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm text-text">{user.email}</td>
                <td className="px-4 py-3 text-sm text-text">{user.name}</td>
                <td className="px-4 py-3">
                  <RoleSelect userId={user.id} currentRole={user.role} />
                </td>
                <td className="px-4 py-3 text-sm text-muted">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
