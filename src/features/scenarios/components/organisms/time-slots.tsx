"use client";

import { useEffect, useState } from "react";
import { fetchTimeSlots } from "@/features/scenarios/api/scenario.service";
import { TimeSlot } from "@/features/reservations/types/reservation.types";
import { Button } from "@/shared/ui/button";
import { Loader2 } from "lucide-react";

interface TimeSlotsProps {
  subScenarioId: string | number;
  date: string;
  onSelectTimeSlot: (id: number | null) => void;
  selectedTimeSlotId: number | null;
  refreshTrigger?: number; // Added to force refresh
}

export function TimeSlots({
  subScenarioId,
  date,
  onSelectTimeSlot,
  selectedTimeSlotId,
  refreshTrigger = 0,
}: TimeSlotsProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTimeSlots = async () => {
      setIsLoading(true);
      try {
        const { timeSlots, bookedSlots } = await fetchTimeSlots(subScenarioId, date);
        setTimeSlots(timeSlots);
        setBookedSlots(bookedSlots);
      } catch (error) {
        console.error("Error loading time slots:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTimeSlots();
  }, [subScenarioId, date, refreshTrigger]); // Added refreshTrigger

  // Reset selected time slot when date changes
  useEffect(() => {
    onSelectTimeSlot(null);
  }, [date, onSelectTimeSlot]);

  if (isLoading) {
    return (
      <div className="h-52 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-md">
        <p className="text-gray-500">No hay horarios disponibles para esta fecha.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {timeSlots.map((slot) => {
        const isBooked = bookedSlots.includes(slot.id);
        const isSelected = selectedTimeSlotId === slot.id;

        return (
          <Button
            key={slot.id}
            variant={isSelected ? "default" : "outline"}
            disabled={isBooked}
            className={`
              justify-start h-auto py-3 px-4 transition-all
              ${isSelected ? "bg-teal-600 text-white" : ""}
              ${
                isBooked
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
              }
            `}
            onClick={() => onSelectTimeSlot(isSelected ? null : slot.id)}
          >
            <div className="flex items-center w-full">
              <span className="font-medium">
                {slot.startTime} - {slot.endTime}
              </span>
              <span className="ml-auto text-xs font-medium">
                {isBooked ? "Reservado" : isSelected ? "Seleccionado" : "Disponible"}
              </span>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
