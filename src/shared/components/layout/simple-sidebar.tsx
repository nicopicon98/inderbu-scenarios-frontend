"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { menuItems, reportItems } from "./data/menu-items";

// Crear un contexto para compartir el estado del sidebar
type SidebarContextType = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Hook para usar el contexto del sidebar
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

// Proveedor del contexto del sidebar
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  // Guardar el estado en localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState) {
      setCollapsed(savedState === "true");
    }
  }, []);

  // Actualizar localStorage cuando cambia el estado
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function SimpleSidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-10 bg-white border-r border-gray-200 pt-16 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      <div className="absolute right-[-12px] top-20">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-full border border-gray-200 bg-white shadow-sm"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>

      <div className="flex flex-col space-y-1 p-2 h-[calc(100vh-64px)] flex-col justify-between">
        <div className="flex flex-col space-y-1">
          {menuItems.map((item) => {
            // Si estamos en /dashboard, solo ese elemento debe estar activo, no /dashboard/escenarios
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-accent text-primary font-medium"
                    : "text-gray-500 hover:bg-gray-100 hover:text-primary"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 mr-2",
                    isActive ? "text-primary" : "text-gray-400"
                  )}
                />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}

          <div className="my-2 border-t border-gray-200"></div>
          {/* {reportItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-accent text-primary font-medium"
                    : "text-gray-500 hover:bg-gray-100 hover:text-primary"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 mr-2",
                    isActive ? "text-primary" : "text-gray-400"
                  )}
                />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })} */}
        </div>
        <div>
          <div className="mt-2 border-t border-gray-200 mb-2"></div>
          <button
            className="flex items-center rounded-md px-3 py-2 text-sm transition-colors text-red-500 hover:bg-red-50 w-full"
            onClick={() => console.log("Cerrar sesión")}
          >
            <LogOut className="h-5 w-5 mr-2 text-red-500" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
