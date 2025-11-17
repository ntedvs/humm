"use client"

import { formatMoney } from "@/utils/format"
import { useState } from "react"

type Props = {
  company: {
    id: string
    slug: string
    name: string
    description: string | null
    stage: string | null
    valuation: string | null
    askingAmount: string | null
  }
  isOwner: boolean
  updateAction: (formData: FormData) => Promise<void>
}

export default function CompanyInfo({ company, isOwner, updateAction }: Props) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <div className="card">
        <form
          action={async (formData) => {
            await updateAction(formData)
            setIsEditing(false)
          }}
          className="space-y-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Edit Company Info
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Save
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={company.description || ""}
              rows={3}
              className="input resize-none"
            />
          </div>

          <div>
            <label htmlFor="stage" className="label">
              Stage
            </label>
            <input
              type="text"
              id="stage"
              name="stage"
              defaultValue={company.stage || ""}
              placeholder="e.g., Seed, Series A"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="valuation" className="label">
              Valuation
            </label>
            <input
              type="number"
              id="valuation"
              name="valuation"
              defaultValue={company.valuation || ""}
              placeholder="e.g., 5000000"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="askingAmount" className="label">
              Asking Amount
            </label>
            <input
              type="number"
              id="askingAmount"
              name="askingAmount"
              defaultValue={company.askingAmount || ""}
              placeholder="e.g., 1000000"
              className="input"
            />
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Company Info</h2>
        {isOwner && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-ghost btn-sm"
          >
            Edit
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
            Description
          </p>
          <p className="text-gray-900">{company.description || "—"}</p>
        </div>

        <div className="divider" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
              Stage
            </p>
            <p className="text-gray-900">{company.stage || "—"}</p>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
              Valuation
            </p>
            <p className="text-gray-900">{formatMoney(company.valuation)}</p>
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
            Asking Amount
          </p>
          <p className="text-gray-900">{formatMoney(company.askingAmount)}</p>
        </div>
      </div>
    </div>
  )
}
