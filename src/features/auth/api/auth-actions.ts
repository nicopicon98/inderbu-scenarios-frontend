'use server';

import { createUserRepository } from '@/entities/user/api/userRepository';
import {
  LoginCredentials,
  LoginSchema,
  RegisterData,
  RegisterSchema,
  ResetPasswordSchema,
  extractUserFromToken
} from '@/entities/user/model/types';
import { ServerHttpClientFactory } from '@/shared/api/http-client-server';
import { createServerAuthContext } from '@/shared/api/server-auth';
import { createFormDataValidator } from '@/shared/lib/validation';
import { cookies } from 'next/headers';

export interface AuthResult {
  success: boolean;
  data?: any;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// Form data validators
const validateLogin = createFormDataValidator(LoginSchema);
const validateRegister = createFormDataValidator(RegisterSchema);
const validateResetPassword = createFormDataValidator(ResetPasswordSchema);

export async function loginAction(
  prevState: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  try {
    // Validate input
    const credentials = validateLogin(formData);

    // Create repository (no auth needed for login)
    const httpClient = await ServerHttpClientFactory.createServerSync();
    const repository = createUserRepository(httpClient);

    // Execute login
    const tokens = await repository.login(credentials);

    // Extract user from token
    const user = extractUserFromToken(tokens.access_token);
    if (!user) {
      throw new Error('Invalid token received from server');
    }

    // Set server-side cookies
    const cookieStore = await cookies();
    cookieStore.set('auth_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    if (tokens.refresh_token) {
      cookieStore.set('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    console.log(`User logged in successfully: ${user.email}`);

    return {
      success: true,
      data: {
        user,
        tokens,
      },
    };
  } catch (error) {
    console.error('Error in login action:', error);

    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return {
          success: false,
          error: 'Datos de entrada inválidos',
          fieldErrors: { general: [error.message] },
        };
      }

      return {
        success: false,
        error: error.message || 'Error de autenticación',
      };
    }

    return {
      success: false,
      error: 'Error inesperado al iniciar sesión',
    };
  }
}

export async function registerAction(
  prevState: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  try {
    // Validate input
    const registerData = validateRegister(formData);

    // Create repository
    const httpClient = await ServerHttpClientFactory.createServerSync();
    const repository = createUserRepository(httpClient);

    // Execute registration
    await repository.register(registerData);

    console.log(`User registered successfully: ${registerData.email}`);

    return {
      success: true,
      data: { message: 'Registrado correctamente. Revisa tu correo para confirmar tu cuenta.' },
    };
  } catch (error) {
    console.error('Error in register action:', error);

    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return {
          success: false,
          error: 'Datos de entrada inválidos',
          fieldErrors: { general: [error.message] },
        };
      }

      return {
        success: false,
        error: error.message || 'Error de registro',
      };
    }

    return {
      success: false,
      error: 'Error inesperado al registrar usuario',
    };
  }
}

export async function resetPasswordAction(
  prevState: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  try {
    // Validate input
    const resetData = validateResetPassword(formData);

    // Create repository
    const httpClient = await ServerHttpClientFactory.createServer();
    const repository = createUserRepository(httpClient);

    // Execute reset password
    await repository.resetPassword(resetData);

    console.log(`Password reset sent for: ${resetData.email}`);

    return {
      success: true,
      data: { message: 'Correo enviado. Revisa tu bandeja para restablecer tu contraseña.' },
    };
  } catch (error) {
    console.error('Error in reset password action:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar correo de restablecimiento',
    };
  }
}

export async function logoutAction(): Promise<AuthResult> {
  try {
    // Try to call logout endpoint
    try {
      const authContext = createServerAuthContext();
      const httpClient = ServerHttpClientFactory.createServer(authContext);
      const repository = createUserRepository(httpClient);

      await repository.logout();
    } catch (error) {
      console.warn('Error calling logout endpoint:', error);
      // Continue with local logout even if server call fails
    }

    // Clear server-side cookies
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    cookieStore.delete('refresh_token');

    console.log('User logged out successfully');

    return {
      success: true,
      data: { message: 'Sesión cerrada correctamente' },
    };
  } catch (error) {
    console.error('Error in logout action:', error);

    return {
      success: false,
      error: 'Error al cerrar sesión',
    };
  }
}

// Direct function calls (non-form based)
export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    const validatedCredentials = LoginSchema.parse(credentials);

    const httpClient = await ServerHttpClientFactory.createServer();
    const repository = createUserRepository(httpClient);

    const tokens = await repository.login(validatedCredentials);
    const user = extractUserFromToken(tokens.access_token);

    if (!user) {
      throw new Error('Invalid token received from server');
    }

    // Set cookies
    const cookieStore = await cookies();
    cookieStore.set('auth_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    if (tokens.refresh_token) {
      cookieStore.set('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return {
      success: true,
      data: { user, tokens },
    };
  } catch (error) {
    console.error('Error in direct login:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de autenticación',
    };
  }
}

export async function register(data: RegisterData): Promise<AuthResult> {
  try {
    const validatedData = RegisterSchema.parse(data);

    const httpClient = await ServerHttpClientFactory.createServer();
    const repository = createUserRepository(httpClient);

    await repository.register(validatedData);

    return {
      success: true,
      data: { message: 'Usuario registrado correctamente' },
    };
  } catch (error) {
    console.error('Error in direct register:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de registro',
    };
  }
}
