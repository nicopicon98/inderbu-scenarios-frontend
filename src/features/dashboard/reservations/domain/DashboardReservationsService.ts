import { 
  GetDashboardReservationsUseCase, 
  DashboardReservationsFilters, 
  DashboardReservationsResponse 
} from '../application/GetDashboardReservationsUseCase';

export class DashboardReservationsService {
  constructor(
    private readonly getDashboardReservationsUseCase: GetDashboardReservationsUseCase
  ) {}

  async getDashboardReservations(filters: DashboardReservationsFilters = {}): Promise<DashboardReservationsResponse> {
    return await this.getDashboardReservationsUseCase.execute(filters);
  }
}
