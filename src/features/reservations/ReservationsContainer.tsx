"use client";

import { useState } from "react";
import { Plus, Filter } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { useReservations } from "./hooks/useReservations";
import { StatsGrid } from "./components/molecules/StatsGrid";
import { FiltersCard } from "./components/molecules/FiltersCard";
import { ReservationsTable } from "./components/organisms/ReservationsTable";
import { ReservationDto } from "@/services/reservation.service";
import { EditReservationDrawer } from "./components/organisms/EditReservationDrawer";
import { CreateReservationModal } from "./components/organisms/CreateReservationModal";

export const ReservationsContainer = () => {
  const { reservations, isLoading, stats } = useReservations();
  const [showFilters, setShowFilters] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ReservationDto | null>(null);

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
        onEdit={setEditing}
      />

      <EditReservationDrawer reservation={editing} onClose={() => setEditing(null)}/>
      <CreateReservationModal open={creating} onClose={() => setCreating(false)}/>
    </section>
  );
};
