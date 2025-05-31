# 🎨 Toasts de Sonner - Guía de Uso

## ✅ Problema Solucionado

Los toasts ahora aparecen con los colores correctos gracias a:

1. ✅ **ThemeProvider configurado** en layout.tsx
2. ✅ **Componente Sonner customizado** con colores específicos
3. ✅ **RichColors habilitado** para mejor UX

## 🎯 Tipos de Toast Disponibles

### **Success (Verde)**

```typescript
import { toast } from "sonner";

toast.success("¡Operación exitosa!");
toast.success("Usuario registrado correctamente");
```

### **Error (Rojo)**

```typescript
toast.error("Error al procesar la solicitud");
toast.error("No se pudo conectar al servidor");
```

### **Warning (Amarillo)**

```typescript
toast.warning("Advertencia: Sesión expirará pronto");
toast.warning("Campos obligatorios faltantes");
```

### **Info (Azul)**

```typescript
toast.info("Nueva actualización disponible");
toast.info("Procesando información...");
```

### **Toast Básico (Tema del sistema)**

```typescript
toast("Mensaje general");
toast("Notificación básica");
```

## 🎨 Ejemplos Visuales

### **En Autenticación:**

```typescript
// ✅ Login exitoso - Verde
toast.success("¡Bienvenido! Inicio de sesión correcto");

// ❌ Error de login - Rojo
toast.error("Credenciales incorrectas");

// ⚠️ Advertencia - Amarillo
toast.warning("Máximo 3 intentos de login");

// ℹ️ Información - Azul
toast.info("Revisa tu correo para confirmar tu cuenta");
```

### **En Operaciones CRUD:**

```typescript
// Crear
toast.success("Registro creado exitosamente");

// Actualizar
toast.success("Información actualizada");

// Eliminar
toast.success("Elemento eliminado");

// Errores
toast.error("No se pudo completar la operación");
```

## ⚙️ Configuración Avanzada

### **Toast con duración personalizada:**

```typescript
toast.success("Mensaje", { duration: 5000 }); // 5 segundos
```

### **Toast con acción:**

```typescript
toast.error("Error al guardar", {
  action: {
    label: "Reintentar",
    onClick: () => handleRetry(),
  },
});
```

### **Toast persistente:**

```typescript
toast.error("Error crítico", { duration: Infinity });
```

### **Toast con descripción:**

```typescript
toast.success("Operación completada", {
  description: "Los cambios se aplicaron correctamente",
});
```

## 🎭 Resultado Visual Esperado

Después de la configuración, los toasts aparecen así:

- **Success**: Fondo verde, texto blanco, ícono de check
- **Error**: Fondo rojo, texto blanco, ícono de X
- **Warning**: Fondo amarillo, texto blanco, ícono de advertencia
- **Info**: Fondo azul, texto blanco, ícono de información
- **Posición**: Top-right
- **Botón cerrar**: Habilitado
- **Animaciones**: Suaves y fluidas

## 🔧 Configuración Aplicada

```typescript
// En shared/ui/sonner.tsx
<Sonner
  theme={theme}
  richColors          // Colores automáticos por tipo
  closeButton         // Botón X para cerrar
  position="top-right" // Posición en pantalla
  toastOptions={{
    classNames: {
      success: "bg-green-600 text-white border-green-600",
      error: "bg-red-600 text-white border-red-600",
      warning: "bg-yellow-600 text-white border-yellow-600",
      info: "bg-blue-600 text-white border-blue-600",
    }
  }}
/>
```

## 📱 Responsive

Los toasts se adaptan automáticamente a diferentes tamaños de pantalla y respetan el tema del sistema (light/dark mode).

## 🎉 ¡Listo para usar!

Ahora todos los toasts en tu aplicación tendrán los colores apropiados y una mejor experiencia visual.
