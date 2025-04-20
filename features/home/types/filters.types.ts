export interface ActivityArea {
  id: string;
  name: string;
}

export interface Neighborhood {
  id: string;
  name: string;
}

export interface FiltersState {
  activityArea: string | null;
  neighborhood: string | null;
  searchQuery: string;
}

// /features/home/types/filters.types.ts

export interface SubScenario {
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

