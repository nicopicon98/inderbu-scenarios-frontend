"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  email: string;
  role?: number; // Optional, only if you want to store user role
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, role: number, token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token")
    if (storedToken) {
      try {
        const tokenPayload = JSON.parse(atob(storedToken.split(".")[1]))
        setUser({ email: tokenPayload.email, role: tokenPayload.role })
        setToken(storedToken)
      } catch (error) {
        console.error("Failed to parse stored token", error)
        localStorage.removeItem("auth_token")
      }
    }
  }, [])

  const login = (email: string, role: number, token: string) => {
    setUser({ email, role })
    setToken(token)
    localStorage.setItem("auth_token", token)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("auth_token")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
