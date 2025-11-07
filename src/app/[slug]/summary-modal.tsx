"use client"

import { Upload } from "@/drizzle/app"
import { X } from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"

type Props = { upload: Upload }

export default function SummaryModal({ upload }: Props) {
  const [open, setOpen] = useState(false)

  if (!upload.summary) return null

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-secondary">
        View Summary
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="card max-h-[80vh] w-full max-w-3xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-bold text-text">AI Analysis</h2>
                <p className="text-sm text-text-muted">{upload.name}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-2 hover:bg-surface"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="prose prose-sm max-w-none text-text">
              <ReactMarkdown>{upload.summary}</ReactMarkdown>
            </div>

            {upload.processed && (
              <p className="mt-4 border-t border-border pt-4 text-xs text-text-muted">
                Generated on {new Date(upload.processed).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
