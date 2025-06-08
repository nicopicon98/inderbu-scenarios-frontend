// Infrastructure: Neighborhood Repository Adapter (bridges existing API to domain interface)

import { NeighborhoodRepository, Neighborhood } from '@/entities/neighborhood/domain/neighborhood.domain';

// Existing API interface (what currently exists)
interface NeighborhoodApiService {
  getNeighborhoods(): Promise<Neighborhood[]>;
}

// Infrastructure: Adapter Pattern - Bridge existing API to domain interface  
export class NeighborhoodRepositoryAdapter implements NeighborhoodRepository {
  constructor(private readonly apiService: NeighborhoodApiService) {}

  async findAll(): Promise<Neighborhood[]> {
    console.log('NeighborhoodRepositoryAdapter: Executing findAll');

    try {
      // Call existing API service
      const result = await this.apiService.getNeighborhoods();
      
      console.log(`NeighborhoodRepositoryAdapter: Found ${result.length} neighborhoods`);
      return result;

    } catch (error) {
      console.error('NeighborhoodRepositoryAdapter: Error in findAll:', error);
      throw error; // Re-throw to let domain handle it
    }
  }

  async findById(id: number): Promise<Neighborhood | null> {
    console.log(`NeighborhoodRepositoryAdapter: Executing findById with id: ${id}`);

    try {
      const allNeighborhoods = await this.findAll();
      const found = allNeighborhoods.find(neighborhood => neighborhood.id === id);
      
      console.log(`NeighborhoodRepositoryAdapter: ${found ? 'Found' : 'Not found'} neighborhood with id ${id}`);
      return found || null;

    } catch (error) {
      console.error('NeighborhoodRepositoryAdapter: Error in findById:', error);
      throw error;
    }
  }

  async findByName(name: string): Promise<Neighborhood[]> {
    console.log(`NeighborhoodRepositoryAdapter: Executing findByName with name: ${name}`);

    try {
      const allNeighborhoods = await this.findAll();
      const filtered = allNeighborhoods.filter(neighborhood => 
        neighborhood.name.toLowerCase().includes(name.toLowerCase())
      );
      
      console.log(`NeighborhoodRepositoryAdapter: Found ${filtered.length} neighborhoods matching "${name}"`);
      return filtered;

    } catch (error) {
      console.error('NeighborhoodRepositoryAdapter: Error in findByName:', error);
      throw error;
    }
  }
}

// Factory function for DI container
export function createNeighborhoodRepositoryAdapter(apiService: NeighborhoodApiService): NeighborhoodRepository {
  return new NeighborhoodRepositoryAdapter(apiService);
}
