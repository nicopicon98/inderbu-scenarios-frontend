// Este archivo ya no es necesario con la nueva implementación usando SearchSelect
// Se mantiene por compatibilidad, pero los filtros ahora se manejan directamente en FiltersCard

export const FILTER_TYPES = {
  SCENARIO: 'scenarioId',
  ACTIVITY_AREA: 'activityAreaId', 
  NEIGHBORHOOD: 'neighborhoodId',
  USER: 'userId',
  SEARCH: 'searchQuery'
} as const;
