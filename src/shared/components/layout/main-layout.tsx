import type React from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <Header />
      <Sidebar />
      <main className="pt-16 pl-[72px]">
        <div className="p-4">{children}</div>
      </main>
      <footer className="pl-[72px] p-4 text-xs text-gray-400">
        Escenarios Deportivos Inderbu 2025 • Versión 1.0.0
      </footer>
    </div>
  )
}
