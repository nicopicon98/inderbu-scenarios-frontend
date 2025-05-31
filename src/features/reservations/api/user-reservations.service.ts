import { ReservationDto } from "@/services/reservation.service";

export interface UserReservationList {
  data: ReservationDto[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

interface IUserReservationParams {
  userId: number;
  page?: number;
  limit?: number;
  searchQuery?: string;
}

export async function getUserReservations({
  userId,
  page = 1,
  limit = 10,
  searchQuery = "",
}: IUserReservationParams): Promise<UserReservationList> {
  console.log("Fetching user reservations with params:", {
    userId,
    page,
    limit,
    searchQuery,
  });

  const url = new URL("http://localhost:3001/reservations");
  url.searchParams.set("userId", userId.toString());
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", limit.toString());

  if (searchQuery.trim()) {
    url.searchParams.set("search", searchQuery.trim());
  }

  console.log("API URL:", url.toString());

  const token = localStorage.getItem("auth_token");
  if (!token) {
    throw new Error("No se encontró un token de autenticación");
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to load user reservations: ${res.status}`);
  }

  const resJson = await res.json();
  console.log("User reservations response:", resJson);

  // Mapear los datos para ser compatibles con el código existente
  const mappedData = resJson.data.map((item: ReservationDto) => ({
    ...item,
    // Añadimos campos derivados para mantener compatibilidad
    subScenarioId: item.subScenario?.id,
    userId: item.user?.id,
    timeSlotId: item.timeSlot?.id,
    reservationStateId: item.reservationState?.id,
  }));

  return {
    data: mappedData,
    meta: resJson.meta,
  };
}

// Servicio para cancelar reserva
export async function cancelReservation(
  reservationId: number,
): Promise<ReservationDto> {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    throw new Error("No se encontró un token de autenticación");
  }

  // Asumiendo que el estado CANCELADA tiene ID 3
  const response = await fetch(
    `http://localhost:3001/reservations/${reservationId}/state`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stateId: 3 }), // ID del estado CANCELADA
    },
  );

  if (!response.ok) {
    throw new Error(`Error cancelando reserva: ${response.status}`);
  }

  return response.json();
}

// Servicio para obtener estados de reserva
export async function getReservationStates(): Promise<
  { id: number; state: string }[]
> {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    throw new Error("No se encontró un token de autenticación");
  }

  const response = await fetch("http://localhost:3001/reservations/states", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error obteniendo estados: ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}
