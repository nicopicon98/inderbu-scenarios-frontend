"use client";

import { useState } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { useAuth } from "@/shared/contexts/auth-context";
import {
  FiCalendar,
  FiCheck,
  FiClock,
  FiGrid,
  FiMapPin,
  FiTag,
  FiUser,
  FiUsers,
  FiLoader,
} from "react-icons/fi";

import { TimeSlots } from "@/features/scenarios/components/organisms/time-slots";
import { SimpleCalendar } from "@/shared/components/organisms/simple-calendar";
import { SimpleCarousel } from "@/shared/components/organisms/simple-carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ScenarioWithRelations } from "../../api/scenario.service";
import { createReservation } from "../../api/reservation.service";
import { Recommendations } from "./recommendations";
import { getTodayLocalISO } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import { AuthModal } from "@/shared/components/organisms/auth-modal";

interface ScenarioDetailProps {
  subScenario: ScenarioWithRelations;
}

export function ScenarioDetail({ subScenario }: ScenarioDetailProps) {
  const today = getTodayLocalISO();
  const [date, setDate] = useState<string>(today);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add a refresh trigger
  const { toast } = useToast();
  const { isAuthenticated, login } = useAuth();

  console.log({subScenario});

  const handleLoginSuccess = (email: string, role: number, token: string) => {
    login(email, role, token);
    // After successful login, we can continue with the reservation process
    handleReservationProcess();
  };

  const handleReservationProcess = async () => {
    if (!selectedTimeSlotId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor selecciona un horario para reservar",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        subScenarioId: subScenario.id,
        timeSlotId: selectedTimeSlotId,
        reservationDate: date,
      };

      console.log({infoCreateReservation: payload})

      await createReservation(payload);
      
      toast({
        title: "Reserva exitosa",
        description: "¡Reserva realizada con éxito!",
        variant: "default",
      });
      
      // Reset selection after successful reservation
      setSelectedTimeSlotId(null);
      
      // Increment the refresh trigger to force the TimeSlots component to refresh
      setRefreshTrigger(prev => prev + 1);
      
    } catch (error) {
      console.error("Error creating reservation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo completar la reserva. Por favor intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReservationSubmit = () => {
    if (!isAuthenticated) {
      // If not authenticated, open the login modal
      setIsLoginModalOpen(true);
    } else {
      // If already authenticated, proceed with reservation
      handleReservationProcess();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      {/* Imagen e información */}
      <div className="lg:col-span-2 space-y-6">
        <div className="relative bg-teal-500 rounded-lg overflow-hidden h-[300px]">
          <SimpleCarousel />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del escenario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <h3 className="text-base font-medium text-gray-700 flex items-center gap-1">
                  <FiGrid className="text-teal-600" /> <span>Actividad</span>
                </h3>
                <p className="text-gray-600 text-sm pt-1">
                  {subScenario.activityArea?.name}
                </p>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-700 flex items-center gap-1">
                  <FiMapPin className="text-teal-600" /> Superficie
                </h3>
                <p className="text-gray-600 text-sm pt-1">
                  {subScenario.fieldSurfaceType?.name}
                </p>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-700 flex items-center gap-1">
                  <FiUser className="text-teal-600" /> Jugadores
                </h3>
                <p className="text-gray-600 text-sm pt-1">
                  {subScenario.numberOfPlayers}
                </p>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-700 flex items-center gap-1">
                  <FiUsers className="text-teal-600" /> Espectadores
                </h3>
                <p className="text-gray-600 text-sm pt-1">
                  {subScenario.numberOfSpectators}
                </p>
              </div>
              <div className="lg:col-span-2">
                <h3 className="text-base font-medium text-gray-700 flex items-center gap-1">
                  <FiMapPin className="text-teal-600" /> Dirección
                </h3>
                <p className="text-gray-600 text-sm pt-1">
                  {subScenario.scenario.address}
                </p>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-700 flex items-center gap-1">
                  <FiMapPin className="text-teal-600" /> Barrio
                </h3>
                <p className="text-gray-600 text-sm pt-1">
                  {subScenario.scenario.neighborhood.name}
                </p>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-700 flex items-center gap-1">
                  <FiTag className="text-teal-600" /> Costo
                </h3>
                <p className="text-gray-600 text-sm pt-1">
                  {subScenario.hasCost ? "Con costo" : "Gratuito"}
                </p>
              </div>
            </div>

            <Recommendations />
          </CardContent>
        </Card>
      </div>

      {/* Panel de reserva */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Reserva tu espacio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Selecciona una fecha y horario para reservar esta instalación.
            </p>
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <FiCalendar className="text-teal-600" />
                Selecciona una fecha
              </h3>
              <SimpleCalendar selectedDate={date} onDateChange={setDate} />
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium flex items-center gap-2 pb-2">
                <FiClock className="text-teal-600" />
                Horarios disponibles
              </h3>
              <TimeSlots 
                subScenarioId={subScenario.id} 
                date={date} 
                onSelectTimeSlot={setSelectedTimeSlotId}
                selectedTimeSlotId={selectedTimeSlotId}
                refreshTrigger={refreshTrigger}  // Add the refresh trigger
              />
            </div>

            <Button 
              className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white cursor-pointer flex items-center justify-center gap-2"
              onClick={handleReservationSubmit}
              disabled={!selectedTimeSlotId || isSubmitting}
            >
              {isSubmitting ? (
                <FiLoader className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <FiCheck className="h-5 w-5 mr-2" />
              )}
              {isSubmitting ? "Procesando..." : "Confirmar reserva"}
            </Button>

            {!selectedTimeSlotId && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                Selecciona un horario disponible para continuar
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Login Modal */}
      <AuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}