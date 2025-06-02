// API Response types matching the exact backend structure
export interface PageMetaDto {
  readonly page: number;
  readonly limit: number;
  readonly totalItems: number;
  readonly totalPages: number;
}

// For paginated responses
export interface PaginatedApiResponse<T> {
  statusCode: number;
  message: string;
  data: T[];
  meta: PageMetaDto;
}

// For simple responses
export interface SimpleApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// API Error structure (from HttpExceptionFilter)
export interface ApiError {
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams {
  search?: string;
}

// Reservation-specific query params (matching the current working service)
export interface ReservationQueryParams extends PaginationParams, SearchParams {
  scenarioId?: number;
  activityAreaId?: number;
  neighborhoodId?: number;
  userId?: number;
  dateFrom?: string; // YYYY-MM-DD format
  dateTo?: string;   // YYYY-MM-DD format
  searchQuery?: string; // Note: current service uses searchQuery, not search
}
