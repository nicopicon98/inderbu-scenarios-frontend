"use client";

import { useState, useEffect } from "react";
import { SimpleLayout } from "@/shared/components/layout/simple-layout";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Switch } from "@/shared/ui/switch";
import { Badge } from "@/shared/ui/badge";
import { FilterToolbar } from "@/shared/ui/filter-toolbar";
import { DataTable } from "@/shared/ui/data-table";
import { StatusBadge } from "@/shared/ui/status-badge";
import { Modal } from "@/shared/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/shared/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  FileEdit,
  Search,
  Filter,
  Download,
  Printer,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "@/shared/hooks/use-toast";

// Servicios
import ReservationService, {
  ReservationDto,
} from "@/services/reservation.service";
import UserService, { UserDto } from "@/services/user.service";
import ScenarioService, {
  ScenarioDto,
  SubScenarioDto,
} from "@/services/scenario.service";
import TimeSlotService, { TimeSlotDto } from "@/services/time-slot.service";

// Utilidades
import {
  mapReservationState,
  getReservationStateId,
  formatDate,
} from "@/utils/reservation.utils";

/* -------------------------------------------------------------------------- */
/*                              Filter options                                */
/* -------------------------------------------------------------------------- */

const filterOptions: {
  id: string;
  label: string;
  type: "select" | "text" | "date";
  placeholder?: string;
  options?: { value: string; label: string }[];
}[] = [
  // Eliminamos el filtro de código/ID para evitar brechas de seguridad
  {
    id: "venue",
    label: "Escenario",
    type: "select",
    placeholder: "Todos los escenarios...",
    options: [
      { value: "all", label: "Todos los escenarios..." },
      // Estas opciones se cargarán dinámicamente
    ],
  },
  {
    id: "neighborhood",
    label: "Barrio",
    type: "select",
    placeholder: "Todos los barrios...",
    options: [
      { value: "all", label: "Todos los barrios..." },
      // Estas opciones se cargarán dinámicamente
    ],
  },
  {
    id: "client",
    label: "Clientes",
    type: "select",
    placeholder: "Todos los clientes...",
    options: [
      { value: "all", label: "Todos los clientes..." },
      // Estas opciones se cargarán dinámicamente
    ],
  },
  {
    id: "dateType",
    label: "Fecha",
    type: "select",
    placeholder: "Reserva",
    options: [
      { value: "reservation", label: "Reserva" },
      { value: "created", label: "Creado" },
    ],
  },
  {
    id: "dateFrom",
    label: "Desde",
    type: "date",
  },
  {
    id: "dateTo",
    label: "Hasta",
    type: "date",
  },
  {
    id: "status",
    label: "Estado",
    type: "select",
    placeholder: "Todos los estados...",
    options: [
      { value: "all", label: "Todos los estados..." },
      { value: "approved", label: "Aprobada" },
      { value: "pending", label: "Pendiente" },
      { value: "rejected", label: "Rechazada" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*                                Component                                   */
/* -------------------------------------------------------------------------- */

export default function ReservationsPage() {
  // Estados
  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<
    ReservationDto[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioDto[]>([]);
  const [subScenarios, setSubScenarios] = useState<SubScenarioDto[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlotDto[]>([]);
  const [statsData, setStatsData] = useState({
    totalReservations: 0,
    todayReservations: 0,
    activeScenarios: 0,
    registeredClients: 0,
  });

  // Estados UI
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationDto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Estado para nueva reserva
  const [newReservation, setNewReservation] = useState({
    clientId: "",
    subScenarioId: "",
    scenarioId: "",
    timeSlotId: "",
    reservationDate: new Date().toISOString().split("T")[0],
    comments: "",
    status: true,
  });

  // Estado para reserva en edición
  const [editingReservation, setEditingReservation] = useState({
    id: 0,
    date: "",
    timeSlotId: 0,
    reservationStateId: 1,
    observations: "",
  });

  // Estados para controlar disponibilidad en creación de reserva
  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    { id: number; startTime: string; endTime: string; available: boolean }[]
  >([]);
  const [subScenariosForScenario, setSubScenariosForScenario] = useState<
    SubScenarioDto[]
  >([]);

  // Carga inicial de datos
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Cargar reservaciones
        const reservationsData = await ReservationService.getAllReservations();
        console.log(reservationsData);
        setReservations(reservationsData);
        setFilteredReservations(reservationsData);

        // Cargar usuarios/clientes
        const usersData = await UserService.getAllUsers();
        setUsers(usersData);

        // Cargar escenarios y subescenarios
        const scenariosData = await ScenarioService.getAllScenarios();
        setScenarios(scenariosData);

        const allSubScenarios = scenariosData.flatMap(
          (s) => s.subScenarios || []
        );
        setSubScenarios(allSubScenarios);

        // Cargar timeslots
        const timeSlotsData = await TimeSlotService.getAllTimeSlots();
        setTimeSlots(timeSlotsData);

        // Calcular estadísticas
        calculateStats(reservationsData, scenariosData, usersData);
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast({
          title: "Error",
          description:
            "No se pudieron cargar los datos. Intente de nuevo más tarde.",
          duration: 3000,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculamos las estadísticas
  const calculateStats = (
    reservations: ReservationDto[],
    scenarios: ScenarioDto[],
    users: UserDto[]
  ) => {
    const today = new Date().toISOString().split("T")[0];
    const todayReservations = reservations.filter(
      (r) => r.reservationDate === today
    ).length;

    const activeScenarios = scenarios.reduce((total, scenario) => {
      return (
        total + (scenario.subScenarios?.filter((ss) => ss.active)?.length || 0)
      );
    }, 0);

    setStatsData({
      totalReservations: reservations.length,
      todayReservations,
      activeScenarios,
      registeredClients: users.length,
    });
  };

  // Manejador para abrir el drawer de edición
  const handleOpenDrawer = (reservation: ReservationDto) => {
    setSelectedReservation(reservation);
    setEditingReservation({
      id: reservation.id,
      date: reservation.reservationDate,
      timeSlotId: reservation.timeSlotId ?? 1,
      reservationStateId: reservation.reservationStateId ?? 1,
      observations: "", // Asumimos que este campo no existe en el modelo actual
    });
    setIsDrawerOpen(true);
  };

  // Manejador de búsqueda y filtros
  const handleSearch = (appliedFilters: Record<string, string>) => {
    setFilters(appliedFilters);

    let filtered = [...reservations];

    // El filtro por ID fue eliminado para mejorar la seguridad

    if (appliedFilters.venue && appliedFilters.venue !== "all") {
      filtered = filtered.filter(
        (r) => r.subScenario?.scenario?.id.toString() === appliedFilters.venue
      );
    }

    if (appliedFilters.neighborhood && appliedFilters.neighborhood !== "all") {
      filtered = filtered.filter(
        (r) =>
          r.subScenario?.scenario?.neighborhood?.id.toString() ===
          appliedFilters.neighborhood
      );
    }

    if (appliedFilters.client && appliedFilters.client !== "all") {
      filtered = filtered.filter(
        (r) => r.user.id.toString() === appliedFilters.client
      );
    }

    if (appliedFilters.dateFrom) {
      filtered = filtered.filter(
        (r) => r.reservationDate >= appliedFilters.dateFrom
      );
    }

    if (appliedFilters.dateTo) {
      filtered = filtered.filter(
        (r) => r.reservationDate <= appliedFilters.dateTo
      );
    }

    if (appliedFilters.status && appliedFilters.status !== "all") {
      const stateMap: Record<string, number[]> = {
        approved: [2], // CONFIRMADA
        pending: [1], // PENDIENTE
        rejected: [3], // RECHAZADA
      };

      if (stateMap[appliedFilters.status]) {
        filtered = filtered.filter((r) =>
          stateMap[appliedFilters.status].includes(r.reservationState.id)
        );
      }
    }

    setFilteredReservations(filtered);
    setShowFilters(false);
  };

  // Manejador para limpiar filtros
  const handleClearFilters = () => {
    setFilters({});
    setFilteredReservations(reservations);
  };

  // Manejador para búsqueda rápida
  const handleQuickSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();

    if (!searchTerm) {
      setFilteredReservations(reservations);
      return;
    }

    // Eliminamos la búsqueda por ID y nos centramos en campos descriptivos para mayor seguridad
    const filtered = reservations.filter(
      (r) =>
        r.user?.first_name?.toLowerCase().includes(searchTerm) ||
        r.user?.last_name?.toLowerCase().includes(searchTerm) ||
        r.user?.email?.toLowerCase().includes(searchTerm) ||
        r.subScenario?.name?.toLowerCase().includes(searchTerm) ||
        r.subScenario?.scenarioName?.toLowerCase().includes(searchTerm)
    );

    setFilteredReservations(filtered);
  };

  // Manejador para cambio de escenario en nueva reserva
  const handleScenarioChange = async (scenarioId: string) => {
    if (!scenarioId) {
      setSubScenariosForScenario([]);
      setNewReservation((prev) => ({
        ...prev,
        scenarioId: "",
        subScenarioId: "",
      }));
      return;
    }

    try {
      // Si estamos usando los datos mockeados
      const scenarioData = scenarios.find(
        (s) => s.id.toString() === scenarioId
      );
      const filteredSubScenarios = scenarioData?.subScenarios || [];
      setSubScenariosForScenario(filteredSubScenarios);
      setNewReservation((prev) => ({
        ...prev,
        scenarioId,
        subScenarioId: "", // Resetear el subescenario al cambiar el escenario
      }));
    } catch (error) {
      console.error(
        `Error loading subscenarios for scenario ${scenarioId}:`,
        error
      );
      toast({
        title: "Error",
        description:
          "No se pudieron cargar los subescenarios. Intente de nuevo más tarde.",
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  // Manejador para cambio de subescenario o fecha en nueva reserva
  const handleAvailabilityCheck = async () => {
    const { subScenarioId, reservationDate } = newReservation;

    if (!subScenarioId || !reservationDate) {
      setAvailableTimeSlots([]);
      return;
    }

    try {
      // Obtener slots disponibles desde el servicio
      const slots = await ReservationService.getAvailableTimeSlots(
        parseInt(subScenarioId),
        reservationDate
      );
      setAvailableTimeSlots(slots);
    } catch (error: any) {
      console.error("Error checking availability:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          "No se pudo verificar la disponibilidad. Usando datos de ejemplo.",
        duration: 3000,
        variant: "default",
      });
      // Si falla, usamos un mock de timeslots para desarrollo
      setAvailableTimeSlots(
        timeSlots.map((ts) => ({
          id: ts.id,
          startTime: ts.startTime,
          endTime: ts.endTime,
          available: Math.random() > 0.3, // Simulamos disponibilidad aleatoria
        }))
      );
    }
  };

  // Efecto para verificar disponibilidad cuando cambia el subescenario o la fecha
  useEffect(() => {
    if (newReservation.subScenarioId && newReservation.reservationDate) {
      handleAvailabilityCheck();
    }
  }, [newReservation.subScenarioId, newReservation.reservationDate]);

  // Crear nueva reserva
  const handleCreateReservation = async () => {
    const { clientId, subScenarioId, timeSlotId, reservationDate } =
      newReservation;

    if (!clientId || !subScenarioId || !timeSlotId || !reservationDate) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos obligatorios.",
        duration: 3000,
        variant: "destructive",
      });
      return;
    }

    try {
      // Preparar payload según lo requiere el backend
      const payload = {
        subScenarioId: parseInt(subScenarioId),
        timeSlotId: parseInt(timeSlotId),
        reservationDate,
      };

      console.log("Creating reservation with payload:", payload);

      // Llamada al servicio
      const newReservationData = await ReservationService.createReservation(
        payload
      );

      // Si todo sale bien, cerramos el modal y actualizamos las reservas
      toast({
        title: "Éxito",
        description: "Reserva creada correctamente.",
        duration: 3000,
      });

      // Recargar reservas
      const updatedReservations = await ReservationService.getAllReservations();
      setReservations(updatedReservations);
      setFilteredReservations(updatedReservations);

      // Reset formulario y cerrar modal
      setNewReservation({
        clientId: "",
        subScenarioId: "",
        scenarioId: "",
        timeSlotId: "",
        reservationDate: new Date().toISOString().split("T")[0],
        comments: "",
        status: true,
      });

      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          "No se pudo crear la reserva. Intente de nuevo más tarde.",
        duration: 5000,
        variant: "destructive",
      });
    }
  };

  // Actualizar reserva
  const handleUpdateReservation = async () => {
    if (!selectedReservation) return;

    try {
      // Actualizar estado de reserva
      await ReservationService.updateReservationState(
        selectedReservation.id,
        editingReservation.reservationStateId
      );

      toast({
        title: "Éxito",
        description: "Reserva actualizada correctamente.",
        duration: 3000,
      });

      // Recargar reservas
      const updatedReservations = await ReservationService.getAllReservations();
      setReservations(updatedReservations);
      setFilteredReservations(updatedReservations);

      setIsDrawerOpen(false);
    } catch (error: any) {
      console.error("Error updating reservation:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          "No se pudo actualizar la reserva. Intente de nuevo más tarde.",
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  // Calculamos contadores para las pestañas
  const getTabCounts = () => {
    const approved = reservations.filter(
      (r) => r.reservationStateId === 2
    ).length;
    const pending = reservations.filter(
      (r) => r.reservationStateId === 1
    ).length;
    const rejected = reservations.filter(
      (r) => r.reservationStateId === 3
    ).length;

    return { approved, pending, rejected, total: reservations.length };
  };

  const tabCounts = getTabCounts();

  // Columnas para la tabla de reservas - eliminamos la columna ID por seguridad
  const columns = [
    {
      id: "client",
      header: "Cliente",
      cell: (row: ReservationDto) => (
        <div>
          <div className="font-medium">
            {row.user?.first_name
              ? `${row.user.first_name} ${row.user.last_name}`
              : "Cliente sin nombre"}
          </div>
          <div className="text-xs text-gray-500">
            {row.user?.email || "Sin email"}
          </div>
          <div className="text-xs text-gray-500">
            {row.user?.phone || "Sin teléfono"}
          </div>
        </div>
      ),
    },
    {
      id: "venue",
      header: "Escenario",
      cell: (row: ReservationDto) => (
        <div>
          <div className="font-medium">
            {row.subScenario?.name || "Escenario sin nombre"}
          </div>
          <div className="text-xs text-gray-500">
            {row.subScenario?.scenarioName || "Sin escenario"}
          </div>
          <div className="text-xs">
            {row.subScenario?.hasCost ? (
              <Badge variant="outline" className="bg-yellow-50">
                De pago
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-50">
                Gratuito
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "created",
      header: "Creado",
      cell: (row: ReservationDto) => (
        <span>{row.createdAt ? formatDate(row.createdAt) : "N/A"}</span>
      ),
    },
    {
      id: "date",
      header: "Reserva",
      cell: (row: ReservationDto) => (
        <span>{formatDate(row.reservationDate)}</span>
      ),
    },
    {
      id: "time",
      header: "Hora",
      cell: (row: ReservationDto) => (
        <span>
          {row.timeSlot
            ? `${row.timeSlot.startTime} - ${row.timeSlot.endTime}`
            : "Horario no disponible"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Estado",
      cell: (row: ReservationDto) => (
        <StatusBadge
          status={mapReservationState(
            row.reservationState?.state || "PENDIENTE"
          )}
        />
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (row: ReservationDto) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenDrawer(row)}
            className="h-8 px-2 py-0"
          >
            <FileEdit className="h-4 w-4 mr-1" />
            Abrir
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Ver detalles</DropdownMenuItem>
              <DropdownMenuItem>Duplicar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Cancelar reserva
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  // Estadísticas para mostrar
  const stats = [
    {
      title: "Total Reservas",
      value: statsData.totalReservations.toString(),
      change: "+12%",
      trend: "up",
      icon: Calendar,
    },
    {
      title: "Reservas Hoy",
      value: statsData.todayReservations.toString(),
      change: "+5%",
      trend: "up",
      icon: Calendar,
    },
    {
      title: "Escenarios Activos",
      value: statsData.activeScenarios.toString(),
      change: "0%",
      trend: "neutral",
      icon: MapPin,
    },
    {
      title: "Clientes Registrados",
      value: statsData.registeredClients.toString(),
      change: "+3%",
      trend: "up",
      icon: Users,
    },
  ];

  return (
    <SimpleLayout>
      {/* --------------------------------------------------------------------- */}
      {/*                                HEADER                               */}
      {/* --------------------------------------------------------------------- */}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button onClick={() => setIsModalOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Reserva
            </Button>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/*                            STAT CARDS                              */}
        {/* ------------------------------------------------------------------ */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-xs ${
                    stat.trend === "up"
                      ? "text-green-600"
                      : stat.trend === "down"
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {stat.change} desde el mes pasado
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/*                              TABS                                  */}
        {/* ------------------------------------------------------------------ */}

        <Tabs defaultValue="all" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="approved">Aprobadas</TabsTrigger>
              <TabsTrigger value="pending">Pendientes</TabsTrigger>
              <TabsTrigger value="rejected">Rechazadas</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* ----------------------------- TAB ALL --------------------------- */}

          <TabsContent value="all" className="mt-0">
            {showFilters && (
              <div className="mb-4 animate-fade-in">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Filtros de búsqueda
                    </CardTitle>
                    <CardDescription>
                      Refina los resultados usando los siguientes filtros
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FilterToolbar
                      filters={filterOptions}
                      onSearch={handleSearch}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Listado de reservas */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>Listado de Reservas</CardTitle>
                    <Badge variant="outline" className="ml-2">
                      {filteredReservations.length}
                    </Badge>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar reserva..."
                      className="pl-8"
                      onChange={handleQuickSearch}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  data={filteredReservations}
                  columns={columns}
                  totalItems={filteredReservations.length}
                  pageSize={10}
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredReservations.length / 10)}
                  onPageChange={setCurrentPage}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ------------------------ TABS FILTERED -------------------------- */}

          {(
            [
              {
                key: "approved",
                label: "Reservas Aprobadas",
                badge: tabCounts.approved,
                stateId: 2,
              },
              {
                key: "pending",
                label: "Reservas Pendientes",
                badge: tabCounts.pending,
                stateId: 1,
              },
              {
                key: "rejected",
                label: "Reservas Rechazadas",
                badge: tabCounts.rejected,
                stateId: 3,
              },
            ] as const
          ).map(({ key, label, badge, stateId }) => (
            <TabsContent key={key} value={key} className="mt-0">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle>{label}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {badge}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <DataTable
                    data={reservations.filter(
                      (r) => r.reservationStateId === stateId
                    )}
                    columns={columns}
                    totalItems={badge}
                    pageSize={10}
                    currentPage={1}
                    totalPages={Math.ceil(badge / 10)}
                    onPageChange={setCurrentPage}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*                            EDIT DRAWER                              */}
      {/* ------------------------------------------------------------------ */}

      <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <DrawerContent className="w-full sm:w-[480px]">
          <DrawerHeader>
            <DrawerTitle>
              {selectedReservation ? `Editar Reserva` : "Editar Reserva"}
            </DrawerTitle>
          </DrawerHeader>

          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
            {selectedReservation && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente*</Label>
                  <Input
                    id="client"
                    value={
                      selectedReservation.user
                        ? `${selectedReservation.user.first_name} ${selectedReservation.user.last_name} - ${selectedReservation.user.email}`
                        : "Cliente sin nombre"
                    }
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Escenario*</Label>
                  <Input
                    id="venue"
                    value={`${
                      selectedReservation.subScenario?.name ||
                      "Escenario sin nombre"
                    } (${
                      selectedReservation.subScenario?.scenarioName ||
                      "Sin escenario"
                    })`}
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Fecha Reserva*</Label>
                  <Input
                    id="date"
                    type="date"
                    value={editingReservation.date}
                    onChange={(e) =>
                      setEditingReservation({
                        ...editingReservation,
                        date: e.target.value,
                      })
                    }
                    readOnly // Solo permitimos cambiar el estado, no la fecha
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Hora*</Label>
                  <Input
                    id="time"
                    value={
                      selectedReservation.timeSlot
                        ? `${selectedReservation.timeSlot.startTime} - ${selectedReservation.timeSlot.endTime}`
                        : "Horario no disponible"
                    }
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observaciones</Label>
                  <Textarea
                    id="observations"
                    placeholder="Observaciones"
                    value={editingReservation.observations}
                    onChange={(e) =>
                      setEditingReservation({
                        ...editingReservation,
                        observations: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="created">Creado</Label>
                  <Input
                    id="created"
                    value={
                      selectedReservation.createdAt
                        ? new Date(
                            selectedReservation.createdAt
                          ).toLocaleString()
                        : "Fecha no disponible"
                    }
                    readOnly
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado*</Label>
                  <Select
                    value={editingReservation.reservationStateId.toString()}
                    onValueChange={(value) =>
                      setEditingReservation({
                        ...editingReservation,
                        reservationStateId: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Pendiente</SelectItem>
                      <SelectItem value="2">Confirmada</SelectItem>
                      <SelectItem value="3">Rechazada</SelectItem>
                      <SelectItem value="4">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <DrawerFooter>
            <Button className="w-full" onClick={handleUpdateReservation}>
              Guardar
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Cancelar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* ------------------------------------------------------------------ */}
      {/*                          CREATE MODAL                               */}
      {/* ------------------------------------------------------------------ */}

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Reserva"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateReservation}>Añadir</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-client">Cliente*</Label>
            <Select
              value={newReservation.clientId}
              onValueChange={(value) =>
                setNewReservation({ ...newReservation, clientId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione cliente..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.first_name} {user.last_name} - {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-scenario">Escenario*</Label>
            <Select
              value={newReservation.scenarioId}
              onValueChange={(value) => handleScenarioChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione escenario..." />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map((scenario) => (
                  <SelectItem key={scenario.id} value={scenario.id.toString()}>
                    {scenario.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-subscenario">Subescenario*</Label>
            <Select
              value={newReservation.subScenarioId}
              onValueChange={(value) =>
                setNewReservation({ ...newReservation, subScenarioId: value })
              }
              disabled={
                !newReservation.scenarioId ||
                subScenariosForScenario.length === 0
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione subescenario..." />
              </SelectTrigger>
              <SelectContent>
                {subScenariosForScenario.map((subScenario) => (
                  <SelectItem
                    key={subScenario.id}
                    value={subScenario.id.toString()}
                  >
                    {subScenario.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-date">Fecha de reserva*</Label>
            <Input
              id="new-date"
              type="date"
              value={newReservation.reservationDate}
              onChange={(e) =>
                setNewReservation({
                  ...newReservation,
                  reservationDate: e.target.value,
                })
              }
              min={new Date().toISOString().split("T")[0]} // No permitir fechas pasadas
            />
          </div>

          {newReservation.subScenarioId && newReservation.reservationDate && (
            <div className="space-y-2">
              <Label htmlFor="new-timeslot">Horario*</Label>
              <Select
                value={newReservation.timeSlotId}
                onValueChange={(value) =>
                  setNewReservation({ ...newReservation, timeSlotId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione horario..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTimeSlots
                    .filter((slot) => slot.available)
                    .map((slot) => (
                      <SelectItem key={slot.id} value={slot.id.toString()}>
                        {slot.startTime} - {slot.endTime}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {availableTimeSlots.length > 0 &&
                availableTimeSlots.filter((s) => s.available).length === 0 && (
                  <p className="text-sm text-red-500">
                    No hay horarios disponibles para esta fecha y escenario.
                  </p>
                )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="comments">Comentarios</Label>
            <Textarea
              id="comments"
              placeholder="Escriba si tiene comentarios adicionales sobre la reserva."
              value={newReservation.comments}
              onChange={(e) =>
                setNewReservation({
                  ...newReservation,
                  comments: e.target.value,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="new-status">Estado activo</Label>
            <Switch
              id="new-status"
              checked={newReservation.status}
              onCheckedChange={(checked) =>
                setNewReservation({ ...newReservation, status: checked })
              }
            />
          </div>
        </div>
      </Modal>
    </SimpleLayout>
  );
}
