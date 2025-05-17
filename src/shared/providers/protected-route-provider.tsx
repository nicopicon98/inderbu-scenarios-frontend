"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/shared/contexts/auth-context";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProviderProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRouteProvider({
  children,
  adminOnly = false,
}: ProtectedRouteProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // We need to wait for the authentication check to complete
    const checkAuth = async () => {
      // Adding a small delay to ensure auth state is properly loaded
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!isAuthenticated) {
        // Redirect to home if not authenticated
        router.replace("/");
        return;
      }

      if (adminOnly && user?.role !== 1) {
        // Redirect to home if not admin (role 1)
        router.replace("/");
        return;
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [isAuthenticated, user, router, adminOnly, pathname]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-lg text-gray-600">Verificando acceso...</p>
      </div>
    );
  }

  return <>{children}</>;
}
