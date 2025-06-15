import { 
  GetScenariosDataUseCase, 
  ScenariosFilters, 
  ScenariosDataResponse 
} from '../application/GetScenariosDataUseCase';

export class ScenariosService {
  constructor(
    private readonly getScenariosDataUseCase: GetScenariosDataUseCase
  ) {}

  async getScenariosData(filters: ScenariosFilters = {}): Promise<ScenariosDataResponse> {
    return await this.getScenariosDataUseCase.execute(filters);
  }
}
