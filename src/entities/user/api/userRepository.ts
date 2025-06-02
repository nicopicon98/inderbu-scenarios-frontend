import { ClientHttpClient } from '@/shared/api/http-client-client';
import { SimpleApiResponse } from '@/shared/api/types';
import {
  AuthTokens,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  User
} from '../model/types';

export interface UserRepository {
  login(credentials: LoginCredentials): Promise<AuthTokens>;
  register(data: RegisterData): Promise<void>;
  getCurrentUser(): Promise<User>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  resetPassword(data: ResetPasswordData): Promise<void>;
  logout(): Promise<void>;
}

export class ApiUserRepository implements UserRepository {
  constructor(private httpClient: ClientHttpClient) { }

  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await this.httpClient.post<SimpleApiResponse<AuthTokens>>(
      '/auth/login',
      credentials
    );
    return response.data;
  }

  async register(data: RegisterData): Promise<void> {
    await this.httpClient.post<SimpleApiResponse<void>>(
      '/auth/register',
      data
    );
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.httpClient.get<SimpleApiResponse<User>>(
      '/auth/me'
    );
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await this.httpClient.post<SimpleApiResponse<AuthTokens>>(
      '/auth/refresh',
      { refresh_token: refreshToken }
    );
    return response.data;
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    await this.httpClient.post<SimpleApiResponse<void>>(
      '/auth/reset-password',
      data
    );
  }

  async logout(): Promise<void> {
    await this.httpClient.post<SimpleApiResponse<void>>(
      '/auth/logout'
    );
  }
}

// Factory function for creating repository instances
export const createUserRepository = (httpClient: ClientHttpClient): UserRepository => {
  return new ApiUserRepository(httpClient);
};
