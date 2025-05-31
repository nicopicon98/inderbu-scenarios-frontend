const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Tipos
export interface TimeSlotDto {
  id: number;
  startTime: string;
  endTime: string;
  dayOfWeek?: number;
}

// Servicio de timeslots
const TimeSlotService = {
  // Obtener todos los timeslots
  getAllTimeSlots: async (): Promise<TimeSlotDto[]> => {
    try {
      const response = await fetch(`${API_URL}/timeslots`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error getting timeslots:", error);
      // Para desarrollo, retornamos datos de ejemplo si la API no está disponible
      return mockTimeSlots();
    }
  },
};

// Mock timeslots para desarrollo cuando no haya API disponible
function mockTimeSlots(): TimeSlotDto[] {
  return [
    { id: 1, startTime: "08:00", endTime: "08:59" },
    { id: 2, startTime: "09:00", endTime: "09:59" },
    { id: 3, startTime: "10:00", endTime: "10:59" },
    { id: 4, startTime: "11:00", endTime: "11:59" },
    { id: 5, startTime: "12:00", endTime: "12:59" },
    { id: 6, startTime: "13:00", endTime: "13:59" },
    { id: 7, startTime: "14:00", endTime: "14:59" },
    { id: 8, startTime: "15:00", endTime: "15:59" },
    { id: 9, startTime: "16:00", endTime: "16:59" },
    { id: 10, startTime: "17:00", endTime: "17:59" },
    { id: 11, startTime: "18:00", endTime: "18:59" },
    { id: 12, startTime: "19:00", endTime: "19:59" },
    { id: 13, startTime: "20:00", endTime: "20:59" },
    { id: 14, startTime: "21:00", endTime: "21:59" },
  ];
}

export default TimeSlotService;
