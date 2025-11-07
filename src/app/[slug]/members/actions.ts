"use server"

import { companyTable, relationTable } from "@/drizzle/app"
import { db } from "@/lib/drizzle"
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

  await db
    .update(relationTable)
    .set({ role: newRole })
    .where(eq(relationTable.id, memberId))

  revalidatePath(`/${slug}/members`)
}
