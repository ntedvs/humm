"use client"

import { Loader2, Trash2 } from "lucide-react"
import { useState } from "react"
import { deleteFile } from "./actions"

type Props = {
  uploadId: string
  uploadName: string
  companySlug: string
}

export default function DeleteButton({
  uploadId,
  uploadName,
  companySlug,
}: Props) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    const confirmed = confirm(
      `Delete "${uploadName}"? This cannot be undone.`,
    )

    if (!confirmed) return

    setDeleting(true)

    try {
      await deleteFile(uploadId, companySlug)
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete file. Please try again.",
      )
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-md p-2 text-text-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={`Delete ${uploadName}`}
      title="Delete file"
    >
      {deleting ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Trash2 className="h-5 w-5" />
      )}
    </button>
  )
}
