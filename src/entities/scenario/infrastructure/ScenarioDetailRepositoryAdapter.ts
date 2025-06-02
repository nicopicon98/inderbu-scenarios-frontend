// Infrastructure: Scenario Detail Repository Adapter (bridges existing API to domain interface)

import { 
  ScenarioDetailRepository, 
  ScenarioDetail, 
  ScenarioId,
  ScenarioDetailMapper 
} from '@/entities/scenario/domain/ScenarioDetailDomain';

// Existing API interface (what currently exists)
interface ScenarioApiService {
  getById(request: { id: string }): Promise<any>;
}

// Infrastructure: Adapter Pattern - Bridge existing API to domain interface
export class ScenarioDetailRepositoryAdapter implements ScenarioDetailRepository {
  constructor(private readonly apiService: ScenarioApiService) {}

  async findById(scenarioId: ScenarioId): Promise<ScenarioDetail | null> {
    console.log(`🔌 ScenarioDetailRepositoryAdapter: Executing findById with ID: ${scenarioId.value}`);

    try {
      // Transform domain ScenarioId to API request format
      const apiRequest = {
        id: scenarioId.toString()
      };

      console.log('Calling existing ScenarioService.getById with:', apiRequest);

      // Call existing API service
      const rawData = await this.apiService.getById(apiRequest);

      console.log('📦 Raw data received from API:', rawData);

      // Transform API response to domain entity using domain mapper
      const scenario = ScenarioDetailMapper.toDomainWithDefaults(rawData);
      
      // Validate mapped data using domain service
      ScenarioDetailMapper.validateMappedData(scenario);

      console.log(`ScenarioDetailRepositoryAdapter: Successfully mapped scenario "${scenario.name}"`);
      return scenario;

    } catch (error) {
      console.error('ScenarioDetailRepositoryAdapter: Error in findById:', error);
      
      // Handle specific API errors
      if (this.isNotFoundError(error)) {
        console.log(`Scenario ${scenarioId.value} not found in API`);
        return null; // Not found is a valid domain state
      }
      
      throw error; // Re-throw other errors to let domain handle them
    }
  }

  async exists(scenarioId: ScenarioId): Promise<boolean> {
    console.log(`🔌 ScenarioDetailRepositoryAdapter: Checking existence of ID: ${scenarioId.value}`);

    try {
      const scenario = await this.findById(scenarioId);
      const exists = scenario !== null;
      
      console.log(`Scenario ${scenarioId.value} exists: ${exists}`);
      return exists;

    } catch (error) {
      console.error('ScenarioDetailRepositoryAdapter: Error checking existence:', error);
      return false; // Assume doesn't exist on error
    }
  }

  private isNotFoundError(error: any): boolean {
    // Check for common not found error patterns
    return error?.status === 404 || 
           error?.message?.includes('not found') ||
           error?.message?.includes('404');
  }
}

// Factory function for DI container
export function createScenarioDetailRepositoryAdapter(apiService: ScenarioApiService): ScenarioDetailRepository {
  return new ScenarioDetailRepositoryAdapter(apiService);
}
