// DDD: Dependency Injection Container for Scenario Detail Feature

import { GetScenarioDetailUseCase, createGetScenarioDetailUseCase } from '@/features/scenarios/detail/application/GetScenarioDetailUseCase';
import { ScenarioDetailService, createScenarioDetailService } from '@/features/scenarios/detail/infrastructure/ScenarioDetailService';
import { createInMemoryEventBus } from '@/shared/infrastructure/InMemoryEventBus';

// Import repository adapter
import { createScenarioDetailRepositoryAdapter } from '@/entities/scenario/infrastructure/ScenarioDetailRepositoryAdapter';

// Import existing API service (bridge)
import { ScenarioService } from '@/features/scenarios/services/scenario.service';

// DDD: Container interface
export interface ScenarioDetailContainer {
  scenarioDetailService: ScenarioDetailService;
  getScenarioDetailUseCase: GetScenarioDetailUseCase;
}

/**
 * Creates and wires all dependencies for the scenario detail feature
 * Following DDD layered architecture with proper dependency injection
 */
export function createScenarioDetailContainer(): ScenarioDetailContainer {
  console.log('🏗️ Building ScenarioDetail DI Container...');

  // Infrastructure: Event Bus
  const eventBus = createInMemoryEventBus();

  // Infrastructure: Repository Adapter (Bridge existing API to domain interface)
  const scenarioDetailRepository = createScenarioDetailRepositoryAdapter(ScenarioService);

  console.log('Repository adapter created');

  // Application: Use Cases (Business Logic)
  const getScenarioDetailUseCase = createGetScenarioDetailUseCase(
    scenarioDetailRepository,
    eventBus
  );

  console.log('Use cases created');

  // Infrastructure: Service (External API)
  const scenarioDetailService = createScenarioDetailService(getScenarioDetailUseCase);

  console.log('ScenarioDetail DI Container ready');

  return {
    scenarioDetailService,
    getScenarioDetailUseCase
  };
}

// Type-safe dependency access
export type ScenarioDetailDependencies = ReturnType<typeof createScenarioDetailContainer>;
