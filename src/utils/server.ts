import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export const protect = async (admin?: boolean) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) redirect("/signin")
  if (admin && session.user.role !== "admin") redirect("/")

  return session
}
