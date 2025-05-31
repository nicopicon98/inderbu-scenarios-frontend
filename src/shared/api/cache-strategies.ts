export const CacheStrategies = {
    // Para datos que cambian muy poco (configuraciones, categorías, etc.)
    LongTerm: {
        next: { revalidate: 3600 }, // 1 hora
        description: 'Datos estáticos - ideal para categorías, configuraciones',
    },

    // Para búsquedas dinámicas del usuario
    Search: {
        next: { revalidate: 30 }, // 30 segundos - cache muy corto para búsquedas
        description: 'Búsquedas dinámicas - cache corto para mejor UX',
    },

    // Para datos que cambian ocasionalmente (listados base, feeds)
    Medium: {
        next: { revalidate: 300 }, // 5 minutos
        description: 'Datos semi-dinámicos - ideal para listados base',
    },

    // Para datos que cambian frecuentemente (contadores, estadísticas)
    ShortTerm: {
        next: { revalidate: 60 }, // 1 minuto
        description: 'Datos dinámicos - ideal para estadísticas',
    },

    // Para búsquedas y filtros específicos del usuario
    NoCache: {
        cache: 'no-store' as RequestCache,
        description: 'Sin cache - ideal para búsquedas personalizadas',
    },

    // Para datos en tiempo real
    Realtime: {
        cache: 'no-store' as RequestCache,
        next: { revalidate: 0 },
        description: 'Tiempo real - ideal para chat, notificaciones',
    },
} as const;

export type CacheStrategyKey = keyof typeof CacheStrategies;