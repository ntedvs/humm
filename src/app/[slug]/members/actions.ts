"use server"

import { companyTable, relationTable } from "@/drizzle/app"
import { db } from "@/lib/drizzle"
import { logActivity } from "@/utils/activity"
import { requireCompanyAccess } from "@/utils/permissions"
import { protect } from "@/utils/server"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export const changeRole = async (
  slug: string,
  memberId: string,
  newRole: "owner" | "editor" | "viewer",
) => {
  const session = await protect()

  const company = await db.query.companyTable.findFirst({
    where: eq(companyTable.slug, slug),
  })

  if (!company) throw Error("Company not found")

  await requireCompanyAccess(session.user.id, company.id, "owner")

  // Get current member info before update
  const member = await db.query.relationTable.findFirst({
    where: eq(relationTable.id, memberId),
    with: { user: true },
  })

  if (!member) throw Error("Member not found")

  const oldRole = member.role

  await db
    .update(relationTable)
    .set({ role: newRole })
    .where(eq(relationTable.id, memberId))

  // Log activity
  await logActivity("role_change", company.id, session.user.id, {
    targetUserName: member.user.name,
    oldRole,
    newRole,
  })

  revalidatePath(`/${slug}/members`)
}
