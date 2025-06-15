"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Calendar,
  CalendarCheck,
  CalendarClock,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  User,
} from "lucide-react";
import type { ReservationDto } from "@/services/reservation.service";
import { Button } from "@/shared/ui/button";
import { useEffect, useState } from "react";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { formatDate, getStatusBadgeClass } from "@/utils/utils";


interface ReservationDetailsModalProps {
  reservation: ReservationDto | null;
  onClose: () => void;
}

export const ReservationDetailsModal = ({
  reservation,
  onClose,
}: ReservationDetailsModalProps) => {
  const [open, setOpen] = useState(false);

  // Sync open state with prop
  useEffect(() => {
    setOpen(!!reservation);
  }, [reservation]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[550px] max-h-[90vh] overflow-hidden flex flex-col"
        aria-describedby="reservation-details-description"
      >
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Detalles de Reserva
          </DialogTitle>
          <DialogDescription
            id="reservation-details-description"
            className="sr-only"
          >
            Información detallada de la reserva
          </DialogDescription>
          <div className="flex items-center mt-1">
            {reservation && (
              <Badge
                variant="outline"
                className={`${getStatusBadgeClass(reservation.reservationState?.state)}`}
              >
                {reservation.reservationState?.state === "PENDIENTE" &&
                  "Pendiente"}
                {reservation.reservationState?.state === "CONFIRMADA" &&
                  "Confirmada"}
                {reservation.reservationState?.state === "CANCELADA" &&
                  "Cancelada"}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {reservation && (
          <div className="p-2 space-y-6 overflow-y-auto">
            {/* Información del cliente */}
            <div className="bg-slate-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Información del Cliente</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-gray-500">
                    Nombre completo
                  </Label>
                  <p className="font-medium">
                    {reservation.user
                      ? `${reservation.user.firstName} ${reservation.user.lastName}`
                      : "Cliente sin nombre"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">
                    Correo electrónico
                  </Label>
                  <p>{reservation.user?.email || "Sin email"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Teléfono</Label>
                  <p>{reservation.user?.phone || "Sin teléfono"}</p>
                </div>
              </div>
            </div>

            {/* Información del escenario */}
            <div className="bg-slate-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Información del Escenario</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-gray-500">Sub-escenario</Label>
                  <p className="font-medium">
                    {reservation.subScenario?.name || "Escenario sin nombre"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Escenario</Label>
                  <p>
                    {reservation.subScenario?.scenarioName ||
                      "Sin escenario principal"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Costo</Label>
                  <div className="mt-1">
                    {reservation.subScenario?.hasCost ? (
                      <Badge variant="outline" className="bg-yellow-50 text-xs">
                        <CreditCard className="h-3 w-3 mr-1" /> De pago
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-xs">
                        Gratuito
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Información de la fecha y hora */}
            <div className="bg-slate-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Fecha y Hora</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-gray-500">
                    Fecha de reserva
                  </Label>
                  <p className="flex items-center gap-1 mt-1">
                    <CalendarCheck className="h-4 w-4 text-gray-500" />
                    {formatDate(reservation.initialDate)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Horario</Label>
                  <p className="flex items-center gap-1 mt-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    {reservation.timeSlot
                      ? `${reservation.timeSlot.startTime} - ${reservation.timeSlot.endTime}`
                      : "Horario no disponible"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">
                    Fecha de creación
                  </Label>
                  <p className="flex items-center gap-1 mt-1">
                    <CalendarClock className="h-4 w-4 text-gray-500" />
                    {reservation.createdAt
                      ? new Date(reservation.createdAt).toLocaleString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : "Fecha no disponible"}
                  </p>
                </div>
              </div>
            </div>

            {/* Comentarios (si existen) */}
            {reservation.comments && (
              <div className="bg-slate-50 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Comentarios</h3>
                </div>
                <p className="text-sm whitespace-pre-wrap">
                  {reservation.comments}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
