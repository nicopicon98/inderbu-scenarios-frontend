import { GetScenariosDataUseCase } from '../application/GetScenariosDataUseCase';
import { ScenariosService } from '../domain/ScenariosService';
import { ScenarioRepository, NeighborhoodRepository } from '../infrastructure/ScenarioRepository';
import { IScenarioRepository, INeighborhoodRepository } from '../domain/repositories/IScenarioRepository';

export interface ScenariosContainer {
  scenariosService: ScenariosService;
}

export function createScenariosContainer(): ScenariosContainer {
  // DDD: Dependency injection - build complete container with repositories
  
  // Infrastructure layer - Repository implementations
  const scenarioRepository: IScenarioRepository = new ScenarioRepository();
  const neighborhoodRepository: INeighborhoodRepository = new NeighborhoodRepository();
  
  // Application layer - Use cases with injected repositories
  const getScenariosDataUseCase = new GetScenariosDataUseCase(
    scenarioRepository,
    neighborhoodRepository
  );
  
  // Domain layer - Services with injected use cases
  const scenariosService = new ScenariosService(
    getScenariosDataUseCase
  );

  return {
    scenariosService,
  };
}
