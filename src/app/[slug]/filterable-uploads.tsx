"use client"

import { Upload } from "@/drizzle/app"
import { User } from "@/drizzle/auth"
import { useState } from "react"
import DeleteButton from "./delete-button"
import File from "./file"
import RetryButton from "./retry-button"
import SummaryModal from "./summary-modal"

type UploadWithUser = Upload & { user: User | null }

type Props = {
  uploads: UploadWithUser[]
  companySlug: string
  userId: string
  canDeleteMap: Record<string, boolean>
}

export default function FilterableUploads({
  uploads,
  companySlug,
  userId,
  canDeleteMap,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "material" | "work">(
    "all",
  )

  const filteredUploads = uploads.filter((upload) => {
    const matchesSearch = upload.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || upload.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input flex-1"
        />

        <div className="flex gap-2">
          <button
            onClick={() => setTypeFilter("all")}
            className={
              typeFilter === "all"
                ? "btn btn-primary btn-sm"
                : "btn btn-secondary btn-sm"
            }
          >
            All ({uploads.length})
          </button>
          <button
            onClick={() => setTypeFilter("material")}
            className={
              typeFilter === "material"
                ? "btn btn-primary btn-sm"
                : "btn btn-secondary btn-sm"
            }
          >
            Materials ({uploads.filter((u) => u.type === "material").length})
          </button>
          <button
            onClick={() => setTypeFilter("work")}
            className={
              typeFilter === "work"
                ? "btn btn-primary btn-sm"
                : "btn btn-secondary btn-sm"
            }
          >
            Work ({uploads.filter((u) => u.type === "work").length})
          </button>
        </div>
      </div>

      {/* Files List */}
      {filteredUploads.length === 0 ? (
        <div className="py-12 text-center text-gray-600">
          {searchQuery || typeFilter !== "all"
            ? "No files match your filters"
            : "No files yet"}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUploads.map((upload) => {
            const canDeleteFile = canDeleteMap[upload.id] || false

            return (
              <div
                key={upload.id}
                className="card-flat transition-colors hover:border-gray-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 truncate font-medium text-gray-900">
                      {upload.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(upload.createdAt).toLocaleDateString()} •{" "}
                      {upload.user ? upload.user.name : "Deleted"}
                      {typeFilter === "all" && (
                        <span className="badge badge-gray ml-2">
                          {upload.type}
                        </span>
                      )}
                    </p>

                    {/* PDF Analysis Status */}
                    {upload.extension === "pdf" && (
                      <div className="mt-2">
                        {upload.summary && <SummaryModal upload={upload} />}
                        {!upload.summary && !upload.error && (
                          <span className="text-sm text-gray-500 italic">
                            Analyzing...
                          </span>
                        )}
                        {upload.error && (
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm text-error"
                              title={upload.error}
                            >
                              Analysis failed
                            </span>
                            <RetryButton
                              uploadId={upload.id}
                              companySlug={companySlug}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <File upload={upload} companySlug={companySlug} />
                    {canDeleteFile && (
                      <DeleteButton
                        uploadId={upload.id}
                        uploadName={upload.name}
                        companySlug={companySlug}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
