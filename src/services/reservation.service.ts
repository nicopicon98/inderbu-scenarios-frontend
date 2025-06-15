import { Scenario } from "@/entities/reservation/model/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/* ---------- Creación de reserva ---------- */
export interface CreateReservationDto {
  subScenarioId: number;
  timeSlotId: number;
  reservationDate: string; // YYYY-MM-DD
  comments?: string;
}

export interface CreateReservationResponseDto {
  id: number;
  reservationDate: string; // alias de initialDate
  subScenarioId: number;
  userId: number;
  timeSlotId: number;
  reservationStateId: number;
  comments?: string;
}

/* ---------- Catálogo de estados ---------- */
export interface ReservationStateDto {
  id: number;
  state: "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "CANCELADA";
  description?: string;
}

/* ---------- Timeslot simplificado ---------- */
export interface TimeSlotDto {
  id: number;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface TimeslotResponseDto extends TimeSlotDto {
  available: boolean;
}

/* ---------- Reserva (contrato 2025-06-14) ---------- */
export interface ReservationDto {
  /* Campos nativos del backend */
  id: number;
  type: "SINGLE" | "RANGE";
  subScenarioId: number;
  userId: number;
  initialDate: string; // YYYY-MM-DD
  finalDate: string | null; // YYYY-MM-DD | null
  weekDays: number[] | null; // 0-6 (lun-dom) | null
  comments?: string | null;
  reservationStateId: number;
  totalInstances: number;
  createdAt: string; // ISO
  updatedAt: string; // ISO

  /* Asociaciones */
  subScenario: {
    id: number;
    name: string;

    /* props legacy opcionales (evitan refactor masivo) */
    hasCost?: boolean;
    numberOfSpectators?: number | null;
    numberOfPlayers?: number | null;
    recommendations?: string | null;
    scenarioId?: number;
    scenarioName?: string;
    scenario?: Scenario;
  };

  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };

  reservationState: ReservationStateDto;

  timeslots: TimeSlotDto[];

  /* ---- SHIMS DE COMPATIBILIDAD ---- */
  reservationDate?: string; // = initialDate
  timeSlot?: TimeSlotDto; // primer slot
  timeSlotId?: number; // id del primer slot
}

/* ───────────────────────────────  HELPERS PRIVADOS  ─────────────────────────────────────── */

/** Convierte la respuesta cruda a nuestro DTO con compatibilidad legacy. */
function normalizeReservation(api: any): ReservationDto {
  const firstSlot: TimeSlotDto | undefined = (api.timeslots ?? [])[0];

  return {
    ...api,
    reservationDate: api.initialDate, // alias para UI actual
    timeSlot: firstSlot,
    timeSlotId: firstSlot?.id,
    subScenario: {
      /* relleno de campos legacy para que no fallen lecturas previas */
      hasCost: false,
      numberOfSpectators: null,
      numberOfPlayers: null,
      recommendations: null,
      scenarioId: api.subScenario?.scenarioId ?? 0,
      scenarioName: api.subScenario?.scenarioName ?? "",
      scenario: api.subScenario?.scenario,
      ...api.subScenario,
    },
  } as ReservationDto;
}

/** Construye la URL con filtros opcionales. */
function buildFilterURL(base: string, filters: Record<string, any>) {
  const url = new URL(base);
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && `${val}`.trim() !== "") {
      url.searchParams.set(key, `${val}`);
    }
  });
  return url.toString();
}

/** Fetch genérico para catálogos (escenarios, áreas, etc.). */
async function genericListFetch<T = any>(
  endpoint: string,
  mapper: (raw: any) => T = (x) => x
): Promise<T[]> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const { data } = await res.json();
  return (data ?? []).map(mapper);
}

/* ───────────────────────────────  SERVICIO PÚBLICO  ─────────────────────────────────────── */
const ReservationService = {
  /* ---------- Disponibilidad de slots ---------- */
  async getAvailableTimeSlots(
    subScenarioId: number,
    date: string
  ): Promise<TimeslotResponseDto[]> {
    const res = await fetch(
      `${API_URL}/reservations/available-timeslots?subScenarioId=${subScenarioId}&date=${date}`,
      { credentials: "include" }
    );
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    const { data } = await res.json();
    return data;
  },

  /* ---------- Crear reserva ---------- */
  async createReservation(
    reservationData: CreateReservationDto
  ): Promise<CreateReservationResponseDto> {
    const res = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reservationData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? `Error ${res.status}`);
    }
    return res.json();
  },

  /* ---------- Reservas de un usuario ---------- */
  async getUserReservations(userId: number): Promise<ReservationDto[]> {
    const res = await fetch(`${API_URL}/users/${userId}/reservations`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    const { data } = await res.json();
    return data.map(normalizeReservation);
  },

  /* ---------- Todas las reservas (admin) ---------- */
  async getAllReservations(
    filters: Record<string, any> = {}
  ): Promise<ReservationDto[]> {
    const url = buildFilterURL(`${API_URL}/reservations`, filters);
    const res = await fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    const { data } = await res.json();
    return data.map(normalizeReservation);
  },

  /* ---------- Con paginación ---------- */
  async getAllReservationsWithPagination(
    filters: Record<string, any> = {}
  ): Promise<{
    data: ReservationDto[];
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    const url = buildFilterURL(`${API_URL}/reservations`, filters);
    const res = await fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    const { data, meta } = await res.json();
    return { data: data.map(normalizeReservation), meta };
  },

  /* ---------- Catálogo de estados ---------- */
  async getAllReservationStates(): Promise<ReservationStateDto[]> {
    const res = await fetch(`${API_URL}/reservations/states`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    const { data } = await res.json();
    return data;
  },

  /* ---------- Actualizar estado (legacy) ---------- */
  async updateReservationState(
    reservationId: number,
    stateId: number
  ): Promise<ReservationDto> {
    const res = await fetch(`${API_URL}/reservations/${reservationId}/state`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stateId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? `Error ${res.status}`);
    }
    const result = await res.json();
    return normalizeReservation(result);
  },

  /* ---------- Filtros generales ---------- */
  getAllScenarios: () =>
    genericListFetch<{ id: number; name: string }>("/scenarios"),
  getAllActivityAreas: () =>
    genericListFetch<{ id: number; name: string }>("/activity-areas"),
  getAllNeighborhoods: () =>
    genericListFetch<{ id: number; name: string }>("/neighborhoods"),
  getAllUsers: () =>
    genericListFetch<{
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    }>("/users", (u) => ({
      id: u.id,
      firstName: u.firstName ?? u.first_name ?? "",
      lastName: u.lastName ?? u.last_name ?? "",
      email: u.email ?? "",
    })),
};

export default ReservationService;
