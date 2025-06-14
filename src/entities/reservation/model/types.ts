import { z } from "zod";

// Domain entities matching exactly the current working service and backend structure

export interface City {
  id: number;
  name: string;
}

export interface Commune {
  id: number;
  name: string;
  city: City;
}

export interface Neighborhood {
  id: number;
  name: string;
  commune: Commune;
}

export interface Scenario {
  id: number;
  name: string;
  address: string;
  neighborhood: Neighborhood;
}

export interface SubScenario {
  id: number;
  name: string;
  hasCost: boolean;
  numberOfSpectators: number | null;
  numberOfPlayers: number | null;
  recommendations: string | null;
  scenarioId: number;
  scenarioName: string;
  scenario: Scenario;
}

export interface User {
  id: number;
  first_name: string; // Backend uses first_name, not name
  last_name: string; // Backend uses last_name, not lastName
  email: string;
  phone: string;
}

export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  // Note: No 'day' field in backend
}

export interface ReservationState {
  id: number;
  state: "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "CANCELADA";
  // Note: No 'description' field in backend
}

// Main reservation entity (matching the current working ReservationDto)
export interface ReservationDto {
  id: number;
  reservationDate: string; // YYYY-MM-DD format
  createdAt: string; // Note: no updatedAt in backend
  comments?: string; // Note: backend uses comments, not observations

  // Relations (always included in API responses)
  subScenario: SubScenario;
  user: User;
  timeSlot: TimeSlot;
  reservationState: ReservationState;

  // Backward compatibility fields (added by the current service)
  subScenarioId?: number;
  userId?: number;
  timeSlotId?: number;
  reservationStateId?: number;
}

export interface PaginatedReservations {
  data: ReservationDto[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

// Command DTOs for mutations (matching backend request DTOs)
export interface CreateReservationDto {
  subScenarioId: number;
  timeSlotIds: number[];
  reservationRange: {
    initialDate: string; // YYYY-MM-DD format
    finalDate?: string;
  };
  comments?: string;
  weekdays?: number[];
}

export interface CreateReservationResponseDto {
  id: number;
  reservationDate: string;
  subScenarioId: number;
  userId: number;
  timeSlotId: number;
  reservationStateId: number;
  comments?: string;
}

export interface UpdateReservationStateCommand {
  stateId: number; // Note: backend uses stateId, not reservationStateId
}

export interface ReservationStateDto {
  id: number;
  state: string;
}

export interface TimeslotResponseDto {
  id: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean; // FIXED: Cambiar de 'available' a 'isAvailable' para coincidir con backend
}

// Query parameters interface (matching current service filters)
export interface GetReservationsQuery {
  scenarioId?: number;
  activityAreaId?: number;
  neighborhoodId?: number;
  userId?: number;
  page?: number;
  limit?: number;
  searchQuery?: string;
  dateFrom?: string; // YYYY-MM-DD format
  dateTo?: string; // YYYY-MM-DD format
}

// Validation schemas (updated to match backend requirements)
export const CreateReservationSchema = z.object({
  subScenarioId: z.number().int().positive(),
  timeSlotIds: z.array(z.number().int().positive()),
  reservationRange: z.object({
    initialDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    finalDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  }),
  comments: z.string().optional(),
  weekdays: z.array(z.number().int().min(0).max(6)).optional(),
});

export const UpdateReservationStateSchema = z.object({
  stateId: z.number().int().positive(),
});

export const GetReservationsQuerySchema = z.object({
  scenarioId: z.number().int().positive().optional(),
  activityAreaId: z.number().int().positive().optional(),
  neighborhoodId: z.number().int().positive().optional(),
  userId: z.number().int().positive().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20), // Backend default is 20
  searchQuery: z.string().optional(),
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

// Type guards
export const isActiveReservation = (reservation: ReservationDto): boolean => {
  const now = new Date();
  const reservationDate = new Date(reservation.reservationDate);

  return (
    reservationDate >= now &&
    reservation.reservationState.state !== "CANCELADA" &&
    reservation.reservationState.state !== "RECHAZADA"
  );
};

export const isPastReservation = (reservation: ReservationDto): boolean => {
  return !isActiveReservation(reservation);
};

// Business logic helpers
export const calculateReservationStats = (reservations: ReservationDto[]) => {
  const active = reservations.filter(isActiveReservation);
  const past = reservations.filter(isPastReservation);

  return {
    total: reservations.length,
    active: active.length,
    past: past.length,
    pending: reservations.filter(
      (r) => r.reservationState.state === "PENDIENTE"
    ).length,
    confirmed: reservations.filter(
      (r) => r.reservationState.state === "CONFIRMADA"
    ).length,
    rejected: reservations.filter(
      (r) => r.reservationState.state === "RECHAZADA"
    ).length,
    cancelled: reservations.filter(
      (r) => r.reservationState.state === "CANCELADA"
    ).length,
  };
};

// Helper to get user full name (since backend splits first_name and last_name)
export const getUserFullName = (user: User): string => {
  return `${user.first_name} ${user.last_name}`.trim();
};

// Helper to format scenario full location
export const getScenarioFullLocation = (subScenario: SubScenario): string => {
  const { scenario } = subScenario;
  return scenario.address;
};

// Helper to check if reservation can be modified
export const canModifyReservation = (reservation: ReservationDto): boolean => {
  return (
    isActiveReservation(reservation) &&
    (reservation.reservationState.state === "PENDIENTE" ||
      reservation.reservationState.state === "CONFIRMADA")
  );
};

// Helper to get status color for UI
export const getReservationStatusColor = (state: string) => {
  switch (state) {
    case "CONFIRMADA":
      return "success"; // green
    case "PENDIENTE":
      return "warning"; // yellow
    case "CANCELADA":
      return "destructive"; // red
    case "RECHAZADA":
      return "destructive"; // red
    default:
      return "secondary";
  }
};

// Helper to get status icon for UI
export const getReservationStatusIcon = (state: string) => {
  switch (state) {
    case "CONFIRMADA":
      return "✅";
    case "PENDIENTE":
      return "⏳";
    case "CANCELADA":
      return "❌";
    case "RECHAZADA":
      return "❌";
    default:
      return "📅";
  }
};
