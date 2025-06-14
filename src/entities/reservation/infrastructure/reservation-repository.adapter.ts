import { HttpClient } from "@/shared/api/types";
import { PaginatedApiResponse, SimpleApiResponse } from "@/shared/api/types";
import {
  CreateReservationDto,
  CreateReservationResponseDto,
  GetReservationsQuery,
  PaginatedReservations,
  ReservationDto,
  ReservationStateDto,
  TimeslotResponseDto,
  UpdateReservationStateCommand,
} from "../model/types";

// Interfaces para nueva API de disponibilidad
interface AvailabilityConfiguration {
  subScenarioId: number;
  initialDate: string;
  finalDate?: string;
  weekdays?: number[];
}

interface TimeSlotBasic {
  id: number;
  startTime: string;
  endTime: string;
  isAvailableInAllDates: boolean;
}

interface AvailabilityStats {
  totalDates: number;
  totalTimeslots: number;
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  globalAvailabilityPercentage: number;
  datesWithFullAvailability: number;
  datesWithNoAvailability: number;
}

interface SimplifiedAvailabilityResponse {
  subScenarioId: number;
  requestedConfiguration: {
    initialDate: string;
    finalDate?: string;
    weekdays?: number[];
  };
  calculatedDates: string[];
  timeSlots: TimeSlotBasic[];
  stats: AvailabilityStats;
  queriedAt: string;
}

export interface ReservationRepository {
  getByUserId(
    userId: number,
    query?: GetReservationsQuery
  ): Promise<PaginatedReservations>;
  getById(id: number): Promise<ReservationDto>;
  create(command: CreateReservationDto): Promise<CreateReservationResponseDto>;
  updateState(
    id: number,
    command: UpdateReservationStateCommand
  ): Promise<ReservationDto>;
  delete(id: number): Promise<void>;
  getStates(): Promise<ReservationStateDto[]>;
  getAvailableTimeSlots(
    subScenarioId: number,
    date: string
  ): Promise<TimeslotResponseDto[]>;
  getAvailabilityForConfiguration(
    config: AvailabilityConfiguration
  ): Promise<SimplifiedAvailabilityResponse>;
}

export class ApiReservationRepository implements ReservationRepository {
  constructor(private httpClient: HttpClient) {}

  async getByUserId(
    userId: number,
    query: GetReservationsQuery = {}
  ): Promise<PaginatedReservations> {
    const searchParams = new URLSearchParams();

    searchParams.set("userId", userId.toString());

    if (query.page) searchParams.set("page", query.page.toString());
    if (query.limit) searchParams.set("limit", query.limit.toString());
    if (query.searchQuery?.trim())
      searchParams.set("search", query.searchQuery.trim());
    if (query.scenarioId)
      searchParams.set("scenarioId", query.scenarioId.toString());
    if (query.activityAreaId)
      searchParams.set("activityAreaId", query.activityAreaId.toString());
    if (query.neighborhoodId)
      searchParams.set("neighborhoodId", query.neighborhoodId.toString());
    if (query.dateFrom) searchParams.set("dateFrom", query.dateFrom);
    if (query.dateTo) searchParams.set("dateTo", query.dateTo);

    // CACHE TAGS: Etiquetas granulares para invalidación
    const cacheConfig = {
      next: {
        tags: [
          "reservations", // Lista general
          `user-${userId}-reservations`, // Reservas del usuario específico
          ...(query.scenarioId
            ? [`scenario-${query.scenarioId}-reservations`]
            : []),
          ...(query.activityAreaId
            ? [`activity-${query.activityAreaId}-reservations`]
            : []),
        ],
      },
    };

    // Backend returns: { statusCode, message, data: ReservationDto[], meta: PageMetaDto }
    const response = await this.httpClient.get<
      PaginatedApiResponse<ReservationDto>
    >(`/reservations?${searchParams.toString()}`, cacheConfig);

    // Map data to ensure backward compatibility fields exist
    const mappedData = response.data.map((item: ReservationDto) => ({
      ...item,
      // Add derived fields for maintaining compatibility with existing code
      subScenarioId: item.subScenario?.id,
      userId: item.user?.id,
      timeSlotId: item.timeSlot?.id,
      reservationStateId: item.reservationState?.id,
    }));

    return {
      data: mappedData,
      meta: response.meta,
    };
  }

  async getById(id: number): Promise<ReservationDto> {
    // CACHE TAGS: Reserva específica + lista general
    const cacheConfig = {
      next: {
        tags: [
          `reservation-${id}`, // Reserva específica
          "reservations", // Lista general (para consistency)
        ],
      },
    };

    // Backend returns: { statusCode, message, data: ReservationDto }
    const response = await this.httpClient.get<
      SimpleApiResponse<ReservationDto>
    >(`/reservations/${id}`, cacheConfig);

    return {
      ...response.data,
      // Add derived fields for maintaining compatibility
      subScenarioId: response.data.subScenario?.id,
      userId: response.data.user?.id,
      timeSlotId: response.data.timeSlot?.id,
      reservationStateId: response.data.reservationState?.id,
    };
  }

