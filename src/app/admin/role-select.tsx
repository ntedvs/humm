"use client"

import { useRouter } from "next/navigation"
import { updateUserRole } from "./actions"

type Props = {
  userId: string
  currentRole: string | null
}

export default function RoleSelect({ userId, currentRole }: Props) {
  const router = useRouter()
  const isAdmin = currentRole === "admin"

  return (
    <select
      value={currentRole ?? "user"}
      onChange={async (e) => {
        await updateUserRole(userId, e.target.value)
        router.refresh()
      }}
      disabled={isAdmin}
      className="select"
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>
  )
}
