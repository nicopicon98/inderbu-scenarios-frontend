import { useAuthContext } from "@/shared/contexts/auth-context";
import { toast } from "sonner";
import { decodeJWT } from "../../../lib/utils";
import { TLoginData, TRegisterData, TResetData } from "../schemas/auth-schemas";
import { AuthService } from "../services/auth.service";

export function useAuth() {
  const authContext = useAuthContext();

  /**
   * Login: API call + actualizar contexto
   */
  const handleLogin = async (data: TLoginData) => {
    try {
      // 1. Llamar a la API
      const response = await AuthService.login(data);

      // 2. Decodificar token para obtener datos del usuario
      const tokenPayload = decodeJWT(response.access_token);
      const user = {
        id: tokenPayload.sub || tokenPayload.id,
        email: tokenPayload.email,
        role: tokenPayload.role,
      };

      // 3. Actualizar contexto
      authContext.setUserSession(
        user,
        response.access_token,
        response.refresh_token,
      );

      toast.success("¡Bienvenido! Inicio de sesión correcto");

      return user;
    } catch (error: any) {
      toast.error(error.message || "No se pudo iniciar sesión");
      throw error;
    }
  };

  /**
   * Register: Solo API call
   */
  const handleRegister = async (data: TRegisterData) => {
    try {
      await AuthService.register(data);
      toast.success("Registrado. Revisa tu correo para confirmar tu cuenta");
    } catch (error: any) {
      toast.error(error.message || "No se pudo registrar");
      throw error;
    }
  };

  /**
   * Reset password: Solo API call
   */
  const handleResetPassword = async (data: TResetData) => {
    try {
      await AuthService.resetPassword(data);
      toast.success(
        "Correo enviado. Revisa tu bandeja para restablecer tu contraseña",
      );
    } catch (error: any) {
      toast.error(error.message || "No se pudo enviar el correo");
      throw error;
    }
  };

  /**
   * Logout: API call + limpiar contexto
   */
  const handleLogout = async () => {
    try {
      // 1. Si hay token, llamar API de logout
      if (authContext.token) {
        try {
          await AuthService.logout(authContext.token);
        } catch (error) {
          console.warn("Error en logout del servidor:", error);
          // Continuar con logout local aunque falle el servidor
        }
      }

      // 2. Limpiar contexto
      authContext.clearUserSession();

      toast.success("Sesión cerrada correctamente");
    } catch (error: any) {
      toast.error("Error al cerrar sesión");
      // Aún así limpiar el contexto
      authContext.clearUserSession();
    }
  };

  /**
   * Refresh token: API call + actualizar contexto
   */
  const handleRefreshToken = async (): Promise<boolean> => {
    try {
      if (!authContext.refreshToken) return false;

      const response = await AuthService.refreshToken(authContext.refreshToken);
      authContext.updateToken(response.access_token, response.refresh_token);

      return true;
    } catch (error) {
      console.error("Error refrescando token:", error);
      authContext.clearUserSession();
      return false;
    }
  };

  /**
   * Verificar sesión actual: API call para validar
   */
  const validateCurrentSession = async (): Promise<boolean> => {
    try {
      if (!authContext.token || authContext.isTokenExpired()) {
        // Intentar refresh si tenemos refresh token
        if (authContext.refreshToken) {
          return await handleRefreshToken();
        }
        return false;
      }

      // Verificar con el servidor
      // await AuthService.getCurrentUser(authContext.token);

      // Por ahora verificar con local storage si existe el token
      const storedToken = localStorage.getItem("auth_token");
      if (!storedToken) {
        authContext.clearUserSession();
        return false;
      }
      const tokenPayload = decodeJWT(storedToken);
      if (!tokenPayload || !tokenPayload.sub) {
        authContext.clearUserSession();
        return false;
      }
      // Si llegamos aquí, la sesión es válida
      return true;
    } catch (error) {
      console.error("Sesión inválida:", error);
      authContext.clearUserSession();
      return false;
    }
  };

  return {
    // Estado desde el contexto
    user: authContext.user,
    token: authContext.token,
    isAuthenticated: authContext.isAuthenticated,
    authReady: authContext.authReady,

    // Acciones que combinan API + Context
    handleLogin,
    handleRegister,
    handleResetPassword,
    handleLogout,
    handleRefreshToken,
    validateCurrentSession,

    // Acciones directas del contexto
    clearSession: authContext.clearUserSession,
    isTokenExpired: authContext.isTokenExpired,
  };
}
