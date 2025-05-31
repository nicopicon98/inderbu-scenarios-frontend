"use client";

import { IAuthContextType } from "../interfaces/auth-context-type.interface";
import { IUser } from "../interfaces/user.interface";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext<IAuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Utilitad para decodificar JWT
  const decodeToken = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch {
      return null;
    }
  };

  // Verificar si token está expirado
  const isTokenExpired = (): boolean => {
    if (!token) return true;

    try {
      const payload = decodeToken(token);
      if (!payload?.exp) return true;

      const currentTime = Date.now() / 1000;
      return payload.exp <= currentTime;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedToken = localStorage.getItem("auth_token");
    const storedRefreshToken = localStorage.getItem("refresh_token");

    if (storedToken) {
      const payload = decodeToken(storedToken);

      if (payload) {
        const userId = payload.userId || payload.id || payload.sub;

        if (userId && payload.email && payload.role !== undefined) {
          setUser({
            id: userId,
            email: payload.email,
            role: payload.role,
          });
          setToken(storedToken);

          if (storedRefreshToken) {
            setRefreshToken(storedRefreshToken);
          }
        } else {
          // Token inválido, limpiar
          localStorage.removeItem("auth_token");
          localStorage.removeItem("refresh_token");
        }
      } else {
        // Token malformado, limpiar
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
      }
    }

    setAuthReady(true);
  }, []);

  // Establecer sesión de usuario
  const setUserSession = (
    userData: IUser,
    accessToken: string,
    newRefreshToken?: string,
  ) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem("auth_token", accessToken);

    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
      localStorage.setItem("refresh_token", newRefreshToken);
    }
  };

  // Limpiar sesión de usuario
  const clearUserSession = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
  };

  // Actualizar solo tokens
  const updateToken = (newToken: string, newRefreshToken?: string) => {
    setToken(newToken);
    localStorage.setItem("auth_token", newToken);

    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
      localStorage.setItem("refresh_token", newRefreshToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isAuthenticated: !!user && !isTokenExpired(),
        authReady,
        setUserSession,
        clearUserSession,
        updateToken,
        isTokenExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): IAuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
