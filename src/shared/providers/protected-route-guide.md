# 🛡️ ProtectedRouteProvider - Guía de Uso Mejorada

## 📋 **Cambios Principales Implementados**

### **✅ Problemas Solucionados:**

1. **Import faltante**: Ahora importa correctamente `useAuth`
2. **Roles hardcoded**: Usa `EUserRole` enum en lugar de números
3. **Validación de sesión**: Verifica token con el servidor
4. **Flexibilidad**: Múltiples formas de configurar permisos
5. **TypeScript mejorado**: Tipos más específicos y seguros

### **🆕 Nuevas Funcionalidades:**

- ✅ **Validación de sesión en servidor** (opcional)
- ✅ **Múltiples roles permitidos**
- ✅ **Rutas de fallback personalizables**
- ✅ **Hook de permisos** para uso en componentes
- ✅ **Loading states diferenciados**
- ✅ **Backward compatibility** con `adminOnly`

---

## 🚀 **Ejemplos de Uso**

### **1. Uso Básico - Solo Autenticado**

```typescript
// Cualquier usuario autenticado puede acceder
<ProtectedRouteProvider>
  <DashboardPage />
</ProtectedRouteProvider>
```

### **2. Solo Administradores**

```typescript
// Solo SUPER_ADMIN y ADMIN
<ProtectedRouteProvider
  allowedRoles={[EUserRole.SUPER_ADMIN, EUserRole.ADMIN]}
>
  <AdminPanel />
</ProtectedRouteProvider>

// O usando adminOnly (backward compatibility)
<ProtectedRouteProvider adminOnly>
  <AdminPanel />
</ProtectedRouteProvider>
```

### **3. Rol Específico**

```typescript
// Solo SUPER_ADMIN
<ProtectedRouteProvider requiredRole={EUserRole.SUPER_ADMIN}>
  <SuperAdminSettings />
</ProtectedRouteProvider>

// Solo MODERATOR
<ProtectedRouteProvider requiredRole={EUserRole.MODERATOR}>
  <ModerationPanel />
</ProtectedRouteProvider>
```

### **4. Múltiples Roles Permitidos**

```typescript
// ADMIN o MODERATOR pueden acceder
<ProtectedRouteProvider
  allowedRoles={[EUserRole.ADMIN, EUserRole.MODERATOR]}
>
  <ContentManagement />
</ProtectedRouteProvider>
```

### **5. Configuración Avanzada**

```typescript
<ProtectedRouteProvider
  allowedRoles={[EUserRole.ADMIN, EUserRole.MODERATOR]}
  fallbackPath="/dashboard"           // Redirigir aquí si no tiene acceso
  validateSession={true}              // Validar con servidor (default: true)
>
  <AdvancedFeatures />
</ProtectedRouteProvider>
```

### **6. Sin Validación de Servidor**

```typescript
// Para rutas que no necesitan validación en servidor (más rápido)
<ProtectedRouteProvider
  requiredRole={EUserRole.USER}
  validateSession={false}             // Solo verificar token local
>
  <UserProfile />
</ProtectedRouteProvider>
```

---

## 🎣 **Hook usePermissionGuard**

### **Uso en Componentes**

```typescript
import { usePermissionGuard } from "@/shared/providers/protected-route-provider";

function MyComponent() {
  const {
    hasRole,
    hasAnyRole,
    isAdmin,
    isSuperAdmin,
    isUser,
    user,
    isAuthenticated
  } = usePermissionGuard();

  // Verificar rol específico
  if (hasRole(EUserRole.SUPER_ADMIN)) {
    return <SuperAdminContent />;
  }

  // Verificar múltiples roles
  if (hasAnyRole([EUserRole.ADMIN, EUserRole.MODERATOR])) {
    return <ModeratorContent />;
  }

  // Helpers rápidos
  if (isAdmin()) {
    return <AdminContent />;
  }

  if (isUser()) {
    return <UserContent />;
  }

  return <PublicContent />;
}
```

### **Renderizado Condicional**

```typescript
function Dashboard() {
  const { isAdmin, isSuperAdmin, hasRole } = usePermissionGuard();

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Solo para admins */}
      {isAdmin() && (
        <AdminPanel />
      )}

      {/* Solo para super admins */}
      {isSuperAdmin() && (
        <SuperAdminSettings />
      )}

      {/* Solo para moderadores */}
      {hasRole(EUserRole.MODERATOR) && (
        <ModerationTools />
      )}
    </div>
  );
}
```

