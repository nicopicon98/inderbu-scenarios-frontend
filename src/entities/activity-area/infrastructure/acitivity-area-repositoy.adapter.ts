// Infrastructure: Activity Area Repository Adapter (bridges existing API to domain interface)

import { ActivityAreaRepository, ActivityArea } from '@/entities/activity-area/domain/activity-area.domain';

// Existing API interface (what currently exists)
interface ActivityAreaApiService {
  getActivityAreas(): Promise<ActivityArea[]>;
}

// Infrastructure: Adapter Pattern - Bridge existing API to domain interface
export class ActivityAreaRepositoryAdapter implements ActivityAreaRepository {
  constructor(private readonly apiService: ActivityAreaApiService) {}

  async findAll(): Promise<ActivityArea[]> {
    console.log('🔌 ActivityAreaRepositoryAdapter: Executing findAll');

    try {
      // Call existing API service
      const result = await this.apiService.getActivityAreas();
      
      console.log(`ActivityAreaRepositoryAdapter: Found ${result.length} activity areas`);
      return result;

    } catch (error) {
      console.error('ActivityAreaRepositoryAdapter: Error in findAll:', error);
      throw error; // Re-throw to let domain handle it
    }
  }

  async findById(id: number): Promise<ActivityArea | null> {
    console.log(`🔌 ActivityAreaRepositoryAdapter: Executing findById with id: ${id}`);

    try {
      const allActivityAreas = await this.findAll();
      const found = allActivityAreas.find(area => area.id === id);
      
      console.log(`ActivityAreaRepositoryAdapter: ${found ? 'Found' : 'Not found'} activity area with id ${id}`);
      return found || null;

    } catch (error) {
      console.error('ActivityAreaRepositoryAdapter: Error in findById:', error);
      throw error;
    }
  }

  async findByName(name: string): Promise<ActivityArea[]> {
    console.log(`🔌 ActivityAreaRepositoryAdapter: Executing findByName with name: ${name}`);

    try {
      const allActivityAreas = await this.findAll();
      const filtered = allActivityAreas.filter(area => 
        area.name.toLowerCase().includes(name.toLowerCase())
      );
      
      console.log(`ActivityAreaRepositoryAdapter: Found ${filtered.length} activity areas matching "${name}"`);
      return filtered;

    } catch (error) {
      console.error('ActivityAreaRepositoryAdapter: Error in findByName:', error);
      throw error;
    }
  }
}

// Factory function for DI container
export function createActivityAreaRepositoryAdapter(apiService: ActivityAreaApiService): ActivityAreaRepository {
  return new ActivityAreaRepositoryAdapter(apiService);
}
