"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { DashboardPagination } from "@/shared/components/organisms/dashboard-pagination";
import { ClickableStatusBadge } from "@/features/reservations/components/molecules/clickable-status-badge";
import type { ReservationDto } from "@/services/reservation.service";
import { formatDate, reservationStateById } from "@/utils/utils";
import { PageMeta } from "@/shared/hooks/use-dashboard-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { FileEdit, Calendar, Repeat, Clock, Search } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale/es";

interface DashboardReservationsTableProps {
  reservations: ReservationDto[];
  meta: PageMeta | null;
  loading: boolean;
  filters: { page: number; search: string };
  onPageChange(page: number): void;
  onLimitChange?(limit: number): void;
  onSearch(term: string): void;
  onEdit: (reservation: ReservationDto) => void;
}

const weekdayNames = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"] as const;

const fmtDate = (d: string) =>
  format(parseISO(d), "dd MMM yyyy", { locale: es });
const fmtTime = (t: string) =>
  format(parseISO(`1970-01-01T${t}`), "h aaa", { locale: es });

const ReservationTypeBadge = ({ type }: { type: string }) =>
  type === "SINGLE" ? (
    <Badge
      variant="outline"
      className="bg-blue-50 text-blue-700 border-blue-200"
    >
      <Calendar className="w-3 h-3 mr-1" /> Única
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-purple-50 text-purple-700 border-purple-200"
    >
      <Repeat className="w-3 h-3 mr-1" /> Recurrente
    </Badge>
  );

/* -------------------------------- WeekDays -------------------------------- */
const WeekDaysDisplay = ({ weekDays }: { weekDays: number[] | null }) => {
  if (!weekDays?.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {weekDays.map((d) => (
        <Badge key={d} variant="secondary" className="text-xs px-1 py-0">
          {weekdayNames[d]}
        </Badge>
      ))}
    </div>
  );
};

