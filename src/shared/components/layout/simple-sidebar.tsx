"use client";

import { cn } from "@/utils/utils";
import { useSidebar } from "@/shared/providers/dashboard-sidebar.provider";
import { Button } from "@/shared/ui/button";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "./data/menu-items";


export function SimpleSidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-10 bg-white border-r border-gray-200 pt-16 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[240px]",
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
                    : "text-gray-500 hover:bg-gray-100 hover:text-primary",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 mr-2",
                    isActive ? "text-primary" : "text-gray-400",
                  )}
                />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}

          <div className="my-2 border-t border-gray-200"></div>
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
