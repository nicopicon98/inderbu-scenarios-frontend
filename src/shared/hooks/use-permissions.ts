import { useAuth } from "../contexts/auth-context";
import { EUserRole } from "../enums/user-role.enum";
import { IPermission } from "../interfaces/permission.interface";

export function usePermissions(): IPermission {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return {
      canAccessDashboard: false,
      canViewReservations: false,
      canManageUsers: false,
      canManageScenarios: false,
      canViewAdminPanel: false,
    };
  }

  const permissions: Record<EUserRole, IPermission> = {
    [EUserRole.SUPER_ADMIN]: {
      canAccessDashboard: true,
      canViewReservations: true,
      canManageUsers: true,
      canManageScenarios: true,
      canViewAdminPanel: true,
    },
    [EUserRole.ADMIN]: {
      canAccessDashboard: true,
      canViewReservations: false, // ← Admins no ven reservas personales
      canManageUsers: false,
      canManageScenarios: true,
      canViewAdminPanel: true,
    },
    [EUserRole.USER]: {
      canAccessDashboard: false,
      canViewReservations: true,
      canManageUsers: false,
      canManageScenarios: false,
      canViewAdminPanel: false,
    },
    [EUserRole.MODERATOR]: {
      canAccessDashboard: false,
      canViewReservations: true,
      canManageUsers: false,
      canManageScenarios: false,
      canViewAdminPanel: false,
    },
  };

  return permissions[user.role] || permissions[EUserRole.USER];
}
