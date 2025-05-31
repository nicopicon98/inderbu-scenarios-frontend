"use client";

import { useAuth } from "@/shared/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";


interface ProtectedRouteProviderProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRouteProvider({
  children,
  adminOnly = false,
}: ProtectedRouteProviderProps) {
  const { user, isAuthenticated, authReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Esperar a que el AuthProvider termine su chequeo inicial
    if (!authReady) return;

    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    if (adminOnly && user?.role !== 1) {
      router.replace("/dashboard");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, isAuthenticated, user, adminOnly]);

  if (!authReady) {
    // Spinner mientras el contexto revisa el token
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-lg text-gray-600">Verificando acceso...</p>
      </div>
    );
  }

  return <>{children}</>;
}
