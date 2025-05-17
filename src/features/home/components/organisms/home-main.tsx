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
import { SubHeader } from "@/shared/components/organisms/sub-header";
import { Header } from "@/shared/components/organisms/header";
import { getSubScenarios } from "../../api/home.service";
import FiltersSection from "./filters-section";
import FacilityGrid from "./facility-grid";
import Footer from "./footer";

interface HomeMainProps {
  initialActivityAreas: ActivityArea[];
  initialNeighborhoods: Neighborhood[];
  initialSubScenarios: SubScenario[];
  initialMeta: MetaDto;
}

export default function HomeMain({
  initialActivityAreas,
  initialNeighborhoods,
  initialSubScenarios,
  initialMeta,
}: HomeMainProps) {
  const [subScenarios, setSubScenarios] =
    useState<SubScenario[]>(initialSubScenarios);
  const [meta, setMeta] = useState<MetaDto>(initialMeta);
  const [page, setPage] = useState<number>(initialMeta.page);

  // whenever `page` changes, re‑fetch that page
  useEffect(() => {
    if (page === initialMeta.page) return; // already have page 1
    getSubScenarios({ page, limit: initialMeta.limit })
      .then(({ data, meta }) => {
        console.log({ data, meta });
        setSubScenarios(data);
        setMeta(meta);
      })
      .catch(console.error);
  }, [page]);

  const handleFiltersChange = (filters: {
    activityAreaId?: number;
    neighborhoodId?: number;
    searchQuery?: string;
  }) => {
    const { activityAreaId, neighborhoodId, searchQuery } = filters;

    getSubScenarios({
      page: 1,
      limit: initialMeta.limit,
      activityAreaId,
      neighborhoodId,
      search: searchQuery,
    })
      .then(({ data, meta }) => {
        setSubScenarios(data);
        setMeta(meta);
        setPage(1); // Reset to the first page after filtering
      })
      .catch(console.error);
  };

  return (
    <main className="min-h-screen flex flex-col w-full">
      <Header />
      <SubHeader />
      <MainCarousel />

      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-4xl font-bold text-teal-700 mb-4">Reservas</h1>
        <p className="text-gray-600 mb-8">
          Encuentra los{" "}
          <span className="font-medium">Escenarios deportivos</span> disponibles
          del INDERBÚ.
        </p>

        <FiltersSection
          initialActivityAreas={initialActivityAreas!}
          initialNeighborhoods={initialNeighborhoods!}
          onFiltersChange={handleFiltersChange}
        />
        <FacilityGrid subScenarios={subScenarios} />

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
