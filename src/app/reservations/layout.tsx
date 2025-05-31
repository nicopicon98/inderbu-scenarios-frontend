"use client";

import { ProtectedRouteProvider } from "@/shared/providers/protected-route-provider";

export default function ReservationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProtectedRouteProvider>{children}</ProtectedRouteProvider>;
}
