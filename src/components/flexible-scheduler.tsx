"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { createReservation } from "@/features/reservations/create/api/createReservationAction";
import { SimpleCalendar } from "@/shared/components/organisms/simple-calendar";
import { CalendarIcon, Check, Clock } from "lucide-react";
import { useAuth } from "@/features/auth/model/use-auth";
import { FiCheck, FiLoader } from "react-icons/fi";
import { format, parseISO } from "date-fns";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { AuthModal } from "@/features/auth";
import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { CreateReservationDto } from "@/entities/reservation/model/types";

// Imports para lógica de reservas

interface TimeSlot {
  hour: number;
  label: string;
  selected: boolean;
}

interface ScheduleConfig {
  // Fechas - ahora como strings ISO
  startDate?: string;
  endDate?: string;

  // Configuración de recurrencia
  hasDateRange: boolean;
  hasWeekdaySelection: boolean;
  weekdays: number[];

  // Franjas horarias
  timeSlots: number[];
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

interface FlexibleSchedulerProps {
  subScenarioId: number;
}

interface IFromTo {
  from: string | undefined;
  to: string | undefined;
}

export default function FlexibleScheduler({
  subScenarioId,
}: FlexibleSchedulerProps) {
  // Helper para obtener fecha de hoy en formato ISO
  const getTodayISO = () => new Date().toISOString().split("T")[0];

  const [config, setConfig] = useState<ScheduleConfig>({
    weekdays: [],
    timeSlots: [],
    hasDateRange: false,
    hasWeekdaySelection: false,
    startDate: new Date().toISOString().split("T")[0], // Inicializar con fecha de hoy
  });

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateTimeSlots());
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<IFromTo>(() => ({
    from: new Date().toISOString().split("T")[0], // Inicializar con fecha de hoy
    to: undefined,
  }));

  // Estados para lógica de reservas
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { isAuthenticated } = useAuth();

  const toggleTimeSlot = (hour: number) => {
    setTimeSlots((prev) => {
      const newTimeSlots = prev.map((slot) =>
        slot.hour === hour ? { ...slot, selected: !slot.selected } : slot
      );

      // Actualizar config con los nuevos timeSlots
      const selectedHours = newTimeSlots
        .filter((slot) => slot.selected)
        .map((slot) => slot.hour);

      setConfig((prevConfig) => ({
        ...prevConfig,
        timeSlots: selectedHours,
      }));

      return newTimeSlots;
    });
  };

  const handleWeekdayToggle = (weekday: number) => {
    const newWeekdays = selectedWeekdays.includes(weekday)
      ? selectedWeekdays.filter((w) => w !== weekday)
      : [...selectedWeekdays, weekday];

    setSelectedWeekdays(newWeekdays);
    setConfig((prev) => ({ ...prev, weekdays: newWeekdays }));
  };

  const handleDateRangeToggle = (checked: boolean) => {
    setConfig((prev) => ({ ...prev, hasDateRange: checked }));
    if (!checked) {
      setDateRange((prev) => ({ ...prev, to: undefined }));
      setConfig((prev) => ({ ...prev, endDate: undefined }));
    }
  };

  const handleWeekdaySelectionToggle = (checked: boolean) => {
    setConfig((prev) => ({ ...prev, hasWeekdaySelection: checked }));
    if (!checked) {
      setSelectedWeekdays([]);
      setConfig((prev) => ({ ...prev, weekdays: [] }));
    }
  };

  const handleStartDateChange = (dateStr: string) => {
    setDateRange((prev) => ({ ...prev, from: dateStr }));
    setConfig((prev) => ({ ...prev, startDate: dateStr }));
  };

  const handleEndDateChange = (dateStr: string) => {
    // Validar que la fecha de fin no sea anterior a la fecha de inicio
    if (dateRange.from && dateStr < dateRange.from) {
      return; // No permitir fechas anteriores
    }
    setDateRange((prev) => ({ ...prev, to: dateStr }));
    setConfig((prev) => ({ ...prev, endDate: dateStr }));
  };

