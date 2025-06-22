import { z } from 'zod';
import { EUserRole } from '@/shared/enums/user-role.enum';

// Re-export for convenience and backward compatibility
export { EUserRole };
export { EUserRole as UserRole }; // Alias for migration

// Core user entity
export interface User {
  id: number;
  dni: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: number;
  role: EUserRole; // Computed from roleId for backward compatibility
  address: string;
  neighborhoodId: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  
  // Deprecated fields for backward compatibility
  first_name?: string;
  last_name?: string;
}

// Auth-related types
export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: EUserRole;
}

export interface ResetPasswordData {
  email: string;
}

// JWT payload structure
export interface JwtPayload {
  sub?: number;
  id?: number;
  userId?: number;
  email: string;
  role: EUserRole;
  exp: number;
  iat: number;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Validation schemas
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
  first_name: z.string().min(1, 'Nombre es requerido'),
  last_name: z.string().min(1, 'Apellido es requerido'),
  phone: z.string().min(1, 'Teléfono es requerido'),
  role: z.nativeEnum(EUserRole),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

// Type guards
export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  const role = user.role || getRoleFromId(user.roleId);
  return role === EUserRole.SUPER_ADMIN || role === EUserRole.ADMIN;
};

export const canViewUserReservations = (currentUser: User | null, targetUserId: number): boolean => {
  if (!currentUser) return false;
  
  // Users can view their own reservations
  if (currentUser.id === targetUserId) return true;
  
  // Admins can view any reservations
  return isAdmin(currentUser);
};

// Helper to convert roleId to EUserRole
export const getRoleFromId = (roleId: number): EUserRole => {
  // Map roleId to EUserRole - adjust these mappings based on your backend
  switch (roleId) {
    case 1: return EUserRole.SUPER_ADMIN;
    case 2: return EUserRole.ADMIN;
    case 3: return EUserRole.INDEPENDIENTE;
    case 4: return EUserRole.CLUB_DEPORTIVO;
    case 5: return EUserRole.ENTRENADOR;
    default: return EUserRole.INDEPENDIENTE; // Default role
  }
};

// Helper functions
export const getUserFullName = (user: User): string => {
  // Use new fields first, fallback to deprecated ones
  const firstName = user.firstName || user.first_name || '';
  const lastName = user.lastName || user.last_name || '';
  return `${firstName} ${lastName}`.trim() || user.email;
};

export const getUserRoleName = (role: EUserRole): string => {
  switch (role) {
    case EUserRole.SUPER_ADMIN:
      return 'Super Admin';
    case EUserRole.ADMIN:
      return 'Administrador';
    case EUserRole.INDEPENDIENTE:
      return 'Independiente';
    case EUserRole.CLUB_DEPORTIVO:
      return 'Club Deportivo';
    case EUserRole.ENTRENADOR:
      return 'Entrenador';
    default:
      return 'Usuario';
  }
};

// JWT utilities
export const decodeJWT = (token: string): JwtPayload | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = decodeJWT(token);
    if (!payload?.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return payload.exp <= currentTime;
  } catch {
    return true;
  }
};

export const extractUserFromToken = (token: string): User | null => {
  const payload = decodeJWT(token);
  if (!payload) return null;
  
  const userId = payload.userId || payload.id || payload.sub;
  if (!userId || !payload.email || payload.role === undefined) {
    return null;
  }
  
  // Create user object with minimal data from token
  return {
    id: userId,
    email: payload.email,
    roleId: payload.role, // JWT contains roleId as 'role'
    role: getRoleFromId(payload.role), // Convert to enum
    // Set default values for required fields
    dni: 0,
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    neighborhoodId: 0,
    isActive: true,
  };
};
