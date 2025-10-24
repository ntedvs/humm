"use client"

import { useState } from "react"

export default function FileInput() {
  const [fileName, setFileName] = useState<string>("")

  return (
    <div>
      <input
        id="file"
        name="file"
        type="file"
        required
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          setFileName(file ? file.name : "")
        }}
      />
      <label
        htmlFor="file"
        className="input flex cursor-pointer items-center text-text-subtle"
      >
        {fileName || "Choose a file..."}
      </label>
    </div>
  )
}
