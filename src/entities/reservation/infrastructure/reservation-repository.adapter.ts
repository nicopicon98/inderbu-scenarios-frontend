import { HttpClient } from '@/shared/api/types';
import { PaginatedApiResponse, SimpleApiResponse } from '@/shared/api/types';
import {
  CreateReservationDto,
  CreateReservationResponseDto,
  GetReservationsQuery,
  PaginatedReservations,
  ReservationDto,
  ReservationStateDto,
  TimeslotResponseDto,
  UpdateReservationStateCommand,
} from '../model/types';

export interface ReservationRepository {
  getByUserId(userId: number, query?: GetReservationsQuery): Promise<PaginatedReservations>;
  getById(id: number): Promise<ReservationDto>;
  create(command: CreateReservationDto): Promise<CreateReservationResponseDto>;
  updateState(id: number, command: UpdateReservationStateCommand): Promise<ReservationDto>;
  delete(id: number): Promise<void>;
  getStates(): Promise<ReservationStateDto[]>;
  getAvailableTimeSlots(subScenarioId: number, date: string): Promise<TimeslotResponseDto[]>;
}

export class ApiReservationRepository implements ReservationRepository {
  constructor(private httpClient: HttpClient) { }

  async getByUserId(userId: number, query: GetReservationsQuery = {}): Promise<PaginatedReservations> {
    const searchParams = new URLSearchParams();

    searchParams.set('userId', userId.toString());

    if (query.page) searchParams.set('page', query.page.toString());
    if (query.limit) searchParams.set('limit', query.limit.toString());
    if (query.searchQuery?.trim()) searchParams.set('search', query.searchQuery.trim());
    if (query.scenarioId) searchParams.set('scenarioId', query.scenarioId.toString());
    if (query.activityAreaId) searchParams.set('activityAreaId', query.activityAreaId.toString());
    if (query.neighborhoodId) searchParams.set('neighborhoodId', query.neighborhoodId.toString());
    if (query.dateFrom) searchParams.set('dateFrom', query.dateFrom);
    if (query.dateTo) searchParams.set('dateTo', query.dateTo);

    // CACHE TAGS: Etiquetas granulares para invalidación
    const cacheConfig = {
      next: {
        tags: [
          'reservations',                    // Lista general
          `user-${userId}-reservations`,     // Reservas del usuario específico
          ...(query.scenarioId ? [`scenario-${query.scenarioId}-reservations`] : []),
          ...(query.activityAreaId ? [`activity-${query.activityAreaId}-reservations`] : []),
        ]
      }
    };

    // Backend returns: { statusCode, message, data: ReservationDto[], meta: PageMetaDto }
    const response = await this.httpClient.get<PaginatedApiResponse<ReservationDto>>(
      `/reservations?${searchParams.toString()}`,
      cacheConfig
    );

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
          `reservation-${id}`,    // Reserva específica
          'reservations',         // Lista general (para consistency)
        ]
      }
    };

    // Backend returns: { statusCode, message, data: ReservationDto }
    const response = await this.httpClient.get<SimpleApiResponse<ReservationDto>>(
      `/reservations/${id}`,
      cacheConfig
    );

    return {
      ...response.data,
      // Add derived fields for maintaining compatibility
      subScenarioId: response.data.subScenario?.id,
      userId: response.data.user?.id,
      timeSlotId: response.data.timeSlot?.id,
      reservationStateId: response.data.reservationState?.id,
    };
  }

  async create(command: CreateReservationDto): Promise<CreateReservationResponseDto> {
    console.log('🚀 Repository: Creating reservation with command:', command);
    
    // Backend returns: { statusCode, message, data: CreateReservationResponseDto }
    const response = await this.httpClient.post<SimpleApiResponse<CreateReservationResponseDto>>(
      '/reservations',
      command
    );

    console.log('✅ Repository: Reservation created successfully:', response.data);
    return response.data;
  }

  async updateState(id: number, command: UpdateReservationStateCommand): Promise<ReservationDto> {
    // CONFIG para httpOnly cookies
    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
      // CRÍTICO: Incluir cookies para autenticación
      next: {
        tags: [`reservation-${id}`, 'reservations'] // Cache tags para invalidación
      }
    };

    console.log(`Repository: Updating reservation ${id} state to ${command.stateId}`);
    
    // Backend expects: { stateId: number }
    // Backend returns: { statusCode, message, data: ReservationDto }
    const response = await this.httpClient.patch<SimpleApiResponse<ReservationDto>>(
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
        tags: ['reservation-states'],
        revalidate: 3600  // 1 hora - los estados cambian raramente
      }
    };

    // Backend returns: { statusCode, message, data: { id: number, state: string }[] }
    const response = await this.httpClient.get<SimpleApiResponse<ReservationStateDto[]>>(
      '/reservations/states',
      cacheConfig
    );

    return response.data;
  }

  async getAvailableTimeSlots(subScenarioId: number, date: string): Promise<TimeslotResponseDto[]> {
    // 🎯 FIXED: Corregido endpoint para coincidir con backend
    // CACHE TAGS: Timeslots por scenario y fecha
    const cacheConfig = {
      next: {
        tags: [
          `timeslots-${subScenarioId}-${date}`, // Específico por scenario y fecha
          `timeslots-${subScenarioId}`,         // Por scenario general
          'timeslots',                          // Global
        ],
        revalidate: 300  // 5 minutos - los timeslots pueden cambiar relativamente rápido
      }
    };

    try {
      console.log(`Calling availability endpoint: /reservations/availability?subScenarioId=${subScenarioId}&date=${date}`);
      
      // 🎯 FIXED: El backend devuelve AvailabilityResponseDto, no TimeslotResponseDto[]
      interface AvailabilityResponseDto {
        subScenarioId: number;
        date: string;
        timeslots: TimeslotResponseDto[];  // ← Array está aquí
        totalAvailable: number;
        totalTimeslots: number;
        queriedAt?: string;
      }
      
      const response = await this.httpClient.get<SimpleApiResponse<AvailabilityResponseDto>>(
        `/reservations/availability?subScenarioId=${subScenarioId}&date=${date}`,
        cacheConfig
      );

      // DEBUG: Loggear la respuesta completa del backend
      console.log(`🔎 Full response from backend:`, response);
      console.log(`🔎 Response.data:`, response.data);
      console.log(`🔎 Response.data.timeslots:`, response.data.timeslots);
      console.log(`🔎 Type of response.data.timeslots:`, typeof response.data.timeslots);
      console.log(`🔎 Is response.data.timeslots an array?`, Array.isArray(response.data.timeslots));
      
      if (response.data && response.data.timeslots && Array.isArray(response.data.timeslots)) {
        console.log(`✅ Successfully parsed ${response.data.timeslots.length} timeslots`);
        return response.data.timeslots; // 🎯 FIXED: Extraer el array de timeslots
      } else {
        console.error(`❌ Invalid response.data.timeslots format:`, response.data);
        throw new Error(`Invalid response format: expected timeslots array in data property`);
      }
      
    } catch (error) {
      console.error(`❌ Error fetching availability:`, error);
      
      // DEBUG: Si es un error de HTTP, mostrar más detalles
      if (error instanceof Error && 'response' in error) {
        const httpError = error as any;
        console.error(`🔎 HTTP Error details:`, {
          status: httpError.response?.status,
          statusText: httpError.response?.statusText,
          data: httpError.response?.data
        });
      }
      
      throw error;
    }
  }
}

// Factory function for creating repository instances - now accepts both Client and Server HTTP clients
export const createReservationRepository = (httpClient: HttpClient): ReservationRepository => {
  return new ApiReservationRepository(httpClient);
};
