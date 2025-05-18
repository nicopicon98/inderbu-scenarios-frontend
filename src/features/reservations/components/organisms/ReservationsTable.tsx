"use client";

import { useState } from "react";
import { DataTable } from "@/shared/ui/data-table";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { StatusBadge } from "@/shared/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { FileEdit, MoreHorizontal } from "lucide-react";

import type { ReservationDto } from "@/services/reservation.service";
import { mapReservationState, formatDate } from "@/utils/reservation.utils";

interface ReservationsTableProps {
  reservations: ReservationDto[];
  isLoading: boolean;
  onEdit: (reservation: ReservationDto) => void;
}

export const ReservationsTable = ({
  reservations,
  isLoading,
  onEdit,
}: ReservationsTableProps) => {
  const [page, setPage] = useState(1);

  const columns = [
    {
      id: "client",
      header: "Cliente",
      cell: (row: ReservationDto) => (
        <div>
          <div className="font-medium">
            {row.user
              ? `${row.user.first_name} ${row.user.last_name}`
              : "Cliente sin nombre"}
          </div>
          <div className="text-xs text-gray-500">
            {row.user?.email || "Sin email"}
          </div>
          <div className="text-xs text-gray-500">
            {row.user?.phone || "Sin teléfono"}
          </div>
        </div>
      ),
    },
    {
      id: "venue",
      header: "Escenario",
      cell: (row: ReservationDto) => (
        <div>
          <div className="font-medium">
            {row.subScenario?.name || "Escenario sin nombre"}
          </div>
          <div className="text-xs text-gray-500">
            {row.subScenario?.scenarioName || "Sin escenario"}
          </div>
          <div className="text-xs">
            {row.subScenario?.hasCost ? (
              <Badge variant="outline" className="bg-yellow-50">
                De pago
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-50">
                Gratuito
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "created",
      header: "Creado",
      cell: (row: ReservationDto) => (
        <span>{row.createdAt ? formatDate(row.createdAt) : "N/A"}</span>
      ),
    },
    {
      id: "date",
      header: "Reserva",
      cell: (row: ReservationDto) => <span>{formatDate(row.reservationDate)}</span>,
    },
    {
      id: "time",
      header: "Hora",
      cell: (row: ReservationDto) => (
        <span>
          {row.timeSlot
            ? `${row.timeSlot.startTime} - ${row.timeSlot.endTime}`
            : "Horario no disponible"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Estado",
      cell: (row: ReservationDto) => (
        <StatusBadge
          status={mapReservationState(row.reservationState?.state || "PENDIENTE")}
        />
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (row: ReservationDto) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(row)}
            className="h-8 px-2 py-0"
          >
            <FileEdit className="h-4 w-4 mr-1" />
            Abrir
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Ver detalles</DropdownMenuItem>
              <DropdownMenuItem>Duplicar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Cancelar reserva
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={reservations}
      columns={columns}
      totalItems={reservations.length}
      pageSize={10}
      currentPage={page}
      totalPages={Math.ceil(reservations.length / 10)}
      onPageChange={setPage}
      isLoading={isLoading}
    />
  );
};
