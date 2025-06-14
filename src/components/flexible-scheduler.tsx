import { 
  CalendarIcon, 
  Check, 
  Clock, 
  X, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Settings,
  ArrowRight,
  ArrowLeft,
  Info,
  Star,
  Zap,
  Coffee,
  Moon,
  Sun,
  Sunset,
  PlayCircle,
  HelpCircle,
  CheckCircle2
} from "lucide-react";
import { useAvailabilityConfiguration } from "@/features/reservations/hooks/use-availability-configuration.hook";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { createReservation } from "@/features/reservations/create/api/createReservationAction";
import { SimpleCalendar } from "@/shared/components/organisms/simple-calendar";
import { CreateReservationDto } from "@/entities/reservation/model/types";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/features/auth/model/use-auth";
import { FiCheck, FiLoader } from "react-icons/fi";
import { format, parseISO } from "date-fns";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { AuthModal } from "@/features/auth";
import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";
import { toast } from "sonner";


const Tooltip = ({ children, content, side = "top" }: { 
  children: React.ReactNode; 
  content: string; 
  side?: "top" | "bottom" | "left" | "right" 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        {children}
      </div>
      {isVisible && (
        <div className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg transition-opacity duration-200 ${
          side === "top" ? "bottom-full mb-2 left-1/2 transform -translate-x-1/2" :
          side === "bottom" ? "top-full mt-2 left-1/2 transform -translate-x-1/2" :
          side === "left" ? "right-full mr-2 top-1/2 transform -translate-y-1/2" :
          "left-full ml-2 top-1/2 transform -translate-y-1/2"
        }`}>
          {content}
          <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
            side === "top" ? "top-full left-1/2 -translate-x-1/2 -mt-1" :
            side === "bottom" ? "bottom-full left-1/2 -translate-x-1/2 -mb-1" :
            side === "left" ? "left-full top-1/2 -translate-y-1/2 -ml-1" :
            "right-full top-1/2 -translate-y-1/2 -mr-1"
          }`} />
        </div>
      )}
    </div>
  );
};

const OnboardingStep = ({ 
  step, 
  title, 
  description, 
  isActive, 
  isCompleted 
}: {
  step: number;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
}) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
    isActive ? "bg-blue-50 border-l-4 border-blue-500" : 
    isCompleted ? "bg-green-50 border-l-4 border-green-500" :
    "bg-gray-50 border-l-4 border-gray-200"
  }`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
      isCompleted ? "bg-green-500 text-white" :
      isActive ? "bg-blue-500 text-white" :
      "bg-gray-300 text-gray-600"
    }`}>
      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : step}
    </div>
    <div>
      <h4 className={`font-medium ${isActive ? "text-blue-900" : isCompleted ? "text-green-900" : "text-gray-600"}`}>
        {title}
      </h4>
      <p className={`text-sm ${isActive ? "text-blue-700" : isCompleted ? "text-green-700" : "text-gray-500"}`}>
        {description}
      </p>
    </div>
  </div>
);

// MEJORA: Formateo de horas más humano
const formatHourHuman = (hour: number): string => {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};

// MEJORA: Agrupación inteligente con iconos y shortcuts
const TIME_PERIODS = [
  {
    id: 'morning',
    name: 'Mañana',
    icon: Sun,
    description: '6 AM - 12 PM',
    hours: [6, 7, 8, 9, 10, 11],
    color: 'from-yellow-50 to-orange-50 border-yellow-200',
    shortcut: 'business-morning',
    defaultExpanded: true,
  },
  {
    id: 'afternoon', 
    name: 'Tarde',
    icon: Sunset,
    description: '12 PM - 6 PM',
    hours: [12, 13, 14, 15, 16, 17],
    color: 'from-blue-50 to-sky-50 border-blue-200',
    shortcut: 'business-afternoon',
    defaultExpanded: true,
  },
  {
    id: 'evening',
    name: 'Noche',
    icon: Coffee,
    description: '6 PM - 12 AM',
    hours: [18, 19, 20, 21, 22, 23],
    color: 'from-purple-50 to-indigo-50 border-purple-200',
    shortcut: 'evening',
    defaultExpanded: true,
  },
  {
    id: 'late_night',
    name: 'Madrugada',
    icon: Moon,
    description: '12 AM - 6 AM',
    hours: [0, 1, 2, 3, 4, 5],
    color: 'from-gray-50 to-slate-50 border-gray-200',
    shortcut: 'late-night',
    defaultExpanded: false,
  },
];

