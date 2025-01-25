// app/layout.tsx

import type { Metadata } from "next"
import { GumProvider } from "@/contexts/GumContext"
import "./globals.css"

export const metadata: Metadata = {
  title: "Gum Jam - Bubble Gum Rhythm Game",
  description: "A quirky rhythm game where you chew gum and prevent it from escaping!",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <GumProvider>{children}</GumProvider>
      </body>
    </html>
  )
}

