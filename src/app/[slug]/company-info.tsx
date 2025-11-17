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
      <section className="mb-8">
        <form
          action={async (formData) => {
            await updateAction(formData)
            setIsEditing(false)
          }}
          className="card space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text">Company Info</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-sm btn-ghost"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-sm btn-primary">
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
              rows={2}
              className="input"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
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
          </div>
        </form>
      </section>
    )
  }

  return (
    <section className="mb-8">
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Company Info</h2>
          {isOwner && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-sm btn-ghost"
            >
              Edit
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-text-muted">Description</p>
            <p className="mt-1 text-text">
              {company.description || "—"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-text-muted">Stage</p>
              <p className="mt-1 font-medium text-text">
                {company.stage || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-text-muted">Valuation</p>
              <p className="mt-1 font-medium text-text">
                {formatMoney(company.valuation)}
              </p>
            </div>

            <div>
              <p className="text-sm text-text-muted">Asking Amount</p>
              <p className="mt-1 font-medium text-text">
                {formatMoney(company.askingAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
