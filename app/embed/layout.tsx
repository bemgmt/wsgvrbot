import type React from "react"
import "../globals.css"

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased overflow-hidden">
        {children}
      </body>
    </html>
  )
}

