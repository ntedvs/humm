import { activityTable } from "@/drizzle/app"
import { db } from "@/lib/drizzle"
import { desc, eq } from "drizzle-orm"

type Props = {
  companyId: string
  limit?: number
}

export default async function ActivityFeed({ companyId, limit = 10 }: Props) {
  const activities = await db.query.activityTable.findMany({
    where: eq(activityTable.companyId, companyId),
    with: { user: true },
    orderBy: desc(activityTable.createdAt),
    limit,
  })

  if (activities.length === 0) {
    return <p className="text-sm text-gray-500">No recent activity</p>
  }

  const formatActivity = (activity: (typeof activities)[0]) => {
    const userName = activity.user?.name || "Deleted User"
    const metadata = activity.metadata as {
      fileName?: string
      fileType?: string
      targetUserName?: string
      targetUserEmail?: string
      oldRole?: string
      newRole?: string
      role?: string
    }

    switch (activity.type) {
      case "file_upload":
        return `${userName} uploaded ${metadata.fileName}`
      case "file_delete":
        return `${userName} deleted ${metadata.fileName}`
      case "member_add":
        return `${userName} added ${metadata.targetUserName} as ${metadata.role}`
      case "member_remove":
        return `${userName} removed ${metadata.targetUserName} (${metadata.role})`
      case "role_change":
        return `${userName} changed ${metadata.targetUserName}'s role from ${metadata.oldRole} to ${metadata.newRole}`
      default:
        return `${userName} performed an action`
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 7) {
      return date.toLocaleDateString()
    } else if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    } else {
      return "Just now"
    }
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="border-l-2 border-gray-200 py-1 pl-3">
          <p className="text-sm text-gray-900">{formatActivity(activity)}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {formatTime(activity.createdAt)}
          </p>
        </div>
      ))}
    </div>
  )
}