// MEJORA PRIORIDAD MEDIA: Shortcuts inteligentes predefinidos
const SMART_SHORTCUTS = [
  {
    id: 'business',
    name: 'Horario comercial',
    description: 'Lunes a viernes, 9 AM - 5 PM',
    hours: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    icon: '🏢',
  },
  {
    id: 'morning-workout',
    name: 'Ejercicio matutino',
    description: 'Perfecto para entrenar antes del trabajo',
    hours: [6, 7, 8],
    icon: '💪',
  },
  {
    id: 'lunch-break',
    name: '🍽️ Hora del almuerzo',
    description: 'Ideal para actividades en el break',
    hours: [12, 13],
    icon: '🍽️',
  },
  {
    id: 'after-work',
    name: '🌆 Después del trabajo',
    description: 'Relajarse después de la jornada laboral',
    hours: [18, 19, 20],
    icon: '🌆',
  },
  {
    id: 'weekend-morning',
    name: '🌅 Mañana de fin de semana',
    description: 'Aprovecha la mañana del sábado/domingo',
    hours: [8, 9, 10, 11],
    icon: '🌅',
  },
];

interface TimeSlot {
  hour: number;
  label: string;
  selected: boolean;
  status: 'available' | 'occupied' | 'unknown';
}

interface ScheduleConfig {
  startDate?: string;
  endDate?: string;
  hasDateRange: boolean;
  hasWeekdaySelection: boolean;
  weekdays: number[];
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

// MEJORA: Generación de slots con formateo humano
const generateTimeSlots = (availabilityChecker?: (hour: number) => 'available' | 'occupied' | 'unknown'): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push({
      hour,
      label: formatHourHuman(hour),
      selected: false,
      status: availabilityChecker ? availabilityChecker(hour) : 'unknown',
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
  const getTodayISO = () => new Date().toISOString().split("T")[0];

  // MEJORA PRIORIDAD MEDIA: Estados para wizard de pasos
  const [currentStep, setCurrentStep] = useState(1);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [config, setConfig] = useState<ScheduleConfig>({
    weekdays: [],
    timeSlots: [],
    hasDateRange: false,
    hasWeekdaySelection: false,
    startDate: new Date().toISOString().split("T")[0],
  });

  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<IFromTo>(() => ({
    from: new Date().toISOString().split("T")[0],
    to: undefined,
  }));

  // Estados para UI mejorada
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [expandedPeriods, setExpandedPeriods] = useState<Record<string, boolean>>(
    TIME_PERIODS.reduce((acc, period) => ({
      ...acc,
      [period.id]: period.defaultExpanded
    }), {})
  );

  // Estados para lógica de reservas
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  // REMOVED: refreshTrigger ya no es necesario
  const { isAuthenticated } = useAuth();

  // 🎯 Hook único para disponibilidad (simplificado)
  const availabilityConfig = useMemo(() => ({
    subScenarioId,
    initialDate: dateRange.from || new Date().toISOString().split("T")[0],
    finalDate: config.hasDateRange ? dateRange.to : undefined,
    weekdays: config.hasWeekdaySelection && selectedWeekdays.length > 0 ? selectedWeekdays : undefined,
  }), [subScenarioId, dateRange.from, dateRange.to, config.hasDateRange, config.hasWeekdaySelection, selectedWeekdays]);

  const {
    timeSlots: availabilityTimeSlots,
    availableSlotIds,
    calculatedDates,
    stats,
    isLoading: isLoadingAvailability,
    error: availabilityError,
    checkAvailability,
    checkSlotAvailability,
    getSlotStatus,
  } = useAvailabilityConfiguration();

  // 🔄 Auto-consultar cuando cambie la configuración
  useEffect(() => {
    console.log('🔍 Availability config changed:', availabilityConfig);
    checkAvailability(availabilityConfig);
  }, [availabilityConfig, checkAvailability]);

  // Generar timeSlots con estado de disponibilidad
  const timeSlots = useMemo(() => {
    return generateTimeSlots((hour) => getSlotStatus(hour));
  }, [getSlotStatus]);

  // MEJORA PRIORIDAD BAJA: Detectar primera visita para onboarding
  useEffect(() => {
    const hasVisited = localStorage.getItem('reservations-visited');
    if (!hasVisited) {
      setShowOnboarding(true);
      setIsFirstTime(true);
      localStorage.setItem('reservations-visited', 'true');
    } else {
      setIsFirstTime(false);
    }
  }, []);



  // Tracking de slots seleccionados localmente
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());

  // MEJORA PRIORIDAD MEDIA: Wizard steps logic
  const steps = [
    {
      number: 1,
      title: "Selecciona la fecha",
      description: "¿Cuándo quieres hacer tu reserva?",
      isCompleted: !!dateRange.from,
      isActive: currentStep === 1,
    },
    {
      number: 2,
      title: "Elige tus horarios",
      description: "Selecciona las horas que prefieras",
      isCompleted: selectedSlots.size > 0,
      isActive: currentStep === 2,
    },
    {
      number: 3,
      title: "Confirma tu reserva",
      description: "Revisa y confirma los detalles",
      isCompleted: false,
      isActive: currentStep === 3,
    },
  ];

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const toggleTimeSlot = (hour: number) => {
    if (!checkSlotAvailability(hour)) {
      toast.error(`${formatHourHuman(hour)} ya está ocupado`);
      return;
    }

    setSelectedSlots(prev => {
      const newSelectedSlots = new Set(prev);
      
      if (newSelectedSlots.has(hour)) {
        newSelectedSlots.delete(hour);
      } else {
        newSelectedSlots.add(hour);
      }

      const selectedHours = Array.from(newSelectedSlots);
      setConfig(prevConfig => ({
        ...prevConfig,
        timeSlots: selectedHours,
      }));

      // MEJORA: Auto-avanzar al siguiente paso cuando se selecciona algo
      if (newSelectedSlots.size > 0 && currentStep === 2) {
        setTimeout(() => {
          if (currentStep === 2) nextStep();
        }, 1000);
      }

      return newSelectedSlots;
    });
  };

  // MEJORA PRIORIDAD MEDIA: Shortcuts inteligentes mejorados
  const applySmartShortcut = (shortcutId: string) => {
    const shortcut = SMART_SHORTCUTS.find(s => s.id === shortcutId);
    if (!shortcut) return;

    const availableHours = shortcut.hours.filter(hour => checkSlotAvailability(hour));
    
    if (availableHours.length === 0) {
      toast.warning(`No hay horarios disponibles para "${shortcut.name}"`);
      return;
    }
    
    setSelectedSlots(new Set(availableHours));
    setConfig(prevConfig => ({
      ...prevConfig,
      timeSlots: availableHours,
    }));
    
    toast.success(`✨ ${shortcut.icon} ${shortcut.name} aplicado (${availableHours.length} horarios)`);
  };

  const selectPeriodHours = (periodId: string) => {
    const period = TIME_PERIODS.find(p => p.id === periodId);
    if (!period) return;

    const availablePeriodHours = period.hours.filter(hour => checkSlotAvailability(hour));
    
    if (availablePeriodHours.length === 0) {
      toast.warning(`No hay horarios disponibles en ${period.name.split(' ')[1]}`);
      return;
    }
    
    setSelectedSlots(prev => {
      const newSet = new Set(prev);
      availablePeriodHours.forEach(hour => newSet.add(hour));
      return newSet;
    });
    
    setConfig(prevConfig => ({
      ...prevConfig,
      timeSlots: Array.from(new Set([...prevConfig.timeSlots, ...availablePeriodHours])),
    }));
    
    toast.success(`Seleccionados ${availablePeriodHours.length} horarios en ${period.name.split(' ')[1]}`);
  };

  // Resto de funciones (sin cambios de funcionalidad, solo mejoras UX)
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
    
    // MEJORA: Auto-avanzar al siguiente paso cuando se selecciona fecha
    if (currentStep === 1) {
      setTimeout(() => {
        nextStep();
      }, 500);
    }
  };

