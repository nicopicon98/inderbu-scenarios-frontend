"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Clock, MapPin, X, Loader2 } from "lucide-react";

import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardFooter } from "@/shared/ui/card";
import { Reservation } from "../../types/reservation.types";
import { useToast } from "@/shared/hooks/use-toast";


interface ReservationItemProps {
  reservation: Reservation;
  onCancelled: (id: number) => void;
}

export function ReservationItem({ reservation, onCancelled }: ReservationItemProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { toast } = useToast();

  const handleCancelReservation = async () => {
    setIsCancelling(true);
    try {
      // const success = await cancelReservation(reservation.id);
      const success = true
      if (success) {
        toast({
          title: "Reserva cancelada",
          description: "La reserva ha sido cancelada exitosamente",
        });
        onCancelled(reservation.id);
      } else {
        toast({
          title: "Error",
          description: "No se pudo cancelar la reserva",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al cancelar la reserva",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
      setIsConfirmOpen(false);
    }
  };

  // Format the date for display
  const formattedDate = format(new Date(reservation.reservationDate), "EEEE d 'de' MMMM, yyyy", { locale: es });

  return (
    <>
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="relative h-40 bg-blue-100">
          <Image
            src="https://inderbu.gov.co/escenarios/content/fields/57/12770.jpg"
            alt={reservation.subScenario.name}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
        <CardContent className="p-4 flex-grow">
          <h3 className="font-bold text-lg text-blue-700 mb-2">
            {reservation.subScenario.name}
          </h3>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start">
              <CalendarIcon className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
              <div>
                <p className="font-medium text-gray-700">Fecha</p>
                <p>{formattedDate}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
              <div>
                <p className="font-medium text-gray-700">Horario</p>
                <p>{reservation.timeSlot.startTime} - {reservation.timeSlot.endTime}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
              <div>
                <p className="font-medium text-gray-700">Ubicación</p>
                <p>{reservation.subScenario.scenario.address}</p>
                <p>{reservation.subScenario.scenario.neighborhood.name}</p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t p-4 bg-gray-50">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setIsConfirmOpen(true)}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar reserva
          </Button>
        </CardFooter>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar Reserva</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas cancelar esta reserva? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="font-medium">{reservation.subScenario.name}</p>
            <p className="text-sm text-gray-500">{formattedDate}, {reservation.timeSlot.startTime} - {reservation.timeSlot.endTime}</p>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isCancelling}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelReservation}
              disabled={isCancelling}
              className="flex items-center"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
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
