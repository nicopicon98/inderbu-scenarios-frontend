import { IUser } from "./user.interface";

export interface IAuthContextType {
  user: IUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  authReady: boolean;
  // Métodos de estado - NO hacen API calls
  setUserSession: (user: IUser, token: string, refreshToken?: string) => void;
  clearUserSession: () => void;
  updateToken: (token: string, refreshToken?: string) => void;
  isTokenExpired: () => boolean;
}
