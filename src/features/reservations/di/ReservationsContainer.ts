import { createReservationRepository, ReservationRepository } from '@/entities/reservation/api/reservationRepository';
import { EventBus } from '@/entities/reservation/domain/ReservationDomain';
import { createUserRepository, UserRepository } from '@/entities/user/api/userRepository';
import { HttpClientFactory } from '@/shared/api/http-client';
import { createServerAuthContext } from '@/shared/api/server-auth';
import { createInMemoryEventBus } from '@/shared/infrastructure/InMemoryEventBus';
import {
  createGetUserReservationsUseCase,
  GetUserReservationsUseCase
} from '../list/application/GetUserReservationsUseCase';
import {
  createServerReservationService,
  ServerReservationService
} from '../list/infrastructure/ServerReservationService';

// ✅ DDD: Dependency Injection Containers for Reservations Feature

// Container for User Reservations List Use Case
export interface UserReservationsContainer {
  reservationService: ServerReservationService;
  getUserReservationsUseCase: GetUserReservationsUseCase;
}

/**
 * Creates and wires all dependencies for the list user reservations use case
 * Following DDD layered architecture with proper dependency injection
 * 
 * This container is responsible for:
 * - Setting up infrastructure dependencies (HTTP client, auth context)
 * - Creating repositories for user and reservations
 * - Initializing event bus for domain events
 * - Wiring application use cases (business logic)
 * - Exposing services for external API consumption
 * 
 */
export function createUserReservationsContainer(): UserReservationsContainer {
  console.log('Building UserReservations DI Container...');

  // Infrastructure layer: HTTP Client and Auth
  const authContext = createServerAuthContext();
  const httpClient = HttpClientFactory.createServerClientSync(authContext);

  // Infrastructure layer: Use existing repositories directly
  // ✅ No adapters needed - existing interfaces are sufficient for our domain
  const userRepo: UserRepository = createUserRepository(httpClient);
  const reservationRepo: ReservationRepository = createReservationRepository(httpClient);

  // Infrastructure layer: Event Bus
  const eventBus: EventBus = createInMemoryEventBus();

  // Application layer: Use Cases (Business Logic)
  const getUserReservationsUseCase: GetUserReservationsUseCase = createGetUserReservationsUseCase(
    reservationRepo,
    userRepo,
    eventBus
  );

  // 🌐 Infrastructure layer: Service (External API)
  const reservationService: ServerReservationService = createServerReservationService(
    getUserReservationsUseCase
  );

  console.log('✅ UserReservations DI Container ready');

  return {
    reservationService,
    getUserReservationsUseCase
  };
}

// TODO: Future containers for other reservation use cases

/**
 * Container for Create Reservation Use Case
 * TODO: Implement when create reservation is migrated to new architecture
 */
export interface CreateReservationContainer {
  // createReservationService: CreateReservationService;
  // createReservationUseCase: CreateReservationUseCase;
}

export function createCreateReservationContainer(): CreateReservationContainer {
  throw new Error('CreateReservation container not implemented yet');
}

/**
 * Container for Cancel Reservation Use Case  
 * TODO: Implement when cancel reservation is migrated to new architecture
 */
export interface CancelReservationContainer {
  // cancelReservationService: CancelReservationService;
  // cancelReservationUseCase: CancelReservationUseCase;
}

export function createCancelReservationContainer(): CancelReservationContainer {
  throw new Error('CancelReservation container not implemented yet');
}

// Type-safe dependency access
export type UserReservationsDependencies = ReturnType<typeof createUserReservationsContainer>;
export type CreateReservationDependencies = ReturnType<typeof createCreateReservationContainer>;
export type CancelReservationDependencies = ReturnType<typeof createCancelReservationContainer>;
