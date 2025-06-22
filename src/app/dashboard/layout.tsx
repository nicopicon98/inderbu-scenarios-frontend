"use client";

import { SimpleLayout } from "@/shared/components/layout/simple-layout";
import { SidebarProvider } from "@/shared/providers/dashboard-sidebar.provider";
import { ProtectedRouteProvider } from "@/shared/providers/protected-route-provider";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRouteProvider adminOnly={true}>
      <SidebarProvider>
        <SimpleLayout>{children}</SimpleLayout>
      </SidebarProvider>
    </ProtectedRouteProvider>
  );
}
