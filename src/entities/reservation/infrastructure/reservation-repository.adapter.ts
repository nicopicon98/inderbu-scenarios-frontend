import { ClientHttpClient } from '@/shared/api/http-client-client';
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
  constructor(private httpClient: ClientHttpClient) { }

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

    // Backend returns: { statusCode, message, data: ReservationDto[], meta: PageMetaDto }
    const response = await this.httpClient.get<PaginatedApiResponse<ReservationDto>>(
      `/reservations?${searchParams.toString()}`
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
    // Backend returns: { statusCode, message, data: ReservationDto }
    const response = await this.httpClient.get<SimpleApiResponse<ReservationDto>>(
      `/reservations/${id}`
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
    // Backend returns: { statusCode, message, data: CreateReservationResponseDto }
    const response = await this.httpClient.post<SimpleApiResponse<CreateReservationResponseDto>>(
      '/reservations',
      command
    );

    return response.data;
  }

  async updateState(id: number, command: UpdateReservationStateCommand): Promise<ReservationDto> {
    // Backend expects: { stateId: number }
    // Backend returns: { statusCode, message, data: ReservationDto }
    const response = await this.httpClient.patch<SimpleApiResponse<ReservationDto>>(
      `/reservations/${id}/state`,
      command
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

  async delete(id: number): Promise<void> {
    await this.httpClient.delete(`/reservations/${id}`);
  }

  async getStates(): Promise<ReservationStateDto[]> {
    // Backend returns: { statusCode, message, data: { id: number, state: string }[] }
    const response = await this.httpClient.get<SimpleApiResponse<ReservationStateDto[]>>(
      '/reservations/states'
    );

    return response.data;
  }

  async getAvailableTimeSlots(subScenarioId: number, date: string): Promise<TimeslotResponseDto[]> {
    // Backend returns: { statusCode, message, data: TimeslotResponseDto[] }
    const response = await this.httpClient.get<SimpleApiResponse<TimeslotResponseDto[]>>(
      `/reservations/available-timeslots?subScenarioId=${subScenarioId}&date=${date}`
    );

    return response.data;
  }
}

// Factory function for creating repository instances
export const createReservationRepository = (httpClient: ClientHttpClient): ReservationRepository => {
  return new ApiReservationRepository(httpClient);
};
