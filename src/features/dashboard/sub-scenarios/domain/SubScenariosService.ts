import { 
  GetSubScenariosDataUseCase, 
  SubScenariosFilters, 
  SubScenariosDataResponse 
} from '../application/GetSubScenariosDataUseCase';

export class SubScenariosService {
  constructor(
    private readonly getSubScenariosDataUseCase: GetSubScenariosDataUseCase
  ) {}

  async getSubScenariosData(filters: SubScenariosFilters = {}): Promise<SubScenariosDataResponse> {
    return await this.getSubScenariosDataUseCase.execute(filters);
  }
}
