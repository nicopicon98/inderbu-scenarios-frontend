// Configuración de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Función para agregar token de autenticación a los headers
const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Agregar token de autenticación si existe
  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// Función para construir URL con parámetros de consulta
const buildUrl = (endpoint: string, params?: Record<string, any>): string => {
  const url = new URL(`${API_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });
  }
  
  return url.toString();
};

// Función base para realizar peticiones
const fetchApi = async <T>(
  endpoint: string, 
  options?: RequestInit,
  params?: Record<string, any>
): Promise<T> => {
  const url = buildUrl(endpoint, params);
  
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options?.headers || {}),
    },
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Error ${response.status}: ${response.statusText}`
      );
    }
    
    // Parsear respuesta como JSON
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Interfaces

export interface PageOptions {
  page?: number;
  limit?: number;
  search?: string;
  activityAreaId?: number;
  neighborhoodId?: number;
  scenarioId?: number;
}

export interface PageMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PagedResponse<T> {
  data: T[];
  meta: PageMeta;
}

export interface Neighborhood {
  id: number;
  name: string;
}

export interface ActivityArea {
  id: number;
  name: string;
}

export interface Scenario {
  id: number;
  name: string;
  address: string;
  neighborhood?: Neighborhood;
}

export interface FieldSurfaceType {
  id: number;
  name: string;
}

// Ahora actualizemos la interfaz SubScenario
export interface SubScenario {
  id: number;
  name: string;
  state: boolean;
  hasCost: boolean;
  numberOfSpectators?: number;
  numberOfPlayers?: number;
  recommendations?: string;
  createdAt: string; // o Date si prefieres parsearla
  
  // IDs de relaciones
  scenarioId: number;
  activityAreaId?: number;
  fieldSurfaceTypeId?: number;
  
  // Objetos de relaciones
  scenario?: Scenario;
  activityArea?: ActivityArea;
  fieldSurfaceType?: FieldSurfaceType;
}

// Tipo para manejar tanto respuestas paginadas como arrays simples
export type ApiResponse<T> = T[] | PagedResponse<T>;

// Servicios para Scenarios
export const scenarioService = {
  getAll: async (options: PageOptions = {}): Promise<PagedResponse<Scenario>> => {
    return fetchApi<PagedResponse<Scenario>>('/scenarios', { method: 'GET' }, options);
  },
  getById: async (id: number): Promise<Scenario> => {
    return fetchApi<Scenario>(`/scenarios/${id}`, { method: 'GET' });
  },
};

// Servicios para Sub-Scenarios
export const subScenarioService = {
  getAll: async (options: PageOptions = {}): Promise<PagedResponse<SubScenario>> => {
    return fetchApi<PagedResponse<SubScenario>>('/sub-scenarios', { method: 'GET' }, options);
  },
  getById: async (id: number): Promise<SubScenario> => {
    return fetchApi<SubScenario>(`/sub-scenarios/${id}`, { method: 'GET' });
  },
};

// Servicios para Activity Areas
export const activityAreaService = {
  getAll: async (options: PageOptions = {}): Promise<ApiResponse<ActivityArea>> => {
    return fetchApi<ApiResponse<ActivityArea>>('/activity-areas', { method: 'GET' }, options);
  }
};

// Servicios para Neighborhoods
export const neighborhoodService = {
  getAll: async (options: PageOptions = {}): Promise<ApiResponse<Neighborhood>> => {
    return fetchApi<ApiResponse<Neighborhood>>('/neighborhoods', { method: 'GET' }, options);
  }
};

// Métodos CRUD genéricos para futura extensión
export const apiService = {
  get: async <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
    return fetchApi<T>(endpoint, { method: 'GET' }, params);
  },
  
  post: async <T>(endpoint: string, data: any): Promise<T> => {
    return fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  put: async <T>(endpoint: string, data: any): Promise<T> => {
    return fetchApi<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  patch: async <T>(endpoint: string, data: any): Promise<T> => {
    return fetchApi<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  
  delete: async <T>(endpoint: string): Promise<T> => {
    return fetchApi<T>(endpoint, { method: 'DELETE' });
  },
};

export default apiService;
