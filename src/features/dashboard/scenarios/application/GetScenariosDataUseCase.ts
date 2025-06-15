import { Neighborhood, Scenario, PageMeta } from '@/services/api';
import { IScenarioRepository, INeighborhoodRepository, ScenariosFilters } from '../domain/repositories/IScenarioRepository';

export interface ScenariosDataResponse {
  scenarios: Scenario[];
  neighborhoods: Neighborhood[];
  meta: PageMeta;
  filters: ScenariosFilters;
}

export class GetScenariosDataUseCase {
  constructor(
    private readonly scenarioRepository: IScenarioRepository,
    private readonly neighborhoodRepository: INeighborhoodRepository
  ) {}

  async execute(filters: ScenariosFilters = {}): Promise<ScenariosDataResponse> {
    try {
      // Default filters
      const defaultFilters: ScenariosFilters = {
        page: 1,
        limit: 7,
        search: "",
        ...filters,
      };

      // Load scenarios and neighborhoods in parallel using repositories
      const [
        scenariosResult,
        neighborhoods,
      ] = await Promise.all([
        this.scenarioRepository.getAllWithPagination(defaultFilters),
        this.neighborhoodRepository.getAll(),
      ]);

      return {
        scenarios: scenariosResult.data,
        neighborhoods,
        meta: scenariosResult.meta,
        filters: defaultFilters,
      };

    } catch (error) {
      console.error('Error in GetScenariosDataUseCase:', error);
      throw error;
    }
  }
}
