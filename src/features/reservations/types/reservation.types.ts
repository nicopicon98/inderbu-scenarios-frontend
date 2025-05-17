import { SubScenario } from "@/features/home/types/filters.types";

export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
}

export interface Reservation {
  id: number;
  subScenario: SubScenario;
  timeSlot: TimeSlot;
  reservationDate: string;
  status: "active" | "cancelled" | "completed";
  createdAt: string;
}

export interface ReservationPayload {
  subScenarioId: number;
  timeSlotId: number;
  reservationDate: string;
}
