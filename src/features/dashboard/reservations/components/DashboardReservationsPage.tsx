"use client";

import { ReservationDetailsModal } from "@/features/reservations/components/organisms/reservation-details-modal";
import { CreateReservationModal } from "@/features/reservations/components/organisms/create-reservation-modal";
import { DashboardReservationsTable } from "./organisms/dashboard-reservations-table";
import { useDashboardReservationsData } from "../hooks/use-dashboard-reservations-data";
import { DashboardReservationsResponse } from "../application/GetDashboardReservationsUseCase";
import { FiltersCard } from "@/features/reservations/components/molecules/filters-card";
import { StatsGrid } from "@/features/reservations/components/molecules/stats-grid";
import { ReservationDto } from "@/services/reservation.service";
import { useRouter } from "next/navigation";
import { Filter, Plus, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { useState } from "react";

interface DashboardReservationsPageProps {
  initialData: DashboardReservationsResponse;
}

export function DashboardReservationsPage({ initialData }: DashboardReservationsPageProps) {
  const router = useRouter();

  // Pagination and filters using standardized hook
  const {
    filters: paginationFilters,
    onPageChange,
    onLimitChange,
    onSearch,
    onFilterChange,
    buildPageMeta,
  } = useDashboardReservationsData();

  // Local state from initial data
  const [reservations] = useState<ReservationDto[]>(initialData.reservations);
  const [stats] = useState(initialData.stats);
  
  // Build page meta from initial data
  const pageMeta = buildPageMeta(initialData.meta.totalItems);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [creating, setCreating] = useState(false);
  const [viewingDetails, setViewingDetails] = useState<ReservationDto | null>(null);

  // Extract advanced filters from URL (non-pagination filters)
  const advancedFilters = {
    scenarioId: paginationFilters.scenarioId,
    activityAreaId: paginationFilters.activityAreaId,
    neighborhoodId: paginationFilters.neighborhoodId,
    userId: paginationFilters.userId,
    dateFrom: paginationFilters.dateFrom,
    dateTo: paginationFilters.dateTo,
  };

  // Check for active filters
  const hasActiveFilters = Object.values(advancedFilters).some(value => value !== undefined);

  const handleFiltersChange = (newFilters: any) => {
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({ 
      scenarioId: undefined,
      activityAreaId: undefined,
      neighborhoodId: undefined,
      userId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      search: ""
    });
  };

  const refetch = () => {
    router.refresh();
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight">Reservas</h1>
          {hasActiveFilters && (
            <p className="text-sm text-gray-600 mt-1">
              Mostrando {pageMeta?.totalItems} de {pageMeta?.totalItems} reservas con filtros aplicados
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters((p) => !p)}
            className={showFilters ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {hasActiveFilters && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                !
              </Badge>
            )}
          </Button>
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nueva Reserva
          </Button>
        </div>
      </div>

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          <Badge variant="outline" className="flex items-center gap-1">
            Filtros de selección activos
            <button
              onClick={clearFilters}
              className="ml-1 hover:bg-gray-200 rounded"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}

      <StatsGrid stats={stats} />

      <FiltersCard
        open={showFilters}
        filters={advancedFilters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={clearFilters}
      />

      <DashboardReservationsTable
        reservations={reservations}
        meta={pageMeta}
        loading={false}
        filters={{
          page: pageMeta?.page || 1,
          search: paginationFilters.search || '',
        }}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        onSearch={onSearch}
        onEdit={setViewingDetails}
      />

      <ReservationDetailsModal
        reservation={viewingDetails}
        onClose={() => setViewingDetails(null)}
      />
      
      <CreateReservationModal
        open={creating}
        onClose={() => setCreating(false)}
        onSuccess={() => {
          refetch();
          setCreating(false);
        }}
      />
    </section>
  );
}
