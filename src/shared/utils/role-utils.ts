import { EUserRole } from "../enums/user-role.enum";

export function getRoleDisplayName(role: EUserRole): string {
  const names = {
    [EUserRole.SUPER_ADMIN]: "Super Administrador",
    [EUserRole.ADMIN]: "Administrador",
    [EUserRole.USER]: "Usuario",
    [EUserRole.MODERATOR]: "Moderador",
  };
  return names[role] || "Usuario";
}

export function getRoleHierarchyLevel(role: EUserRole): number {
  // Menor número = mayor jerarquía
  return role;
}

export function canRoleModify(
  currentRole: EUserRole,
  targetRole: EUserRole,
): boolean {
  return getRoleHierarchyLevel(currentRole) < getRoleHierarchyLevel(targetRole);
}

export function getAvailableRolesForUser(currentRole: EUserRole): EUserRole[] {
  switch (currentRole) {
    case EUserRole.SUPER_ADMIN:
      return [EUserRole.ADMIN, EUserRole.USER, EUserRole.MODERATOR];
    case EUserRole.ADMIN:
      return [EUserRole.USER, EUserRole.MODERATOR];
    default:
      return [];
  }
}
