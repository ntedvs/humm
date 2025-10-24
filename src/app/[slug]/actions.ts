"use server"

import { storage } from "@/lib/storage"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export const sign = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: "humm-bucket",
    Key: key + ".pdf",
  })

  return await getSignedUrl(storage, command, { expiresIn: 3600 })
}
