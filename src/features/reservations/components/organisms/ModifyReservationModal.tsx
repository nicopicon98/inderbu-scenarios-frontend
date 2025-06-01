"use client";

import { ReservationDto } from "@/services/reservation.service";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Separator } from "@/shared/ui/separator";
import {
  AlertTriangle,
  Calendar,
  CalendarX,
  CheckCircle,
  Clock,
  Info,
  MapPin,
  Settings,
  User,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { cancelReservation } from "../../services/user-reservations.service";
import { ClickableStatusBadge } from "../molecules/ClickableStatusBadge";


interface ModifyReservationModalProps {
  reservation: ReservationDto | null;
  isOpen: boolean;
  onClose: () => void;
  onReservationUpdated: (reservationId: number) => void;
  onCreateNewReservation: (subScenarioId: number) => void;
}

export function ModifyReservationModal({
  reservation,
  isOpen,
  onClose,
  onReservationUpdated,
  onCreateNewReservation,
}: ModifyReservationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!reservation) return null;

  const handleCancelReservation = async () => {
    setIsLoading(true);
    try {
      await cancelReservation(reservation.id);
      toast.success("Tu reserva ha sido cancelada exitosamente");
      onReservationUpdated(reservation.id);
      onClose();
    } catch (error) {
      toast.error("No se pudo cancelar la reserva. Intenta de nuevo");
    } finally {
      setIsLoading(false);
      setShowCancelConfirm(false);
    }
  };

  const handleStatusChange = (newStatusId: number) => {
    // Actualizar estado local y notificar al padre
    onReservationUpdated(reservation.id);
  };

  const isReservationActive = () => {
    const now = new Date();
    const reservationDateTime = new Date(
      `${reservation.reservationDate}T${reservation.timeSlot.endTime}`,
    );
    return (
      reservationDateTime >= now &&
      reservation.reservationState.state !== "CANCELADA"
    );
  };

  const canModify =
    isReservationActive() &&
    ["PENDIENTE", "CONFIRMADA"].includes(reservation.reservationState.state);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Gestionar Reserva
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información de la reserva - 1 columna */}
          <div className="space-y-6">
            {/* Card principal con información */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-teal-600" />
                    {reservation.subScenario.name}
                  </CardTitle>
                  <ClickableStatusBadge
                    statusId={reservation.reservationState.id}
                    reservationId={reservation.id}
                    reservationInfo={{
                      userEmail: reservation.user?.email,
                      date: new Date(
                        reservation.reservationDate,
                      ).toLocaleDateString("es-ES"),
                    }}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <MapPin className="text-teal-600 h-4 w-4" /> Escenario
                        Principal
                      </h3>
                      <p className="text-gray-600 text-sm pt-1">
                        {reservation.subScenario.scenario.name}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <User className="text-teal-600 h-4 w-4" /> Tipo
                      </h3>
                      <Badge
                        variant="outline"
                        className={
                          reservation.subScenario.hasCost
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }
                      >
                        {reservation.subScenario.hasCost
                          ? "De pago"
                          : "Gratuito"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Calendar className="text-teal-600 h-4 w-4" /> Fecha
                      </h3>
                      <p className="text-gray-600 text-sm pt-1">
                        {new Date(
                          reservation.reservationDate,
                        ).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Clock className="text-teal-600 h-4 w-4" /> Horario
                      </h3>
                      <p className="text-gray-600 text-sm pt-1">
                        {reservation.timeSlot.startTime} -{" "}
                        {reservation.timeSlot.endTime}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                      <MapPin className="text-teal-600 h-4 w-4" /> Dirección
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {reservation.subScenario.scenario.address}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Barrio:{" "}
                      {reservation.subScenario.scenario.neighborhood.name}
                    </p>
                  </div>
                </div>

                {reservation.comments && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-medium text-blue-800 mb-1 flex items-center gap-1">
                      <Info className="h-4 w-4" />
                      Comentarios
                    </h4>
                    <p className="text-sm text-blue-700 whitespace-pre-wrap">
                      {reservation.comments}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información del usuario */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-teal-600" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Nombre completo
                    </h4>
                    <p className="text-sm text-gray-900">
                      {reservation.user
                        ? `${reservation.user.first_name} ${reservation.user.last_name}`
                        : "Cliente sin nombre"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Correo electrónico
                    </h4>
                    <p className="text-sm text-gray-900">
                      {reservation.user?.email || "Sin email"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Teléfono
                    </h4>
                    <p className="text-sm text-gray-900">
                      {reservation.user?.phone || "Sin teléfono"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel de acciones - 1 columna */}
          <div className="space-y-6">
            {canModify ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    Acciones Disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Opción 1: Cancelar */}
                  {!showCancelConfirm ? (
                    <div className="border border-red-200 rounded-lg p-4 hover:bg-red-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <CalendarX className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h5 className="font-medium text-red-700 mb-1">
                            Cancelar Reserva
                          </h5>
                          <p className="text-sm text-gray-600 mb-3">
                            Cancela tu reserva completamente. Esta acción no se
                            puede deshacer.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-700 hover:bg-red-100 w-full"
                            onClick={() => setShowCancelConfirm(true)}
                          >
                            Cancelar Reserva
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <h5 className="font-medium text-red-700">
                          Confirmar Cancelación
                        </h5>
                      </div>
                      <p className="text-sm text-red-700 mb-4">
                        ¿Estás seguro de que quieres cancelar esta reserva? Esta
                        acción no se puede deshacer.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleCancelReservation}
                          disabled={isLoading}
                          className="flex-1"
                        >
                          {isLoading ? "Cancelando..." : "Sí, Cancelar"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCancelConfirm(false)}
                          className="flex-1"
                        >
                          No, Mantener
                        </Button>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Información sobre cambio de fecha/horario */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="font-medium text-blue-800 mb-2">
                          Cambio de Fecha u Horario
                        </h5>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          <strong>No es posible modificar</strong> la fecha u
                          horario de una reserva existente. Para cambiar estos
                          datos, debes <strong>cancelar esta reserva</strong> y
                          crear una nueva con la fecha y horario que prefieras.
                        </p>
                        <div className="mt-3 text-xs text-blue-600">
                          ℹ️ Puedes crear una nueva reserva desde la página
                          principal de
                          <Link
                            href={`/scenario/${reservation.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium underline ml-1"
                          >
                            escenarios.
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información importante */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h6 className="font-medium text-amber-800 mb-1">
                          Importante
                        </h6>
                        <p className="text-xs text-amber-700 leading-relaxed">
                          Tampoco es posible cambiar de escenario en una reserva
                          existente. Para reservar otro escenario, debes crear
                          una nueva reserva desde el inicio.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Reserva no modificable */
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-700 mb-2">
                      Reserva No Modificable
                    </h4>
                    <p className="text-sm text-gray-600">
                      {reservation.reservationState.state === "CANCELADA"
                        ? "Esta reserva ya ha sido cancelada."
                        : "Esta reserva ya ha pasado y no se puede modificar."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button variant="outline" onClick={onClose} className="px-6">
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
