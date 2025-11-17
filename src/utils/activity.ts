import { activityTable } from "@/drizzle/app"
import { db } from "@/lib/drizzle"

type ActivityType =
  | "file_upload"
  | "file_delete"
  | "member_add"
  | "member_remove"
  | "role_change"

type ActivityMetadata = {
  fileName?: string
  fileType?: string
  targetUserName?: string
  targetUserEmail?: string
  oldRole?: string
  newRole?: string
  role?: string
}

export async function logActivity(
  type: ActivityType,
  companyId: string,
  userId: string | null,
  metadata?: ActivityMetadata,
) {
  await db.insert(activityTable).values({
    type,
    companyId,
    userId,
    metadata: metadata || {},
  })
}
