import { AuthContext, createClientAuthContext } from './auth';
import { ServerAuthContext } from './server-auth';
import { ApiError } from './types';

type AnyAuthContext = AuthContext | ServerAuthContext;

export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  authContext?: AnyAuthContext;
  headers?: Record<string, string>;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

export class HttpClient {
  private baseURL: string;
  private timeout: number;
  private authContext?: AnyAuthContext;
  private defaultHeaders: Record<string, string>;

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, '');
    this.timeout = config.timeout || 10000;
    this.authContext = config.authContext;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    if (this.authContext) {
      const token = await this.authContext.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async buildHeaders(customHeaders?: Record<string, string>): Promise<Record<string, string>> {
    const authHeaders = await this.getAuthHeaders();

    return {
      ...this.defaultHeaders,
      ...authHeaders,
      ...customHeaders,
    };
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    options: {
      body?: any;
      config?: RequestConfig;
    } = {}
  ): Promise<T> {
    const { body, config = {} } = options;

    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.buildHeaders(config.headers);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || this.timeout);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: config.signal || controller.signal,
      };

      if (body && method !== 'GET') {
        fetchOptions.body = body instanceof FormData ? body : JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          statusCode: response.status,
          message: 'Network error',
          timestamp: new Date().toISOString(),
          path: endpoint,
        }));

        // Backend error structure: { statusCode, message, timestamp, path }
        const apiError: ApiError = {
          statusCode: errorData.statusCode || response.status,
          message: errorData.message || `HTTP ${response.status}`,
          timestamp: errorData.timestamp || new Date().toISOString(),
          path: errorData.path || endpoint,
        };

        throw apiError;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'AbortError') {
        throw new Error('Request timeout');
      }

      throw error;
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>('GET', endpoint, { config });
  }

  async post<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>('POST', endpoint, { body, config });
  }

  async put<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>('PUT', endpoint, { body, config });
  }

  async patch<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>('PATCH', endpoint, { body, config });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>('DELETE', endpoint, { config });
  }
}

// Factory for creating HTTP clients
export class HttpClientFactory {
  private static readonly SERVER_BASE_URL = process.env.API_URL || 'http://localhost:3001';
  private static readonly CLIENT_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  static async createServerClient(authContext?: AnyAuthContext): Promise<HttpClient> {
    // If no auth context provided, try to create one dynamically
    if (!authContext && typeof window === 'undefined') {
      try {
        const { createServerAuthContext } = await import('./server-auth');
        authContext = createServerAuthContext();
      } catch (error) {
        console.warn('Could not create server auth context:', error);
      }
    }

    return new HttpClient({
      baseURL: this.SERVER_BASE_URL,
      authContext,
      headers: {
        'User-Agent': 'NextJS-Server/1.0',
      },
    });
  }

  static createClientClient(authContext?: AnyAuthContext): HttpClient {
    return new HttpClient({
      baseURL: this.CLIENT_BASE_URL,
      authContext,
    });
  }

  // Synchronous version for server actions that already have auth context
  static createServerClientSync(authContext?: AnyAuthContext): HttpClient {
    return new HttpClient({
      baseURL: this.SERVER_BASE_URL,
      authContext,
      headers: {
        'User-Agent': 'NextJS-Server/1.0',
      },
    });
  }
}

// Export auth context creators for convenience
export { createClientAuthContext };

// Server auth context creator (async to handle dynamic import)
export async function createServerAuthContext(): Promise<ServerAuthContext> {
  const { createServerAuthContext: createServerAuth } = await import('./server-auth');
  return createServerAuth();
}
