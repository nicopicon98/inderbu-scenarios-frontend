"use client";

import { EUserRole } from "@/shared/enums/user-role.enum";
import { ProtectedRouteProvider } from "@/shared/providers/protected-route-provider";


export default function ReservationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProtectedRouteProvider
    allowedRoles={[EUserRole.USER, EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.MODERATOR]}
    validateSession={true}
  >{children}</ProtectedRouteProvider>;
}
