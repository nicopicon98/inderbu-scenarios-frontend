// features/scenarios/api/scenarioApi.ts
export interface ScenarioWithRelations {
  id: number;
  name: string;
  hasCost: boolean;
  numberOfSpectators: number;
  numberOfPlayers: number;
  recommendations: string;
  scenario: {
    id: number;
    name: string;
    address: string;
    neighborhood: { id: number; name: string };
  };
  activityArea?: { id: number; name: string };
  fieldSurfaceType?: { id: number; name: string };
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export async function fetchScenarioById(
  id: string
): Promise<ScenarioWithRelations> {
  const res = await fetch(
    `http://localhost:3001/sub-scenarios/${id}`,
    { cache: "no-store" }
  );
  console.log("res", res);
  if (!res.ok) {
    throw new Error(`Error loading scenario ${id}: ${res.status}`);
  }
  const json: ApiResponse<ScenarioWithRelations> = await res.json();
  return json.data;
}

export interface TimeSlot {
  id: number;
  startTime: string; // "HH:MM:SS"
  endTime: string;   // "HH:MM:SS"
  available: boolean;
}
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export async function fetchTimeSlots(
  subScenarioId: number,
  date: string,                // "YYYY-MM-DD"
): Promise<TimeSlot[]> {
  const url = new URL(
    `http://localhost:3001/reservations/available-timeslots`,
  );
  url.searchParams.set("subScenarioId", subScenarioId.toString());
  url.searchParams.set("date", date);
  console.log(url);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Error fetching timeslots: ${res.status}`);
  const json: ApiResponse<TimeSlot[]> = await res.json();
  console.log(json);
  return json.data;
}