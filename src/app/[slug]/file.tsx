"use client"

import { Upload } from "@/drizzle/app"
import { ExternalLink } from "lucide-react"
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
      className="rounded-md p-2 text-text-muted transition-colors hover:bg-surface-hover hover:text-accent"
      aria-label={`Download ${upload.name}`}
    >
      <ExternalLink className="h-5 w-5" />
    </button>
  )
}
