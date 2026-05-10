import type React from "react"
import type { Metadata } from "next"
import { DM_Sans, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthGuard } from "@/components/auth-guard"
import "./globals.css"

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "GearGuard - Maintenance Management System",
  description: "Role-based maintenance management for equipment tracking and repair workflows",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} ${geistMono.variable} font-sans antialiased`}>
        <AuthGuard>{children}</AuthGuard>
        <Analytics />
      </body>
    </html>
  )
}