  const handleEndDateChange = (dateStr: string) => {
    if (dateRange.from && dateStr < dateRange.from) {
      return;
    }
    setDateRange((prev) => ({ ...prev, to: dateStr }));
    setConfig((prev) => ({ ...prev, endDate: dateStr }));
  };

  const formatDateSafe = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy");
    } catch {
      return dateStr;
    }
  };

  // FIXED: Lógica de reservas con refetch manual
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

    const selectedSlotsArray = Array.from(selectedSlots);
    const unavailableSlots = selectedSlotsArray.filter(slot => !checkSlotAvailability(slot));
    
    if (unavailableSlots.length > 0) {
      toast.error(`Los siguientes horarios ya no están disponibles: ${unavailableSlots.map(s => formatHourHuman(s)).join(", ")}`);
      
      setSelectedSlots(prev => {
        const newSet = new Set(prev);
        unavailableSlots.forEach(slot => newSet.delete(slot));
        return newSet;
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("FlexibleScheduler: Creando reservas múltiples");
      
      const command: CreateReservationDto = {
        subScenarioId,
        timeSlotIds: selectedSlotsArray,
        reservationRange: {
          initialDate: reservationDate,
          finalDate: dateRange.to,
        },
      };

      if (selectedWeekdays.length > 0) {
        command.weekdays = selectedWeekdays;
      }

      console.log("FlexibleScheduler: Enviando comando:", command);

      const result = await createReservation(command);

      if (!result.success) {
        if (result.error?.includes('conflicto') || result.error?.includes('ocupado')) {
          toast.error("Algunos horarios fueron ocupados por otro usuario. Refrescando disponibilidad...");
          await checkAvailability(availabilityConfig);
        } else {
          toast.error(result.error || "Error desconocido al crear la reserva");
        }
        return;
      }

      toast.success(
        `¡${selectedSlotsArray.length} reserva${selectedSlotsArray.length > 1 ? "s" : ""} realizada${selectedSlotsArray.length > 1 ? "s" : ""} con éxito!`
      );
      
      setSelectedSlots(new Set());
      setConfig((prev) => ({ ...prev, timeSlots: [] }));
      // Refetch disponibilidad
      await checkAvailability(availabilityConfig);
      setCurrentStep(1); // Reset wizard
      
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
    return selectedSlots.size;
  };

  const clearAllTimeSlots = () => {
    setSelectedSlots(new Set());
    setConfig((prevConfig) => ({
      ...prevConfig,
      timeSlots: [],
    }));
  };

  const togglePeriodExpansion = (periodId: string) => {
    setExpandedPeriods(prev => ({
      ...prev,
      [periodId]: !prev[periodId]
    }));
  };

  return (
    <div className="w-full px-2 sm:px-4 lg:px-8 space-y-4 sm:space-y-6">
      {/* MEJORA PRIORIDAD BAJA: Onboarding modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlayCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Bienvenido! 🎉</h2>
              <p className="text-gray-600">
                Te guiaremos paso a paso para hacer tu primera reserva de forma súper fácil.
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              {steps.map((step) => (
                <OnboardingStep
                  key={step.number}
                  step={step.number}
                  title={step.title}
                  description={step.description}
                  isActive={false}
                  isCompleted={false}
                />
              ))}
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowOnboarding(false)}
              >
                Saltar tutorial
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowOnboarding(false)}
              >
                ¡Empezar!
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card className="border-2 shadow-lg transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Reserva tu horario
            {isLoadingAvailability && (
              <FiLoader className="h-4 w-4 animate-spin text-blue-500" />
            )}
            
            {/* MEJORA: Help button con tooltip */}
            <Tooltip content="Selecciona una fecha y horarios para crear tu reserva. ¡Es súper fácil!" side="bottom">
              <Button variant="ghost" size="sm" className="ml-auto">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </Tooltip>
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Primero, elige cuándo quieres reservar"}
            {currentStep === 2 && "Ahora, selecciona tus horarios preferidos"}
            {currentStep === 3 && "¡Perfecto! Revisa y confirma tu reserva"}
            {availabilityError && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                Error al cargar disponibilidad: {availabilityError}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Opciones avanzadas */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="date-range-mode"
                checked={config.hasDateRange}
                onCheckedChange={handleDateRangeToggle}
              />
              <Label htmlFor="date-range-mode" className="text-base font-medium">
                Reservar varios días
              </Label>
              <Tooltip content="Activa esta opción si quieres reservar el mismo horario para múltiples días" side="top">
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </Tooltip>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-4 w-4 mr-2" />
              {showAdvancedOptions ? "Ocultar opciones" : "Más opciones"}
              {showAdvancedOptions ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>
          </div>

          {/* Configuración de fechas */}
          {!config.hasDateRange ? (
            /* MEJORA PRIORIDAD MEDIA: Layout wizard mejorado */
            <div className="space-y-6">
              {/* Paso 1: Fecha */}
              <div className={`transition-all duration-300 ${currentStep === 1 ? "opacity-100" : currentStep > 1 ? "opacity-75" : "opacity-50"}`}>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Label className="text-lg font-semibold">
                        ¿Cuándo quieres reservar?
                      </Label>
                      {currentStep > 1 && dateRange.from && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {formatDateSafe(dateRange.from)}
                        </Badge>
                      )}
                    </div>
                    <SimpleCalendar
                      selectedDate={dateRange.from || getTodayISO()}
                      onDateChange={handleStartDateChange}
                    />
                  </div>

                  {/* Paso 2: Horarios (solo mostrar si paso 1 completado) */}
                  {currentStep >= 2 && (
                    <div className={`transition-all duration-500 ${currentStep === 2 ? "opacity-100" : "opacity-75"}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-lg font-semibold">
                            Elige tus horarios
                          </Label>
                          <Badge variant="outline" className="text-sm">
                            {availableSlotIds.length} disponibles
                          </Badge>
                        </div>
                      </div>

                      {/* MEJORA PRIORIDAD MEDIA: Smart Shortcuts */}
                      {/* <div className="mb-4">
                        <Label className="text-sm font-medium mb-2 block">✨ Atajos inteligentes:</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {SMART_SHORTCUTS.slice(0, 3).map((shortcut) => (
                            <Tooltip key={shortcut.id} content={shortcut.description} side="bottom">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8 transition-all duration-200 hover:scale-105"
                                onClick={() => applySmartShortcut(shortcut.id)}
                                disabled={isLoadingAvailability}
                              >
                                {shortcut.icon} {shortcut.name.split(' ')[1]}
                              </Button>
                            </Tooltip>
                          ))}
                        </div>
                      </div> */}

                      {/* Horarios agrupados por períodos */}
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {TIME_PERIODS.map((period) => {
                          const periodSlots = timeSlots.filter(slot => period.hours.includes(slot.hour));
                          const availableInPeriod = periodSlots.filter(slot => slot.status === 'available').length;
                          const selectedInPeriod = periodSlots.filter(slot => selectedSlots.has(slot.hour)).length;
                          const IconComponent = period.icon;
                          
                          return (
                            <div key={period.id} className={`border rounded-lg ${period.color} transition-all duration-300 hover:shadow-md`}>
                              <div 
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-black/5 rounded-t-lg transition-all duration-200"
                                onClick={() => togglePeriodExpansion(period.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="h-5 w-5" />
                                    <span className="font-medium">{period.name}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {period.description}
                                    </span>
                                  </div>
                                  {availableInPeriod > 0 && (
                                    <Tooltip content={`Seleccionar todos los horarios disponibles de ${period.name.split(' ')[1]}`} side="top">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs h-6 px-2 transition-all duration-200 hover:scale-105"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          selectPeriodHours(period.id);
                                        }}
                                      >
                                        + Seleccionar todo
                                      </Button>
                                    </Tooltip>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {selectedInPeriod > 0 && (
                                    <Badge variant="secondary" className="text-xs animate-pulse">
                                      {selectedInPeriod} seleccionado{selectedInPeriod > 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {availableInPeriod}/{period.hours.length} disponibles
                                  </Badge>
                                  <div className={`transition-transform duration-200 ${expandedPeriods[period.id] ? "rotate-180" : ""}`}>
                                    <ChevronDown className="h-4 w-4" />
                                  </div>
                                </div>
                              </div>

                              {/* MEJORA PRIORIDAD BAJA: Animación de expansión */}
                              <div className={`overflow-hidden transition-all duration-300 ${
                                expandedPeriods[period.id] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                              }`}>
                                <div className="p-3 pt-0 grid grid-cols-2 gap-2">
                                  {periodSlots.map((slot) => {
                                    const isSelected = selectedSlots.has(slot.hour);
                                    const isAvailable = slot.status === 'available';
                                    const isOccupied = slot.status === 'occupied';
                                    const isUnknown = slot.status === 'unknown';
                                    
                                    return (
                                      <Button
                                        key={slot.hour}
                                        variant={isSelected ? "secondary" : "outline"}
                                        disabled={isOccupied || isLoadingAvailability}
                                        className={`h-10 text-sm transition-all duration-200 relative hover:scale-105 ${
                                          isSelected
                                            ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200 shadow-md"
                                            : isOccupied
                                            ? "opacity-50 cursor-not-allowed bg-red-50 border-red-200 text-red-400"
                                            : isUnknown
                                            ? "opacity-70 bg-gray-50"
                                            : "hover:bg-green-50 border-green-200 bg-white hover:shadow-md"
                                        }`}
                                        onClick={() => toggleTimeSlot(slot.hour)}
                                      >
                                        {isSelected && <Check className="h-4 w-4 mr-2 text-green-600" />}
                                        {isOccupied && <X className="h-4 w-4 mr-2 text-red-500" />}
                                        {isUnknown && isLoadingAvailability && <FiLoader className="h-4 w-4 mr-2 animate-spin" />}
                                        {slot.label}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Mensajes informativos mejorados */}
                      {isLoadingAvailability && (
                        <div className="text-center py-4 animate-pulse">
                          <FiLoader className="h-6 w-6 animate-spin mx-auto text-blue-500 mb-2" />
                          <p className="text-sm text-blue-600">Consultando disponibilidad...</p>
                        </div>
                      )}
                      
                      {!isLoadingAvailability && availableSlotIds.length === 0 && (
                        <div className="text-center py-6 animate-in fade-in duration-500">
                          <div className="text-6xl mb-4">😔</div>
                          <p className="text-sm text-red-600 font-medium">No hay horarios disponibles para esta fecha</p>
                          <p className="text-xs text-muted-foreground mt-1">Intenta con otra fecha</p>
                        </div>
                      )}
                      
                      {!isLoadingAvailability && getSelectedTimeSlotsCount() === 0 && availableSlotIds.length > 0 && (
                        <div className="text-center py-4">
                          <div className="text-4xl mb-2">👆</div>
                          <p className="text-sm text-gray-500">Selecciona un horario disponible para continuar</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Paso 3: Resumen y confirmación */}
              {currentStep >= 3 && dateRange.from && getSelectedTimeSlotsCount() > 0 && (
                <div className={`transition-all duration-500 ${currentStep === 3 ? "opacity-100" : "opacity-75"}`}>
                  <div className="p-6 border-2 border-green-200 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 animate-in slide-in-from-bottom duration-500">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-6 w-6 text-green-600" />
                      <Label className="font-bold text-green-800 text-lg">
                        ¡Tu reserva está casi lista!
                      </Label>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-green-700 mb-2">
                          <strong>Fecha:</strong> {formatDateSafe(dateRange.from)}
                        </p>
                        <p className="text-sm text-green-700 mb-3">
                          <strong>Horarios:</strong> {getSelectedTimeSlotsCount()} seleccionado{getSelectedTimeSlotsCount() > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(selectedSlots).sort((a, b) => a - b).map((hour) => (
                          <Badge
                            key={hour}
                            variant="secondary"
                            className="text-xs bg-green-100 text-green-700 border-green-300 animate-in zoom-in duration-300"
                          >
                            {formatHourHuman(hour)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MEJORA PRIORIDAD MEDIA: Navegación de wizard */}
              {!config.hasDateRange && (
                <div className="flex justify-between items-center pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="transition-all duration-200"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    {currentStep === 1 && "Selecciona una fecha para continuar"}
                    {currentStep === 2 && "Elige tus horarios preferidos"}
                    {currentStep === 3 && "¡Todo listo para confirmar!"}
                  </div>
                  
                  {currentStep < 3 ? (
                    <Button
                      onClick={nextStep}
                      disabled={
                        (currentStep === 1 && !dateRange.from) ||
                        (currentStep === 2 && getSelectedTimeSlotsCount() === 0)
                      }
                      className="transition-all duration-200"
                    >
                      Siguiente
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <div /> // Spacer
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Layout para rango de fechas (versión simplificada) */
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    Fecha de inicio
                  </Label>
                  <SimpleCalendar
                    selectedDate={dateRange.from || getTodayISO()}
                    onDateChange={handleStartDateChange}
                  />
                </div>
                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    Fecha de finalización
                  </Label>
                  <SimpleCalendar
                    selectedDate={dateRange.to || getTodayISO()}
                    onDateChange={handleEndDateChange}
                  />
                </div>
              </div>

              {/* Opciones avanzadas para rango */}
              {showAdvancedOptions && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="weekday-selection-mode"
                      checked={config.hasWeekdaySelection}
                      onCheckedChange={handleWeekdaySelectionToggle}
                    />
                    <Label htmlFor="weekday-selection-mode" className="text-base font-medium">
                      Seleccionar días específicos de la semana
                    </Label>
                    <Tooltip content="Si activas esta opción, solo se reservarán los días de la semana que selecciones" side="top">
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </div>

                  {config.hasWeekdaySelection && (
                    <div>
                      <Label className="text-base font-medium">Días de la semana</Label>
                      <div className="grid grid-cols-7 gap-2 mt-3">
                        {WEEKDAYS.map((weekday) => (
                          <Button
                            key={weekday.value}
                            variant={selectedWeekdays.includes(weekday.value) ? "secondary" : "outline"}
                            size="sm"
                            className={`h-12 flex flex-col transition-all duration-200 hover:scale-105 ${
                              selectedWeekdays.includes(weekday.value)
                                ? "bg-blue-100 text-blue-700 border-blue-300"
                                : "hover:bg-muted"
                            }`}
                            onClick={() => handleWeekdayToggle(weekday.value)}
                          >
                            <span className="text-xs">{weekday.short}</span>
                            <span className="text-xs">{weekday.label.slice(0, 3)}</span>
                          </Button>
                        ))}
                      </div>

                      {selectedWeekdays.length > 0 && (
                        <div className="mt-3">
                          <Label>Días seleccionados:</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedWeekdays.map((weekday) => (
                              <Badge key={weekday} variant="secondary" className="bg-blue-100 text-blue-700 animate-in zoom-in duration-300">
                                {WEEKDAYS.find((w) => w.value === weekday)?.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Horarios para rango (similar estructura pero sin wizard) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-semibold">Elige tus horarios</Label>
                  <Badge variant="outline" className="text-sm">
                    {availableSlotIds.length} disponibles
                  </Badge>
                </div>

                {/* Smart Shortcuts para rango */}
                <div className="mb-4">
                  <Label className="text-sm font-medium mb-2 block">✨ Atajos inteligentes:</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SMART_SHORTCUTS.map((shortcut) => (
                      <Tooltip key={shortcut.id} content={shortcut.description} side="bottom">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8 transition-all duration-200 hover:scale-105"
                          onClick={() => applySmartShortcut(shortcut.id)}
                          disabled={isLoadingAvailability}
                        >
                          {shortcut.icon}
                          <span className="hidden sm:inline ml-1">{shortcut.name.split(' ')[1]}</span>
                        </Button>
                      </Tooltip>
                    ))}
                  </div>
                </div>

                {/* Períodos de tiempo (misma estructura que el wizard) */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {TIME_PERIODS.map((period) => {
                    const periodSlots = timeSlots.filter(slot => period.hours.includes(slot.hour));
                    const availableInPeriod = periodSlots.filter(slot => slot.status === 'available').length;
                    const selectedInPeriod = periodSlots.filter(slot => selectedSlots.has(slot.hour)).length;
                    const IconComponent = period.icon;
                    
                    return (
                      <div key={period.id} className={`border rounded-lg ${period.color} transition-all duration-300 hover:shadow-md`}>
                        <div 
                          className="flex items-center justify-between p-3 cursor-pointer hover:bg-black/5 rounded-t-lg transition-all duration-200"
                          onClick={() => togglePeriodExpansion(period.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-5 w-5" />
                              <span className="font-medium">{period.name}</span>
                              <span className="text-sm text-muted-foreground">{period.description}</span>
                            </div>
                            {availableInPeriod > 0 && (
                              <Tooltip content={`Seleccionar todos los horarios disponibles de ${period.name.split(' ')[1]}`} side="top">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs h-6 px-2 transition-all duration-200 hover:scale-105"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectPeriodHours(period.id);
                                  }}
                                >
                                  + Seleccionar todo
                                </Button>
                              </Tooltip>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedInPeriod > 0 && (
                              <Badge variant="secondary" className="text-xs animate-pulse">
                                {selectedInPeriod} seleccionado{selectedInPeriod > 1 ? 's' : ''}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {availableInPeriod}/{period.hours.length} disponibles
                            </Badge>
                            <div className={`transition-transform duration-200 ${expandedPeriods[period.id] ? "rotate-180" : ""}`}>
                              <ChevronDown className="h-4 w-4" />
                            </div>
                          </div>
                        </div>

                        <div className={`overflow-hidden transition-all duration-300 ${
                          expandedPeriods[period.id] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}>
                          <div className="p-3 pt-0 grid grid-cols-2 gap-2">
                            {periodSlots.map((slot) => {
                              const isSelected = selectedSlots.has(slot.hour);
                              const isAvailable = slot.status === 'available';
                              const isOccupied = slot.status === 'occupied';
                              const isUnknown = slot.status === 'unknown';
                              
                              return (
                                <Button
                                  key={slot.hour}
                                  variant={isSelected ? "secondary" : "outline"}
                                  disabled={isOccupied || isLoadingAvailability}
                                  className={`h-10 text-sm transition-all duration-200 relative hover:scale-105 ${
                                    isSelected
                                      ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200 shadow-md"
                                      : isOccupied
                                      ? "opacity-50 cursor-not-allowed bg-red-50 border-red-200 text-red-400"
                                      : isUnknown
                                      ? "opacity-70 bg-gray-50"
                                      : "hover:bg-green-50 border-green-200 bg-white hover:shadow-md"
                                  }`}
                                  onClick={() => toggleTimeSlot(slot.hour)}
                                >
                                  {isSelected && <Check className="h-4 w-4 mr-2 text-green-600" />}
                                  {isOccupied && <X className="h-4 w-4 mr-2 text-red-500" />}
                                  {isUnknown && isLoadingAvailability && <FiLoader className="h-4 w-4 mr-2 animate-spin" />}
                                  {slot.label}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mensajes informativos */}
                {isLoadingAvailability && (
                  <div className="text-center py-4 animate-pulse">
                    <FiLoader className="h-6 w-6 animate-spin mx-auto text-blue-500 mb-2" />
                    <p className="text-sm text-blue-600">Consultando disponibilidad...</p>
                  </div>
                )}
                
                {!isLoadingAvailability && availableSlotIds.length === 0 && (
                  <div className="text-center py-6 animate-in fade-in duration-500">
                    <div className="text-6xl mb-4">😔</div>
                    <p className="text-sm text-red-600 font-medium">No hay horarios disponibles</p>
                    <p className="text-xs text-muted-foreground mt-1">Intenta con otras fechas</p>
                  </div>
                )}
                
                {!isLoadingAvailability && getSelectedTimeSlotsCount() === 0 && availableSlotIds.length > 0 && (
                  <div className="text-center py-4">
                    <div className="text-4xl mb-2">👆</div>
                    <p className="text-sm text-gray-500">Selecciona horarios para continuar</p>
                  </div>
                )}

                {/* Resumen para rango */}
                {dateRange.from && getSelectedTimeSlotsCount() > 0 && (
                  <div className="mt-4 p-4 border-2 border-green-200 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 animate-in slide-in-from-bottom duration-500">
                    <Label className="font-semibold text-green-800">Tu reserva:</Label>
                    <p className="text-sm text-green-700 mt-2">
                      {!config.hasDateRange
                        ? `${formatDateSafe(dateRange.from)} • ${getSelectedTimeSlotsCount()} horario${getSelectedTimeSlotsCount() > 1 ? 's' : ''}`
                        : config.hasWeekdaySelection && selectedWeekdays.length > 0
                        ? `${formatDateSafe(dateRange.from)}${dateRange.to ? ` - ${formatDateSafe(dateRange.to)}` : ""} • 📆 ${selectedWeekdays.map((w) => WEEKDAYS.find((wd) => wd.value === w)?.label).join(", ")} • ${getSelectedTimeSlotsCount()} horario${getSelectedTimeSlotsCount() > 1 ? 's' : ''}`
                        : `${formatDateSafe(dateRange.from)}${dateRange.to ? ` - ${formatDateSafe(dateRange.to)}` : ""} • ${getSelectedTimeSlotsCount()} horario${getSelectedTimeSlotsCount() > 1 ? 's' : ''}`}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Array.from(selectedSlots).sort((a, b) => a - b).map((hour) => (
                        <Badge key={hour} variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-300 animate-in zoom-in duration-300">
                          {formatHourHuman(hour)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MEJORA PRIORIDAD BAJA: Botón de confirmación súper atractivo con animaciones */}
          <div className="relative">
            {/* FIXED: Efecto de glow DETRÁS del botón para no bloquear clicks */}
            {getSelectedTimeSlotsCount() > 0 && !isSubmitting && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg blur-xl opacity-20 -z-10 pointer-events-none" />
            )}
            
            <Button
              className={`relative w-full font-semibold py-4 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl z-10 ${
                getSelectedTimeSlotsCount() > 0 
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg" 
                  : "bg-gray-300 text-gray-600"
              }`}
              size="lg"
              onClick={onSubmit}
              disabled={getSelectedTimeSlotsCount() === 0 || isSubmitting || isLoadingAvailability}
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="h-5 w-5 mr-2 animate-spin" />
                  Procesando tu reserva...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Confirmar mi reserva ({getSelectedTimeSlotsCount()} horario{getSelectedTimeSlotsCount() !== 1 ? 's' : ''})
                </>
              )}
            </Button>
          </div>

          {/* MEJORA PRIORIDAD MEDIA: Clear button mejorado */}
          {getSelectedTimeSlotsCount() > 0 && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllTimeSlots}
                className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
              >
                Limpiar selección
              </Button>
            </div>
          )}
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
