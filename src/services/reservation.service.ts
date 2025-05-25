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
  comments?: string;
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

export interface ReservationStateDto {
  id: number;
  state: string;
}

export interface ReservationDto {
  id: number;
  reservationDate: string;
  createdAt: string;
  comments?: string;
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
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("No se encontró un token de autenticación");
    }
    console.log({ reservationData });
    try {
      const response = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
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

  // Obtener todas las reservas (admin) con filtros opcionales
  getAllReservations: async (filters?: {
    scenarioId?: number;
    activityAreaId?: number;
    neighborhoodId?: number;
    userId?: number;
    page?: number;
    limit?: number;
    searchQuery?: string;
  }): Promise<ReservationDto[]> => {
    const url = new URL(`${API_URL}/reservations`);
    
    // Añadir parámetros de filtros si existen
    if (filters) {
      if (filters.scenarioId && filters.scenarioId > 0) {
        url.searchParams.set('scenarioId', filters.scenarioId.toString());
      }
      if (filters.activityAreaId && filters.activityAreaId > 0) {
        url.searchParams.set('activityAreaId', filters.activityAreaId.toString());
      }
      if (filters.neighborhoodId && filters.neighborhoodId > 0) {
        url.searchParams.set('neighborhoodId', filters.neighborhoodId.toString());
      }
      if (filters.userId && filters.userId > 0) {
        url.searchParams.set('userId', filters.userId.toString());
      }
      if (filters.page && filters.page > 0) {
        url.searchParams.set('page', filters.page.toString());
      }
      if (filters.limit && filters.limit > 0) {
        url.searchParams.set('limit', filters.limit.toString());
      }
      if (filters.searchQuery && filters.searchQuery.trim()) {
        url.searchParams.set('search', filters.searchQuery.trim());
      }
    }

    console.log('Fetching reservations with URL:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    console.log({ responseFromBackend: response });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const responseData = await response.json();

    console.log({ responseData });

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

  // Nueva función para obtener reservas con paginación y metadatos
  getAllReservationsWithPagination: async (filters?: {
    scenarioId?: number;
    activityAreaId?: number;
    neighborhoodId?: number;
    userId?: number;
    page?: number;
    limit?: number;
    searchQuery?: string;
  }): Promise<{
    data: ReservationDto[];
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }> => {
    const url = new URL(`${API_URL}/reservations`);
    
    // Añadir parámetros de filtros si existen
    if (filters) {
      if (filters.scenarioId && filters.scenarioId > 0) {
        url.searchParams.set('scenarioId', filters.scenarioId.toString());
      }
      if (filters.activityAreaId && filters.activityAreaId > 0) {
        url.searchParams.set('activityAreaId', filters.activityAreaId.toString());
      }
      if (filters.neighborhoodId && filters.neighborhoodId > 0) {
        url.searchParams.set('neighborhoodId', filters.neighborhoodId.toString());
      }
      if (filters.userId && filters.userId > 0) {
        url.searchParams.set('userId', filters.userId.toString());
      }
      if (filters.page && filters.page > 0) {
        url.searchParams.set('page', filters.page.toString());
      }
      if (filters.limit && filters.limit > 0) {
        url.searchParams.set('limit', filters.limit.toString());
      }
      if (filters.searchQuery && filters.searchQuery.trim()) {
        url.searchParams.set('search', filters.searchQuery.trim());
      }
    }

    console.log('Fetching reservations with pagination, URL:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const responseData = await response.json();

    console.log('Paginated reservations response:', responseData);

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

    return {
      data: reservations,
      meta: responseData.meta || {
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        totalItems: reservations.length,
        totalPages: 1,
      }
    };
  },
  // Obtener todos los estados de reserva disponibles
  getAllReservationStates: async (): Promise<ReservationStateDto[]> => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No se encontró un token de autenticación");
      }

      const response = await fetch(`${API_URL}/reservations/states`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const states = await response.json();
      return states.data;
    } catch (error) {
      console.error("Error fetching reservation states:", error);
      throw error;
    }
  },

  // Método legacy para compatibilidad con código existente
  updateReservationState: async (
    reservationId: number,
    stateId: number
  ): Promise<ReservationDto> => {
    // Let's print both reservationId and stateId
    console.log({ reservationId, stateId });
    try {
      const response = await fetch(
        `${API_URL}/reservations/${reservationId}/state`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
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

  // Obtener escenarios para filtros
  getAllScenarios: async (): Promise<{id: number, name: string}[]> => {
    try {
      const response = await fetch(`${API_URL}/scenarios`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      return [];
    }
  },

  // Obtener áreas de actividad para filtros
  getAllActivityAreas: async (): Promise<{id: number, name: string}[]> => {
    try {
      const response = await fetch(`${API_URL}/activity-areas`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error fetching activity areas:", error);
      return [];
    }
  },

  // Obtener barrios para filtros
  getAllNeighborhoods: async (): Promise<{id: number, name: string}[]> => {
    try {
      const response = await fetch(`${API_URL}/neighborhoods`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error fetching neighborhoods:", error);
      return [];
    }
  },

  // Obtener usuarios para filtros (solo admins)
  getAllUsers: async (): Promise<{id: number, firstName: string, lastName: string, email: string}[]> => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      // Mapear a formato consistente
      return (data.data || data).map((user: any) => ({
        id: user.id,
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
        email: user.email || ''
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },
};

export default ReservationService;
