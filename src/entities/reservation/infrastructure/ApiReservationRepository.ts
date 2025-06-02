import { getReservationsByUserId } from '@/entities/reservation/api/queries';
import { ReservationRepository } from '@/entities/reservation/domain/ReservationDomain';
import { PaginatedReservations, PaginationQuery } from '@/entities/reservation/model/types';
import { HttpClient } from '@/shared/api/http-client';

// DDD: Repository implementation (Infrastructure layer)
// Adapts existing queries to domain interface
export class ApiReservationRepository implements ReservationRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async findByUserId(
    userId: number, 
    pagination: PaginationQuery
  ): Promise<PaginatedReservations> {
    // Use existing query implementation
    return getReservationsByUserId(userId, pagination);
  }

  async findById(reservationId: number): Promise<any> {
    // TODO: Implement when needed
    throw new Error('findById not implemented yet');
  }

  async cancel(reservationId: number, reason?: string): Promise<void> {
    // TODO: Implement when needed
    throw new Error('cancel not implemented yet');
  }

  async create(reservationData: any): Promise<any> {
    // TODO: Implement when needed  
    throw new Error('create not implemented yet');
  }
}

// Factory function for dependency injection
export function createApiReservationRepository(httpClient: HttpClient): ReservationRepository {
  return new ApiReservationRepository(httpClient);
}

// Update existing factory to use new implementation
export function createReservationRepository(httpClient: HttpClient): ReservationRepository {
  return createApiReservationRepository(httpClient);
}

// Re-export for backward compatibility
export type { ReservationRepository };
