import { ServerHttpClientFactory } from '@/shared/api/http-client-server';
import { createServerAuthContext, ServerAuthContext } from '@/shared/api/server-auth';
import { cache } from 'react';
import { GetReservationsQuery, PaginatedReservations, ReservationDto } from '../model/types';
import { createReservationRepository } from '../infrastructure/reservation-repository.adapter';

// Server-side data fetching with caching (SERVER-ONLY)
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
