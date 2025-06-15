"use client";

import { ReservationDetailsModal } from "@/features/reservations/components/organisms/reservation-details-modal";
import { CreateReservationModal } from "@/features/reservations/components/organisms/create-reservation-modal";
import { ReservationsTable } from "@/features/reservations/components/organisms/reservations-table";
import { DashboardReservationsResponse } from "../application/GetDashboardReservationsUseCase";
import { FiltersCard } from "@/features/reservations/components/molecules/filters-card";
import { StatsGrid } from "@/features/reservations/components/molecules/stats-grid";
import { ReservationDto } from "@/services/reservation.service";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Plus, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { useState } from "react";

interface DashboardReservationsPageProps {
  initialData: DashboardReservationsResponse;
}

export function DashboardReservationsPage({ initialData }: DashboardReservationsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state from initial data
  const [reservations] = useState<ReservationDto[]>(initialData.reservations);
  const [stats] = useState(initialData.stats);
  const [meta] = useState(initialData.meta);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [creating, setCreating] = useState(false);
  const [viewingDetails, setViewingDetails] = useState<ReservationDto | null>(null);

  // Extract filters from URL
  const filters = {
    scenarioId: searchParams.get('scenarioId') ? Number(searchParams.get('scenarioId')) : undefined,
    activityAreaId: searchParams.get('activityAreaId') ? Number(searchParams.get('activityAreaId')) : undefined,
    neighborhoodId: searchParams.get('neighborhoodId') ? Number(searchParams.get('neighborhoodId')) : undefined,
    userId: searchParams.get('userId') ? Number(searchParams.get('userId')) : undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
  };

  // Check for active filters
  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  const handleFiltersChange = (newFilters: any) => {
    const params = new URLSearchParams();
    
    // Add pagination
    params.set('page', '1');
    params.set('limit', '7');
    
    // Add filters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      }
    });

    router.push(`/dashboard?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/dashboard?page=1&limit=7');
  };

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/dashboard?${params.toString()}`);
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
              Mostrando {meta.totalItems} de {meta.totalItems} reservas con filtros aplicados
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
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={clearFilters}
      />

      <ReservationsTable
        reservations={reservations}
        isLoading={false}
        onEdit={setViewingDetails}
        page={meta.page}
        pageSize={meta.limit}
        totalItems={meta.totalItems}
        onPageChange={changePage}
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
