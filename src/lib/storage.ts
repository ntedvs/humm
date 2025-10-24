import { S3Client } from "@aws-sdk/client-s3"

export const storage = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.STORAGE_ID!,
    secretAccessKey: process.env.STORAGE_SECRET!,
  },
})
