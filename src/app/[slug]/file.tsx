"use client"

import { Upload } from "@/drizzle/app"
import { ExternalLink } from "lucide-react"
import { sign } from "./actions"

type Props = { upload: Upload; companySlug: string }

export default function File({ upload, companySlug }: Props) {
  return (
    <>
      <button
        onClick={async () =>
          window.open(await sign(companySlug + "/" + upload.id))
        }
      >
        <ExternalLink />
      </button>
    </>
  )
}
