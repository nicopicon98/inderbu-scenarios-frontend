import ReservationService from "@/services/reservation.service";

// URL base del API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function createReservation(payload: {
  subScenarioId: number;
  timeSlotId: number;
  reservationDate: string;
}) {
  try {
    // Llamada real al API para crear la reserva
    return await ReservationService.createReservation(payload);
  } catch (error) {
    console.error("Error creating reservation:", error);
    throw error;
  }
}
