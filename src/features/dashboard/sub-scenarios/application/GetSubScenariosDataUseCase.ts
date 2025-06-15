import { SubScenario, Scenario, ActivityArea, Neighborhood, PageMeta } from '@/services/api';
import {
  ISubScenarioRepository,
  IScenarioRepository,
  IActivityAreaRepository,
  INeighborhoodRepository,
  SubScenariosFilters,
} from '../domain/repositories/ISubScenarioRepository';

export interface SubScenariosDataResponse {
  subScenarios: SubScenario[];
  scenarios: Scenario[];
  activityAreas: ActivityArea[];
  neighborhoods: Neighborhood[];
  fieldSurfaceTypes: { id: number; name: string }[];
  meta: PageMeta;
  filters: SubScenariosFilters;
}

export class GetSubScenariosDataUseCase {
  constructor(
    private readonly subScenarioRepository: ISubScenarioRepository,
    private readonly scenarioRepository: IScenarioRepository,
    private readonly activityAreaRepository: IActivityAreaRepository,
    private readonly neighborhoodRepository: INeighborhoodRepository
  ) {}

  async execute(filters: SubScenariosFilters = {}): Promise<SubScenariosDataResponse> {
    try {
      // Default filters
      const defaultFilters: SubScenariosFilters = {
        page: 1,
        limit: 7,
        search: "",
        ...filters,
      };

      // Load all catalog data and sub-scenarios in parallel using repositories
      const [
        scenarios,
        activityAreas,
        neighborhoods,
        subScenariosResult,
      ] = await Promise.all([
        this.scenarioRepository.getAllWithLimit(100),
        this.activityAreaRepository.getAll(),
        this.neighborhoodRepository.getAll(),
        this.subScenarioRepository.getAllWithPagination(defaultFilters),
      ]);

      // Static field surface types (could come from API in the future)
      const fieldSurfaceTypes = [
        { id: 1, name: "Concreto" },
        { id: 2, name: "Sintético" },
        { id: 3, name: "Césped" },
        { id: 4, name: "Cemento" },
      ];

      return {
        subScenarios: subScenariosResult.data,
        scenarios,
        activityAreas,
        neighborhoods,
        fieldSurfaceTypes,
        meta: subScenariosResult.meta,
        filters: defaultFilters,
      };

    } catch (error) {
      console.error('Error in GetSubScenariosDataUseCase:', error);
      throw error;
    }
  }
}
