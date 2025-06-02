// ❌ ARCHIVO ELIMINADO - ERA OBSOLETO
// 
// 🔄 MIGRADO A: @/features/auth/model/useAuth.tsx
// 
// USO CORRECTO:
// import { useAuth } from '@/features/auth';
// 
// Este archivo ha sido eliminado porque ya no es necesario.
// Todos los imports deben usar la nueva implementación DDD.

export function useAuth() {
  throw new Error(`
    ❌ ARCHIVO OBSOLETO: @/features/auth/hooks/use-auth
    
    🔄 MIGRADO A: @/features/auth/model/useAuth.tsx
    
    USO CORRECTO:
    import { useAuth } from '@/features/auth';
    
    Este archivo será eliminado en el siguiente deploy.
  `);
}
