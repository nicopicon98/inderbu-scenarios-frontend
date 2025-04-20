"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";

export function Calendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const months = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
  ];
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const weekdaysShort = ["D","L","M","M","J","V","S"];

  const getDaysInMonth = (y: number, m: number) =>
    new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) =>
    new Date(y, m, 1).getDay();

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const arr: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  };

  const calendarDays = generateCalendarDays();

  // Ejemplo de días disponibles (puedes traerlo de tu API)
  const availableDays = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="bg-white rounded-md border border-gray-200">
      {/* --- Navegación de mes/año --- */}
      <div className="flex items-center space-x-2 p-4">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Select
          value={months[currentMonth]}
          onValueChange={(v) => setCurrentMonth(months.indexOf(v))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={months[currentMonth]} />
          </SelectTrigger>
          <SelectContent>
            {months.map((m, i) => (
              <SelectItem key={i} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentYear.toString()}
          onValueChange={(v) => setCurrentYear(parseInt(v))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder={currentYear.toString()} />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* --- Calendario --- */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Cabecera: D L M ... */}
          {weekdaysShort.map((wd, idx) => (
            <div
              key={idx}
              className="text-sm font-medium text-gray-500 py-2"
            >
              {wd}
            </div>
          ))}

          {/* Espacios vacíos + días */}
          {calendarDays.map((day, idx) =>
            day === null ? (
              <div key={idx} />
            ) : (
              <button
                key={idx}
                onClick={() => setSelectedDay(day)}
                className={`rounded-md py-2 text-sm w-full ${
                  day === selectedDay
                    ? "bg-teal-100 text-teal-700 font-medium"
                    : availableDays.includes(day)
                    ? "hover:bg-gray-100 text-gray-700"
                    : "text-gray-300 cursor-not-allowed"
                }`}
                disabled={!availableDays.includes(day)}
              >
                {day}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
