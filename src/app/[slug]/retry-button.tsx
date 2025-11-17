"use client"

import { useState } from "react"
import { retryAnalysis } from "./actions"

type Props = {
  uploadId: string
  companySlug: string
}

export default function RetryButton({ uploadId, companySlug }: Props) {
  const [retrying, setRetrying] = useState(false)

  const handleRetry = async () => {
    setRetrying(true)

    try {
      await retryAnalysis(uploadId, companySlug)
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to retry analysis. Please try again.",
      )
      setRetrying(false)
    }
  }

  return (
    <button
      onClick={handleRetry}
      disabled={retrying}
      title="Retry analysis"
      className="btn btn-secondary btn-sm"
    >
      {retrying ? "Retrying..." : "Retry"}
    </button>
  )
}
