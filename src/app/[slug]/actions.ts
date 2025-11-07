"use server"

import { companyTable } from "@/drizzle/app"
import { db } from "@/lib/drizzle"
import { storage } from "@/lib/storage"
import { requireCompanyAccess } from "@/utils/permissions"
import { protect } from "@/utils/server"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { eq } from "drizzle-orm"

export const sign = async (key: string) => {
  const session = await protect()
  const slug = key.split("/")[0]

  const company = await db.query.companyTable.findFirst({
    where: eq(companyTable.slug, slug),
  })

  if (!company) throw Error("Company not found")

  await requireCompanyAccess(session.user.id, company.id)

  const command = new GetObjectCommand({
    Bucket: "humm-bucket",
    Key: key,
  })

  return await getSignedUrl(storage, command, { expiresIn: 3600 })
}
