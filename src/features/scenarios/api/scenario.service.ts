import { SubScenario } from "@/features/home/types/filters.types";
import { TimeSlot } from "@/features/reservations/types/reservation.types";
import ScenarioService from "@/services/scenario.service";
import ReservationService, { TimeslotResponseDto } from "@/services/reservation.service";

// Definir la URL base del API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ScenarioWithRelations extends SubScenario {
  // Aquí se pueden agregar más campos específicos para un escenario completo
}

export async function fetchScenarioById(
  id: string
): Promise<ScenarioWithRelations> {
  // Usar el servicio real para obtener datos del backend
  const response = await fetch(`${API_URL}/sub-scenarios/${id}`);

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  const { data } = await response.json();
  console.log({ subscenario: data });
  // Convertir la respuesta del backend al formato que espera el frontend
  return {
    id: data.id,
    name: data.name,
    hasCost: data.hasCost || false,
    numberOfPlayers: data.numberOfPlayers || 0,
    numberOfSpectators: data.numberOfSpectators || 0,
    recommendations:
      data.recommendations || "No hay recomendaciones disponibles.",
    activityArea: data.activityArea || { id: "1", name: "Deportes" },
    fieldSurfaceType: data.fieldSurfaceType || { id: "1", name: "Normal" },
    scenario: {
      id: data.scenario?.id || 0,
      name: data.scenario?.name || "Escenario sin nombre",
      address: data.scenario?.address || "Sin dirección",
      neighborhood: data.scenario?.neighborhood || { id: "1", name: "Centro" },
    },
  };
}

export async function fetchTimeSlots(
  subScenarioId: string | number,
  date: string
): Promise<{ timeSlots: TimeSlot[]; bookedSlots: number[] }> {
  console.log(
    `Fetching time slots for sub-scenario ${subScenarioId} on ${date}`
  );

  const availableTimeslots = await ReservationService.getAvailableTimeSlots(
    Number(subScenarioId),
    date
  );

  console.log({availableTimeslots});

  // Obtener todos los timeslots para poder mostrar los reservados y disponibles
  const allTimeSlots = await fetch(
    `${API_URL}/reservations/available-timeslots?subScenarioId=${subScenarioId}&date=${date}`
  );

  if (!allTimeSlots.ok) {
    throw new Error(`Error ${allTimeSlots.status}: ${allTimeSlots.statusText}`);
  }

  const {data} = await allTimeSlots.json();

  // Crear el arreglo de timeslots con el formato esperado
  const timeSlots: TimeSlot[] = data.map((slot: any) => ({
    id: slot.id,
    startTime: slot.startTime,
    endTime: slot.endTime,
    dayOfWeek: new Date(date).getDay(),
  }));

  // Crear la lista de slots reservados (los que no están disponibles)
  const bookedSlots = timeSlots
    .filter(
      (slot) => !availableTimeslots.find((a) => a.id === slot.id && a.available)
    )
    .map((slot) => slot.id);

  return { timeSlots, bookedSlots };
}
