const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

/* ---------- Escenario y sub-escenario ---------- */
export interface Scenario {
  id: number;
  name: string;
  address: string;
  neighborhood: Neighborhood;
}

export interface CreateReservationDto {
  subScenarioId: number;
  timeSlotId: number;
  reservationDate: string;
}

export interface CreateReservationResponseDto {
  id: number;
  reservationDate: string;
  subScenarioId: number;
  userId: number;
  timeSlotId: number;
  reservationStateId: number;
}

export interface ReservationDto {
  id: number;
  reservationDate: string;
  createdAt: string;
  subScenario: {
    id: number;
    name: string;
    hasCost: boolean;
    numberOfSpectators: number | null;
    numberOfPlayers: number | null;
    recommendations: string | null;
    scenarioId: number;
    scenarioName: string;
    scenario: Scenario;
  };
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  timeSlot: {
    id: number;
    startTime: string;
    endTime: string;
  };
  reservationState: {
    id: number;
    state: "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "CANCELADA";
  };

  // Campos adicionales para compatibilidad con código existente
  subScenarioId?: number;
  userId?: number;
  timeSlotId?: number;
  reservationStateId?: number;
}

export interface TimeslotResponseDto {
  id: number;
  startTime: string;
  endTime: string;
  available: boolean;
}

// Servicio de reservas
const ReservationService = {
  // Obtener slots disponibles
  getAvailableTimeSlots: async (
    subScenarioId: number,
    date: string
  ): Promise<TimeslotResponseDto[]> => {
    try {
      const response = await fetch(
        `${API_URL}/reservations/available-timeslots?subScenarioId=${subScenarioId}&date=${date}`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const responseToJson = await response.json();
      return responseToJson.data;
    } catch (error) {
      console.error("Error getting available timeslots:", error);
      throw error;
    }
  },

  // Crear una reserva
  createReservation: async (
    reservationData: CreateReservationDto
  ): Promise<CreateReservationResponseDto> => {
    try {
      const response = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      return response.json();
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      throw error;
    }
  },

  // Obtener reservas de usuario
  getUserReservations: async (userId: number): Promise<ReservationDto[]> => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/reservations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error getting user reservations:", error);
      throw error;
    }
  },

  // Obtener todas las reservas (admin)
  getAllReservations: async (): Promise<ReservationDto[]> => {
    const response = await fetch(`${API_URL}/reservations`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    console.log({ responseFromBackend: response });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const responseData = await response.json();

    // Mapeamos los datos para ser compatibles con el código existente
    const reservations = responseData.data.map((item: ReservationDto) => {
      return {
        ...item,
        // Añadimos campos derivados para mantener compatibilidad
        subScenarioId: item.subScenario?.id,
        userId: item.user?.id,
        timeSlotId: item.timeSlot?.id,
        reservationStateId: item.reservationState?.id,
      };
    });

    return reservations;
  },

  // Actualizar estado de reserva
  updateReservationState: async (
    reservationId: number,
    stateId: number
  ): Promise<ReservationDto> => {
    try {
      const response = await fetch(
        `${API_URL}/admin/reservations/${reservationId}/state`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ stateId }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error updating reservation state:", error);
      throw error;
    }
  },
};

export default ReservationService;
