"use client";

import { Button } from "@/shared/ui/button";
import { useState } from "react";


export function TimeSlots() {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const morningSlots = [
    "06:00 AM - 07:00 AM",
    "07:00 AM - 08:00 AM",
    "08:00 AM - 09:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
  ];

  const afternoonSlots = [
    "12:00 PM - 01:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
    "05:00 PM - 06:00 PM",
    "08:00 PM - 09:00 PM",
    "09:00 PM - 10:00 PM",
    "10:00 PM - 11:00 PM",
  ];

  const handleSelectSlot = (slot: string) => {
    setSelectedSlot(slot);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3">
      {morningSlots.map((slot) => (
        <Button
          key={slot}
          variant="outline"
          className={`h-14 ${
            selectedSlot === slot
              ? "bg-teal-600 text-white hover:bg-teal-700"
              : "bg-lime-500 text-white hover:bg-lime-600"
          }`}
          onClick={() => handleSelectSlot(slot)}
        >
          {slot}
        </Button>
      ))}

      {afternoonSlots.map((slot) => (
        <Button
          key={slot}
          variant="outline"
          className={`h-14 ${
            selectedSlot === slot
              ? "bg-teal-600 text-white hover:bg-teal-700"
              : "bg-lime-500 text-white hover:bg-lime-600"
          }`}
          onClick={() => handleSelectSlot(slot)}
        >
          {slot}
        </Button>
      ))}
    </div>
  );
}