  async create(
    command: CreateReservationDto
  ): Promise<CreateReservationResponseDto> {
    console.log("🚀 Repository: Creating reservation with command:", command);

    // Backend returns: { statusCode, message, data: CreateReservationResponseDto }
    const response = await this.httpClient.post<
      SimpleApiResponse<CreateReservationResponseDto>
    >("/reservations", command);

    console.log("Repository: Reservation created successfully:", response.data);
    return response.data;
  }

  async updateState(
    id: number,
    command: UpdateReservationStateCommand
  ): Promise<ReservationDto> {
    // CONFIG para httpOnly cookies
    const requestConfig = {
      headers: {
        "Content-Type": "application/json",
      },
      // CRÍTICO: Incluir cookies para autenticación
      next: {
        tags: [`reservation-${id}`, "reservations"], // Cache tags para invalidación
      },
    };

    console.log(
      `Repository: Updating reservation ${id} state to ${command.stateId}`
    );

    // Backend expects: { stateId: number }
    // Backend returns: { statusCode, message, data: ReservationDto }
    const response = await this.httpClient.patch<
      SimpleApiResponse<ReservationDto>
    >(
      `/reservations/${id}/state`,
      command,
      requestConfig // ← ¡INCLUIR CONFIG!
    );

    console.log(`Repository: Reservation ${id} state updated successfully`);

    return {
      ...response.data,
      // Add derived fields for maintaining compatibility
      subScenarioId: response.data.subScenario?.id,
      userId: response.data.user?.id,
      timeSlotId: response.data.timeSlot?.id,
      reservationStateId: response.data.reservationState?.id,
    };
  }

  async delete(id: number): Promise<void> {
    await this.httpClient.delete(`/reservations/${id}`);
  }

  async getStates(): Promise<ReservationStateDto[]> {
    // CACHE TAGS: Estados raramente cambian
    const cacheConfig = {
      next: {
        tags: ["reservation-states"],
        revalidate: 3600, // 1 hora - los estados cambian raramente
      },
    };

    // Backend returns: { statusCode, message, data: { id: number, state: string }[] }
    const response = await this.httpClient.get<
      SimpleApiResponse<ReservationStateDto[]>
    >("/reservations/states", cacheConfig);

    return response.data;
  }

  async getAvailabilityForConfiguration(
    config: AvailabilityConfiguration
  ): Promise<SimplifiedAvailabilityResponse> {
    const searchParams = new URLSearchParams({
      subScenarioId: config.subScenarioId.toString(),
      initialDate: config.initialDate,
    });

    if (config.finalDate) {
      searchParams.set('finalDate', config.finalDate);
    }

    if (config.weekdays && config.weekdays.length > 0) {
      searchParams.set('weekdays', config.weekdays.join(','));
    }

    const cacheConfig = {
      next: {
        tags: [
          `availability-config-${config.subScenarioId}-${config.initialDate}`,
          `availability-${config.subScenarioId}`,
          "availability",
        ],
        revalidate: 300, // 5 minutos
      },
    };

    try {
      console.log(
        `Calling availability configuration endpoint: /reservations/availability?${searchParams.toString()}`
      );

      const url = `/reservations/availability?${searchParams.toString()}`;

      const response = await this.httpClient.get<
        SimpleApiResponse<SimplifiedAvailabilityResponse>
      >(url, cacheConfig);

      console.log(`Availability configuration response:`, response.data);

      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format from availability configuration API');
      }

      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching availability configuration:`, error);
      throw error;
    }
  }

  async getAvailableTimeSlots(
    subScenarioId: number,
    date: string
  ): Promise<TimeslotResponseDto[]> {
    // REFACTORED: Usar el nuevo endpoint para consistencia
    // Convertir consulta de un día al nuevo formato
    const config: AvailabilityConfiguration = {
      subScenarioId,
      initialDate: date,
      // Sin finalDate ni weekdays = consulta de un solo día
    };

    try {
      console.log(
        `getAvailableTimeSlots: Converting single-date query to new format:`, config
      );

      const response = await this.getAvailabilityForConfiguration(config);
      
      // Convertir timeSlots a TimeslotResponseDto[] para compatibilidad
      const timeslots: TimeslotResponseDto[] = response.timeSlots
        .filter(slot => slot.isAvailableInAllDates) // Solo disponibles
        .map(slot => ({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailableInAllDates,
        }));

      console.log(
        `getAvailableTimeSlots: Converted ${timeslots.length} available timeslots for ${date}`
      );

      return timeslots;
    } catch (error) {
      console.error(`❌ Error in getAvailableTimeSlots:`, error);
      throw error;
    }
  }
}

// Factory function for creating repository instances - now accepts both Client and Server HTTP clients
export const createReservationRepository = (
  httpClient: HttpClient
): ReservationRepository => {
  return new ApiReservationRepository(httpClient);
};
