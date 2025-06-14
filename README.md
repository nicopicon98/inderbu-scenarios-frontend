# 🏟️ Inderbu Scenarios Frontend

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Shadcn/UI](https://img.shields.io/badge/Shadcn/UI-Latest-black?style=for-the-badge)](https://ui.shadcn.com/)

Sistema de reserva y gestión de escenarios deportivos para el Instituto de Deportes y Recreación de Bucaramanga (INDERBU).

## Tabla de Contenidos

- [Inicio Rápido](#-inicio-rápido)
- [Arquitectura](#-arquitectura)
  - [Estructura de Carpetas](#estructura-de-carpetas)
  - [Patrones Arquitectónicos](#patrones-arquitectónicos)
- [⚙️ Tecnologías](#-tecnologías)
- [🧩 Features](#-features)
- [🔧 Desarrollo](#-desarrollo)
- [Despliegue](#-despliegue)
- [📝 Guías de Desarrollo](#-guías-de-desarrollo)
- [👥 Contribución](#-contribución)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

## Inicio Rápido

```bash
# Clonar el repositorio
git clone https://github.com/inderbu/inderbu-scenarios-frontend.git

# Instalar dependencias
cd inderbu-scenarios-frontend
pnpm install

# Iniciar entorno de desarrollo
pnpm dev

# Iniciar pruebas
pnpm test

# Construir para producción
pnpm build
```

## Arquitectura

El proyecto sigue una arquitectura moderna que combina los principios de Feature-First y Atomic Design, optimizada para Next.js 14 con el App Router.

### Estructura de Carpetas

```
/inderbu-scenarios-frontend
  /app                           # App Router (Next.js)
    /(home)                      # Grupo de rutas para home
      page.tsx                   # Página principal
    /(auth)                      # Grupo para autenticación
      /login
        page.tsx
      /register
        page.tsx
    /(scenarios)                 # Escenarios deportivos
      /[id]
        page.tsx
        loading.tsx
    /(info)                      # Información general
      page.tsx
    layout.tsx
    loading.tsx
    globals.css
    error.tsx
    not-found.tsx

  /features                      # Organización por características
    /home
      /components
        /atoms
        /molecules
        /organisms
      /hooks                     # Custom hooks específicos
        useHomeFilters.tsx
      /services                  # Servicios para esta feature
        facilityService.ts       # Clase estática para acceso a datos
      /store                     # Estado local de feature
        homeState.ts             # Estado (Redux/Zustand/etc.)
      /contexts                  # Contextos React
        HomeContext.tsx
      /api                       # Capa de acceso a API específica
        facilityApi.ts           # Llamadas a API específicas
      /types                     # Tipos específicos
        facility.types.ts
      /utils                     # Utilidades específicas
        homeUtils.ts

    /scenarios
      /components
        /atoms
        /molecules
        /organisms
      /hooks
        useScenario.tsx
      /services                  # Servicios estáticos
        scenarioService.ts       # Métodos de servicio
        bookingService.ts        # Lógica de negocio para reservas
      /store
        scenariosState.ts        # Estado
      /contexts
        ScenarioContext.tsx
      /api
        scenarioApi.ts           # Llamadas a API
      /socket                    # Gestión de websockets específicos
        scenarioSocket.ts        # Conexión socket para updates en tiempo real
      /types
      /utils

    /auth
      /components
        /atoms
        /molecules
        /organisms
      /hooks
        useAuth.tsx
      /services                  # Servicios estáticos de auth
        authService.ts           # Métodos para manejo de autenticación
        tokenService.ts          # Gestión de tokens
      /store
        authState.ts
      /contexts
        AuthContext.tsx
      /api
        authApi.ts               # Llamadas a API de auth
      /types
      /utils

  /shared                        # Componentes y utilidades compartidas
    /components
      /atoms
      /molecules
      /organisms
      /templates
        MainLayout.tsx
    /hooks                       # Hooks compartidos
      useMobile.tsx
      useToast.ts
      useFetch.tsx               # Hook genérico para peticiones
      useSocket.tsx              # Hook para sockets
    /contexts
      ThemeContext.tsx
    /store                       # Estado global compartido
      globalState.ts
    /services                    # Servicios compartidos estáticos
      cacheService.ts            # Servicio de caché
      logService.ts              # Servicio de logging
      storageService.ts          # Local/Session storage
    /api
      apiClient.ts               # Cliente API base configurado
      apiUtils.ts                # Utilidades para API
    /socket                      # Gestión de sockets centralizados
      socketManager.ts           # Manager central de sockets
      socketEvents.ts            # Constantes de eventos
    /utils
      dateUtils.ts
      validationUtils.ts
      formatUtils.ts
    /types
      common.types.ts
      api.types.ts
      socket.types.ts
    /constants                   # Constantes globales
      routes.ts
      apiEndpoints.ts
      socketEvents.ts
    /ui                          # Componentes UI de shadcn
      # Componentes de shadcn
    /providers                   # Providers
      AppProviders.tsx           # Composición de providers
      SocketProvider.tsx         # Provider para sockets
      ApiProvider.tsx            # Provider para cliente API
      ThemeProvider.tsx
      ToastProvider.tsx

  /core                          # Núcleo de la aplicación
    /api                         # Configuración base de API
      axiosInstance.ts           # Configuración base con interceptores
      fetchClient.ts             # Alternativa con fetch API
      apiInterceptors.ts         # Interceptores
    /socket                      # Configuración base de sockets
      socketClient.ts            # Cliente socket.io
      socketConfig.ts            # Configuración
    /auth                        # Core de autenticación
      authConfig.ts
      authUtils.ts
    /state                       # Gestión de estado
      createStore.ts             # Factory para crear stores
      storeUtils.ts              # Utilidades para estado
    /services                    # Servicios core
      baseService.ts             # Clase base para otros servicios
      httpService.ts             # Servicio HTTP base

  /lib                           # Utilities y configuraciones
    /api                         # Config de API
    /auth                        # Config de Auth
    /db                          # Conexión a DB
    /cache                       # Estrategias de caché
    utils.ts                     # Utils generales

  /config                        # Configuraciones de app
    env.ts                       # Variables de entorno
    constants.ts                 # Constantes globales
    routes.ts                    # Rutas de la aplicación
    api.ts                       # Config de API endpoints
    socket.ts                    # Config de socket

  /server                        # Código exclusivo del servidor
    /actions                     # Server Actions (Next.js)
      homeActions.ts
      scenarioActions.ts
      authActions.ts
    /api                         # Route Handlers
      /auth
        [...].ts
      /scenarios
        [...].ts
    /services                    # Servicios del lado del servidor
      dbService.ts
      authService.ts
    /db                          # Acceso a DB
      dbClient.ts
      models.ts
    /middlewares                 # Middlewares del servidor
      authMiddleware.ts
    /utils                       # Utilidades del servidor
      serverUtils.ts

  /types                         # Tipos globales
    global.d.ts                  # Tipos globales
    next-auth.d.ts               # Tipos para auth
    api.ts                       # Tipos para APIs

  /public                        # Archivos estáticos

  /mock-data                     # Datos de prueba

  # Archivos de configuración
  next.config.mjs
  tailwind.config.ts
  postcss.config.mjs
  tsconfig.json
  package.json
  components.json                # Configuración de shadcn
  middleware.ts                  # Middleware global
```

### Patrones Arquitectónicos

El proyecto implementa los siguientes patrones arquitectónicos:

#### Feature-First + Atomic Design

- **Feature-First**: Organización del código por funcionalidades de negocio
- **Atomic Design**: Componentes organizados en átomos, moléculas y organismos

#### Servicios Estáticos

Clases de servicios que encapsulan la lógica de negocio:

```typescript
// Ejemplo de servicio estático
export class ScenarioService {
  static async getScenarioById(id: string) {
    // Implementación
  }

  static transformScenarioData(data: any) {
    // Transformación de datos
  }
}
```

#### Manejo Avanzado de Estado

- **Estado Local**: useState, useReducer en componentes
- **Estado Global**: Zustand/Redux/Context API
- **Estado del Servidor**: Server Components y Server Actions
- **Estado de Consulta**: React Query/SWR para datos remotos

#### Comunicación en Tiempo Real

- Sockets organizados por feature
- Socket Manager centralizado
- Hooks para integración con componentes

#### API Layer

Capas separadas para API:

- Core API Client: Configuración base
- Feature-specific APIs: Endpoints por funcionalidad
- Servicios: Lógica de negocio usando APIs

## ⚙️ Tecnologías

- **Framework**: Next.js 14
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes UI**: Shadcn/UI
- **Gestión de Estado**: Zustand
- **Peticiones API**: Axios
- **Tiempo Real**: Socket.io
- **Validación**: Zod
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier

## 🧩 Features

- **Autenticación**: Login, registro, recuperación de contraseña
- **Escenarios Deportivos**: Listado, búsqueda y filtrado
- **Reservas**: Calendario, selección de horarios
- **Perfil de Usuario**: Gestión de reservas, historial
- **Panel de Administración**: Gestión de escenarios y reservas

## 🔧 Desarrollo

### Comandos disponibles

```bash
# Desarrollo
pnpm dev           # Inicia servidor de desarrollo
pnpm build         # Construye para producción
pnpm start         # Inicia la versión de producción

# Linting y Formateo
pnpm lint          # Ejecuta ESLint
pnpm format        # Ejecuta Prettier

# Testing
pnpm test          # Ejecuta tests
pnpm test:watch    # Ejecuta tests en modo watch
pnpm test:coverage # Ejecuta tests con coverage

# Utilidades
pnpm ui:add        # Añade componentes de shadcn/ui
```

### Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_ENVIRONMENT=development
```

## Despliegue

### Despliegue en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

### Despliegue con Docker

```bash
# Construir imagen
docker build -t inderbu-scenarios-frontend .

# Ejecutar contenedor
docker run -p 3000:3000 inderbu-scenarios-frontend
```

## 📝 Guías de Desarrollo

### Convenciones de Código

- **Nomenclatura**: PascalCase para componentes, camelCase para funciones/variables
- **Importaciones**: Usar alias `@/` para imports absolutos
- **Componentes**: Usar functional components con hooks
- **Tipos**: Definir interfaces/types para Props y Estado

### Creación de Componentes

Seguir la estructura de Atomic Design:

```typescript
// Ejemplo de componente (Molécula)
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Buscar...' }: SearchBarProps) {
  const [query, setQuery] = useState('');

  return (
    <div className="flex gap-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
      />
      <Button onClick={() => onSearch(query)}>Buscar</Button>
    </div>
  );
}
```

### Implementación de Feature

Para implementar una nueva feature:

1. Crear estructura en `/features/[nombre-feature]`
2. Implementar componentes, hooks, servicios y APIs necesarios
3. Crear rutas en `/app/` si es necesario
4. Integrar con el resto de la aplicación

## 👥 Contribución

1. Hacer fork del repositorio
2. Crear rama para la feature (`git checkout -b feature/amazing-feature`)
3. Hacer commit de los cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

## Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

## Contacto

Nombre del Proyecto - [@inderbu](https://twitter.com/inderbu) - info@inderbu.gov.co

Link del Proyecto: [https://github.com/inderbu/inderbu-scenarios-frontend](https://github.com/inderbu/inderbu-scenarios-frontend)
