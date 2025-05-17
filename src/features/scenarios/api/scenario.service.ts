import { SubScenario } from "@/features/home/types/filters.types";
import { TimeSlot } from "@/features/reservations/types/reservation.types";

export interface ScenarioWithRelations extends SubScenario {
  // Aquí se pueden agregar más campos específicos para un escenario completo
}

export async function fetchScenarioById(id: string): Promise<ScenarioWithRelations> {
  // Simulación de una API para obtener detalles de un escenario
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        name: "Cancha de Fútbol Principal",
        description: "Cancha profesional de fútbol con grama sintética",
        hasCost: false,
        numberOfPlayers: 22,
        numberOfSpectators: 100,
        recommendations: "Traer calzado deportivo adecuado. No se permite el ingreso con alimentos. Respetar las señalizaciones.",
        activityArea: { id: "1", name: "Deportes" },
        neighborhood: { id: "1", name: "Centro" },
        fieldSurfaceType: { id: "1", name: "Grama Sintética" },
        scenario: {
          id: 1,
          name: "Complejo Deportivo Principal",
          address: "Calle 45 #23-45",
          neighborhood: { id: "1", name: "Centro" }
        },
        address: "Calle 45 #23-45",
        imageUrl: "https://via.placeholder.com/300x200/FF5733/FFFFFF?text=Cancha+de+Futbol",
      });
    }, 500);
  });
}

export async function fetchTimeSlots(
  subScenarioId: string | number,
  date: string
): Promise<{ timeSlots: TimeSlot[]; bookedSlots: number[] }> {
  // Simulación de una API para obtener horarios disponibles
  console.log(`Fetching time slots for sub-scenario ${subScenarioId} on ${date}`);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generar horarios de ejemplo
      const timeSlots: TimeSlot[] = [
        { id: 1, startTime: "08:00", endTime: "10:00", dayOfWeek: 1 },
        { id: 2, startTime: "10:00", endTime: "12:00", dayOfWeek: 1 },
        { id: 3, startTime: "14:00", endTime: "16:00", dayOfWeek: 1 },
        { id: 4, startTime: "16:00", endTime: "18:00", dayOfWeek: 1 },
        { id: 5, startTime: "18:00", endTime: "20:00", dayOfWeek: 1 },
      ];
      
      // Simulación de horarios ya reservados
      // Diferentes para diferentes fechas para simular un comportamiento real
      const day = new Date(date).getDate();
      let bookedSlots: number[] = [];
      
      if (day % 2 === 0) {
        bookedSlots = [1, 3]; // Para días pares
      } else {
        bookedSlots = [2, 5]; // Para días impares
      }
      
      resolve({ timeSlots, bookedSlots });
    }, 800);
  });
}
