import { relationTable } from "@/drizzle/app"
import { db } from "@/lib/drizzle"
import { and, eq } from "drizzle-orm"

type Role = "owner" | "editor" | "viewer"

export const getRole = async (userId: string, companyId: string) => {
  const relation = await db.query.relationTable.findFirst({
    where: and(
      eq(relationTable.userId, userId),
      eq(relationTable.companyId, companyId),
    ),
  })

  return relation?.role ?? null
}

export const hasMinimumRole = async (
  userId: string,
  companyId: string,
  min: Role,
) => {
  const role = await getRole(userId, companyId)
  if (!role) return false

  const hierarchy = { viewer: 1, editor: 2, owner: 3 }
  return hierarchy[role] >= hierarchy[min]
}

export const requireCompanyAccess = async (
  userId: string,
  companyId: string,
  min: Role = "viewer",
) => {
  const access = await hasMinimumRole(userId, companyId, min)
  if (!access) throw Error("insufficient permissions")
}

export const canView = async (userId: string, companyId: string) => {
  return hasMinimumRole(userId, companyId, "viewer")
}

export const canUpload = async (userId: string, companyId: string) => {
  return hasMinimumRole(userId, companyId, "editor")
}

export const canManage = async (userId: string, companyId: string) => {
  return hasMinimumRole(userId, companyId, "owner")
}

export const canDelete = async (
  userId: string,
  companyId: string,
  uploaderId: string | null,
) => {
  const owner = await hasMinimumRole(userId, companyId, "owner")
  const uploader = uploaderId === userId

  return owner || uploader
}
