// ❌ ARCHIVO OBSOLETO ELIMINADO
// Este archivo ha sido migrado a @/features/auth/model/useAuth.tsx
// siguiendo la nueva arquitectura DDD + FSD + Atomic Design
//
// 🚫 NO IMPORTAR DESDE AQUÍ
// ✅ Usar: import { useAuth } from '@/features/auth';
//
// El archivo será eliminado en la siguiente limpieza.

export function useAuth() {
  throw new Error(`
    ❌ ARCHIVO OBSOLETO: @/features/auth/hooks/use-auth
    
    🔄 MIGRADO A: @/features/auth/model/useAuth.tsx
    
    ✅ USO CORRECTO:
    import { useAuth } from '@/features/auth';
    
    Este archivo será eliminado en el siguiente deploy.
  `);
}
