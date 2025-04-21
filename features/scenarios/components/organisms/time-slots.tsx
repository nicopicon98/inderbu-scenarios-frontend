"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/shared/ui/button";
import { fetchTimeSlots, TimeSlot } from "../../api/scenario.service";

interface TimeSlotsProps {
  subScenarioId: number;
  date: string; // "YYYY-MM-DD"
  onSelectTimeSlot: (timeSlotId: number | null) => void;
  selectedTimeSlotId: number | null;
  refreshTrigger?: number; // A number that changes to trigger a refresh
}

export function TimeSlots({ 
  subScenarioId, 
  date, 
  onSelectTimeSlot, 
  selectedTimeSlotId,
  refreshTrigger = 0
}: TimeSlotsProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);

  // Function to fetch time slots data
  const fetchData = useCallback(async () => {
    if (!date) return;
    
    setAnimate(true);
    setLoading(true);
    
    try {
      const data = await fetchTimeSlots(subScenarioId, date);
      setSlots(data);
      // Pequeño retraso para asegurar que el DOM se actualice antes de la animación
      setTimeout(() => setAnimate(false), 50);
      // Reset selected timeslot when data refreshes
      onSelectTimeSlot(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [subScenarioId, date, onSelectTimeSlot]);

  // Initial load and when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]); // Added refreshTrigger to dependency array

  const handleTimeSlotSelect = (timeSlotId: number) => {
    onSelectTimeSlot(selectedTimeSlotId === timeSlotId ? null : timeSlotId);
  };

  if (loading) return <div>Cargando horarios…</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="grid grid-cols-2 gap-2">
      {slots
        .filter((slot) => slot.id > 8 && slot.id < 21)
        .map((slot, index) => {
          // convierte "HH:MM:SS" -> "HH:MM"
          const from = slot.startTime.slice(0, 5);
          const to = slot.endTime.slice(0, 5);
          const isSelected = selectedTimeSlotId === slot.id;

          return (
            <Button
              key={slot.id}
              disabled={!slot.available}
              onClick={() => slot.available && handleTimeSlotSelect(slot.id)}
              className={`
                cursor-pointer py-1 px-2 rounded-md text-sm
                transition-all duration-300 ease-in-out
                ${
                  animate
                    ? "opacity-0 transform translate-y-2"
                    : "opacity-100 transform translate-y-0"
                }
                ${
                  isSelected
                    ? "bg-teal-600 text-white border border-teal-700 hover:bg-teal-700"
                    : slot.available
                    ? "bg-white border border-teal-200 text-teal-700 hover:bg-teal-50"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }
              `}
              style={{
                transitionDelay: `${index * 50}ms`,
              }}
            >
              {from} - {to}
            </Button>
          );
        })}
    </div>
  );
}