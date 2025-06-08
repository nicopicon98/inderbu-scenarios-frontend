// DDD: Dependency Injection Container for Home Feature

import { GetHomeDataUseCase, createGetHomeDataUseCase } from '@/features/home/data/application/get-home-data-use-case';
import { HomeService, createHomeService } from '@/features/home/data/infrastructure/home-service';
import { createInMemoryEventBus } from '@/shared/infrastructure/InMemoryEventBus';

// Import repository adapters
import { createSubScenarioRepositoryAdapter } from '@/entities/sub-scenario/infrastructure/sub-scenario-repository.adapter';
import { createActivityAreaRepositoryAdapter } from '@/entities/activity-area/infrastructure/acitivity-area-repositoy.adapter';
import { createNeighborhoodRepositoryAdapter } from '@/entities/neighborhood/infrastructure/neighborhood-repository.adapter';

// Import existing API services (temporary bridge)
import { 
  subScenarioApiService, 
  activityAreaApiService, 
  neighborhoodApiService 
} from '@/features/home/services/home.service';

// DDD: Container interface
export interface HomeContainer {
  homeService: HomeService;
  getHomeDataUseCase: GetHomeDataUseCase;
}

/**
 * Creates and wires all dependencies for the home feature
 * Following DDD layered architecture with proper dependency injection
 */
export function createHomeContainer(): HomeContainer {
  console.log('Building Home DI Container...');

  // Infrastructure: Event Bus
  const eventBus = createInMemoryEventBus();

  // Infrastructure: Repository Adapters (Bridge existing APIs to domain interfaces)
  const subScenarioRepository = createSubScenarioRepositoryAdapter(subScenarioApiService);
  const activityAreaRepository = createActivityAreaRepositoryAdapter(activityAreaApiService);
  const neighborhoodRepository = createNeighborhoodRepositoryAdapter(neighborhoodApiService);

  console.log('Repository adapters created');

  // Application: Use Cases (Business Logic)
  const getHomeDataUseCase = createGetHomeDataUseCase(
    subScenarioRepository,
    activityAreaRepository,
    neighborhoodRepository,
    eventBus
  );

  console.log('Use cases created');

  // Infrastructure: Service (External API)
  const homeService = createHomeService(getHomeDataUseCase);

  console.log('Home DI Container ready');

  return {
    homeService,
    getHomeDataUseCase
  };
}

// Type-safe dependency access
export type HomeDependencies = ReturnType<typeof createHomeContainer>;
