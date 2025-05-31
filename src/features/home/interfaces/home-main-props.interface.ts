import { IActivityArea, IMetaDto, INeighborhood, ISubScenario } from "../types/filters.types";

export interface HomeMainProps {
  initialActivityAreas: IActivityArea[];
  initialNeighborhoods: INeighborhood[];
  initialSubScenarios: ISubScenario[];
  initialMeta: IMetaDto;
}