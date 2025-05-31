"use client";

import {
  BarChart,
  Calendar,
  Map,
  MapPin,
  Settings,
  User,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";


export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Reservas",
      href: "/",
      icon: Calendar,
    },
    {
      title: "Escenarios",
      href: "/dashboard/escenarios",
      icon: MapPin,
    },
    {
      title: "Sub-escenarios",
      href: "/dashboard/sub-escenarios",
      icon: MapPin,
    },
    {
      title: "Clientes",
      href: "/clientes",
      icon: Users,
    },
    {
      title: "Presidentes",
      href: "/presidentes",
      icon: User,
    },
    {
      title: "Ubicaciones",
      href: "/ubicaciones",
      icon: Map,
    },
    {
      title: "Opciones",
      href: "/opciones",
      icon: Settings,
    },
  ];

  const reportItems = [
    {
      title: "Reservas",
      href: "/reportes/reservas",
      icon: BarChart,
    },
  ];

  return (
    <div className="fixed inset-y-0 left-0 z-10 w-[72px] bg-white border-r border-gray-200 pt-16">
      <div className="flex flex-col items-center space-y-4 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full p-2 text-xs ${
                isActive
                  ? "text-primary bg-accent"
                  : "text-gray-500 hover:text-primary hover:bg-gray-50"
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-center">{item.title}</span>
            </Link>
          );
        })}

        <div className="w-full border-t border-gray-200 my-2"></div>

        <div className="text-xs text-gray-400 px-2 w-full text-center">
          REPORTES
        </div>

        {reportItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full p-2 text-xs ${
                isActive
                  ? "text-primary bg-accent"
                  : "text-gray-500 hover:text-primary hover:bg-gray-50"
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-center">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
