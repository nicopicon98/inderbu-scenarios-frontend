import { ApiClient } from './api-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export const apiClient = new ApiClient({
  baseUrl: API_BASE_URL,
  defaultHeaders: {
    'Accept': 'application/json',
    // Agregar headers globales aquí si es necesario
  },
});

// Re-export para conveniencia
export { CacheStrategies } from './cache-strategies';
export { ApiError } from './api-client';