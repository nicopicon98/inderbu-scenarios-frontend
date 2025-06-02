// INTERFACE OBSOLETA ELIMINADA
// Esta interface ha sido migrada a @/features/auth/model/useAuth.tsx
// siguiendo la nueva arquitectura DDD + FSD + Atomic Design
//
// 🚫 NO IMPORTAR DESDE AQUÍ
// Usar: AuthContextType de @/features/auth/model/useAuth.tsx
//
// El archivo será eliminado en la siguiente limpieza.

import { IUser } from "./user.interface";

/**
 * @deprecated
 * Use AuthContextType from @/features/auth/model/useAuth.tsx instead
 */
export interface IAuthContextType {
  user: IUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  authReady: boolean;
  setUserSession: (user: IUser, token: string, refreshToken?: string) => void;
  clearUserSession: () => void;
  updateToken: (token: string, refreshToken?: string) => void;
  isTokenExpired: () => boolean;
}
