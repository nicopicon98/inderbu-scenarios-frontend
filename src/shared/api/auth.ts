export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export class ClientAuthManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  // Helper to set cookies from client
  private static setCookie(name: string, value: string, days: number = 7): void {
    if (typeof window === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
  }

  // Helper to delete cookies from client
  private static deleteCookie(name: string): void {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  // Client-side token management
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    // Store in localStorage for client-side access
    localStorage.setItem(this.TOKEN_KEY, token);
    
    // Also store in cookies for server-side access
    this.setCookie(this.TOKEN_KEY, token, 7); // 7 days
    
    console.log('ClientAuthManager: Token stored in localStorage + cookies');
  }

  static setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    // Store in localStorage for client-side access
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    
    // Also store in cookies for server-side access
    this.setCookie(this.REFRESH_TOKEN_KEY, token, 30); // 30 days
    
    console.log('ClientAuthManager: Refresh token stored in localStorage + cookies');
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    // Clear from localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    
    // Clear from cookies
    this.deleteCookie(this.TOKEN_KEY);
    this.deleteCookie(this.REFRESH_TOKEN_KEY);
    
    console.log('ClientAuthManager: Tokens cleared from localStorage + cookies');
  }

  static setTokens(accessToken: string, refreshToken?: string): void {
    this.setToken(accessToken);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}

// Auth context interface for HttpClient
export interface AuthContext {
  getToken(): Promise<string | null>;
  isServer: boolean;
}

export const createClientAuthContext = (): AuthContext => ({
  getToken: async () => ClientAuthManager.getToken(),
  isServer: false,
});
