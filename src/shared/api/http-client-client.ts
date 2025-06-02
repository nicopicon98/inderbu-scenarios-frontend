import { AuthContext, createClientAuthContext } from './auth';
import { ApiError } from './types';

export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  authContext?: AuthContext;
  headers?: Record<string, string>;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

// ✅ CLIENT-ONLY HTTP Client (no server dependencies)
export class ClientHttpClient {
  private baseURL: string;
  private timeout: number;
  private authContext?: AuthContext;
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

// ✅ CLIENT-ONLY Factory (no server dependencies)
export class ClientHttpClientFactory {
  private static readonly CLIENT_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  static createClient(authContext?: AuthContext): ClientHttpClient {
    return new ClientHttpClient({
      baseURL: this.CLIENT_BASE_URL,
      authContext,
    });
  }

  static createClientWithAuth(): ClientHttpClient {
    const authContext = createClientAuthContext();
    return this.createClient(authContext);
  }
}

// ✅ Re-export client auth context creator
export { createClientAuthContext };

// ✅ Type alias for backward compatibility
export type HttpClient = ClientHttpClient;
