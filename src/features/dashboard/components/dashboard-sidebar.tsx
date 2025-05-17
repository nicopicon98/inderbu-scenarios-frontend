"use client";

import Link from "next/link";
import { 
  LayoutDashboard, 
  CalendarRange, 
  Settings, 
  Users, 
  Map, 
  Clock,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  href?: string;
  isActive?: boolean;
  submenu?: MenuItem[];
  isOpen?: boolean;
}

export function DashboardSidebar() {
  const pathname = usePathname();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      href: "/dashboard",
      isActive: pathname === "/dashboard",
    },
    {
      title: "Reservas",
      icon: <CalendarRange size={20} />,
      href: "/dashboard/reservations",
      isActive: pathname === "/dashboard/reservations",
    },
    {
      title: "Escenarios",
      icon: <Map size={20} />,
      isOpen: false,
      submenu: [
        {
          title: "Escenarios",
          href: "/dashboard/scenarios",
          isActive: pathname === "/dashboard/scenarios",
        },
        {
          title: "Sub-escenarios",
          href: "/dashboard/sub-scenarios",
          isActive: pathname === "/dashboard/sub-scenarios",
        },
      ],
    },
    {
      title: "Horarios",
      icon: <Clock size={20} />,
      href: "/dashboard/timeslots",
      isActive: pathname === "/dashboard/timeslots",
    },
    {
      title: "Usuarios",
      icon: <Users size={20} />,
      href: "/dashboard/users",
      isActive: pathname === "/dashboard/users",
    },
    {
      title: "Configuración",
      icon: <Settings size={20} />,
      href: "/dashboard/settings",
      isActive: pathname === "/dashboard/settings",
    },
  ]);

  const toggleSubmenu = (index: number) => {
    const newMenuItems = [...menuItems];
    newMenuItems[index].isOpen = !newMenuItems[index].isOpen;
    setMenuItems(newMenuItems);
  };

  return (
    <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-64px)]">
      <div className="py-6 px-4">
        <nav>
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={item.title}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(index)}
                      className={cn(
                        "flex items-center w-full px-4 py-2 text-sm rounded-md transition-colors",
                        "hover:bg-gray-100 text-gray-700 hover:text-blue-600"
                      )}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.title}</span>
                      <span className="ml-auto">
                        {item.isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                    </button>
                    {item.isOpen && item.submenu && (
                      <ul className="ml-6 mt-1 space-y-1">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.title}>
                            <Link
                              href={subItem.href || "#"}
                              className={cn(
                                "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
                                subItem.isActive
                                  ? "bg-blue-50 text-blue-600 font-medium"
                                  : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                              )}
                            >
                              {subItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className={cn(
                      "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
                      item.isActive
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    )}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
