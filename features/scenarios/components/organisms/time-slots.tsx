"use client";

import { useEffect, useState } from "react";
import { Button }             from "@/shared/ui/button";
import { fetchTimeSlots, TimeSlot } from "../../api/scenario.service";

interface TimeSlotsProps {
  subScenarioId: number;
  date: string;              // "YYYY-MM-DD"
}

export function TimeSlots({ subScenarioId, date }: TimeSlotsProps) {
  const [slots, setSlots]       = useState<TimeSlot[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    fetchTimeSlots(subScenarioId, date)
      .then((data) => setSlots(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [subScenarioId, date]);

  if (loading) return <div>Cargando horarios…</div>;
  if (error)   return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="grid grid-cols-2 gap-2">
      {slots
        .filter(slot => slot.id > 8 && slot.id < 21)
        .map((slot) => {
          // convierte "HH:MM:SS" -> "HH:MM"
          const from = slot.startTime.slice(0, 5);
          const to   = slot.endTime.slice(0, 5);
          return (
            <Button
              key={slot.id}
              disabled={!slot.available}
              className={`cursor-pointer py-1 px-2 rounded-md text-sm ${
                slot.available
                  ? "bg-white border border-teal-200 text-teal-700 hover:bg-teal-50"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {from} - {to}
            </Button>
          );
        })
      }
    </div>
  );
}
