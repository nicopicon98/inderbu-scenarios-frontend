"use client";

import { ProtectedRouteProvider } from "@/shared/providers/protected-route-provider";
import { SidebarProvider } from "@/shared/components/layout/simple-sidebar";


export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRouteProvider adminOnly={true}>
      <SidebarProvider>{children}</SidebarProvider>
    </ProtectedRouteProvider>
  );
}
