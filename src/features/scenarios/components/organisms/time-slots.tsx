"use client";

import { useEffect, useState } from "react";
import { fetchTimeSlots } from "@/features/scenarios/api/scenario.service";
import { TimeSlot } from "@/features/reservations/types/reservation.types";
import { Button } from "@/shared/ui/button";
import { Loader2, Clock } from "lucide-react";

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
      <div className="h-32 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Cargando horarios...</p>
        </div>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-3 rounded-full mb-3">
            <Clock className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="font-medium text-red-800 mb-1">Sin horarios disponibles</h3>
          <p className="text-sm text-red-600">
            No hay horarios disponibles para esta fecha. Intenta con otra fecha.
          </p>
        </div>
      </div>
    );
  }

  const availableSlots = timeSlots.filter(slot => !bookedSlots.includes(slot.id));
  const occupiedSlots = timeSlots.filter(slot => bookedSlots.includes(slot.id));

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">{availableSlots.length} disponibles</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">{occupiedSlots.length} ocupados</span>
          </div>
        </div>
      </div>

      {/* Time slots with scroll */}
      <div className="relative">
        <div 
          className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 
                     scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 
                     hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#D1D5DB #F3F4F6'
          }}
        >
          {timeSlots.map((slot, index) => {
            const isBooked = bookedSlots.includes(slot.id);
            const isSelected = selectedTimeSlotId === slot.id;

            return (
              <Button
                key={slot.id}
                variant={isSelected ? "default" : "outline"}
                disabled={isBooked}
                className={`
                  justify-start h-auto py-3 px-4 transition-all duration-200
                  transform hover:scale-[1.02] active:scale-[0.98]
                  ${isSelected 
                    ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" 
                    : ""
                  }
                  ${isBooked
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 hover:scale-100" 
                    : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 hover:shadow-sm"
                  }
                `}
                onClick={() => onSelectTimeSlot(isSelected ? null : slot.id)}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: isLoading ? 'none' : 'fadeInUp 0.3s ease-out forwards'
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm">
                      {slot.startTime} - {slot.endTime}
                    </span>
                    {isBooked && (
                      <span className="text-xs text-gray-400 mt-1">
                        Ocupado
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </Button>
            );
          })}
        </div>

        {/* Scroll indicators */}
        {timeSlots.length > 6 && (
          <div className="absolute -right-1 top-2 bottom-2 w-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="w-full bg-blue-400 rounded-full transition-all duration-300"
              style={{ 
                height: `${Math.min(100, (6 / timeSlots.length) * 100)}%`
              }}
            />
          </div>
        )}
      </div>
      
      {/* Helper text */}
      {availableSlots.length > 0 && (
        <p className="text-xs text-gray-500 text-center pt-2">
          Selecciona un horario disponible para continuar
        </p>
      )}
    </div>
  );
}

/* Add these styles to your global CSS */
const additionalStyles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom scrollbar for webkit browsers */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 6px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 6px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}
`;
