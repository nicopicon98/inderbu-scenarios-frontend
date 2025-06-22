'use client';

import { DefaultOptions, QueryClient } from '@tanstack/react-query';

const queryConfig: DefaultOptions = {
    queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes (cuando la data se considera obsoleta)
        gcTime: 10 * 60 * 1000,   // 10 minutes (cuando la data se elimina de la memoria)
        retry: (failureCount, error: any) => {
            // No reintentar si hay un error de cliente (4xx) excepto 408 (Request Timeout)
            if (error?.statusCode >= 400 && error?.statusCode < 500 && error?.statusCode !== 408) {
                return false;
            }
            return failureCount < 3;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: 'always',
    },
    mutations: {
        retry: (failureCount, error: any) => {
            // No reintentar si hay un error de cliente (4xx) excepto 408 (Request Timeout)
            if (error?.statusCode >= 400 && error?.statusCode < 500) {
                return false;
            }
            return failureCount < 1; // Only retry once for mutations
        },
    },
};

export const createQueryClient = () => new QueryClient({
    defaultOptions: queryConfig,
});

// Global instance for client-side usage
let browserQueryClient: QueryClient | undefined = undefined;

export const getQueryClient = () => {
    if (typeof window === 'undefined') {
        // Server: always make a new query client
        return createQueryClient();
    } else {
        // Browser: make a new query client if we don't already have one
        if (!browserQueryClient) browserQueryClient = createQueryClient();
        return browserQueryClient;
    }
};