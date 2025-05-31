"use client";
import { useMemo } from "react";

import { Pagination } from "@/shared/components/organisms/pagination";
import { UnifiedHeader } from "@/shared/components/organisms/unified-header";
import { useHomeData } from "../../hooks/useHomeData";
import FacilityGrid from "./facility-grid";
import HomeFilters from "./home-filters";
import Footer from "./footer";
import { HeroSection } from "./hero-section";
import { EmptyState } from "./empty-state";
import { LoadingIndicator } from "../molecules/loading-indicator";
import { HomeMainProps } from "../../interfaces/home-main-props.interface";
import { ErrorMessage } from "./error-message";

export default function HomeMain({
  initialActivityAreas,
  initialNeighborhoods,
  initialSubScenarios,
  initialMeta,
}: HomeMainProps) {
  // Usar el hook personalizado para manejar todo el estado y lógica
  const {
    subScenarios,
    meta,
    page,
    filters,
    activeFilters,
    loading,
    error,
    hasError,
    hasData,
    isEmpty,
    setPage,
    setFilters,
    setActiveFilters,
    clearFilters,
    retryFetch,
  } = useHomeData({
    initialSubScenarios,
    initialMeta,
  });

  // Memoizar componentes que dependen del estado, esto para evitar re-renderizados innecesarios
  const contentSection = useMemo(() => {
    if (loading) return <LoadingIndicator />;
    if (hasError && error) return <ErrorMessage error={error} onRetry={retryFetch} />;
    if (isEmpty) return <EmptyState onClearFilters={clearFilters} />;

    return (
      <>
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
      </>
    );
  }, [
    loading,
    hasError,
    error,
    isEmpty,
    subScenarios,
    page,
    meta.totalPages,
    retryFetch,
    clearFilters,
    setPage
  ]);

  return (
    <main className="min-h-screen flex flex-col w-full">
      <UnifiedHeader />

      <HeroSection />

      <div className="container mx-auto px-4 py-12 flex-grow">
        <HomeFilters
          activityAreas={initialActivityAreas}
          neighborhoods={initialNeighborhoods}
          filters={filters}
          setFilters={setFilters}
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
          clearFilters={clearFilters}
        />

        {contentSection}
      </div>

      <Footer />
    </main>
  );
}
