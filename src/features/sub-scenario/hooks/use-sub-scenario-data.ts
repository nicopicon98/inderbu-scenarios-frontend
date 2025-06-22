"use client";

import {
  ActivityArea,
  Neighborhood,
  PageMeta,
  PageOptions,
  Scenario,
  SubScenario,
  CreateSubScenarioDto,
  UpdateSubScenarioDto,
  activityAreaService,
  neighborhoodService,
  scenarioService,
  subScenarioService,
} from "@/services/api";
import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export interface FilterState extends PageOptions {
  search: string;
  scenarioId?: number;
  activityAreaId?: number;
  neighborhoodId?: number;
}

const EMPTY_FILTERS: FilterState = { search: "", page: 1, limit: 7 };

export function useSubScenarioData() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRender = useRef(true);

  // ─── Internal State (como useHomeData) ──────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [subScenarios, setSubScenarios] = useState<SubScenario[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activityAreas, setActivityAreas] = useState<ActivityArea[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [fieldSurfaceTypes, setSurface] = useState<
    { id: number; name: string }[]
  >([]);
  const [pageMeta, setPageMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Extract filters from URL ───────────────────────────────────────────────────────────────────
  const urlFilters = {
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 7,
    search: searchParams.get('search') || "",
    scenarioId: searchParams.get('scenarioId') ? Number(searchParams.get('scenarioId')) : undefined,
    activityAreaId: searchParams.get('activityAreaId') ? Number(searchParams.get('activityAreaId')) : undefined,
    neighborhoodId: searchParams.get('neighborhoodId') ? Number(searchParams.get('neighborhoodId')) : undefined,
  };

  // ─── Sync URL with state on mount and URL changes ─────────────────────────────────────────────
  useEffect(() => {
    setFilters(urlFilters);
  }, [searchParams]);

  // ─── Sync state with URL (cuando el estado interno cambia) ─────────────────────────────────────
  const updateUrl = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams();
    
    if (newFilters.page && newFilters.page > 1) params.set('page', newFilters.page.toString());
    if (newFilters.limit !== 7) params.set('limit', newFilters.limit!.toString());
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.scenarioId) params.set('scenarioId', newFilters.scenarioId.toString());
    if (newFilters.activityAreaId) params.set('activityAreaId', newFilters.activityAreaId.toString());
    if (newFilters.neighborhoodId) params.set('neighborhoodId', newFilters.neighborhoodId.toString());

    const newUrl = params.toString() ? `/dashboard/sub-scenarios?${params.toString()}` : '/dashboard/sub-scenarios';
    router.replace(newUrl, { scroll: false });
  }, [router]);

  // ─── Initial bootstrap ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [{ data: scenariosData }, areas, neighs] = await Promise.all([
          scenarioService.getAll({ limit: 100 }),
          activityAreaService.getAll(),
          neighborhoodService.getAll(),
        ]);

        setScenarios(scenariosData);
        setActivityAreas(Array.isArray(areas) ? areas : areas.data);
        setNeighborhoods(Array.isArray(neighs) ? neighs : neighs.data);
        setSurface([
          { id: 1, name: "Concreto" },
          { id: 2, name: "Sintético" },
          { id: 3, name: "Césped" },
          { id: 4, name: "Cemento" },
        ]);
      } catch (err) {
        console.error(err);
        setError("Error al cargar datos iniciales.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ─── Fetch subescenarios cuando cambia el estado interno ───────────────────────────────────────
  const fetchSubScenarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await subScenarioService.getAll(filters);
      setSubScenarios(res.data);
      setPageMeta(res.meta);
    } catch (err) {
      console.error(err);
      setError("Error al obtener sub-escenarios.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // ─── Effect para fetch SOLO en renders subsecuentes ───────────────────────────────────────────
  useEffect(() => {
    // Evitar fetch en el primer render (datos vienen del SSR si está disponible)
    if (initialRender.current) {
      initialRender.current = false;
      // Solo hacer el fetch inicial si no hay datos
      if (subScenarios.length === 0) {
        fetchSubScenarios();
      }
      return;
    }

    // Solo hacer fetch si ya pasó el primer render
    fetchSubScenarios();
  }, [filters, fetchSubScenarios]);

  // ─── Handlers ──────────────────────────────────────────────────────────────────────────────────
  const onPageChange = useCallback((page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    updateUrl(newFilters);
  }, [filters, updateUrl]);

  const onSearch = useCallback((q: string) => {
    const newFilters = { ...filters, search: q, page: 1 };
    setFilters(newFilters);
    updateUrl(newFilters);
  }, [filters, updateUrl]);

  const onFilterChange = useCallback((upd: Partial<FilterState>) => {
    const newFilters = { ...filters, ...upd, page: 1 };
    setFilters(newFilters);
    updateUrl(newFilters);
  }, [filters, updateUrl]);

  // ─── CRUD actions ───────────────────────────────────────────────────────────
  const createSubScenario = async (
    formData: Omit<SubScenario, "id"> & { images?: any[] },
  ) => {
    setLoading(true);
    try {
      // Crear el DTO con solo los campos necesarios y validar tipos
      const createDto: CreateSubScenarioDto = {
        name: formData.name,
        state: Boolean(formData.state),
        hasCost: Boolean(formData.hasCost),
        numberOfSpectators: Number(formData.numberOfSpectators) || 0,
        numberOfPlayers: Number(formData.numberOfPlayers) || 0,
        recommendations: formData.recommendations || '',
        scenarioId: Number(formData.scenarioId),
        activityAreaId: formData.activityAreaId ? Number(formData.activityAreaId) : undefined,
        fieldSurfaceTypeId: formData.fieldSurfaceTypeId ? Number(formData.fieldSurfaceTypeId) : undefined,
      };
      
      // Extraer archivos File de las imágenes
      const imageFiles: File[] = formData.images?.map(img => img.file).filter(Boolean) || [];
      
      // Crear subescenario con imágenes en una sola llamada
      const result = await subScenarioService.create(createDto, imageFiles);
      
      // Refetch los datos actuales
      await fetchSubScenarios();
    } catch (error) {
      console.error('Error al crear subescenario:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSubScenario = async (id: number, formData: Partial<SubScenario>) => {
    setLoading(true);
    try {
      // Filtrar solo los campos editables para el DTO de actualización
      const updateDto: UpdateSubScenarioDto = {
        name: formData.name,
        state: formData.state,
        hasCost: formData.hasCost,
        numberOfSpectators: formData.numberOfSpectators,
        numberOfPlayers: formData.numberOfPlayers,
        recommendations: formData.recommendations,
        activityAreaId: formData.activityAreaId,
        fieldSurfaceTypeId: formData.fieldSurfaceTypeId,
      };
      
      // Remover campos undefined para evitar enviarlos
      const cleanDto = Object.fromEntries(
        Object.entries(updateDto).filter(([_, value]) => value !== undefined)
      ) as UpdateSubScenarioDto;
      
      await subScenarioService.update(id, cleanDto);
      // Refetch los datos actuales
      await fetchSubScenarios();
    } finally {
      setLoading(false);
    }
  };

  return {
    filters,
    subScenarios,
    scenarios,
    activityAreas,
    neighborhoods,
    fieldSurfaceTypes,
    pageMeta,
    loading,
    error,
    onSearch,
    onPageChange,
    onFilterChange,
    createSubScenario,
    updateSubScenario,
  };
}
