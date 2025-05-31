import { usePermissions } from "../../hooks/use-permissions";
import { useRoleChecks } from "../../hooks/use-role-checks";
import { EUserRole } from "@/shared/enums/user-role.enum";
import React from "react";

interface PermissionGuardProps {
  children: React.ReactNode;

  // Opciones mutuamente excluyentes
  requiredRole?: EUserRole;
  allowedRoles?: EUserRole[];
  requiredPermission?: keyof ReturnType<typeof usePermissions>;

  // Render alternativo
  fallback?: React.ReactNode;

  // Modo de operación
  mode?: "hide" | "show-fallback";
}

export function PermissionGuard({
  children,
  requiredRole,
  allowedRoles,
  requiredPermission,
  fallback = null,
  mode = "hide",
}: PermissionGuardProps) {
  const roleChecks = useRoleChecks();
  const permissions = usePermissions();

  let hasPermission = false;

  if (requiredRole) {
    hasPermission = roleChecks.isRole(requiredRole);
  } else if (allowedRoles) {
    hasPermission = roleChecks.hasAnyRole(allowedRoles) ?? false;
  } else if (requiredPermission) {
    hasPermission = permissions[requiredPermission];
  }

  if (hasPermission) {
    return <>{children}</>;
  }

  return mode === "show-fallback" ? <>{fallback}</> : null;
}
