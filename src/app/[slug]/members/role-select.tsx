"use client"

import { changeRole } from "./actions"

type Props = {
  slug: string
  memberId: string
  currentRole: "owner" | "editor" | "viewer"
}

export default function RoleSelect({ slug, memberId, currentRole }: Props) {
  return (
    <select
      name="role"
      defaultValue={currentRole}
      onChange={async (e) => {
        const newRole = e.target.value as "owner" | "editor" | "viewer"
        await changeRole(slug, memberId, newRole)
      }}
      className="select"
    >
      <option value="viewer">Viewer</option>
      <option value="editor">Editor</option>
      <option value="owner">Owner</option>
    </select>
  )
}
