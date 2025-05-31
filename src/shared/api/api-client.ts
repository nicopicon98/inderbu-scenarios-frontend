import { CacheStrategies } from "./cache-strategies";

interface ApiClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
}

interface RequestOptions {
  params?: Record<string, any>;
  cacheStrategy?: keyof typeof CacheStrategies;
  headers?: Record<string, string>;
  body?: any;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
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
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Request genérico con manejo de errores centralizado - MEJORADO
   */
  async request<TResponse>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<TResponse> {
    const {
      params,
      cacheStrategy = "Medium",
      headers = {},
      body,
      method = "GET",
    } = options;

    const url = this.buildUrl(endpoint, method === "GET" ? params : undefined);
    const strategy = CacheStrategies[cacheStrategy];

    // Para operaciones que no son GET, no usar cache
    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...this.config.defaultHeaders,
        ...headers,
      },
      // Solo aplicar cache strategies a GET requests
      ...(method === "GET" ? strategy : { cache: "no-store" }),
    };

    // Agregar body para operaciones que no son GET
    if (body && method !== "GET") {
      fetchOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          endpoint,
        );
      }

      // Para operaciones que pueden no devolver contenido (like 204)
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return await response.json();
      } else {
        return {} as TResponse;
      }
    } catch (error) {
      console.error(`API request failed [${method} ${endpoint}]:`, error);
      throw error instanceof ApiError
        ? error
        : new ApiError(
            `Network error: ${error instanceof Error ? error.message : "Unknown"}`,
            0,
            endpoint,
          );
    }
  }

  /**
   * GET - Helper para colecciones con validación automática
   */
  async getCollection<TItem>(
    endpoint: string,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ): Promise<TItem[]> {
    const response = await this.request<{ data: TItem[] }>(endpoint, {
      ...options,
      method: "GET",
    });

    if (!Array.isArray(response.data)) {
      throw new ApiError("Expected array response", 422, endpoint);
    }

    return response.data;
  }

  /**
   * GET - Helper para obtener un único elemento
   */
  async getItem<TItem>(
    endpoint: string,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ): Promise<TItem> {
    const response = await this.request<{ data: TItem }>(endpoint, {
      ...options,
      method: "GET",
    });

    if (!response || typeof response.data !== "object") {
      throw new ApiError("Expected object in data field", 422, endpoint);
    }

    return response.data;
  }

  /**
   * GET - Helper para datos paginados
   */
  async getPaginated<TItem>(
    endpoint: string,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ): Promise<{ data: TItem[]; meta: any }> {
    const response = await this.request<{ data: TItem[]; meta: any }>(
      endpoint,
      {
        ...options,
        method: "GET",
      },
    );

    if (!Array.isArray(response.data)) {
      throw new ApiError("Expected array in data field", 422, endpoint);
    }

    if (!response.meta) {
      throw new ApiError("Missing pagination meta", 422, endpoint);
    }

    return response;
  }

  /**
   * POST - Crear nuevo recurso
   */
  async post<TResponse, TBody = any>(
    endpoint: string,
    body: TBody,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ): Promise<TResponse> {
    return this.request<TResponse>(endpoint, {
      ...options,
      method: "POST",
      body,
      cacheStrategy: "NoCache", // POSTs nunca se cachean
    });
  }

  /**
   * PUT - Actualizar recurso completo
   */
  async put<TResponse, TBody = any>(
    endpoint: string,
    body: TBody,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ): Promise<TResponse> {
    return this.request<TResponse>(endpoint, {
      ...options,
      method: "PUT",
      body,
      cacheStrategy: "NoCache",
    });
  }

  /**
   * PATCH - Actualizar recurso parcial
   */
  async patch<TResponse, TBody = any>(
    endpoint: string,
    body: TBody,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ): Promise<TResponse> {
    return this.request<TResponse>(endpoint, {
      ...options,
      method: "PATCH",
      body,
      cacheStrategy: "NoCache",
    });
  }

  /**
   * DELETE - Eliminar recurso
   */
  async delete<TResponse = void>(
    endpoint: string,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ): Promise<TResponse> {
    return this.request<TResponse>(endpoint, {
      ...options,
      method: "DELETE",
      cacheStrategy: "NoCache",
    });
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
