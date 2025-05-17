'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/shared/ui/select';

export interface SimpleCalendarProps {
  selectedDate: string;
  onDateChange: (newDate: string) => void;
}

export function SimpleCalendar({ selectedDate, onDateChange }: SimpleCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  // Sincronizar estado interno con la prop selectedDate
  useEffect(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      setCurrentYear(y);
      setCurrentMonth(m - 1);
      setSelectedDay(d);
    }
  }, [selectedDate]);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i);
  const weekdaysShort = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();

  // Genera un array con nulls para padding y los días numéricos
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  // Determinar días habilitados: hoy o en el futuro
  const isFutureMonth =
    currentYear > today.getFullYear() ||
    (currentYear === today.getFullYear() && currentMonth > today.getMonth());
  const isCurrentMonth =
    currentYear === today.getFullYear() && currentMonth === today.getMonth();

  const availableDays = calendarDays.filter((day) => {
    if (day === null) return false;
    if (isFutureMonth) return true;
    if (isCurrentMonth && day >= today.getDate()) return true;
    return false;
  }) as number[];

  // Navegación de mes/año
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else setCurrentMonth(currentMonth - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else setCurrentMonth(currentMonth + 1);
  };

  // Al hacer click en un día, notificar al padre
  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onDateChange(`${currentYear}-${mm}-${dd}`);
  };

  return (
    <div className="bg-white rounded-md border border-gray-200">
      {/* Navegación mes/año */}
      <div className="flex items-center space-x-2 p-4">
        <Button variant="outline" size="icon" onClick={prevMonth} className="cursor-pointer hover:bg-gray-100">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Select
          value={months[currentMonth]}
          onValueChange={(v) => setCurrentMonth(months.indexOf(v))}
        >
          <SelectTrigger className="w-[140px] cursor-pointer hover:bg-gray-100">
            <SelectValue placeholder={months[currentMonth]} />
          </SelectTrigger>
          <SelectContent className="bg-white rounded-md border border-gray-200">
            {months.map((m, i) => (
              <SelectItem key={i} value={m} className="cursor-pointer hover:bg-gray-100">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(currentYear)}
          onValueChange={(v) => setCurrentYear(Number(v))}
        >
          <SelectTrigger className="w-[100px] cursor-pointer hover:bg-gray-100">
            <SelectValue placeholder={String(currentYear)} />
          </SelectTrigger>
          <SelectContent className="bg-white rounded-md border border-gray-200">
            {years.map((y) => (
              <SelectItem key={y} value={String(y)} className="cursor-pointer hover:bg-gray-100">
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={nextMonth} className="cursor-pointer hover:bg-gray-100">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendario */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekdaysShort.map((wd, i) => (
            <div key={i} className="text-sm font-medium text-gray-500 py-2">
              {wd}
            </div>
          ))}

          {calendarDays.map((day, idx) =>
            day === null ? (
              <div key={idx} />
            ) : (
              <Button
                key={idx}
                onClick={() => handleDayClick(day)}
                disabled={!availableDays.includes(day)}
                className={`rounded-md py-2 text-sm w-full ${
                  day === selectedDay
                    ? 'bg-teal-100 text-teal-700 font-medium'
                    : availableDays.includes(day)
                    ? 'hover:bg-gray-100 text-gray-700 cursor-pointer'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                {day}
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}