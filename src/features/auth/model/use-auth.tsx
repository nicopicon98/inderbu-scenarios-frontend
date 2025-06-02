'use client';

import { createUserRepository } from '@/entities/user/api/userRepository';
import {
  AuthState,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  User,
  extractUserFromToken,
  isTokenExpired
} from '@/entities/user/model/types';
import { ClientAuthManager } from '@/shared/api/auth';
import { ClientHttpClientFactory, createClientAuthContext } from '@/shared/api/http-client-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { TRegisterData } from '../schemas/auth-schemas';

interface AuthContextType extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: TRegisterData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;

  // Validation methods (for compatibility with ProtectedRouteProvider)
  validateCurrentSession: () => Promise<boolean>;
  isTokenExpired: () => boolean;

  // State setters (for server actions integration)
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;

  // Compatibility alias
  authReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const queryClient = useQueryClient();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = ClientAuthManager.getToken();

        if (!token) {
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        if (isTokenExpired(token)) {
          // Try to refresh token
          const refreshToken = ClientAuthManager.getRefreshToken();
          if (refreshToken) {
            const refreshed = await handleRefreshToken();
            if (!refreshed) {
              ClientAuthManager.clearTokens();
              setAuthState(prev => ({ ...prev, isLoading: false }));
              return;
            }
          } else {
            ClientAuthManager.clearTokens();
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return;
          }
        }

        // Extract user from token
        const user = extractUserFromToken(token);
        if (user) {
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          ClientAuthManager.clearTokens();
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        ClientAuthManager.clearTokens();
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Error de inicialización',
        });
      }
    };

    initializeAuth();
  }, []);

  // Create repository instance
  const createRepository = () => {
    const authContext = createClientAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);
    return createUserRepository(httpClient);
  };

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const repository = createRepository();
      return repository.login(credentials);
    },
    onSuccess: (tokens) => {
      // Store tokens
      ClientAuthManager.setTokens(tokens.access_token, tokens.refresh_token);

      // Extract user from token
      const user = extractUserFromToken(tokens.access_token);
      if (user) {
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        toast.success('¡Bienvenido! Inicio de sesión correcto');
      } else {
        throw new Error('Token inválido recibido del servidor');
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Error de autenticación';
      setAuthState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      toast.error(errorMessage);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: TRegisterData) => {
      const repository = createRepository();
      return repository.register(data);
    },
    onSuccess: () => {
      toast.success('Registrado correctamente. Revisa tu correo para confirmar tu cuenta.');
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Error de registro';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const repository = createRepository();
      return repository.resetPassword(data);
    },
    onSuccess: () => {
      toast.success('Correo enviado. Revisa tu bandeja para restablecer tu contraseña.');
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Error al enviar correo';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        const repository = createRepository();
        await repository.logout();
      } catch (error) {
        console.warn('Error calling logout endpoint:', error);
        // Continue with local logout even if server call fails
      }
    },
    onSettled: () => {
      // Clear tokens and state regardless of server call result
      ClientAuthManager.clearTokens();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // Clear all queries
      queryClient.clear();

      toast.success('Sesión cerrada correctamente');
    },
  });

  // Validate current session
  const validateCurrentSession = async (): Promise<boolean> => {
    try {
      const token = ClientAuthManager.getToken();
      
      if (!token) {
        return false;
      }

      if (isTokenExpired(token)) {
        // Try to refresh token
        const refreshToken = ClientAuthManager.getRefreshToken();
        if (refreshToken) {
          return await handleRefreshToken();
        }
        return false;
      }

      // Token exists and is not expired - session is valid
      return true;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  };

  // Check if current token is expired
  const checkTokenExpired = (): boolean => {
    const token = ClientAuthManager.getToken();
    if (!token) return true;
    return isTokenExpired(token);
  };
  const handleRefreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = ClientAuthManager.getRefreshToken();
      if (!refreshToken) return false;

      const repository = createRepository();
      const tokens = await repository.refreshToken(refreshToken);

      // Store new tokens
      ClientAuthManager.setTokens(tokens.access_token, tokens.refresh_token);

      // Update user from new token
      const user = extractUserFromToken(tokens.access_token);
      if (user) {
        setAuthState(prev => ({ ...prev, user, isAuthenticated: true }));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      ClientAuthManager.clearTokens();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return false;
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    ...authState,
    login: async (credentials: LoginCredentials) => {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await loginMutation.mutateAsync(credentials);
    },
    register: async (data: TRegisterData) => {
      setAuthState(prev => ({ ...prev, error: null }));
      await registerMutation.mutateAsync(data);
    },
    resetPassword: async (data: ResetPasswordData) => {
      setAuthState(prev => ({ ...prev, error: null }));
      await resetPasswordMutation.mutateAsync(data);
    },
    logout: async () => {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await logoutMutation.mutateAsync();
    },
    refreshToken: handleRefreshToken,
    validateCurrentSession,
    isTokenExpired: checkTokenExpired,
    authReady: !authState.isLoading, // Compatibility alias
    setUser: (user: User | null) => {
      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated: !!user
      }));
    },
    setError: (error: string | null) => {
      setAuthState(prev => ({ ...prev, error }));
    },
    setLoading: (isLoading: boolean) => {
      setAuthState(prev => ({ ...prev, isLoading }));
    },
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for server action integration
export function useAuthActions() {
  const { setUser, setError, setLoading } = useAuth();

  return {
    handleLoginSuccess: (user: User, tokens: any) => {
      // Store tokens in localStorage
      ClientAuthManager.setTokens(tokens.access_token, tokens.refresh_token);
      setUser(user);
      setError(null);
      setLoading(false);
    },
    handleAuthError: (error: string) => {
      setError(error);
      setLoading(false);
    },
    handleLogoutSuccess: () => {
      ClientAuthManager.clearTokens();
      setUser(null);
      setError(null);
      setLoading(false);
    },
  };
}
