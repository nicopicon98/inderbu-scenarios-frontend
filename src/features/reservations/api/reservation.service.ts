import { ReservationPayload, Reservation } from "../types/reservation.types";

// Simulación de una API con datos mock para desarrollo
const mockReservations: Reservation[] = [
  {
    id: 1,
    subScenario: {
      id: "1",
      name: "Cancha de Fútbol Principal",
      description: "Cancha profesional de fútbol con grama sintética",
      address: "Calle 45 #23-45",
      activityArea: { id: "1", name: "Deportes" },
      neighborhood: { id: "1", name: "Centro" },
      imageUrl: "https://via.placeholder.com/300x200/FF5733/FFFFFF?text=Cancha+de+Futbol",
      hasCost: false,
      numberOfPlayers: 22,
      numberOfSpectators: 100,
      recommendations: "Traer calzado deportivo",
      scenario: {
        id: 1,
        name: "Complejo Deportivo Principal",
        address: "Calle 45 #23-45",
        neighborhood: { id: "1", name: "Centro" }
      },
      fieldSurfaceType: { id: "1", name: "Grama Sintética" }
    },
    timeSlot: {
      id: 1,
      startTime: "08:00",
      endTime: "10:00",
      dayOfWeek: 1
    },
    reservationDate: "2024-05-20",
    status: "active",
    createdAt: "2024-05-15T14:30:00"
  },
  {
    id: 2,
    subScenario: {
      id: "2",
      name: "Cancha de Baloncesto",
      description: "Cancha techada para baloncesto",
      address: "Calle 78 #34-56",
      activityArea: { id: "1", name: "Deportes" },
      neighborhood: { id: "5", name: "Occidente" },
      imageUrl: "https://via.placeholder.com/300x200/FF33B5/FFFFFF?text=Baloncesto",
      hasCost: false,
      numberOfPlayers: 10,
      numberOfSpectators: 50,
      recommendations: "Traer balón propio",
      scenario: {
        id: 2,
        name: "Coliseo Municipal",
        address: "Calle 78 #34-56",
        neighborhood: { id: "5", name: "Occidente" }
      },
      fieldSurfaceType: { id: "2", name: "Duela" }
    },
    timeSlot: {
      id: 2,
      startTime: "14:00",
      endTime: "16:00",
      dayOfWeek: 3
    },
    reservationDate: "2024-05-22",
    status: "active",
    createdAt: "2024-05-16T10:15:00"
  }
];

// Simular la obtención de reservas
export async function getUserReservations(): Promise<Reservation[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockReservations);
    }, 1000);
  });
}

// Simular la creación de una reserva
export async function createReservation(payload: ReservationPayload): Promise<Reservation> {
  console.log("Creating reservation with payload:", payload);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const newReservation: Reservation = {
        id: Date.now(),
        subScenario: {
          id: payload.subScenarioId.toString(),
          name: "Escenario Reservado",
          description: "Descripción del escenario",
          address: "Dirección del escenario",
          activityArea: { id: "1", name: "Deportes" },
          neighborhood: { id: "1", name: "Centro" },
          imageUrl: "",
          hasCost: false,
          numberOfPlayers: 10,
          numberOfSpectators: 50,
          recommendations: "",
          scenario: {
            id: 1,
            name: "Escenario Principal",
            address: "Dirección",
            neighborhood: { id: "1", name: "Centro" }
          },
          fieldSurfaceType: { id: "1", name: "Normal" }
        },
        timeSlot: {
          id: payload.timeSlotId,
          startTime: "10:00",
          endTime: "12:00",
          dayOfWeek: 1
        },
        reservationDate: payload.reservationDate,
        status: "active",
        createdAt: new Date().toISOString()
      };
      
      mockReservations.push(newReservation);
      resolve(newReservation);
    }, 1000);
  });
}

// Simular la cancelación de una reserva
export async function cancelReservation(id: number): Promise<boolean> {
  console.log("Cancelling reservation with id:", id);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockReservations.findIndex(r => r.id === id);
      if (index !== -1) {
        mockReservations[index].status = "cancelled";
        resolve(true);
      } else {
        resolve(false);
      }
    }, 1000);
  });
}
