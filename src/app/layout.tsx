import "@/styles/base.css"
import { Metadata } from "next"
import { Inter } from "next/font/google"
import { ReactNode } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: { default: "Humm", template: "%s + Humm" },
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`mx-auto flex min-h-screen max-w-6xl flex-col gap-4 p-4 ${inter.className}`}
      >
        {/* <header></header> */}
        <main className="grow">{children}</main>
        {/* <footer></footer> */}
      </body>
    </html>
  )
}
