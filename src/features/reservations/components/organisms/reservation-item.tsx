"use client";

import { ReservationDto } from "@/services/reservation.service";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Settings,
  Tag,
  Users,
  X
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "../atoms/status-badge";
import { cancelReservationAction, CancelReservationResult } from "../../cancel/api/cancelReservationAction";


interface ReservationItemProps {
  reservation: ReservationDto;
  isActive: boolean;
  onCancelled: (id: number) => void;
  onModify?: (reservation: ReservationDto) => void;
  highlightManageButton?: boolean; // Nueva prop para destacar el botón
}

export function ReservationItem({
  reservation,
  isActive,
  onCancelled,
  onModify,
  highlightManageButton = false,
}: ReservationItemProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleCancelReservation = async () => {
    setIsCancelling(true);
    try {
      const success: CancelReservationResult = await cancelReservationAction(reservation.id);
      if (success) {
        toast.success("La reserva ha sido cancelada exitosamente");
        onCancelled(reservation.id);
      } else {
        toast.error("No se pudo cancelar la reserva");
      }
    } catch (error) {
      toast.error("Ocurrió un error al cancelar la reserva");
    } finally {
      setIsCancelling(false);
      setIsConfirmOpen(false);
    }
  };

  // Format the date for display
  const formattedDate = format(
    new Date(reservation.reservationDate),
    "EEEE d 'de' MMMM",
    { locale: es },
  );
  const formattedShortDate = format(
    new Date(reservation.reservationDate),
    "dd MMM",
    { locale: es },
  );

  console.log("Reservation", reservation);

  return (
    <>
      <Card
        className={`h-full overflow-hidden border-0 shadow-sm hover:shadow-xl 
                       transition-all duration-300 hover:-translate-y-2 bg-white 
                       rounded-xl backdrop-blur-sm group ${!isActive ? "opacity-75" : ""}`}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
          <Image
            src="https://inderbu.gov.co/escenarios/content/fields/57/12770.jpg"
            alt={reservation.subScenario.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Status badge */}
          <div className="absolute top-3 right-3 z-20">
            <div className="backdrop-blur-sm rounded-lg shadow-lg">
              <StatusBadge
                status={reservation.reservationState.state}
                size="sm"
                variant="default"
              />
            </div>
          </div>

          {/* Date badge */}
          <div className="absolute top-3 left-3 z-20">
            <Badge
              variant="outline"
              className="bg-white/90 text-gray-700 border-white/50 
                                              backdrop-blur-sm shadow-sm"
            >
              <CalendarIcon className="w-3 h-3 mr-1" />
              {formattedShortDate}
            </Badge>
          </div>

          {/* Bottom overlay info */}
          <div
            className="absolute bottom-0 left-0 right-0 z-20 p-4 
                         bg-gradient-to-t from-black/80 to-transparent"
          >
            <h3
              className="font-semibold text-lg mb-1 line-clamp-2 text-white 
                         group-hover:text-blue-200 transition-colors"
            >
              {reservation.subScenario.name}
            </h3>
            <div className="flex items-center text-white/90 text-sm">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">
                {reservation.subScenario.scenario.neighborhood.name}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-5">
          {/* Cost and capacity info */}
          <div className="flex items-center justify-between mb-3">
            <Badge
              variant="outline"
              className={`text-xs ${reservation.subScenario.hasCost
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-green-50 text-green-700 border-green-200"
                }`}
            >
              <Tag className="w-3 h-3 mr-1" />
              {reservation.subScenario.hasCost ? "De pago" : "Gratuito"}
            </Badge>
            {reservation.subScenario.numberOfPlayers && (
              <div className="flex items-center text-gray-500 text-xs">
                <Users className="w-3 h-3 mr-1" />
                <span>{reservation.subScenario.numberOfPlayers} jugadores</span>
              </div>
            )}
          </div>

          {/* Date and time */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 capitalize">
                  {formattedDate}
                </p>
              </div>
            </div>

            <div className="flex items-center text-sm">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {reservation.timeSlot.startTime} -{" "}
                  {reservation.timeSlot.endTime}
                </p>
              </div>
            </div>

            <div className="flex items-start text-sm">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                <MapPin className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 line-clamp-2">
                  {reservation.subScenario.scenario.address}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {reservation.subScenario.scenario.neighborhood.name}
                </p>
              </div>
            </div>
          </div>

          {/* Action */}
          {isActive ? (
            <div className="space-y-2">
              {onModify && (
                <Button
                  variant="default"
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg
                           transition-all duration-200 group/btn font-medium relative ${highlightManageButton
                      ? "ring-2 ring-blue-300 ring-offset-2 shadow-blue-200/50 shadow-lg"
                      : ""
                    }`}
                  onClick={() => onModify(reservation)}
                >
                  {highlightManageButton && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
                  )}
                  <Settings className="mr-2 h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
                  Gestionar reserva
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300
                         transition-all duration-200 group/btn"
                onClick={() => setIsConfirmOpen(true)}
              >
                <X className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                Cancelar reserva
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {onModify && (
                <Button
                  variant="outline"
                  className="w-full border-gray-200 text-gray-600 hover:bg-gray-50
                           transition-all duration-200 group/btn"
                  onClick={() => onModify(reservation)}
                >
                  <Settings className="mr-2 h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
                  Gestionar reserva
                </Button>
              )}
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                <span className="text-gray-500 font-medium">
                  Reserva completada
                </span>
                <div className="flex items-center text-gray-400">
                  <CheckCircle2 className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              Cancelar Reserva
            </DialogTitle>
            <DialogDescription className="text-gray-600 leading-relaxed">
              ¿Estás seguro que deseas cancelar esta reserva? Una vez cancelada,
              el horario estará disponible para otros usuarios.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 px-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-1">
              {reservation.subScenario.name}
            </h4>
            <p className="text-sm text-gray-600 mb-2 capitalize">
              {formattedDate}
            </p>
            <p className="text-sm text-gray-600">
              {reservation.timeSlot.startTime} - {reservation.timeSlot.endTime}
            </p>
          </div>

          <DialogFooter className="sm:justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isCancelling}
              className="flex-1"
            >
              Mantener reserva
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelReservation}
              disabled={isCancelling}
              className="flex items-center flex-1"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Confirmar cancelación
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
