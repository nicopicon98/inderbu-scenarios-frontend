import { GetReservationsQuery } from '../model/types';

// Query key factory for React Query (CLIENT-SAFE)
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
