"use client"

import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface AppShellProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-[72px] md:pl-[260px] transition-all duration-200">
        <Header title={title} subtitle={subtitle} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
