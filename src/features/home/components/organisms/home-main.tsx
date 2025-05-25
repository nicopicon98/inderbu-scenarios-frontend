"use client";
import { useEffect, useState } from "react";

import {
  ActivityArea,
  MetaDto,
  Neighborhood,
  SubScenario,
} from "../../types/filters.types";
import { Pagination } from "@/shared/components/organisms/pagination";
import { MainCarousel } from "@/shared/components/organisms/main-carousel";
import { UnifiedHeader } from "@/shared/components/organisms/unified-header";
import { getSubScenarios } from "../../api/home.service";
import ModernFilters from "./modern-filters";
import FacilityGrid from "./facility-grid";
import Footer from "./footer";

interface HomeMainProps {
  initialActivityAreas: ActivityArea[];
  initialNeighborhoods: Neighborhood[];
  initialSubScenarios: SubScenario[];
  initialMeta: MetaDto;
}

type Filters = {
  activityAreaId?: number;
  neighborhoodId?: number;
  searchQuery: string;
  hasCost?: boolean;
};

export default function HomeMain({
  initialActivityAreas,
  initialNeighborhoods,
  initialSubScenarios,
  initialMeta,
}: HomeMainProps) {
  /* ─────────── State global de la página ─────────── */
  const [subScenarios, setSubScenarios] =
    useState<SubScenario[]>(initialSubScenarios);
  const [meta, setMeta] = useState<MetaDto>(initialMeta);
  const [page, setPage] = useState<number>(initialMeta.page);

  /* Filtros y chips visuales */
  const [filters, setFilters] = useState<Filters>({ searchQuery: "" });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // whenever `page` changes, re‑fetch that page
  useEffect(() => {
    console.log("Nuevo valor de filters :", filters);
    getSubScenarios({ page, limit: initialMeta.limit, ...filters })
      .then(({ data, meta }) => {
        setSubScenarios(data);
        setMeta(meta);
      })
      .catch(console.error);
  }, [page, filters]);

  const clearFilters = () => {
    setFilters({ searchQuery: "" });
    setActiveFilters([]);
    setPage(1);
  };

  return (
    <main className="min-h-screen flex flex-col w-full">
      <UnifiedHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-green-600 
                       bg-clip-text text-transparent mb-4"
          >
            Reserva tu espacio deportivo
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Descubre y reserva los mejores{" "}
            <span className="font-semibold text-blue-600">
              escenarios deportivos
            </span>{" "}
            de Bucaramanga y su area metropolitana con INDERBÚ
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Reservas gratuitas disponibles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Múltiples ubicaciones</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex-grow">
        <ModernFilters
          activityAreas={initialActivityAreas}
          neighborhoods={initialNeighborhoods}
          filters={filters}
          setFilters={setFilters}
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
          clearFilters={clearFilters}
        />

        <div className="mt-12">
          <FacilityGrid
            subScenarios={subScenarios}
            onClearFilters={clearFilters}
          />
        </div>

        <Pagination
          currentPage={page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      </div>

      <Footer />
    </main>
  );
}
