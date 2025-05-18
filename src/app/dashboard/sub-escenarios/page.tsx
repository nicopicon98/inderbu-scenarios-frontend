"use client";

import { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
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
  Plus,
  FileEdit,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  MapPin,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { SimpleLayout } from "@/shared/components/layout/simple-layout";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui/pagination";
import { Switch } from "@/shared/ui/switch";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";

import {
  subScenarioService,
  scenarioService,
  activityAreaService,
  neighborhoodService,
  SubScenario,
  Scenario,
  ActivityArea,
  Neighborhood,
  PageOptions,
  PageMeta,
} from "@/services/api";

// Interfaz para nuestro estado y filtros
interface FilterState {
  search: string;
  activityAreaId?: number;
  neighborhoodId?: number;
  scenarioId?: number;
  page: number;
  limit: number;
}

export default function SubScenarioManagement() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubScenario, setSelectedSubScenario] = useState<SubScenario | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);

  // Datos desde API
  const [subScenarios, setSubScenarios] = useState<SubScenario[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activityAreas, setActivityAreas] = useState<ActivityArea[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [pageMeta, setPageMeta] = useState<PageMeta | null>(null);

  // Manejo de carga y errores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado de filtros
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    page: 1,
    limit: 7,
  });

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Cargar datos para los filtros
        const scenariosResult = await scenarioService.getAll({ limit: 100 });
        const areasResult = await activityAreaService.getAll();
        const neighborhoodsResult = await neighborhoodService.getAll();

        // Manejar los resultados 
        setScenarios(scenariosResult.data);
        setActivityAreas(Array.isArray(areasResult) ? areasResult : areasResult.data);
        setNeighborhoods(Array.isArray(neighborhoodsResult) ? neighborhoodsResult : neighborhoodsResult.data);

        // Cargar sub-escenarios iniciales
        const subScenariosResult = await subScenarioService.getAll(filters);
        setSubScenarios(subScenariosResult.data);
        setPageMeta(subScenariosResult.meta);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Error al cargar los datos iniciales. Intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Filtros dinámicos basados en datos cargados desde API
  const filterOptions = [
    {
      id: "search",
      label: "Nombre/Código",
      type: "text",
      placeholder: "Buscar por nombre o código",
      value: filters.search,
    },
    {
      id: "scenarioId",
      label: "Escenario",
      type: "select",
      placeholder: "Seleccione escenario...",
      options: [
        { value: "", label: "Todos los escenarios..." },
        ...scenarios.map((s) => ({
          value: s.id.toString(),
          label: s.name,
        })),
      ],
      value: filters.scenarioId,
    },
    {
      id: "activityAreaId",
      label: "Área de Actividad",
      type: "select",
      placeholder: "Seleccione área...",
      options: [
        { value: "", label: "Todas las áreas..." },
        ...activityAreas.map((a) => ({
          value: a.id.toString(),
          label: a.name,
        })),
      ],
      value: filters.activityAreaId,
    },
    {
      id: "neighborhoodId",
      label: "Barrio",
      type: "select",
      placeholder: "Seleccione barrio...",
      options: [
        { value: "", label: "Todos los barrios..." },
        ...neighborhoods.map((n) => ({
          value: n.id.toString(),
          label: n.name,
        })),
      ],
      value: filters.neighborhoodId,
    },
  ];



  // Manejar cambios de página
  const handlePageChange = async (newPage: number) => {
    // Creamos un nuevo objeto de filtros para evitar referencias al estado anterior
    const newFilters: FilterState = { 
      ...filters, 
      page: newPage 
    };
    
    setLoading(true);
    try {
      // Usamos directamente el nuevo objeto para la llamada a la API
      const response = await subScenarioService.getAll(newFilters);
      setSubScenarios(response.data);
      setPageMeta(response.meta);
      // Actualizamos el estado de filtros después de la llamada exitosa
      setFilters(newFilters);
    } catch (err) {
      console.error("Error changing page:", err);
      setError("Error al cambiar de página. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Renderizar componentes de paginación
  const renderPaginationItems = () => {
    if (!pageMeta) return null;
    
    const items = [];
    const currentPage = filters.page;
    const totalPages = pageMeta.totalPages;
    
    // Siempre mostrar primera página
    items.push(
      <PaginationItem key="page-1">
        <PaginationLink 
          isActive={currentPage === 1}
          onClick={() => handlePageChange(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Mostrar elipsis si es necesario antes del rango
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Mostrar páginas intermedias
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      items.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink 
            isActive={currentPage === i}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Mostrar elipsis si es necesario después del rango
    if (currentPage < totalPages - 2 && totalPages > 4) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Siempre mostrar última página si hay más de una
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink 
            isActive={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  // Manejar búsqueda
  const handleSearch = async (searchTerm: string) => {
    // Creamos un nuevo objeto de filtros con la búsqueda y reiniciamos a página 1
    const newFilters: FilterState = { 
      ...filters, 
      search: searchTerm, 
      page: 1 
    };
    
    setLoading(true);
    try {
      // Usamos directamente el nuevo objeto para la llamada a la API
      const response = await subScenarioService.getAll(newFilters);
      setSubScenarios(response.data);
      setPageMeta(response.meta);
      // Actualizamos el estado de filtros después de la llamada exitosa
      setFilters(newFilters);
    } catch (err) {
      console.error("Error searching:", err);
      setError("Error al buscar sub-escenarios. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Manejar filtros avanzados
  const handleFilterChange = async (filterUpdates: Partial<FilterState>) => {
    // Creamos un nuevo objeto de filtros combinando los actuales con las actualizaciones
    const newFilters: FilterState = { 
      ...filters, 
      ...filterUpdates,
      page: 1 // Reiniciamos a la primera página para filtros nuevos
    };
    
    setLoading(true);
    try {
      // Usamos directamente el nuevo objeto para la llamada a la API
      const response = await subScenarioService.getAll(newFilters);
      setSubScenarios(response.data);
      setPageMeta(response.meta);
      // Actualizamos el estado de filtros después de la llamada exitosa
      setFilters(newFilters);
      // Ocultamos el panel de filtros
      setShowFilters(false);
    } catch (err) {
      console.error("Error applying filters:", err);
      setError("Error al aplicar filtros. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = (subScenario: SubScenario) => {
    setSelectedSubScenario(subScenario);
    setIsDrawerOpen(true);
  };

  // Columnas para la tabla - adaptadas para sub-escenarios
  const columns = [
    {
      id: "scenario",
      header: "Escenario",
      cell: (row: any) => <span>{row.scenario?.name || 'No asignado'}</span>,
    },
    {
      id: "name",
      header: "Nombre",
      cell: (row: any) => <span>{row.name}</span>,
    },
    {
      id: "activityArea",
      header: "Área Actividad",
      cell: (row: any) => <span>{row.activityArea?.name || 'No asignada'}</span>,
    },
    {
      id: "status",
      header: "Estado",
      cell: (row: any) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.status === "active"
              ? "bg-orange-100 text-orange-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status === "active" ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (row: any) => (
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
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Desactivar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <SimpleLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Sub-Escenarios Deportivos
          </h1>
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
              Nuevo Sub-Escenario
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Activos</TabsTrigger>
              <TabsTrigger value="inactive">Inactivos</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Tab All */}
          <TabsContent value="all" className="mt-0">
            {showFilters && (
              <div className="mb-4 animate-in fade-in">
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {filterOptions.map((filter) => (
                        <div key={filter.id} className="space-y-2">
                          <Label htmlFor={filter.id}>{filter.label}</Label>
                          {filter.type === "text" ? (
                            <Input
                              id={filter.id}
                              placeholder={filter.placeholder}
                              value={filters.search || ""}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  search: e.target.value,
                                })
                              }
                            />
                          ) : (
                            <select
                              id={filter.id}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={
                                filter.id === "activityAreaId"
                                  ? filters.activityAreaId || ""
                                  : filter.id === "neighborhoodId"
                                  ? filters.neighborhoodId || ""
                                  : filter.id === "scenarioId"
                                  ? filters.scenarioId || ""
                                  : ""
                              }
                              onChange={(e) => {
                                const value = e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined;
                                if (filter.id === "activityAreaId")
                                  setFilters({
                                    ...filters,
                                    activityAreaId: value,
                                  });
                                if (filter.id === "neighborhoodId")
                                  setFilters({
                                    ...filters,
                                    neighborhoodId: value,
                                  });
                                if (filter.id === "scenarioId")
                                  setFilters({
                                    ...filters,
                                    scenarioId: value,
                                  });
                              }}
                            >
                              {filter.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button onClick={() => handleFilterChange(filters)}>
                        Buscar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>Listado de Sub-Escenarios</CardTitle>
                    <Badge variant="outline" className="ml-2">
                      {pageMeta?.totalItems || 0}
                    </Badge>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar sub-escenario..."
                      className="pl-8"
                      value={filters.search}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        {columns.map((column) => (
                          <th
                            key={column.id}
                            className="px-4 py-3 text-left text-sm font-medium text-gray-500"
                          >
                            {column.header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="px-4 py-8 text-center"
                          >
                            <div className="flex justify-center items-center">
                              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mr-2" />
                              <span>Cargando sub-escenarios...</span>
                            </div>
                          </td>
                        </tr>
                      ) : subScenarios.length > 0 ? (
                        subScenarios.map((subScenario) => (
                          <tr
                            key={subScenario.id}
                            className="border-b hover:bg-gray-50"
                          >
                            {columns.map((column) => (
                              <td
                                key={`${subScenario.id}-${column.id}`}
                                className="px-4 py-3 text-sm"
                              >
                                {column.cell(subScenario)}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="px-4 py-8 text-center text-sm text-gray-500"
                          >
                            No se encontraron sub-escenarios con los filtros
                            aplicados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between px-4 py-2 border-t">
                  <div className="text-sm text-gray-500">
                    {pageMeta && (
                      <>
                        Mostrando{" "}
                        <span className="font-medium">{subScenarios.length}</span>{" "}
                        de{" "}
                        <span className="font-medium">
                          {pageMeta.totalItems}
                        </span>{" "}
                        sub-escenarios (Página {filters.page} de {pageMeta.totalPages})
                      </>
                    )}
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(filters.page - 1)} 
                          disabled={!pageMeta?.hasPreviousPage || loading}
                        />
                      </PaginationItem>
                      {renderPaginationItems()}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(filters.page + 1)} 
                          disabled={!pageMeta?.hasNextPage || loading}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tabs Filtered - Simplemente rehuso la misma tabla para estas pestañas */}
          {[
            {
              key: "active",
              label: "Sub-Escenarios Activos",
              count: subScenarios.length,
            },
            {
              key: "inactive",
              label: "Sub-Escenarios Inactivos",
              count: subScenarios.length,
            },
          ].map(({ key, label, count }) => (
            <TabsContent key={key} value={key} className="mt-0">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle>{label}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {count}
                      </Badge>
                    </div>
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar sub-escenario..."
                        className="pl-8"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          {columns.map((column) => (
                            <th
                              key={column.id}
                              className="px-4 py-3 text-left text-sm font-medium text-gray-500"
                            >
                              {column.header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Aquí deberíamos filtrar por status cuando tengamos ese campo */}
                        {loading ? (
                          <tr>
                            <td
                              colSpan={columns.length}
                              className="px-4 py-8 text-center"
                            >
                              <div className="flex justify-center items-center">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mr-2" />
                                <span>Cargando sub-escenarios...</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          subScenarios.map((subScenario) => (
                            <tr
                              key={subScenario.id}
                              className="border-b hover:bg-gray-50"
                            >
                              {columns.map((column) => (
                                <td
                                  key={`${subScenario.id}-${column.id}`}
                                  className="px-4 py-3 text-sm"
                                >
                                  {column.cell(subScenario)}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 border-t">
                    <div className="text-sm text-gray-500">
                      Mostrando <span className="font-medium">{count}</span>{" "}
                      sub-escenarios
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(filters.page - 1)} 
                            disabled={!pageMeta?.hasPreviousPage || loading}
                          />
                        </PaginationItem>
                        {renderPaginationItems()}
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(filters.page + 1)} 
                            disabled={!pageMeta?.hasNextPage || loading}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit Drawer */}
        <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
          <DrawerContent className="w-full sm:w-[480px]">
            <DrawerHeader>
              <DrawerTitle>
                {selectedSubScenario
                  ? `Editar Sub-Escenario: ${selectedSubScenario.name}`
                  : "Editar Sub-Escenario"}
              </DrawerTitle>
            </DrawerHeader>

            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
              {selectedSubScenario && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="sub-scenario-name">Nombre*</Label>
                    <Input
                      id="sub-scenario-name"
                      defaultValue={selectedSubScenario.name}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sub-scenario-scenario">Escenario*</Label>
                    <select
                      id="sub-scenario-scenario"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue={selectedSubScenario.scenario?.id}
                    >
                      <option value="">Seleccione escenario...</option>
                      {scenarios.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sub-scenario-area">Área de Actividad*</Label>
                    <select
                      id="sub-scenario-area"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue={selectedSubScenario.activityArea?.id}
                    >
                      <option value="">Seleccione área de actividad...</option>
                      {activityAreas.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sub-scenario-description">Descripción</Label>
                    <Textarea
                      id="sub-scenario-description"
                      placeholder="Descripción del sub-escenario"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <Label htmlFor="sub-scenario-status">Estado</Label>
                    <Switch id="sub-scenario-status" defaultChecked={true} />
                  </div>
                </>
              )}
            </div>

            <DrawerFooter>
              <Button className="w-full bg-green-500 hover:bg-green-600">
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

        {/* Create Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Crear Sub-Escenario</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="new-sub-scenario-name">Nombre*</Label>
                <Input id="new-sub-scenario-name" placeholder="Nombre del sub-escenario" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-sub-scenario-scenario">Escenario*</Label>
                <select
                  id="new-sub-scenario-scenario"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccione escenario...</option>
                  {scenarios.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-sub-scenario-area">Área de Actividad*</Label>
                <select
                  id="new-sub-scenario-area"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccione área de actividad...</option>
                  {activityAreas.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-sub-scenario-description">Descripción</Label>
                <Textarea
                  id="new-sub-scenario-description"
                  placeholder="Descripción del sub-escenario"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="new-sub-scenario-status">Estado</Label>
                <Switch id="new-sub-scenario-status" defaultChecked={true} />
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="bg-green-500 hover:bg-green-600"
                onClick={() => {
                  // Handle save logic here
                  setIsModalOpen(false);
                }}
              >
                Guardar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SimpleLayout>
  );
}
