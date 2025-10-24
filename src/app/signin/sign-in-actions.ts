"use server"

import { auth } from "@/lib/auth"
import { shape } from "@/utils/client"
import { redirect } from "next/navigation"

export const submit = async (fd: FormData) => {
  const { email, password } = shape(fd)
  await auth.api.signInEmail({ body: { email, password } })

  redirect("/")
}
