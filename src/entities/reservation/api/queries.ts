import { ServerHttpClientFactory } from '@/shared/api/http-client-server';
import { createServerAuthContext, ServerAuthContext } from '@/shared/api/server-auth';
import { cache } from 'react';
import { GetReservationsQuery, PaginatedReservations, ReservationDto } from '../model/types';
import { createReservationRepository } from './reservationRepository';

// Server-side data fetching with caching
export const getReservationsByUserId = cache(async (
  userId: number,
  query: GetReservationsQuery = {}
): Promise<PaginatedReservations> => {
  const authContext: ServerAuthContext = createServerAuthContext();
  const httpClient = ServerHttpClientFactory.createServerSync(authContext);
  const repository = createReservationRepository(httpClient);

  return repository.getByUserId(userId, query);
});

export const getReservationById = cache(async (id: number): Promise<ReservationDto> => {
  const authContext = createServerAuthContext();
  const httpClient = ServerHttpClientFactory.createServerSync(authContext);
  const repository = createReservationRepository(httpClient);

  return repository.getById(id);
});

export const getReservationStates = cache(async () => {
  const authContext = createServerAuthContext();
  const httpClient = ServerHttpClientFactory.createServerSync(authContext);
  const repository = createReservationRepository(httpClient);

  return repository.getStates();
});

export const getAvailableTimeSlots = cache(async (subScenarioId: number, date: string) => {
  const authContext = createServerAuthContext();
  const httpClient = ServerHttpClientFactory.createServerSync(authContext);
  const repository = createReservationRepository(httpClient);

  return repository.getAvailableTimeSlots(subScenarioId, date);
});

// Query key factory for React Query
export const reservationQueryKeys = {
  all: ['reservations'] as const,
  lists: () => [...reservationQueryKeys.all, 'list'] as const,
  list: (filters: GetReservationsQuery) => [...reservationQueryKeys.lists(), { filters }] as const,
  details: () => [...reservationQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...reservationQueryKeys.details(), id] as const,
  states: () => [...reservationQueryKeys.all, 'states'] as const,
  timeSlots: () => [...reservationQueryKeys.all, 'timeSlots'] as const,
  timeSlot: (subScenarioId: number, date: string) => [...reservationQueryKeys.timeSlots(), { subScenarioId, date }] as const,
} as const;
