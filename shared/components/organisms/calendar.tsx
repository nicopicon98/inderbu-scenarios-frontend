"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export function Calendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Días de la semana
  const weekdays = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  // Obtener el número de días en el mes actual
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Obtener el día de la semana del primer día del mes (0 = Domingo, 1 = Lunes, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generar los días del calendario
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

    const days = [];

    // Agregar días vacíos para alinear con el día de la semana correcto
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Agregar los días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Simular días disponibles (para este ejemplo, algunos días al azar)
  const availableDays = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
  const selectedDay = 26; // Día seleccionado para este ejemplo

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Select
          value={months[currentMonth]}
          onValueChange={(value) => setCurrentMonth(months.indexOf(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={months[currentMonth]} />
          </SelectTrigger>
          <SelectContent>
            {months.map((month, index) => (
              <SelectItem key={index} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Select
          value={currentYear.toString()}
          onValueChange={(value) => setCurrentYear(Number.parseInt(value))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder={currentYear.toString()} />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="grid grid-cols-7">
          {weekdays.map((day, index) => (
            <div
              key={index}
              className="bg-teal-500 text-white p-2 text-center font-medium border-r last:border-r-0"
            >
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`p-4 text-center border-t border-r last:border-r-0 ${
                day === null
                  ? "bg-gray-100"
                  : day === selectedDay
                  ? "bg-teal-600 text-white"
                  : availableDays.includes(day)
                  ? "bg-teal-100"
                  : ""
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
