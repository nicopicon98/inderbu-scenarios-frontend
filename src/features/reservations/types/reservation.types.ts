import { ReservationDto } from "@/services/reservation.service";

export interface ITimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  dayOfWeek?: number;
  available: boolean;
}

// Re-export ReservationDto for consistency
// export { ReservationDto as Reservation };

export interface ReservationPayload {
  subScenarioId: number;
  timeSlotId: number;
  reservationDate: string;
}

// Additional types for UI components
export interface ReservationStatus {
  id: number;
  state: "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "CANCELADA";
}

export interface ReservationStats {
  total: number;
  active: number;
  past: number;
  pending: number;
  confirmed: number;
  cancelled: number;
}
