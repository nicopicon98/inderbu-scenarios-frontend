"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/modal";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { ReservationDto } from "@/services/reservation.service";
import { cancelReservation } from "../../api/user-reservations.service";
import { toast } from "@/shared/hooks/use-toast";
import {
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Info,
  X,
  CheckCircle,
} from "lucide-react";

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
  const [showDateChangeInfo, setShowDateChangeInfo] = useState(false);

  if (!reservation) return null;

  const handleCancelReservation = async () => {
    setIsLoading(true);
    try {
      await cancelReservation(reservation.id);
      toast({
        title: "Reserva cancelada",
        description: "Tu reserva ha sido cancelada exitosamente.",
      });
      onReservationUpdated(reservation.id);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cancelar la reserva. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowCancelConfirm(false);
    }
  };

  const handleDateChange = () => {
    // Cerrar modal actual y redirigir a crear nueva reserva
    onCreateNewReservation(reservation.subScenario.id);
    onClose();
  };

  const isReservationActive = () => {
    const now = new Date();
    const reservationDateTime = new Date(`${reservation.reservationDate}T${reservation.timeSlot.endTime}`);
    return reservationDateTime >= now && reservation.reservationState.state !== 'CANCELADA';
  };

  const canModify = isReservationActive() && 
    ['PENDIENTE', 'CONFIRMADA'].includes(reservation.reservationState.state);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Gestionar Reserva
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la reserva */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">{reservation.subScenario.name}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{reservation.subScenario.scenario.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{new Date(reservation.reservationDate).toLocaleDateString('es-ES')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{reservation.timeSlot.startTime} - {reservation.timeSlot.endTime}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant={reservation.reservationState.state === 'CONFIRMADA' ? 'default' : 'secondary'}
                  className="w-fit"
                >
                  {reservation.reservationState.state}
                </Badge>
              </div>
            </div>

            {reservation.comments && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Comentarios:</strong> {reservation.comments}
                </p>
              </div>
            )}
          </div>

          {/* Opciones disponibles */}
          {canModify ? (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                ¿Qué quieres hacer con tu reserva?
              </h4>

              {/* Opción 1: Cancelar */}
              {!showCancelConfirm ? (
                <div className="border rounded-lg p-4 hover:bg-red-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-red-700 mb-1">Cancelar Reserva</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Cancela tu reserva completamente. Esta acción no se puede deshacer.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => setShowCancelConfirm(true)}
                    >
                      Cancelar Reserva
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h5 className="font-medium text-red-700">Confirmar Cancelación</h5>
                  </div>
                  <p className="text-sm text-red-700 mb-4">
                    ¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleCancelReservation}
                      disabled={isLoading}
                    >
                      {isLoading ? "Cancelando..." : "Sí, Cancelar"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCancelConfirm(false)}
                    >
                      No, Mantener
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              {/* Opción 2: Cambiar fecha */}
              <div className="border rounded-lg p-4 hover:bg-blue-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-blue-700 mb-1">Cambiar Fecha u Horario</h5>
                    <p className="text-sm text-gray-600 mb-3">
                      Para cambiar la fecha u horario, se cancelará esta reserva y crearás una nueva.
                    </p>
                    {!showDateChangeInfo && (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-blue-600 p-0 h-auto text-xs"
                        onClick={() => setShowDateChangeInfo(true)}
                      >
                        Ver más detalles →
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={handleDateChange}
                  >
                    Cambiar Fecha/Horario
                  </Button>
                </div>

                {showDateChangeInfo && (
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <h6 className="font-medium text-blue-800 mb-2 flex items-center gap-1">
                      <Info className="h-4 w-4" />
                      ¿Cómo funciona?
                    </h6>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Se cancelará automáticamente tu reserva actual</li>
                      <li>• Te llevaremos al proceso de crear una nueva reserva</li>
                      <li>• Podrás elegir nueva fecha, horario en el mismo escenario</li>
                      <li>• Si quieres cambiar de escenario, debes hacer una reserva completamente nueva</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Información importante */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <h6 className="font-medium text-amber-800 mb-1">Importante</h6>
                    <p className="text-xs text-amber-700">
                      No es posible cambiar de escenario en una reserva existente. 
                      Para reservar otro escenario, debes crear una nueva reserva desde el inicio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Reserva no modificable */
            <div className="bg-gray-50 border rounded-lg p-4 text-center">
              <CheckCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <h4 className="font-medium text-gray-700 mb-1">Reserva No Modificable</h4>
              <p className="text-sm text-gray-600">
                {reservation.reservationState.state === 'CANCELADA' 
                  ? "Esta reserva ya ha sido cancelada."
                  : "Esta reserva ya ha pasado y no se puede modificar."
                }
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
