"use client";

import { AuthModal } from "@/features/auth";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { TimeSlots } from "@/features/scenarios/components/organisms/time-slots";
import { getTodayLocalISO } from "@/lib/utils";
import { SimpleCalendar } from "@/shared/components/organisms/simple-calendar";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useState } from "react";
import { FiCalendar, FiCheck, FiClock, FiLoader } from "react-icons/fi";
import { toast } from "sonner";
import { createReservation } from "../../services/reservation.service";

interface IReservationPanelProps {
  subScenarioId: number;
}

export function ReservationPanel({ subScenarioId }: IReservationPanelProps) {
  const today = getTodayLocalISO();
  const [date, setDate] = useState(today);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<number | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { isAuthenticated, handleLogin } = useAuth();

  // --- handlers -------------------------------------------------------------
  const doReservation = async () => {
    if (!selectedTimeSlotId) {
      toast.error("Por favor selecciona un horario para reservar");
      return;
    }
    setIsSubmitting(true);
    try {
      await createReservation({
        subScenarioId,
        timeSlotId: selectedTimeSlotId,
        reservationDate: date,
      });
      toast.success("¡Reserva realizada con éxito!");
      setSelectedTimeSlotId(null);
      setRefreshTrigger((r) => r + 1);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo completar la reserva, inténtalo de nuevo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = () => {
    if (!isAuthenticated) setIsLoginModalOpen(true);
    else doReservation();
  };

  const handleLoginSuccess = (
    // id: number,
    // email: string,
    // role: number,
    // token: string,
  ) => {
    // login(id, email, role, token);
    doReservation();
  };

  // --- JSX ------------------------------------------------------------------
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Reserva tu espacio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Selecciona una fecha y horario para reservar esta instalación.
          </p>

          <section>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FiCalendar className="text-teal-600" /> Selecciona una fecha
            </h3>
            <SimpleCalendar selectedDate={date} onDateChange={setDate} />
          </section>

          <section className="mt-4">
            <h3 className="text-lg font-medium flex items-center gap-2 pb-2">
              <FiClock className="text-teal-600" /> Horarios disponibles
            </h3>
            <TimeSlots
              subScenarioId={subScenarioId}
              date={date}
              onSelectTimeSlot={setSelectedTimeSlotId}
              selectedTimeSlotId={selectedTimeSlotId}
              refreshTrigger={refreshTrigger}
            />
          </section>

          <Button
            className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-2"
            onClick={onSubmit}
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

      <AuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
