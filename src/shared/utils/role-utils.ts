import { EUserRole } from "../enums/user-role.enum";

export function getRoleDisplayName(role: EUserRole): string {
  const names = {
    [EUserRole.SUPER_ADMIN]: "Super Administrador",
    [EUserRole.ADMIN]: "Administrador",
    [EUserRole.INDEPENDIENTE]: "Usuario Independiente",
    [EUserRole.CLUB_DEPORTIVO]: "Club Deportivo",
    [EUserRole.ENTRENADOR]: "Entrenador",
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
      return [
        EUserRole.ADMIN,
        EUserRole.INDEPENDIENTE,
        EUserRole.CLUB_DEPORTIVO,
        EUserRole.ENTRENADOR,
      ];
    case EUserRole.ADMIN:
      return [
        EUserRole.INDEPENDIENTE,
        EUserRole.CLUB_DEPORTIVO,
        EUserRole.ENTRENADOR,
      ];
    case EUserRole.INDEPENDIENTE:
      return [EUserRole.INDEPENDIENTE];
    case EUserRole.CLUB_DEPORTIVO:
      return [EUserRole.CLUB_DEPORTIVO];
    case EUserRole.ENTRENADOR:
      return [EUserRole.ENTRENADOR];
    default:
      return [];
  }
}
