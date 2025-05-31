import { CacheStrategies } from "./cache-strategies";

interface ApiClientConfig {
    baseUrl: string;
    defaultHeaders?: Record<string, string>;
}

export class ApiClient {
    private config: ApiClientConfig;

    constructor(config: ApiClientConfig) {
        this.config = config;
    }

    /**
     * Construir URL con parámetros de forma segura
     */
    private buildUrl(endpoint: string, params?: Record<string, any>): string {
        const url = new URL(endpoint, this.config.baseUrl);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    url.searchParams.set(key, String(value));
                }
            });
        }

        return url.toString();
    }

    /**
     * Request genérico con manejo de errores centralizado
     */
    async request<TResponse>(
        endpoint: string,
        options: {
            params?: Record<string, any>;
            cacheStrategy?: keyof typeof CacheStrategies;
            headers?: Record<string, string>;
        } = {}
    ): Promise<TResponse> {
        const { params, cacheStrategy = 'Medium', headers = {} } = options;

        const url = this.buildUrl(endpoint, params);
        const strategy = CacheStrategies[cacheStrategy];

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.config.defaultHeaders,
                    ...headers,
                },
                ...strategy,
            });

            if (!response.ok) {
                throw new ApiError(
                    `HTTP ${response.status}: ${response.statusText}`,
                    response.status,
                    endpoint
                );
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed [${endpoint}]:`, error);
            throw error instanceof ApiError ? error : new ApiError(
                `Network error: ${error instanceof Error ? error.message : 'Unknown'}`,
                0,
                endpoint
            );
        }
    }

    /**
     * Helper para colecciones con validación automática
     */
    async getCollection<TItem>(
        endpoint: string,
        options: {
            params?: Record<string, any>;
            cacheStrategy?: keyof typeof CacheStrategies;
        } = {}
    ): Promise<TItem[]> {
        const response = await this.request<{ data: TItem[] }>(endpoint, options);

        if (!Array.isArray(response.data)) {
            throw new ApiError('Expected array response', 422, endpoint);
        }

        return response.data;
    }

    /**
    * Helper para obtener un único elemento con validación
    */
    async getItem<TItem>(
        endpoint: string,
        options: {
            params?: Record<string, any>;
            cacheStrategy?: keyof typeof CacheStrategies;
        } = {}
    ): Promise<TItem> {
        const response = await this.request<{ data: TItem }>(endpoint, options);
        if (!response || typeof response.data !== 'object') {
            throw new ApiError('Expected object in data field', 422, endpoint);
        }
        return response.data;
    }

    /**
     * Helper para datos paginados
     */
    async getPaginated<TItem>(
        endpoint: string,
        options: {
            params?: Record<string, any>;
            cacheStrategy?: keyof typeof CacheStrategies;
        } = {}
    ): Promise<{ data: TItem[]; meta: any }> {
        const response = await this.request<{ data: TItem[]; meta: any }>(endpoint, options);

        if (!Array.isArray(response.data)) {
            throw new ApiError('Expected array in data field', 422, endpoint);
        }

        if (!response.meta) {
            throw new ApiError('Missing pagination meta', 422, endpoint);
        }

        return response;
    }
}

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public endpoint: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}