"use client";

import { SidebarProvider } from "@/shared/components/layout/simple-sidebar";
import { ProtectedRouteProvider } from "@/shared/providers/protected-route-provider";

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