  // Helper para formatear fechas de forma segura
  const formatDateSafe = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy");
    } catch {
      return dateStr; // fallback
    }
  };

  // Lógica de reservas
  const doReservation = async () => {
    if (getSelectedTimeSlotsCount() === 0) {
      toast.error("Por favor selecciona al menos un horario para reservar");
      return;
    }

    const reservationDate = dateRange.from;
    if (!reservationDate) {
      toast.error("Por favor selecciona una fecha");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("FlexibleScheduler: Creando reservas múltiples");

      // Crear reservas para cada horario seleccionado
      const selectedHours: number[] = timeSlots
        .filter((slot) => slot.selected)
        .map((slot) => slot.hour);

      
      const command: CreateReservationDto = {
        subScenarioId,
        timeSlotIds: selectedHours,
        reservationRange: {
          initialDate: reservationDate,
          finalDate: dateRange.to,
        },
      };

      // add week days to command as long as there's at least 1 selected
      if (selectedWeekdays.length > 0) {
        command.weekdays = selectedWeekdays;
      }

      console.log("FlexibleScheduler: Enviando comando:", command);

      const result = await createReservation(command);

      if (!result.success) {
        console.error("Server action failed:", result.error);
        return;
      }

      toast.success(
        `¡${selectedHours.length} reserva${selectedHours.length > 1 ? "s" : ""} realizada${selectedHours.length > 1 ? "s" : ""} con éxito!`
      );
      setRefreshTrigger((r) => r + 1);
      // Limpiar selecciones
      setTimeSlots((prev) =>
        prev.map((slot) => ({ ...slot, selected: false }))
      );
      setConfig((prev) => ({ ...prev, timeSlots: [] }));
    } catch (err) {
      console.error("Server Action error:", err);
      toast.error("No se pudo completar la reserva, inténtalo de nuevo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    } else {
      doReservation();
    }
  };

  const handleLoginSuccess = () => {
    doReservation();
  };

  const getSelectedTimeSlotsCount = () => {
    return timeSlots.filter((slot) => slot.selected).length;
  };

  const clearAllTimeSlots = () => {
    setTimeSlots((prev) => {
      const newTimeSlots = prev.map((slot) => ({ ...slot, selected: false }));

      setConfig((prevConfig) => ({
        ...prevConfig,
        timeSlots: [],
      }));

      return newTimeSlots;
    });
  };

  const selectBusinessHours = () => {
    setTimeSlots((prev) => {
      const newTimeSlots = prev.map((slot) => ({
        ...slot,
        selected: slot.hour >= 9 && slot.hour <= 17,
      }));

      const selectedHours = newTimeSlots
        .filter((slot) => slot.selected)
        .map((slot) => slot.hour);

      setConfig((prevConfig) => ({
        ...prevConfig,
        timeSlots: selectedHours,
      }));

      return newTimeSlots;
    });
  };

  return (
    <div className="w-full px-4 lg:px-8 space-y-6">
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Configurador de Reservas
          </CardTitle>
          <CardDescription>
            Configura tu reserva para un día específico o un rango de fechas con
            horarios personalizados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Switch para rango de fechas - primero */}
          <div className="flex items-center space-x-2">
            <Switch
              id="date-range-mode"
              checked={config.hasDateRange}
              onCheckedChange={handleDateRangeToggle}
            />
            <Label htmlFor="date-range-mode" className="text-base font-medium">
              Rango de fechas
            </Label>
          </div>

          {/* Configuración de fechas y horarios */}
          {!config.hasDateRange ? (
            /* Layout: Calendario + Horarios lado a lado */
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Calendario único */}
              <div>
                <SimpleCalendar
                  selectedDate={dateRange.from || getTodayISO()}
                  onDateChange={handleStartDateChange}
                />
              </div>

              {/* Horarios al lado */}
              <div>
                <div className="flex items-center justify-between mb-4">
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
                      className="text-complementary border-complementary/40 hover:bg-complementary/10"
                      onClick={selectBusinessHours}
                    >
                      Horario comercial (9-17h)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-muted-foreground hover:bg-muted"
                      onClick={clearAllTimeSlots}
                    >
                      Limpiar todo
                    </Button>
                  </div>
                </div>

                {/* Sistema local de timeSlots para múltiples selecciones */}
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-4 border rounded-lg">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.hour}
                      variant={slot.selected ? "secondary" : "outline"}
                      className={`h-12 text-sm justify-start transition-all ${
                        slot.selected
                          ? "bg-ring/10 text-ring border-ring/30 hover:bg-ring/20"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => toggleTimeSlot(slot.hour)}
                    >
                      {slot.selected && <Check className="h-4 w-4 mr-2" />}
                      {slot.label}
                    </Button>
                  ))}
                </div>

                {getSelectedTimeSlotsCount() === 0 && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Selecciona un horario disponible para continuar
                  </p>
                )}

                {/* Resumen de reserva - justo después de horarios */}
                {dateRange.from && getSelectedTimeSlotsCount() > 0 && (
                  <div className="mt-4 p-4 border-2 border-ring/20 rounded-lg bg-gradient-to-br from-ring/5 to-ring/10">
                    <Label className="font-medium">
                      Resumen de la reserva:
                    </Label>
                    <p className="text-sm text-muted-foreground mt-2">
                      Reserva para el {formatDateSafe(dateRange.from)} en las
                      siguientes franjas:
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-3">
                      {timeSlots
                        .filter((slot) => slot.selected)
                        .map((slot) => (
                          <Badge
                            key={slot.hour}
                            variant="secondary"
                            className="text-xs bg-ring/10 text-ring border-ring/30 justify-center py-1 font-medium"
                          >
                            {slot.hour.toString().padStart(2, "0")}:00-
                            {slot.hour.toString().padStart(2, "0")}:59
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Layout: Calendarios arriba (más anchos), horarios abajo */
            <div className="space-y-6">
              {/* Calendarios de rango - más anchos */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium">
                    Fecha de inicio
                  </Label>
                  <div className="mt-2">
                    <SimpleCalendar
                      selectedDate={dateRange.from || getTodayISO()}
                      onDateChange={handleStartDateChange}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-base font-medium">
                    Fecha de finalización
                  </Label>
                  <div className="mt-2">
                    <SimpleCalendar
                      selectedDate={dateRange.to || getTodayISO()}
                      onDateChange={handleEndDateChange}
                    />
                  </div>
                </div>
              </div>

              {/* Switch para días de semana - solo si hay rango de fechas */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="weekday-selection-mode"
                  checked={config.hasWeekdaySelection}
                  onCheckedChange={handleWeekdaySelectionToggle}
                />
                <Label
                  htmlFor="weekday-selection-mode"
                  className="text-base font-medium"
                >
                  Seleccionar días de la semana
                </Label>
              </div>

              {/* Selector de días de semana - solo si está activado */}
              {config.hasWeekdaySelection && (
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
                            ? "secondary"
                            : "outline"
                        }
                        size="sm"
                        className={`h-12 flex flex-col transition-all ${
                          selectedWeekdays.includes(weekday.value)
                            ? "bg-complementary/20 text-complementary border-complementary/40 hover:bg-complementary/30"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => handleWeekdayToggle(weekday.value)}
                      >
                        <span className="text-xs">{weekday.short}</span>
                        <span className="text-xs">
                          {weekday.label.slice(0, 3)}
                        </span>
                      </Button>
                    ))}
                  </div>

                  {selectedWeekdays.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <Label>Días seleccionados:</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedWeekdays.map((weekday) => (
                          <Badge
                            key={weekday}
                            variant="secondary"
                            className="bg-complementary/20 text-complementary border-complementary/40"
                          >
                            {WEEKDAYS.find((w) => w.value === weekday)?.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Horarios abajo - full width */}
              <div>
                <div className="flex items-center justify-between mb-4">
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
                      className="text-complementary border-complementary/40 hover:bg-complementary/10"
                      onClick={selectBusinessHours}
                    >
                      Horario comercial (9-17h)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-muted-foreground hover:bg-muted"
                      onClick={clearAllTimeSlots}
                    >
                      Limpiar todo
                    </Button>
                  </div>
                </div>

                {/* Sistema local de timeSlots para múltiples selecciones */}
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-4 border rounded-lg">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.hour}
                      variant={slot.selected ? "secondary" : "outline"}
                      className={`h-12 text-sm justify-start transition-all ${
                        slot.selected
                          ? "bg-ring/10 text-ring border-ring/30 hover:bg-ring/20"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => toggleTimeSlot(slot.hour)}
                    >
                      {slot.selected && <Check className="h-4 w-4 mr-2" />}
                      {slot.label}
                    </Button>
                  ))}
                </div>

                {getSelectedTimeSlotsCount() === 0 && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Selecciona un horario disponible para continuar
                  </p>
                )}

                {/* Resumen de reserva - justo después de horarios */}
                {dateRange.from && getSelectedTimeSlotsCount() > 0 && (
                  <div className="mt-4 p-4 border-2 border-ring/20 rounded-lg bg-gradient-to-br from-ring/5 to-ring/10">
                    <Label className="font-medium">
                      Resumen de la reserva:
                    </Label>
                    <p className="text-sm text-muted-foreground mt-2">
                      {!config.hasDateRange
                        ? // Día específico
                          `Reserva para el ${formatDateSafe(dateRange.from)} en las siguientes franjas:`
                        : config.hasWeekdaySelection &&
                            selectedWeekdays.length > 0
                          ? // Rango con días específicos
                            `Reserva desde el ${formatDateSafe(dateRange.from)}${dateRange.to ? ` hasta el ${formatDateSafe(dateRange.to)}` : ""}, ${selectedWeekdays.map((w) => WEEKDAYS.find((wd) => wd.value === w)?.label).join(", ")} en las siguientes franjas:`
                          : // Rango completo
                            `Reserva desde el ${formatDateSafe(dateRange.from)}${dateRange.to ? ` hasta el ${formatDateSafe(dateRange.to)}` : ""} en las siguientes franjas:`}
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-3">
                      {timeSlots
                        .filter((slot) => slot.selected)
                        .map((slot) => (
                          <Badge
                            key={slot.hour}
                            variant="secondary"
                            className="text-xs bg-ring/10 text-ring border-ring/30 justify-center py-1 font-medium"
                          >
                            {slot.hour.toString().padStart(2, "0")}:00-
                            {slot.hour.toString().padStart(2, "0")}:59
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={onSubmit}
            disabled={getSelectedTimeSlotsCount() === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <FiLoader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FiCheck className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? "Procesando reserva..." : "Confirmar reserva"}
          </Button>
        </CardContent>
      </Card>

      {/* Modal de autenticación */}
      <AuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
