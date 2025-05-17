"use client";

import { ProtectedRouteProvider } from "@/shared/providers/protected-route-provider";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRouteProvider adminOnly={true}>
      {children}
    </ProtectedRouteProvider>
  );
}
