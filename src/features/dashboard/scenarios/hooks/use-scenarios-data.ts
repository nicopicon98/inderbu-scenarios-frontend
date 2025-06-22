"use client";

import { useDashboardPagination } from "@/shared/hooks/use-dashboard-pagination";

export function useScenariosData() {
  const {
    filters,
    onPageChange,
    onLimitChange,
    onSearch,
    onFilterChange,
    buildPageMeta,
  } = useDashboardPagination({
    baseUrl: '/dashboard/scenarios',
    defaultLimit: 7,
  });

  return {
    filters,
    onPageChange,
    onLimitChange,
    onSearch,
    onFilterChange,
    buildPageMeta,
  };
}