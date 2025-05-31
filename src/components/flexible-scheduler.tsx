"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { CalendarIcon, Check, Clock } from "lucide-react";
import { Calendar } from "@/shared/ui/calendar";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";
import { es } from "date-fns/locale";
import { useState } from "react";


interface TimeSlot {
  hour: number;
  label: string;
  selected: boolean;
}

interface ScheduleConfig {
  type: "specific-dates" | "recurring-weekdays" | "month-range";

  // Para fechas específicas
  specificDates?: Date[];

  // Para días recurrentes
  weekdays?: number[];
  startDate?: Date;
  endDate?: Date;

  // Para rango de meses
  startMonth?: Date;
  endMonth?: Date;

  // Franjas horarias (común para todos)
  timeSlots: number[];

  // Configuración adicional
  isRecurring: boolean;
}

const WEEKDAYS = [
  { value: 1, label: "Lunes", short: "L" },
  { value: 2, label: "Martes", short: "M" },
  { value: 3, label: "Miércoles", short: "X" },
  { value: 4, label: "Jueves", short: "J" },
  { value: 5, label: "Viernes", short: "V" },
  { value: 6, label: "Sábado", short: "S" },
  { value: 0, label: "Domingo", short: "D" },
];

// Generar franjas horarias de 24 horas
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push({
      hour,
      label: `${hour.toString().padStart(2, "0")}:00:00 - ${hour.toString().padStart(2, "0")}:59:00`,
      selected: false,
    });
  }
  return slots;
};

