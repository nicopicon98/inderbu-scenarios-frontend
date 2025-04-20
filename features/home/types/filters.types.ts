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
