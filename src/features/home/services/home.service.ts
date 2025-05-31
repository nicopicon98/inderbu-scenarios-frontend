import { apiClient } from '@/shared/api';
import { 
  IActivityArea, 
  INeighborhood, 
  ISubScenario,
  IFilters 
} from '../types/filters.types';
import { IActivityAreaData, IActivityAreaOption, INeighborhoodData, INeighborhoodOption, ISubScenarioData } from '../types/api.types';

export class HomeService {
  
  // ===== MÉTODOS PARA DATOS INICIALES (SSR) =====
  
  /**
   * Obtener todas las áreas de actividad para datos iniciales
   * Cache largo porque son datos estáticos
   */
  static async getActivityAreas(): Promise<IActivityArea[]> {
    const items = await apiClient.getCollection<IActivityAreaData>('/activity-areas', {
      cacheStrategy: 'LongTerm', // 1 hora de cache
    });

    return items.map(item => ({
      id: String(item.id),
      name: item.name || 'Sin nombre',
    }));
  }

  /**
   * Obtener todos los barrios para datos iniciales  
   * Cache largo porque son datos estáticos
   */
  static async getNeighborhoods(): Promise<INeighborhood[]> {
    const items = await apiClient.getCollection<INeighborhoodData>('/neighborhoods', {
      cacheStrategy: 'LongTerm', // 1 hora de cache
    });

    return items.map(item => ({
      id: String(item.id), 
      name: item.name || 'Sin nombre',
    }));
  }

  /**
   * Buscar sub-escenarios con filtros y paginación
   * Cache inteligente según si hay filtros específicos
   */
  static async getSubScenarios(searchParams: {
    page?: number;
    limit?: number;
    searchQuery?: string;
    activityAreaId?: number;
    neighborhoodId?: number;
    hasCost?: boolean;
    scenarioId?: number;
  } = {}): Promise<{ data: ISubScenario[]; meta: any }> {
    const {
      page = 1,
      limit = 10,
      searchQuery = '',
      activityAreaId,
      neighborhoodId,
      hasCost,
      scenarioId,
    } = searchParams;

    // Lógica de cache: si hay filtros específicos del usuario, cache corto
    const hasUserFilters = Boolean(
      searchQuery ||
      activityAreaId ||
      neighborhoodId ||
      hasCost !== undefined ||
      scenarioId
    );

    const cacheStrategy = hasUserFilters ? 'Search' : 'Medium';

    const queryParams = {
      page,
      limit,
      ...(searchQuery && { search: searchQuery }),
      ...(activityAreaId && activityAreaId !== 0 && { activityAreaId }),
      ...(neighborhoodId && neighborhoodId !== 0 && { neighborhoodId }),
      ...(hasCost !== undefined && { hasCost }),
      ...(scenarioId && scenarioId !== 0 && { scenarioId }),
    };

    return apiClient.getPaginated<ISubScenarioData>('/sub-scenarios', {
      params: queryParams,
      cacheStrategy,
    });
  }

  // ===== MÉTODOS PARA BÚSQUEDA DINÁMICA (reemplazan search.service.ts) =====

  /**
   * Buscar áreas de actividad para componentes de filtros
   * Compatible con la interfaz de search.service.ts
   */
  static async searchActivityAreas(search: string = ""): Promise<IActivityAreaOption[]> {
    const params: Record<string, any> = {
      limit: 20, // Cargar más resultados para búsqueda
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    try {
      const items = await apiClient.getCollection<IActivityAreaData>('/activity-areas', {
        params,
        cacheStrategy: 'Search', // Cache corto para búsquedas
      });

      return items.map(item => ({
        id: Number(item.id),
        name: item.name || '',
      }));
    } catch (error) {
      console.error('Error searching activity areas:', error);
      return [];
    }
  }

  /**
   * Buscar barrios para componentes de filtros
   * Compatible con la interfaz de search.service.ts
   */
  static async searchNeighborhoods(search: string = ""): Promise<INeighborhoodOption[]> {
    const params: Record<string, any> = {
      limit: 20,
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    try {
      const items = await apiClient.getCollection<INeighborhoodData>('/neighborhoods', {
        params,
        cacheStrategy: 'Search', // Cache corto para búsquedas
      });

      return items.map(item => ({
        id: Number(item.id),
        name: item.name || '',
      }));
    } catch (error) {
      console.error('Error searching neighborhoods:', error);
      return [];
    }
  }

  // ===== MÉTODOS ADICIONALES PARA FUTURAS FUNCIONALIDADES =====

  /**
   * Obtener escenarios destacados
   */
  static async getFeaturedScenarios(limit: number = 6): Promise<ISubScenario[]> {
    const { data } = await apiClient.getPaginated<ISubScenarioData>('/sub-scenarios/featured', {
      params: { limit },
      cacheStrategy: 'Medium',
    });

    return data;
  }

  /**
   * Obtener estadísticas básicas
   */
  static async getHomeStats(): Promise<{ 
    totalScenarios: number; 
    totalReservations: number;
    availableToday: number;
  }> {
    return apiClient.request<{
      totalScenarios: number;
      totalReservations: number;
      availableToday: number;
    }>('/stats/home', {
      cacheStrategy: 'Medium',
    });
  }
}

export const getActivityAreas = HomeService.getActivityAreas;
export const getNeighborhoods = HomeService.getNeighborhoods;
export const getSubScenarios = HomeService.getSubScenarios;
export const searchActivityAreas = HomeService.searchActivityAreas;
export const searchNeighborhoods = HomeService.searchNeighborhoods;