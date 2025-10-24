"use server"

import { storage } from "@/lib/storage"
import { protect } from "@/utils/server"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export const sign = async (key: string) => {
  await protect()

  const command = new GetObjectCommand({
    Bucket: "humm-bucket",
    Key: key,
  })

  return await getSignedUrl(storage, command, { expiresIn: 3600 })
}
