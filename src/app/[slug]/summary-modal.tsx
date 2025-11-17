"use client"

import { Upload } from "@/drizzle/app"
import { useState } from "react"
import ReactMarkdown from "react-markdown"

type Props = { upload: Upload }

export default function SummaryModal({ upload }: Props) {
  const [open, setOpen] = useState(false)

  if (!upload.summary) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-secondary btn-sm"
      >
        View Summary
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  AI Analysis
                </h2>
                <p className="text-sm text-gray-600">{upload.name}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="btn btn-ghost btn-sm"
              >
                Close
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{upload.summary}</ReactMarkdown>
              </div>

              {upload.processed && (
                <p className="mt-6 border-t border-gray-200 pt-6 text-xs text-gray-500">
                  Generated on {new Date(upload.processed).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
