// ❌ ARCHIVO TEMPORAL - NUEVA ARQUITECTURA DDD NO USA ESTE PATRÓN
// 
// 🔄 EN NUEVA ARQUITECTURA:
// - HTTP Clients: @/shared/api/http-client-client.ts y @/shared/api/http-client-server.ts
// - Auth Context: @/shared/api/auth.ts y @/shared/api/server-auth.ts
// - Repository Pattern: @/entities/[entity]/api/[entity]Repository.ts
// 
// ✅ USO CORRECTO EN NUEVA ARQUITECTURA:
// import { createClientHttpClient } from '@/shared/api/http-client-client';
// import { createServerHttpClient } from '@/shared/api/http-client-server';
// 
// Este archivo evita errores de compilación de archivos obsoletos
// Será eliminado cuando se complete la migración.

// Exportaciones temporales para evitar errores de compilación
export const authApiClient = {
  get: () => {
    throw new Error(`
      ❌ API CLIENT OBSOLETO: authApiClient
      
      🔄 MIGRADO A: Nueva arquitectura DDD
      
      ✅ USO CORRECTO:
      import { createClientHttpClient } from '@/shared/api/http-client-client';
      import { createServerHttpClient } from '@/shared/api/http-client-server';
      
      Este cliente será eliminado en el siguiente deploy.
    `);
  },
  post: () => {
    throw new Error('API Client obsoleto - usar nueva arquitectura DDD');
  },
  put: () => {
    throw new Error('API Client obsoleto - usar nueva arquitectura DDD');
  },
  delete: () => {
    throw new Error('API Client obsoleto - usar nueva arquitectura DDD');
  },
  getCollection: () => {
    throw new Error('API Client obsoleto - usar nueva arquitectura DDD');
  },
  getItem: () => {
    throw new Error('API Client obsoleto - usar nueva arquitectura DDD');
  },
  getPaginated: () => {
    throw new Error('API Client obsoleto - usar nueva arquitectura DDD');
  },
  patch: () => {
    throw new Error('API Client obsoleto - usar nueva arquitectura DDD');
  }
};

// Re-export current working implementations
export { ApiClient } from './api-client';
export { ClientAuthManager, createClientAuthContext } from './auth';
export { CacheStrategies } from './cache-strategies';
export { createClientHttpClient } from './http-client-client';
export { createServerHttpClient } from './http-client-server';
export { createServerAuthContext, ServerAuthManager } from './server-auth';

// Default export for apiClient (for existing usage)
export const apiClient = authApiClient;
