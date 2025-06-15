import { useState } from "react";
import { toast } from "sonner";
import { createReservation } from "@/features/reservations/use-cases/create/actions/createReservationAction";
import { CreateReservationDto } from "@/entities/reservation/model/types";
import { useAuth } from "@/features/auth/model/use-auth";
import { validateMinimumSelection, validateDateSelection, getUnavailableSlots } from "../utils/slot-validators";
import { IFromTo } from "../types/scheduler.types";

export const useReservationProcess = (
  subScenarioId: number,
  availabilityConfig: any,
  checkAvailability: (config: any) => Promise<void>,
  checkSlotAvailability: (hour: number) => boolean
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const doReservation = async (
    selectedSlots: Set<number>,
    dateRange: IFromTo,
    selectedWeekdays: number[],
    clearAllTimeSlots: () => void
  ) => {
    if (!validateMinimumSelection(selectedSlots.size)) {
      return;
    }

    if (!validateDateSelection(dateRange.from)) {
      return;
    }

    const selectedSlotsArray = Array.from(selectedSlots);
    const unavailableSlots = getUnavailableSlots(selectedSlotsArray, checkSlotAvailability);
    
    if (unavailableSlots.length > 0) {
      return false; // Indica que hay slots no disponibles
    }

    setIsSubmitting(true);
    try {
      console.log("FlexibleScheduler: Creando reservas múltiples");
      
      const command: CreateReservationDto = {
        subScenarioId,
        timeSlotIds: selectedSlotsArray,
        reservationRange: {
          initialDate: dateRange.from!,
          finalDate: dateRange.to,
        },
      };

      if (selectedWeekdays.length > 0) {
        command.weekdays = selectedWeekdays;
      }

      console.log("FlexibleScheduler: Enviando comando:", command);

      const result = await createReservation(command);

      if (!result.success) {
        if (result.error?.includes('conflicto') || result.error?.includes('ocupado')) {
          toast.error("Algunos horarios fueron ocupados por otro usuario. Refrescando disponibilidad...");
          await checkAvailability(availabilityConfig);
        } else {
          toast.error(result.error || "Error desconocido al crear la reserva");
        }
        return false;
      }

      toast.success("¡Reserva realizada con éxito!");
      
      clearAllTimeSlots();
      // Refetch disponibilidad
      await checkAvailability(availabilityConfig);
      return true;
    } catch (err) {
      console.error("Server Action error:", err);
      toast.error("No se pudo completar la reserva, inténtalo de nuevo");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (
    selectedSlots: Set<number>,
    dateRange: IFromTo,
    selectedWeekdays: number[],
    clearAllTimeSlots: () => void
  ) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    } else {
      doReservation(selectedSlots, dateRange, selectedWeekdays, clearAllTimeSlots);
    }
  };

  const handleLoginSuccess = (
    selectedSlots: Set<number>,
    dateRange: IFromTo,
    selectedWeekdays: number[],
    clearAllTimeSlots: () => void
  ) => {
    doReservation(selectedSlots, dateRange, selectedWeekdays, clearAllTimeSlots);
  };

  return {
    isSubmitting,
    isLoginModalOpen,
    setIsLoginModalOpen,
    onSubmit,
    handleLoginSuccess,
  };
};
