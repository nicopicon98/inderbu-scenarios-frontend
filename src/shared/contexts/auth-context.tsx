"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface User {
  id: number;
  email: string;
  role?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  authReady: boolean;                 // ← bandera para saber cuándo terminó el chequeo
  login: (id: number, email: string, role: number, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Cargar usuario/token del localStorage al primer render
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split(".")[1]));
        console.log("JWT Payload:", payload); // Debug log
        
        const userId = payload.userId || payload.id || payload.sub;
        if (!userId) {
          console.error("No user ID found in token payload", payload);
          localStorage.removeItem("auth_token");
          setAuthReady(true);
          return;
        }
        
        setUser({ 
          id: userId,
          email: payload.email, 
          role: payload.role 
        });
        setToken(storedToken);
      } catch (err) {
        console.error("Failed to parse stored token:", err);
        localStorage.removeItem("auth_token");
      }
    }

    // Señal de que el chequeo terminó
    setAuthReady(true);
  }, []);

  const login = (id: number, email: string, role: number, token: string) => {
    console.log("Login called with:", { id, email, role }); // Debug log
    setUser({ id, email, role });
    setToken(token);
    localStorage.setItem("auth_token", token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        authReady,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