/* ------------------------------- Time Slots ------------------------------- */
const TimeSlotDisplay = ({ reservation }: { reservation: ReservationDto }) => {
  const { type, timeSlot, timeslots } = reservation;

  if (type === "SINGLE" && timeSlot) {
    return (
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3 text-muted-foreground" />
        <span className="text-sm">
          {fmtTime(timeSlot.startTime)} – {fmtTime(timeSlot.endTime)}
        </span>
      </div>
    );
  }

  if (type === "RANGE" && timeslots?.length) {
    if (timeslots.length === 1) {
      return (
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">
            {fmtTime(timeslots[0].startTime)} – {fmtTime(timeslots[0].endTime)}
          </span>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {timeslots.length} horarios
          </span>
        </div>
        <div className="text-xs text-muted-foreground space-y-0.5">
          {timeslots.slice(0, 2).map((slot, idx) => (
            <div key={idx}>
              {fmtTime(slot.startTime)} – {fmtTime(slot.endTime)}
            </div>
          ))}
          {timeslots.length > 2 && (
            <div className="text-muted">+{timeslots.length - 2} más…</div>
          )}
        </div>
      </div>
    );
  }

  return <span className="text-xs text-muted-foreground">Sin horario</span>;
};

/* ------------------------------ Date display ------------------------------ */
const DateDisplay = ({ reservation }: { reservation: ReservationDto }) => {
  const { type, initialDate, finalDate, totalInstances } = reservation;

  if (type === "SINGLE") {
    return (
      <div>
        <div className="font-medium text-sm">{fmtDate(initialDate)}</div>
        <ReservationTypeBadge type={type} />
      </div>
    );
  }

  return (
    <div className="space-y-1 text-sm">
      <div>
        <span className="font-medium">{fmtDate(initialDate)}</span>
        {finalDate && (
          <span className="text-xs text-muted-foreground block">
            hasta {fmtDate(finalDate)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ReservationTypeBadge type={type} />
        {totalInstances && (
          <Badge variant="outline" className="text-xs">
            {totalInstances} sesiones
          </Badge>
        )}
      </div>
      <WeekDaysDisplay weekDays={reservation.weekDays} />
    </div>
  );
};

export function DashboardReservationsTable({
  reservations,
  meta,
  loading,
  filters,
  onPageChange,
  onLimitChange,
  onSearch,
  onEdit,
}: DashboardReservationsTableProps) {
  // Local optimistic updates for status changes
  const [rows, setRows] = useState<ReservationDto[]>([]);
  useEffect(() => setRows(reservations), [reservations]);

  /* -------------------------------- Columns -------------------------------- */
  const columns = useMemo(
    () => [
      {
        id: "client",
        header: "Cliente",
        cell: (row: ReservationDto) => (
          <div className="min-w-[180px]">
            <div className="font-medium text-sm">
              {row.user
                ? `${row.user.firstName} ${row.user.lastName}`
                : "Cliente sin nombre"}
            </div>
            {row.user?.email && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {row.user.email}
              </div>
            )}
            {row.user?.phone && (
              <div className="text-xs text-muted-foreground">
                {row.user.phone}
              </div>
            )}
          </div>
        ),
      },
      {
        id: "venue",
        header: "Escenario",
        cell: (row: ReservationDto) => (
          <div className="min-w-[200px] space-y-1">
            <div className="font-medium text-sm">
              {row.subScenario?.scenarioName ?? "Sin escenario"}
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              {row.subScenario?.name ?? "Escenario sin nombre"}
            </div>
            <div className="flex items-center gap-2">
              {row.subScenario?.hasCost ? (
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                >
                  De pago
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 text-xs"
                >
                  Gratuito
                </Badge>
              )}
              {row.subScenario?.numberOfSpectators && (
                <Badge variant="secondary" className="text-xs">
                  {row.subScenario.numberOfSpectators} personas
                </Badge>
              )}
            </div>
          </div>
        ),
      },
      {
        id: "details",
        header: "Detalles de reserva",
        cell: (row: ReservationDto) => <DateDisplay reservation={row} />,
      },
      {
        id: "time",
        header: "Horarios",
        cell: (row: ReservationDto) => <TimeSlotDisplay reservation={row} />,
      },
      {
        id: "created",
        header: "Creada",
        cell: (row: ReservationDto) => (
          <div className="text-sm">
            <div>{fmtDate(row.createdAt)}</div>
            {row.updatedAt && row.updatedAt !== row.createdAt && (
              <div className="text-xs text-muted-foreground mt-0.5">
                Act. {fmtDate(row.updatedAt)}
              </div>
            )}
          </div>
        ),
      },
      {
        id: "status",
        header: "Estado",
        cell: (row: ReservationDto) => {
          const currentStatusId = row.reservationState?.id ?? row.reservationStateId ?? 1;

          return (
            <ClickableStatusBadge
              statusId={currentStatusId}
              reservationId={row.id}
              reservationInfo={{
                userEmail: row.user?.email,
                date: fmtDate(row.initialDate),
              }}
              onStatusChange={(newStatusId) => {
                setRows((prev) => {
                  const copy = [...prev];
                  const index = copy.findIndex((r) => r.id === row.id);
                  if (index !== -1) {
                    const newState =
                      reservationStateById[newStatusId] || "PENDIENTE";
                    copy[index] = {
                      ...copy[index],
                      reservationState: { id: newStatusId, state: newState },
                    } as ReservationDto;
                  }
                  return copy;
                });
              }}
            />
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: (row: ReservationDto) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row)}
            aria-label="Ver detalles"
          >
            <FileEdit className="w-4 h-4" />
          </Button>
        ),
      },
    ],
    [onEdit]
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Listado de Reservas</CardTitle>
            <Badge variant="outline">{meta?.totalItems ?? 0}</Badge>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Buscar reservas…"
              value={filters.search}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {columns.map((c) => (
                  <th
                    key={c.id}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500"
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <span className="ml-2">Cargando…</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    {columns.map((c) => (
                      <td key={c.id} className="px-4 py-3 text-sm">
                        {c.cell(r)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-8 text-center text-sm text-gray-500"
                  >
                    No se encontraron reservas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {meta && (
          <div className="border-t p-4">
            <DashboardPagination
              meta={meta}
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
              showLimitSelector={!!onLimitChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}