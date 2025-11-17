"use client"

import { useState } from "react"

export default function FileInput() {
  const [fileName, setFileName] = useState<string>("")

  return (
    <div className="relative">
      <input
        id="file"
        name="file"
        type="file"
        required
        onChange={(e) => {
          const file = e.target.files?.[0]
          setFileName(file ? file.name : "")
        }}
        className="hidden"
      />
      <label
        htmlFor="file"
        className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-center transition-colors hover:border-primary-400 hover:bg-gray-100"
      >
        <span className="text-sm text-gray-600">
          {fileName || "Click to choose a file..."}
        </span>
      </label>
    </div>
  )
}
