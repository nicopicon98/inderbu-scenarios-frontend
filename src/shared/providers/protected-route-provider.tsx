"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { EUserRole } from "@/shared/enums/user-role.enum";

interface ProtectedRouteProviderProps {
  children: React.ReactNode;
  requiredRole?: EUserRole;
  allowedRoles?: EUserRole[];
  adminOnly?: boolean; // Deprecated: usar requiredRole o allowedRoles
  fallbackPath?: string;
  validateSession?: boolean;
}

export function ProtectedRouteProvider({
  children,
  requiredRole,
  allowedRoles,
  adminOnly = false, // Mantener para compatibilidad
  fallbackPath = "/",
  validateSession = true,
}: ProtectedRouteProviderProps) {
  const { 
    user, 
    isAuthenticated, 
    authReady, 
    validateCurrentSession,
    isTokenExpired 
  } = useAuth();
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(false);

  // Función para verificar permisos de rol
  const hasRequiredRole = (): boolean => {
    if (!user) return false;

    // Backward compatibility con adminOnly
    if (adminOnly) {
      return user.role === EUserRole.SUPER_ADMIN || user.role === EUserRole.ADMIN;
    }

    // Verificar rol específico requerido
    if (requiredRole) {
      return user.role === requiredRole;
    }

    // Verificar si el rol está en la lista de roles permitidos
    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles.includes(user.role);
    }

    // Si no se especifica rol, solo verificar autenticación
    return true;
  };

  useEffect(() => {
    const checkAccess = async () => {
      // Esperar a que el AuthProvider termine su chequeo inicial
      if (!authReady) return;

      // Si no está autenticado, redirigir inmediatamente
      if (!isAuthenticated) {
        router.replace(fallbackPath);
        return;
      }

      // Verificar permisos de rol
      if (!hasRequiredRole()) {
        // Redirigir basado en el rol del usuario
        const redirectPath = user?.role === EUserRole.USER ? "/" : "/dashboard";
        router.replace(redirectPath);
        return;
      }

      // Validar sesión con el servidor si está habilitado
      if (validateSession && !isValidating) {
        setIsValidating(true);
        
        try {
          // Verificar si el token está expirado
          if (isTokenExpired()) {
            router.replace(fallbackPath);
            return;
          }

          // Validar sesión con el servidor
          const isValid = await validateCurrentSession();
          
          if (!isValid) {
            router.replace(fallbackPath);
            return;
          }
        } catch (error) {
          console.error("Error validating session:", error);
          router.replace(fallbackPath);
          return;
        } finally {
          setIsValidating(false);
        }
      }
    };

    checkAccess();
  }, [
    authReady, 
    isAuthenticated, 
    user, 
    requiredRole, 
    allowedRoles, 
    adminOnly, 
    fallbackPath,
    validateSession,
    isValidating,
    router,
    validateCurrentSession,
    isTokenExpired
  ]);

  // Loading states
  if (!authReady || isValidating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-lg text-gray-600">
          {!authReady ? "Verificando acceso..." : "Validando sesión..."}
        </p>
      </div>
    );
  }

  // Si llegamos aquí, el usuario tiene acceso
  return <>{children}</>;
}

// Hook personalizado para verificar permisos en componentes
export function usePermissionGuard() {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (role: EUserRole): boolean => {
    return isAuthenticated && user?.role === role;
  };

  const hasAnyRole = (roles: EUserRole[]): boolean => {
    return isAuthenticated && !!user && roles.includes(user.role);
  };

  const isAdmin = (): boolean => {
    return hasAnyRole([EUserRole.SUPER_ADMIN, EUserRole.ADMIN]);
  };

  const isSuperAdmin = (): boolean => {
    return hasRole(EUserRole.SUPER_ADMIN);
  };

  const isUser = (): boolean => {
    return hasRole(EUserRole.USER);
  };

  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isSuperAdmin,
    isUser,
    user,
    isAuthenticated,
  };
}
