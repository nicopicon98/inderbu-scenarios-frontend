import { z } from 'zod';
import { EUserRole } from '@/shared/enums/user-role.enum';

// Re-export for convenience and backward compatibility
export { EUserRole };
export { EUserRole as UserRole }; // Alias for migration

// Core user entity
export interface User {
  id: number;
  email: string;
  role: EUserRole;
  first_name?: string;
  last_name?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Auth-related types
export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}

export interface LoginCredentials {
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
  return user?.role === EUserRole.SUPER_ADMIN || user?.role === EUserRole.ADMIN;
};

export const canViewUserReservations = (currentUser: User | null, targetUserId: number): boolean => {
  if (!currentUser) return false;
  
  // Users can view their own reservations
  if (currentUser.id === targetUserId) return true;
  
  // Admins can view any reservations
  return isAdmin(currentUser);
};

// Helper functions
export const getUserFullName = (user: User): string => {
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
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
  
  return {
    id: userId,
    email: payload.email,
    role: payload.role,
  };
};
