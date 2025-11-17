"use client"

import { Upload } from "@/drizzle/app"
import { sign } from "./actions"

type Props = { upload: Upload; companySlug: string }

export default function File({ upload, companySlug }: Props) {
  return (
    <button
      onClick={async () =>
        window.open(
          await sign(companySlug + "/" + upload.id + "." + upload.extension),
        )
      }
      aria-label={`Download ${upload.name}`}
      className="btn btn-ghost btn-sm"
    >
      Download
    </button>
  )
}
