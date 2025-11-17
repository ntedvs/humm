"use client"

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
    const confirmed = confirm(`Delete "${uploadName}"? This cannot be undone.`)

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
      aria-label={`Delete ${uploadName}`}
      title="Delete file"
      className="btn btn-danger btn-sm"
    >
      {deleting ? "Deleting..." : "Delete"}
    </button>
  )
}
