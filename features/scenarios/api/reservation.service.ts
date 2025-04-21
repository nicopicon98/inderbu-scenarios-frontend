// features/scenarios/api/reservation.service.ts

interface ReservationPayload {
  subScenarioId: number;
  timeSlotId: number;
  reservationDate: string; // "YYYY-MM-DD"
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface ReservationResponse {
  id: number;
  userId: number;
  subScenarioId: number;
  timeSlotId: number;
  reservationDate: string;
  status: string;
  createdAt: string;
}

/**
 * Creates a new reservation
 * @param payload The reservation data
 * @returns The created reservation
 */
export async function createReservation(
  payload: ReservationPayload
): Promise<ReservationResponse> {
  // Get token from localStorage
  const token = localStorage.getItem("auth_token");
  
  if (!token) {
    throw new Error("No authentication token found. Please log in again.");
  }

  const response = await fetch("http://localhost:3001/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // Add authorization header
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Error creating reservation: ${errorData.message || response.statusText}`
    );
  }

  const json: ApiResponse<ReservationResponse> = await response.json();
  return json.data;
}