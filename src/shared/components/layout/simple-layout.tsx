import type React from "react"
import { SimpleSidebar, useSidebar } from "./simple-sidebar"
import { UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimpleLayoutProps {
  children: React.ReactNode
}

export function SimpleLayout({ children }: SimpleLayoutProps) {
  const { collapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <header className="fixed top-0 left-0 right-0 z-20 h-16 bg-white border-b border-gray-200 flex items-center px-4">
        <div className="ml-4 text-xl font-semibold">Escenarios Deportivos Inderbu</div>
        <div className="ml-auto">
          <button className="rounded-full bg-blue-500 text-white p-1">
            <UserCircle className="h-8 w-8" />
          </button>
        </div>
      </header>

      <SimpleSidebar />

      <main className={cn("pt-16 transition-all duration-300", collapsed ? "pl-[72px]" : "pl-[240px]")}>
        <div className="p-4">{children}</div>
      </main>

      <footer
        className={cn("p-4 text-xs text-gray-400 transition-all duration-300", collapsed ? "pl-[72px]" : "pl-[240px]")}
      >
        Escenarios Deportivos Inderbu 2025 • Versión 1.0.0
      </footer>
    </div>
  )
}
