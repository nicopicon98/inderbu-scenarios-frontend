"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Filter } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { useReservations } from "./hooks/useReservations";
import { StatsGrid } from "./components/molecules/StatsGrid";
import { FiltersCard } from "./components/molecules/FiltersCard";
import { ReservationsTable } from "./components/organisms/ReservationsTable";
import { ReservationDto } from "@/services/reservation.service";
import { ReservationDetailsModal } from "./components/organisms/ReservationDetailsModal";
import { CreateReservationModal } from "./components/organisms/CreateReservationModal";

export const ReservationsContainer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { 
    reservations, 
    isLoading, 
    stats, 
    refetch, 
    page, 
    pageSize, 
    totalReservations, 
    changePage 
  } = useReservations();
  const [showFilters, setShowFilters] = useState(false);
  const [creating, setCreating] = useState(false);
  const [viewingDetails, setViewingDetails] = useState<ReservationDto | null>(null);

  // Si la URL no tiene paramétros de paginación, añadirlos al cargar
  useEffect(() => {
    if (!searchParams.has('page') && !searchParams.has('pageSize')) {
      // Solo actualizar la URL si realmente no hay paramétros
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('pageSize', '7');
      router.replace(`/dashboard?${params.toString()}`);
    }
  }, [router, searchParams]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Reservas</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(p => !p)}>
            <Filter className="h-4 w-4 mr-2"/> Filtros
          </Button>
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4 mr-2"/> Nueva Reserva
          </Button>
        </div>
      </div>

      <StatsGrid stats={stats}/>

      <FiltersCard open={showFilters} onSearch={() => { /* TODO */}} />

      <ReservationsTable
        reservations={reservations}
        isLoading={isLoading}
        onEdit={setViewingDetails}
        page={page}
        pageSize={pageSize}
        totalItems={totalReservations}
        onPageChange={changePage}
      />

      <ReservationDetailsModal reservation={viewingDetails} onClose={() => setViewingDetails(null)}/>
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
};
