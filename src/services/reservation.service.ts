// Definir la URL base del API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Tipos
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
    state: 'PENDIENTE' | 'CONFIRMADA' | 'RECHAZADA' | 'CANCELADA';
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
  getAvailableTimeSlots: async (subScenarioId: number, date: string): Promise<TimeslotResponseDto[]> => {
    try {
      const response = await fetch(`${API_URL}/reservations/available-timeslots?subScenarioId=${subScenarioId}&date=${date}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const responseToJson = await response.json();
      return responseToJson.data;
    } catch (error) {
      console.error('Error getting available timeslots:', error);
      throw error;
    }
  },

  // Crear una reserva
  createReservation: async (reservationData: CreateReservationDto): Promise<CreateReservationResponseDto> => {
    try {
      const response = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(reservationData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  },

  // Obtener reservas de usuario
  getUserReservations: async (userId: number): Promise<ReservationDto[]> => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/reservations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error getting user reservations:', error);
      throw error;
    }
  },

  // Obtener todas las reservas (admin)
  getAllReservations: async (): Promise<ReservationDto[]> => {
    try {
      const response = await fetch(`${API_URL}/reservations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      console.log({responseFromBackend: response});
      
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
          reservationStateId: item.reservationState?.id
        };
      });
      
      return reservations;
    } catch (error) {
      console.error('Error getting all reservations:', error);
      // Para desarrollo, retornamos datos de ejemplo si la API no está disponible
      return mockReservations();
    }
  },

  // Actualizar estado de reserva
  updateReservationState: async (reservationId: number, stateId: number): Promise<ReservationDto> => {
    try {
      const response = await fetch(`${API_URL}/admin/reservations/${reservationId}/state`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ stateId })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error updating reservation state:', error);
      throw error;
    }
  }
};

// Mock reservations para desarrollo cuando no haya API disponible
function mockReservations(): ReservationDto[] {
  return [
    {
      id: 509725,
      reservationDate: "2025-05-17",
      createdAt: "2025-01-13T10:30:00",
      subScenario: {
        id: 1,
        name: "COLISEO BICENTENARIO ALEJANDRO GALVIS RAMIREZ",
        hasCost: false,
        numberOfSpectators: 100,
        numberOfPlayers: 20,
        recommendations: "Sin recomendaciones",
        scenarioId: 1,
        scenarioName: "Complejo Deportivo"
      },
      user: {
        id: 1,
        first_name: "ACADEMIA",
        last_name: "DE BADMINTON SANTANDER",
        email: "academia@example.com",
        phone: "3001234567"
      },
      timeSlot: {
        id: 1,
        startTime: "09:00",
        endTime: "09:59"
      },
      reservationState: {
        id: 2,
        state: "CONFIRMADA"
      },
      // Para compatibilidad
      subScenarioId: 1,
      userId: 1,
      timeSlotId: 1,
      reservationStateId: 2
    },
    {
      id: 509776,
      reservationDate: "2025-05-17",
      createdAt: "2025-01-13T10:45:00",
      subScenario: {
        id: 1,
        name: "COLISEO BICENTENARIO ALEJANDRO GALVIS RAMIREZ",
        hasCost: false,
        numberOfSpectators: 100,
        numberOfPlayers: 20,
        recommendations: "Sin recomendaciones",
        scenarioId: 1,
        scenarioName: "Complejo Deportivo"
      },
      user: {
        id: 1,
        first_name: "ACADEMIA",
        last_name: "DE BADMINTON SANTANDER",
        email: "academia@example.com",
        phone: "3001234567"
      },
      timeSlot: {
        id: 2,
        startTime: "10:00",
        endTime: "10:59"
      },
      reservationState: {
        id: 2,
        state: "CONFIRMADA"
      },
      // Para compatibilidad
      subScenarioId: 1,
      userId: 1,
      timeSlotId: 2,
      reservationStateId: 2
    },
    {
      id: 509777,
      reservationDate: "2025-05-18",
      createdAt: "2025-01-15T14:20:00",
      subScenario: {
        id: 2,
        name: "PROVENZA - PATINODROMO - PARQUE RECREO- DEPORTIVO",
        hasCost: true,
        numberOfSpectators: 50,
        numberOfPlayers: 10,
        recommendations: "Traer hidratación",
        scenarioId: 2,
        scenarioName: "Parque Recreativo"
      },
      user: {
        id: 2,
        first_name: "CLUB",
        last_name: "DEPORTIVO BUCARAMANGA",
        email: "club@example.com",
        phone: "3109876543"
      },
      timeSlot: {
        id: 5,
        startTime: "14:00",
        endTime: "15:59"
      },
      reservationState: {
        id: 1,
        state: "PENDIENTE"
      },
      // Para compatibilidad
      subScenarioId: 2,
      userId: 2,
      timeSlotId: 5,
      reservationStateId: 1
    },
    {
      id: 509778,
      reservationDate: "2025-05-19",
      createdAt: "2025-01-20T09:15:00",
      subScenario: {
        id: 3,
        name: "ÓVALO AZUL VELODROMO ALFONSO FLOREZ ORTIZ",
        hasCost: true,
        numberOfSpectators: 200,
        numberOfPlayers: 30,
        recommendations: "Se requiere equipo de seguridad",
        scenarioId: 3,
        scenarioName: "Velódromo"
      },
      user: {
        id: 3,
        first_name: "ASOCIACIÓN",
        last_name: "DEPORTIVA SANTANDER",
        email: "asociacion@example.com",
        phone: "3205551234"
      },
      timeSlot: {
        id: 8,
        startTime: "16:00",
        endTime: "17:59"
      },
      reservationState: {
        id: 3,
        state: "RECHAZADA"
      },
      // Para compatibilidad
      subScenarioId: 3,
      userId: 3,
      timeSlotId: 8,
      reservationStateId: 3
    }
  ];
}

export default ReservationService;
