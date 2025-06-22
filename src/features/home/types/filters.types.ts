export interface IActivityArea {
  id: string;
  name: string;
}

export interface INeighborhood {
  id: string;
  name: string;
}

export interface IFiltersState {
  activityArea: string | null;
  neighborhood: string | null;
  searchQuery: string;
}

export interface IFilters {
  activityAreaId?: number;
  neighborhoodId?: number;
  searchQuery: string;
  hasCost?: boolean;
}

export interface IMetaDto {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export interface ISubScenario {
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
  activityArea: { id: number; name: string };
  fieldSurfaceType: { id: number; name: string };
}
