"use client";

import {
  ActivityArea,
  Neighborhood,
  PageMeta,
  PageOptions,
  Scenario,
  SubScenario,
  activityAreaService,
  neighborhoodService,
  scenarioService,
  subScenarioService,
} from "@/services/api";
import { useCallback, useEffect, useState } from "react";


export interface FilterState extends PageOptions {
  search: string;
  scenarioId?: number;
  activityAreaId?: number;
  neighborhoodId?: number;
}

const EMPTY_FILTERS: FilterState = { search: "", page: 1, limit: 7 };

export function useSubScenarioData() {
  // ─── UI State ────────────────────────────────────────────────────────────────
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

  // ─── Initial bootstrap ───────────────────────────────────────────────────────
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

        await refreshSubScenarios(EMPTY_FILTERS);
      } catch (err) {
        console.error(err);
        setError("Error al cargar datos iniciales.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const refreshSubScenarios = useCallback(async (next: FilterState) => {
    setLoading(true);
    try {
      const res = await subScenarioService.getAll(next);
      setSubScenarios(res.data);
      setPageMeta(res.meta);
      setFilters(next);
    } catch (err) {
      console.error(err);
      setError("Error al obtener sub-escenarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onSearch = (q: string) =>
    refreshSubScenarios({ ...filters, search: q, page: 1 });
  const onPageChange = (page: number) =>
    refreshSubScenarios({ ...filters, page });
  const onFilterChange = (upd: Partial<FilterState>) =>
    refreshSubScenarios({ ...filters, ...upd, page: 1 });

  // ─── CRUD actions ───────────────────────────────────────────────────────────
  const createSubScenario = async (
    dto: Omit<SubScenario, "id"> & { images?: any[] },
  ) => {
    setLoading(true);
    try {
      const created = await subScenarioService.create(dto);
      if (dto.images?.length) {
        const fd = new FormData();
        dto.images.forEach((img) => {
          fd.append("files", img.file);
          fd.append("isFeature", img.isFeature ? "true" : "false");
        });
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sub-scenarios/${created.id}/images`,
          { method: "POST", body: fd },
        );
      }
      await refreshSubScenarios(filters);
    } finally {
      setLoading(false);
    }
  };

  const updateSubScenario = async (id: number, dto: Partial<SubScenario>) => {
    setLoading(true);
    try {
      await subScenarioService.update(id, dto);
      await refreshSubScenarios(filters);
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
