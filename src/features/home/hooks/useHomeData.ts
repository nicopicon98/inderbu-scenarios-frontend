import { useCallback, useEffect, useReducer, Dispatch, SetStateAction } from "react";
import { getSubScenarios } from "../api/home.service";
import { IFilters, IMetaDto, ISubScenario } from "../types/filters.types";

// Re-exportamos el tipo para conveniencia
export type { IFilters };

interface UseHomeDataState {
  subScenarios: ISubScenario[];
  meta: IMetaDto;
  page: number;
  filters: IFilters;
  activeFilters: string[];
  loading: boolean;
  error: string | null;
}

type UseHomeDataAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: { subScenarios: ISubScenario[]; meta: IMetaDto } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_FILTERS'; payload: IFilters }
  | { type: 'SET_FILTERS_WITH_UPDATER'; payload: (prevState: IFilters) => IFilters }
  | { type: 'SET_ACTIVE_FILTERS'; payload: string[] }
  | { type: 'SET_ACTIVE_FILTERS_WITH_UPDATER'; payload: (prevState: string[]) => string[] }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'RETRY_FETCH' };

function useHomeDataReducer(state: UseHomeDataState, action: UseHomeDataAction): UseHomeDataState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'SET_DATA':
      return {
        ...state,
        subScenarios: action.payload.subScenarios,
        meta: action.payload.meta,
        loading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload, page: 1 };
    case 'SET_FILTERS_WITH_UPDATER':
      return { ...state, filters: action.payload(state.filters), page: 1 };
    case 'SET_ACTIVE_FILTERS':
      return { ...state, activeFilters: action.payload };
    case 'SET_ACTIVE_FILTERS_WITH_UPDATER':
      return { ...state, activeFilters: action.payload(state.activeFilters) };
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: { searchQuery: "" },
        activeFilters: [],
        page: 1,
      };
    case 'RETRY_FETCH':
      return { ...state, error: null, loading: true };
    default:
      return state;
  }
}

interface UseHomeDataParams {
  initialSubScenarios: ISubScenario[];
  initialMeta: IMetaDto;
}

export function useHomeData({ initialSubScenarios, initialMeta }: UseHomeDataParams) {
  const initialState: UseHomeDataState = {
    subScenarios: initialSubScenarios,
    meta: initialMeta,
    page: initialMeta.page,
    filters: { searchQuery: "" },
    activeFilters: [],
    loading: false,
    error: null,
  };

  const [state, dispatch] = useReducer(useHomeDataReducer, initialState);

  // Función para fetch de datos
  const fetchSubScenarios = useCallback(async (page: number, filters: IFilters, limit: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const { data, meta } = await getSubScenarios({
        page,
        limit,
        ...filters
      });

      dispatch({
        type: 'SET_DATA',
        payload: { subScenarios: data, meta }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar los escenarios';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error fetching sub scenarios:', error);
    }
  }, []);

  // Effect para fetch cuando cambian dependencias
  useEffect(() => {
    fetchSubScenarios(state.page, state.filters, initialMeta.limit);
  }, [state.page, state.filters, fetchSubScenarios, initialMeta.limit]);

  // Handlers
  const setPage = useCallback((newPage: number) => {
    dispatch({ type: 'SET_PAGE', payload: newPage });
  }, []);

  const setFilters: Dispatch<SetStateAction<IFilters>> = useCallback((filtersOrUpdater) => {
    if (typeof filtersOrUpdater === 'function') {
      dispatch({ type: 'SET_FILTERS_WITH_UPDATER', payload: filtersOrUpdater });
    } else {
      dispatch({ type: 'SET_FILTERS', payload: filtersOrUpdater });
    }
  }, []);

  const setActiveFilters: Dispatch<SetStateAction<string[]>> = useCallback((activeFiltersOrUpdater) => {
    if (typeof activeFiltersOrUpdater === 'function') {
      dispatch({ type: 'SET_ACTIVE_FILTERS_WITH_UPDATER', payload: activeFiltersOrUpdater });
    } else {
      dispatch({ type: 'SET_ACTIVE_FILTERS', payload: activeFiltersOrUpdater });
    }
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const retryFetch = useCallback(() => {
    dispatch({ type: 'RETRY_FETCH' });
    fetchSubScenarios(state.page, state.filters, initialMeta.limit);
  }, [state.page, state.filters, fetchSubScenarios, initialMeta.limit]);

  // Computed values
  const hasError = Boolean(state.error);
  const hasData = state.subScenarios.length > 0;
  const isEmpty = !state.loading && !hasError && !hasData;

  return {
    // State
    subScenarios: state.subScenarios,
    meta: state.meta,
    page: state.page,
    filters: state.filters,
    activeFilters: state.activeFilters,
    loading: state.loading,
    error: state.error,

    // Computed
    hasError,
    hasData,
    isEmpty,

    // Actions
    setPage,
    setFilters,
    setActiveFilters,
    clearFilters,
    retryFetch,
  };
}
