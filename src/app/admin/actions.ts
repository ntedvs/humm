"use server"

import { userTable } from "@/drizzle/auth"
import { db } from "@/lib/drizzle"
import { protect } from "@/utils/server"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function updateUserRole(userId: string, role: string) {
  await protect(true)

  const user = await db.query.userTable.findFirst({
    where: eq(userTable.id, userId),
  })

  if (!user) {
    throw new Error("User not found")
  }

  if (user.role === "admin" && role !== "admin") {
    throw new Error("Cannot demote admin users")
  }

  await db
    .update(userTable)
    .set({ role })
    .where(eq(userTable.id, userId))

  revalidatePath("/admin")
}