export default function FlexibleScheduler() {
  const [config, setConfig] = useState<ScheduleConfig>({
    type: "specific-dates",
    timeSlots: [],
    isRecurring: false,
  });

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateTimeSlots());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [monthRange, setMonthRange] = useState<{
    start: Date | undefined;
    end: Date | undefined;
  }>({
    start: undefined,
    end: undefined,
  });

  const toggleTimeSlot = (hour: number) => {
    setTimeSlots((prev) =>
      prev.map((slot) =>
        slot.hour === hour ? { ...slot, selected: !slot.selected } : slot,
      ),
    );

    setConfig((prev) => ({
      ...prev,
      timeSlots: timeSlots
        .map((slot) =>
          slot.hour === hour ? { ...slot, selected: !slot.selected } : slot,
        )
        .filter((slot) => slot.selected)
        .map((slot) => slot.hour),
    }));
  };

  const handleWeekdayToggle = (weekday: number) => {
    const newWeekdays = selectedWeekdays.includes(weekday)
      ? selectedWeekdays.filter((w) => w !== weekday)
      : [...selectedWeekdays, weekday];

    setSelectedWeekdays(newWeekdays);
    setConfig((prev) => ({ ...prev, weekdays: newWeekdays }));
  };

  const handleRecurringToggle = (checked: boolean) => {
    setConfig((prev) => ({ ...prev, isRecurring: checked }));
  };

  const getSelectedTimeSlotsCount = () => {
    return timeSlots.filter((slot) => slot.selected).length;
  };

  const clearAllTimeSlots = () => {
    setTimeSlots((prev) => prev.map((slot) => ({ ...slot, selected: false })));
    setConfig((prev) => ({ ...prev, timeSlots: [] }));
  };

  const selectBusinessHours = () => {
    setTimeSlots((prev) =>
      prev.map((slot) => ({
        ...slot,
        selected: slot.hour >= 9 && slot.hour <= 17,
      })),
    );
    setConfig((prev) => ({
      ...prev,
      timeSlots: Array.from({ length: 9 }, (_, i) => i + 9),
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Configurador de Disponibilidad
          </CardTitle>
          <CardDescription>
            Configura tu disponibilidad de manera flexible con fechas
            específicas, recurrencias o rangos de meses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selector de tipo de agendamiento */}
          <Tabs
            value={config.type}
            onValueChange={(value) =>
              setConfig((prev) => ({ ...prev, type: value as any }))
            }
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="specific-dates">
                Fechas Específicas
              </TabsTrigger>
              <TabsTrigger value="recurring-weekdays">
                Días Recurrentes
              </TabsTrigger>
              <TabsTrigger value="month-range">Rango de Meses</TabsTrigger>
            </TabsList>

            <TabsContent value="specific-dates" className="space-y-4">
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Seleccionar fechas específicas
                </Label>
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => {
                    setSelectedDates(dates || []);
                    setConfig((prev) => ({
                      ...prev,
                      specificDates: dates || [],
                    }));
                  }}
                  className="rounded-md border w-fit"
                  locale={es}
                />

                {selectedDates.length > 0 && (
                  <div className="space-y-2">
                    <Label>
                      Fechas seleccionadas ({selectedDates.length}):
                    </Label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {selectedDates.map((date, index) => (
                        <Badge key={index} variant="secondary">
                          {format(date, "dd/MM/yyyy", { locale: es })}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recurring-weekdays" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recurring-mode"
                    checked={config.isRecurring}
                    onCheckedChange={handleRecurringToggle}
                  />
                  <Label
                    htmlFor="recurring-mode"
                    className="text-base font-medium"
                  >
                    Evento recurrente (requiere fecha de finalización)
                  </Label>
                </div>

                <div>
                  <Label className="text-base font-medium">
                    Días de la semana
                  </Label>
                  <div className="grid grid-cols-7 gap-2 mt-3">
                    {WEEKDAYS.map((weekday) => (
                      <Button
                        key={weekday.value}
                        variant={
                          selectedWeekdays.includes(weekday.value)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="h-12 flex flex-col"
                        onClick={() => handleWeekdayToggle(weekday.value)}
                      >
                        <span className="text-xs">{weekday.short}</span>
                        <span className="text-xs">
                          {weekday.label.slice(0, 3)}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {config.isRecurring && (
                  <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                    <div>
                      <Label htmlFor="start-date">Fecha de inicio</Label>
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => {
                          setDateRange((prev) => ({ ...prev, from: date }));
                          setConfig((prev) => ({ ...prev, startDate: date }));
                        }}
                        className="rounded-md border bg-background mt-2"
                        locale={es}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date">Fecha de finalización</Label>
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => {
                          setDateRange((prev) => ({ ...prev, to: date }));
                          setConfig((prev) => ({ ...prev, endDate: date }));
                        }}
                        className="rounded-md border bg-background mt-2"
                        locale={es}
                        disabled={(date) =>
                          dateRange.from ? date < dateRange.from : false
                        }
                      />
                    </div>
                  </div>
                )}

                {selectedWeekdays.length > 0 && (
                  <div className="space-y-2">
                    <Label>Días seleccionados:</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedWeekdays.map((weekday) => (
                        <Badge key={weekday} variant="secondary">
                          {WEEKDAYS.find((w) => w.value === weekday)?.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="month-range" className="space-y-4">
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Seleccionar rango de meses
                </Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Mes de inicio</Label>
                    <Calendar
                      mode="single"
                      selected={monthRange.start}
                      onSelect={(date) => {
                        const startOfSelectedMonth = date
                          ? startOfMonth(date)
                          : undefined;
                        setMonthRange((prev) => ({
                          ...prev,
                          start: startOfSelectedMonth,
                        }));
                        setConfig((prev) => ({
                          ...prev,
                          startMonth: startOfSelectedMonth,
                        }));
                      }}
                      className="rounded-md border mt-2"
                      locale={es}
                    />
                  </div>
                  <div>
                    <Label>Mes de finalización</Label>
                    <Calendar
                      mode="single"
                      selected={monthRange.end}
                      onSelect={(date) => {
                        const endOfSelectedMonth = date
                          ? endOfMonth(date)
                          : undefined;
                        setMonthRange((prev) => ({
                          ...prev,
                          end: endOfSelectedMonth,
                        }));
                        setConfig((prev) => ({
                          ...prev,
                          endMonth: endOfSelectedMonth,
                        }));
                      }}
                      className="rounded-md border mt-2"
                      locale={es}
                      disabled={(date) =>
                        monthRange.start ? date < monthRange.start : false
                      }
                    />
                  </div>
                </div>

                {monthRange.start && monthRange.end && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <Label className="font-medium">Rango seleccionado:</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Desde{" "}
                      {format(monthRange.start, "MMMM yyyy", { locale: es })}{" "}
                      hasta{" "}
                      {format(monthRange.end, "MMMM yyyy", { locale: es })}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Selector de horarios disponibles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <Label className="text-base font-medium">
                  Horarios disponibles
                </Label>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectBusinessHours}
                >
                  Horario comercial (9-17h)
                </Button>
                <Button variant="outline" size="sm" onClick={clearAllTimeSlots}>
                  Limpiar todo
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-4 border rounded-lg">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.hour}
                  variant={slot.selected ? "default" : "outline"}
                  className="h-12 text-sm justify-start"
                  onClick={() => toggleTimeSlot(slot.hour)}
                >
                  {slot.selected && <Check className="h-4 w-4 mr-2" />}
                  {slot.label}
                </Button>
              ))}
            </div>

            {getSelectedTimeSlotsCount() > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <Label className="font-medium">
                  {getSelectedTimeSlotsCount()} franja
                  {getSelectedTimeSlotsCount() !== 1 ? "s" : ""} horaria
                  {getSelectedTimeSlotsCount() !== 1 ? "s" : ""} seleccionada
                  {getSelectedTimeSlotsCount() !== 1 ? "s" : ""}
                </Label>
              </div>
            )}
          </div>

          <Button className="w-full" size="lg">
            <Check className="h-4 w-4 mr-2" />
            Confirmar configuración
          </Button>
        </CardContent>
      </Card>

      {/* Resumen de configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumen de Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="font-medium">Tipo de disponibilidad:</Label>
              <p className="text-sm text-muted-foreground">
                {config.type === "specific-dates" && "Fechas específicas"}
                {config.type === "recurring-weekdays" &&
                  `Días recurrentes${config.isRecurring ? " (con fecha de fin)" : ""}`}
                {config.type === "month-range" && "Rango de meses"}
              </p>
            </div>

            {config.timeSlots.length > 0 && (
              <div>
                <Label className="font-medium">
                  Franjas horarias ({config.timeSlots.length}):
                </Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {config.timeSlots.map((hour) => (
                    <Badge key={hour} variant="outline" className="text-xs">
                      {hour.toString().padStart(2, "0")}:00
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {config.type === "recurring-weekdays" &&
              config.isRecurring &&
              dateRange.from &&
              dateRange.to && (
                <div>
                  <Label className="font-medium">Período de recurrencia:</Label>
                  <p className="text-sm text-muted-foreground">
                    {format(dateRange.from, "dd/MM/yyyy", { locale: es })} -{" "}
                    {format(dateRange.to, "dd/MM/yyyy", { locale: es })}
                  </p>
                </div>
              )}

            {config.type === "month-range" &&
              monthRange.start &&
              monthRange.end && (
                <div>
                  <Label className="font-medium">Rango de meses:</Label>
                  <p className="text-sm text-muted-foreground">
                    {format(monthRange.start, "MMMM yyyy", { locale: es })} -{" "}
                    {format(monthRange.end, "MMMM yyyy", { locale: es })}
                  </p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
