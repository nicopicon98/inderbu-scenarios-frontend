"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { formatDate, reservationStateById } from "@/utils/reservation.utils";
import type { ReservationDto } from "@/services/reservation.service";
import { FileEdit, MoreHorizontal } from "lucide-react";
import { DataTable } from "@/shared/ui/data-table";
import { Button } from "@/shared/ui/button";
import { useEffect, useState } from "react";
import { Badge } from "@/shared/ui/badge";
import { ClickableStatusBadge } from "../molecules/clickable-status-badge";


interface ReservationsTableProps {
  reservations: ReservationDto[];
  isLoading: boolean;
  onEdit: (reservation: ReservationDto) => void;
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const ReservationsTable = ({
  reservations,
  isLoading,
  onEdit,
  page,
  pageSize,
  totalItems,
  onPageChange,
}: ReservationsTableProps) => {
  const [localReservations, setLocalReservations] = useState<ReservationDto[]>(
    [],
  );

  // Actualizar el estado local cuando las props cambian
  useEffect(() => {
    setLocalReservations(reservations);
  }, [reservations]);

  const columns = [
    {
      id: "client",
      header: "Cliente",
      cell: (row: ReservationDto) => (
        <div>
          <div className="font-medium">
            {row.user
              ? `${row.user.firstName} ${row.user.lastName}`
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
      header: "Fecha de creación",
      cell: (row: ReservationDto) => (
        <span>{row.createdAt ? formatDate(row.createdAt) : "N/A"}</span>
      ),
    },
    {
      id: "date",
      header: "Fecha de reserva",
      cell: (row: ReservationDto) => (
        <span>{formatDate(row.initialDate)}</span>
      ),
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
      cell: (row: ReservationDto) => {
        const currentStatusId = row.reservationState?.id || 1;

        return (
          <ClickableStatusBadge
            statusId={currentStatusId}
            reservationId={row.id}
            reservationInfo={{
              userEmail: row.user?.email,
              date: formatDate(row.initialDate),
            }}
            onStatusChange={(newStatusId) => {
              // Actualizar localmente el estado sin necesidad de recargar toda la tabla
              const updatedReservations = [...localReservations];
              const reservationIndex = updatedReservations.findIndex(
                (r) => r.id === row.id,
              );

              if (reservationIndex !== -1) {
                if (updatedReservations[reservationIndex].reservationState) {
                  // Obtener el estado correspondiente al ID directamente del mapa
                  const newState =
                    reservationStateById[newStatusId] || "PENDIENTE";

                  // Actualizar el estado local
                  updatedReservations[reservationIndex].reservationState.id =
                    newStatusId;
                  updatedReservations[reservationIndex].reservationState.state =
                    newState;
                } else {
                  // Si por alguna razón no existe reservationState, crearlo
                  const newState =
                    reservationStateById[newStatusId] || "PENDIENTE";

                  updatedReservations[reservationIndex].reservationState = {
                    id: newStatusId,
                    state: newState,
                  };
                }
                setLocalReservations(updatedReservations);
              }
            }}
          />
        );
      },
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
            Ver detalles
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={localReservations}
      columns={columns}
      totalItems={totalItems}
      pageSize={pageSize}
      currentPage={page}
      totalPages={Math.ceil(totalItems / pageSize)}
      onPageChange={onPageChange}
      isLoading={isLoading}
    />
  );
};