---

## 🔄 **Migración desde la Versión Anterior**

### **Antes:**

```typescript
// ❌ Versión anterior con problemas
<ProtectedRouteProvider adminOnly>
  <AdminPanel />
</ProtectedRouteProvider>
```

### **Después:**

```typescript
// ✅ Versión mejorada - funciona igual
<ProtectedRouteProvider adminOnly>
  <AdminPanel />
</ProtectedRouteProvider>

// ✅ O mejor aún, más explícito
<ProtectedRouteProvider
  allowedRoles={[EUserRole.SUPER_ADMIN, EUserRole.ADMIN]}
>
  <AdminPanel />
</ProtectedRouteProvider>
```

---

## 🏗️ **Uso en Layouts Next.js**

### **Dashboard Layout**

```typescript
// app/dashboard/layout.tsx
import { ProtectedRouteProvider } from "@/shared/providers/protected-route-provider";
import { EUserRole } from "@/shared/enums/user-role.enum";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRouteProvider
      allowedRoles={[EUserRole.ADMIN, EUserRole.MODERATOR]}
      fallbackPath="/"
    >
      <DashboardSidebar />
      <main>{children}</main>
    </ProtectedRouteProvider>
  );
}
```

### **Admin Layout**

```typescript
// app/admin/layout.tsx
export default function AdminLayout({ children }) {
  return (
    <ProtectedRouteProvider requiredRole={EUserRole.SUPER_ADMIN}>
      <AdminSidebar />
      <main>{children}</main>
    </ProtectedRouteProvider>
  );
}
```

---

## ⚡ **Performance y UX Mejoradas**

### **Loading States Diferenciados:**

- **"Verificando acceso..."**: Cargando contexto de auth inicial
- **"Validando sesión..."**: Verificando token con servidor

### **Validación Inteligente:**

- ✅ **Local primero**: Verifica token local antes de llamar servidor
- ✅ **Servidor opcional**: Puedes deshabilitarlo para rutas que no lo necesiten
- ✅ **Refresh automático**: Si el token expira, intenta refresh antes de redirigir

### **Redirección Inteligente:**

- **Usuario regular** → Redirige a `/`
- **Admin/Moderator** → Redirige a `/dashboard`
- **Personalizable** → Usa `fallbackPath` custom

---

## 🔒 **Niveles de Seguridad**

### **Nivel 1: Solo Token Local**

```typescript
<ProtectedRouteProvider validateSession={false}>
  {/* Más rápido, menos seguro */}
</ProtectedRouteProvider>
```

### **Nivel 2: Validación con Servidor (Default)**

```typescript
<ProtectedRouteProvider validateSession={true}>
  {/* Más lento, más seguro */}
</ProtectedRouteProvider>
```

### **Nivel 3: Roles Específicos + Validación**

```typescript
<ProtectedRouteProvider
  requiredRole={EUserRole.SUPER_ADMIN}
  validateSession={true}
>
  {/* Máximo nivel de seguridad */}
</ProtectedRouteProvider>
```

---

## 🎯 **Mejores Prácticas**

### **✅ Recomendado:**

```typescript
// Usar enums en lugar de números
allowedRoles={[EUserRole.ADMIN, EUserRole.MODERATOR]}

// Especificar fallback apropiado
fallbackPath="/dashboard"

// Validar sesión en rutas críticas
validateSession={true}
```

### **❌ Evitar:**

```typescript
// No usar números hardcoded
user?.role !== 1  // ❌

// No mezclar props
<ProtectedRouteProvider
  adminOnly
  requiredRole={EUserRole.ADMIN}  // ❌ Confuso
>
```

---

## 🚀 **Resultado Final**

Con estos cambios, el `ProtectedRouteProvider` ahora:

- ✅ **Funciona correctamente** con la nueva arquitectura de `useAuth`
- ✅ **Es más flexible** con múltiples formas de configurar permisos
- ✅ **Es más seguro** con validación de sesión opcional
- ✅ **Tiene mejor UX** con loading states claros
- ✅ **Es backward compatible** con código existente
- ✅ **Incluye hook adicional** para uso en componentes

**¡Tu aplicación ahora tiene un sistema de protección de rutas robusto y profesional!** 🛡️
