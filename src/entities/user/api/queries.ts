import { HttpClientFactory } from '@/shared/api/http-client';
import { createServerAuthContext } from '@/shared/api/server-auth';
import { cache } from 'react';
import { User, extractUserFromToken } from '../model/types';
import { createUserRepository } from './userRepository';

// Server-side auth queries with caching
export const getCurrentUserFromServer = cache(async (): Promise<User | null> => {
  try {
    const authContext = createServerAuthContext();
    const token = await authContext.getToken();

    if (!token) return null;

    // Try to extract user from token first (faster)
    const userFromToken = extractUserFromToken(token);
    if (userFromToken) {
      return userFromToken;
    }

    // Fallback to API call if token doesn't contain enough info
    const httpClient = HttpClientFactory.createServerClientSync(authContext);
    const repository = createUserRepository(httpClient);

    return await repository.getCurrentUser();
  } catch (error) {
    console.error('Error getting current user from server:', error);
    return null;
  }
});

export const getServerAuthState = cache(async (): Promise<{
  user: User | null;
  isAuthenticated: boolean;
}> => {
  const user = await getCurrentUserFromServer();
  return {
    user,
    isAuthenticated: !!user,
  };
});

// Validation helpers for server components
export const requireAuth = async (): Promise<User> => {
  const user = await getCurrentUserFromServer();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};

export const requireAdmin = async (): Promise<User> => {
  const user = await requireAuth();
  if (user.role !== 1 && user.role !== 2) { // SUPER_ADMIN or ADMIN
    throw new Error('Admin access required');
  }
  return user;
};

export const requireUserAccess = async (targetUserId: number): Promise<User> => {
  const user = await requireAuth();

  // Users can access their own data
  if (user.id === targetUserId) {
    return user;
  }

  // Admins can access any user's data
  if (user.role === 1 || user.role === 2) {
    return user;
  }

  throw new Error('Access denied');
};
