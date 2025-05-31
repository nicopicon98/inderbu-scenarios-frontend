import { BarChart, Calendar, Map, MapPin, Settings, Users } from "lucide-react";

export const reportItems = [
  // {
  //   title: "Reportes",
  //   href: "/reportes/reservas",
  //   icon: BarChart,
  // },
];

export const menuItems = [
  {
    title: "Reservas",
    href: "/dashboard",
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
    href: "/dashboard/clientes",
    icon: Users,
  },
  {
    title: "Ubicaciones",
    href: "/dashboard/ubicaciones",
    icon: Map,
  },
  // {
  //   title: "Opciones",
  //   href: "/dashboard/opciones",
  //   icon: Settings,
  // },
];
