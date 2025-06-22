"use client";

import { EUserRole } from "@/shared/enums/user-role.enum";
import { ProtectedRouteProvider } from "@/shared/providers/protected-route-provider";

const allowedRoles: EUserRole[] = [
  EUserRole.SUPER_ADMIN,
  EUserRole.INDEPENDIENTE,
  EUserRole.CLUB_DEPORTIVO,
  EUserRole.ENTRENADOR,
];

export default function ReservationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProtectedRouteProvider
    allowedRoles={[...allowedRoles]}
    validateSession={true}
  >{children}</ProtectedRouteProvider>;
}
