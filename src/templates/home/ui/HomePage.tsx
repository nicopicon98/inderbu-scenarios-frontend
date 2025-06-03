"use client";

import { HomeDataResponse } from '@/features/home/data/application/get-home-data-use-case';
import { MainHeader } from "@/shared/components/organisms/main-header";
import { Pagination } from "@/shared/components/organisms/pagination";
import { LoadingIndicator } from "@/features/home/components/molecules/loading-indicator";
import { ErrorMessage } from "@/features/home/components/organisms/error-message";
import { HeroSection } from "@/features/home/components/organisms/hero-section";
import { EmptyState } from "@/features/home/components/organisms/empty-state";
import FacilityGrid from "@/features/home/components/organisms/facility-grid";
import HomeFilters from "@/features/home/components/organisms/home-filters";
import Footer from "@/features/home/components/organisms/footer";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { useMemo } from "react";
import { IUseHomeDataParams } from '@/features/home/interfaces/use-home-data-params.interface';

// Template Props (Atomic Design Page Level)
export interface HomePageProps {
  initialData: HomeDataResponse;
}

// Atomic Design: Home Page Template
export function HomePage({ initialData }: HomePageProps) {
  const homeDataInput: IUseHomeDataParams = {
    initialSubScenarios: initialData.subScenarios.data,
    initialMeta: initialData.subScenarios.meta,
    initialFilters: {
      searchQuery: initialData.appliedFilters.searchQuery,
      activityAreaId: initialData.appliedFilters.activityAreaId,
      neighborhoodId: initialData.appliedFilters.neighborhoodId,
      hasCost: initialData.appliedFilters.hasCost,
    },
    initialPage: initialData.subScenarios.meta.page,
  };

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
  } = useHomeData(homeDataInput);

  // Content rendering logic
  const contentSection = useMemo(() => {
    if (loading) {
      console.log('HomePage: Showing loading state');
      return <LoadingIndicator />;
    }
    
    if (hasError && error) {
      console.log('HomePage: Showing error state:', error);
      return <ErrorMessage error={error} onRetry={retryFetch} />;
    }
    
    if (isEmpty) {
      console.log('HomePage: Showing empty state');
      return <EmptyState onClearFilters={clearFilters} />;
    }

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
    setPage,
  ]);

  return (
    <main className="min-h-screen flex flex-col w-full">
      {/* Atomic Design: Organisms */}
      <MainHeader />
      <HeroSection />

      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-12 flex-grow">
        
        {/* Filters Organism */}
        <HomeFilters
          activityAreas={initialData.activityAreas}
          neighborhoods={initialData.neighborhoods}
          filters={filters}
          setFilters={setFilters}
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
          clearFilters={clearFilters}
        />

        {/* Dynamic Content Section */}
        {contentSection}
      </div>

    </main>
  );
}

// Display name for debugging
HomePage.displayName = 'HomePage';
