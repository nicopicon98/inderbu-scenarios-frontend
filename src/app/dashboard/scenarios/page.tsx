"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui/pagination";
import {
  CreateScenarioDto,
  Neighborhood,
  PageMeta,
  PageOptions,
  Scenario,
  UpdateScenarioDto,
  neighborhoodService,
  scenarioService,
} from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Download,
  FileEdit,
  Filter,
  Loader2,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { ScenariosFiltersCard } from "@/features/scenarios/components/molecules/ScenariosFiltersCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { SimpleLayout } from "@/shared/components/layout/simple-layout";
import { memo, useCallback, useEffect, useState } from "react";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "sonner";


// ⭐ COMPONENTES SEPARADOS PARA EVITAR RE-CREACIÓN
interface ValidatedInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const ValidatedInput = memo(
  ({
    id,
    label,
    value,
    onChange,
    error,
    placeholder,
    required,
    className,
  }: ValidatedInputProps) => (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`bg-white h-9 ${error ? "border-red-500 focus:border-red-500" : ""} ${className || ""}`}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  ),
);
ValidatedInput.displayName = "ValidatedInput";

interface ValidatedSelectProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: { id: number; name: string }[];
  error?: string;
  placeholder?: string;
  required?: boolean;
}

const ValidatedSelect = memo(
  ({
    id,
    label,
    value,
    onChange,
    options,
    error,
    placeholder,
    required,
  }: ValidatedSelectProps) => (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`flex h-9 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          error ? "border-red-500 focus-visible:ring-red-500" : ""
        }`}
      >
        <option value="">{placeholder || "Seleccione una opción..."}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  ),
);
ValidatedSelect.displayName = "ValidatedSelect";

// Interfaz para nuestro estado y filtros
interface FilterState {
  search: string;
  neighborhoodId?: number;
  page: number;
  limit: number;
}

// Interfaces para formularios
interface FormData {
  name: string;
  address: string;
  neighborhoodId: number | "";
  description?: string;
}

// Estado para errores de validación
interface FormErrors {
  name?: string;
  address?: string;
  neighborhoodId?: string;
}

export default function FacilityManagement() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(
    null,
  );
  const [showFilters, setShowFilters] = useState(false);

  // Datos desde API
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
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

  // Estados para formularios
  const [createFormData, setCreateFormData] = useState<FormData>({
    name: "",
    address: "",
    neighborhoodId: "",
    description: "",
  });

  const [updateFormData, setUpdateFormData] = useState<FormData>({
    name: "",
    address: "",
    neighborhoodId: "",
    description: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejar búsqueda
  const handleSearch = async (searchTerm: string) => {
    const newFilters = { ...filters, search: searchTerm, page: 1 };
    setFilters(newFilters);
    await fetchScenarios(newFilters);
  };

  // Manejar cambios de filtros desde ScenariosFiltersCard
  const handleFiltersChange = async (newFilters: FilterState) => {
    const updatedFilters = { ...newFilters, page: 1 };
    setFilters(updatedFilters);
    await fetchScenarios(updatedFilters);
  };

  // Limpiar filtros
  const clearFilters = async () => {
    const clearedFilters: FilterState = {
      search: "",
      neighborhoodId: undefined,
      page: 1,
      limit: 7,
    };
    setFilters(clearedFilters);
    await fetchScenarios(clearedFilters);
  };

  // Función de validación
  const validateForm = (data: FormData): FormErrors => {
    const errors: FormErrors = {};

    if (!data.name.trim()) {
      errors.name = "El nombre es requerido";
    } else if (data.name.length < 3) {
      errors.name = "El nombre debe tener al menos 3 caracteres";
    } else if (data.name.length > 100) {
      errors.name = "El nombre no puede exceder 100 caracteres";
    }

    if (!data.address.trim()) {
      errors.address = "La dirección es requerida";
    } else if (data.address.length < 10) {
      errors.address = "La dirección debe tener al menos 10 caracteres";
    } else if (data.address.length > 150) {
      errors.address = "La dirección no puede exceder 150 caracteres";
    }

    if (!data.neighborhoodId) {
      errors.neighborhoodId = "Debe seleccionar un barrio";
    }

    return errors;
  };

  // Handler para crear scenario
  const handleCreateScenario = async () => {
    try {
      setIsSubmitting(true);
      setFormErrors({});

      // Validar formulario
      const errors = validateForm(createFormData);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      // Preparar datos para el backend
      const createData: CreateScenarioDto = {
        name: createFormData.name.trim(),
        address: createFormData.address.trim(),
        neighborhoodId: Number(createFormData.neighborhoodId),
      };

      // Crear scenario
      const newScenario = await scenarioService.create(createData);

      // Actualizar lista
      await fetchScenarios(filters);

      // Limpiar formulario
      setCreateFormData({
        name: "",
        address: "",
        neighborhoodId: "",
        description: "",
      });

      // Cerrar modal
      setIsModalOpen(false);

      // Mostrar notificación de éxito
      toast.success("Escenario creado exitosamente", {
        description: `${newScenario.name} ha sido registrado en el sistema.`,
      });
    } catch (error: any) {
      console.error("Error creating scenario:", error);
      toast.error("Error al crear escenario", {
        description:
          error.message || "Ocurrió un error inesperado. Intente nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para actualizar scenario
  const handleUpdateScenario = async () => {
    if (!selectedScenario) return;

    try {
      setIsSubmitting(true);
      setFormErrors({});

      // Validar formulario
      const errors = validateForm(updateFormData);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      // Preparar datos para el backend (solo campos que cambiaron)
      const updateData: UpdateScenarioDto = {};

      if (updateFormData.name.trim() !== selectedScenario.name) {
        updateData.name = updateFormData.name.trim();
      }

      if (updateFormData.address.trim() !== selectedScenario.address) {
        updateData.address = updateFormData.address.trim();
      }

      if (
        Number(updateFormData.neighborhoodId) !==
        selectedScenario.neighborhood?.id
      ) {
        updateData.neighborhoodId = Number(updateFormData.neighborhoodId);
      }

      // Solo actualizar si hay cambios
      if (Object.keys(updateData).length === 0) {
        toast.info("No se detectaron cambios", {
          description: "No hay modificaciones para guardar.",
        });
        setIsDrawerOpen(false);
        return;
      }

      // Actualizar scenario
      const updatedScenario = await scenarioService.update(
        selectedScenario.id,
        updateData,
      );

      // Actualizar lista
      await fetchScenarios(filters);

      // Cerrar modal
      setIsDrawerOpen(false);
      setSelectedScenario(null);

      // Mostrar notificación de éxito
      toast.success("Escenario actualizado exitosamente", {
        description: `${updatedScenario.name} ha sido actualizado.`,
      });
    } catch (error: any) {
      console.error("Error updating scenario:", error);
      toast.error("Error al actualizar escenario", {
        description:
          error.message || "Ocurrió un error inesperado. Intente nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funciones utilitarias para manejar cambios en formularios (optimizadas con useCallback)
  const handleCreateFieldChange = useCallback(
    (field: keyof FormData, value: string | number) => {
      setCreateFormData((prev) => ({ ...prev, [field]: value }));
      // Limpiar error específico cuando el usuario empiece a escribir
      setFormErrors((prev) => {
        if (prev[field as keyof FormErrors]) {
          const newErrors = { ...prev };
          delete newErrors[field as keyof FormErrors];
          return newErrors;
        }
        return prev;
      });
    },
    [],
  );

  const handleUpdateFieldChange = useCallback(
    (field: keyof FormData, value: string | number) => {
      setUpdateFormData((prev) => ({ ...prev, [field]: value }));
      // Limpiar error específico cuando el usuario empiece a escribir
      setFormErrors((prev) => {
        if (prev[field as keyof FormErrors]) {
          const newErrors = { ...prev };
          delete newErrors[field as keyof FormErrors];
          return newErrors;
        }
        return prev;
      });
    },
    [],
  );

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Cargar solo neighborhoods ya que no necesitamos activityAreas
        const neighborhoodsResult = await neighborhoodService.getAll();

        setNeighborhoods(
          Array.isArray(neighborhoodsResult)
            ? neighborhoodsResult
            : neighborhoodsResult.data,
        );

        // Cargar escenarios iniciales
        await fetchScenarios(filters);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Error al cargar los datos iniciales. Intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Función para cargar escenarios con filtros
  const fetchScenarios = async (options: PageOptions) => {
    try {
      setLoading(true);
      const response = await scenarioService.getAll(options);
      setScenarios(response.data);
      setPageMeta(response.meta);
      return response;
    } catch (err) {
      console.error("Error fetching scenarios:", err);
      setError("Error al cargar los escenarios. Intente nuevamente.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios de página
  const handlePageChange = async (newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    await fetchScenarios(newFilters);
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
      </PaginationItem>,
    );

    // Mostrar elipsis si es necesario antes del rango
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    // Mostrar páginas intermedias
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      items.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    // Mostrar elipsis si es necesario después del rango
    if (currentPage < totalPages - 2 && totalPages > 4) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>,
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
        </PaginationItem>,
      );
    }

    return items;
  };

  // Manejar búsqueda rápida desde el input de la tabla
  const handleQuickSearch = async (searchTerm: string) => {
    const newFilters = { ...filters, search: searchTerm, page: 1 };
    setFilters(newFilters);
    await fetchScenarios(newFilters);
  };

  // Handler para abrir modal de edición (actualizar datos)
  const handleOpenDrawer = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setUpdateFormData({
      name: scenario.name,
      address: scenario.address,
      neighborhoodId: scenario.neighborhood?.id || "",
      description: scenario.description || "",
    });
    setFormErrors({});
    setIsDrawerOpen(true);
  };

  // Columnas para la tabla
  const columns = [
    // Renderizado principal
    {
      id: "neighborhood",
      header: "Barrio",
      cell: (row: any) => (
        <span>{row.neighborhood?.name || "No asignado"}</span>
      ),
    },
    {
      id: "name",
      header: "Nombre",
      cell: (row: any) => <span>{row.name}</span>,
    },
    {
      id: "address",
      header: "Dirección",
      cell: (row: any) => <span>{row.address}</span>,
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
            Escenarios Deportivos
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
              Nuevo Escenario
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
            <ScenariosFiltersCard
              open={showFilters}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={clearFilters}
            />

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>Listado de Escenarios</CardTitle>
                    <Badge variant="outline" className="ml-2">
                      {pageMeta?.totalItems || 0}
                    </Badge>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar escenario..."
                      className="pl-8"
                      value={filters.search}
                      onChange={(e) => handleQuickSearch(e.target.value)}
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
                              <span>Cargando escenarios...</span>
                            </div>
                          </td>
                        </tr>
                      ) : scenarios.length > 0 ? (
                        scenarios.map((scenario) => (
                          <tr
                            key={scenario.id}
                            className="border-b hover:bg-gray-50"
                          >
                            {columns.map((column) => (
                              <td
                                key={`${scenario.id}-${column.id}`}
                                className="px-4 py-3 text-sm"
                              >
                                {column.cell(scenario)}
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
                            No se encontraron escenarios con los filtros
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
                        <span className="font-medium">{scenarios.length}</span>{" "}
                        de{" "}
                        <span className="font-medium">
                          {pageMeta.totalItems}
                        </span>{" "}
                        escenarios (Página {filters.page} de{" "}
                        {pageMeta.totalPages})
                      </>
                    )}
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => {
                            if (pageMeta?.hasPreviousPage && !loading) {
                              handlePageChange(filters.page - 1);
                            }
                          }}
                        />
                      </PaginationItem>
                      {renderPaginationItems()}
                      <PaginationItem>
                        {pageMeta?.hasNextPage && !loading ? (
                          <PaginationNext
                            onClick={() => handlePageChange(filters.page + 1)}
                          />
                        ) : (
                          <span className="pointer-events-none opacity-50">
                            <PaginationNext onClick={() => {}} />
                          </span>
                        )}
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
              label: "Escenarios Activos",
              count: scenarios.length,
            },
            {
              key: "inactive",
              label: "Escenarios Inactivos",
              count: scenarios.length,
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
                        placeholder="Buscar escenario..."
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
                                <span>Cargando escenarios...</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          scenarios.map((scenario) => (
                            <tr
                              key={scenario.id}
                              className="border-b hover:bg-gray-50"
                            >
                              {columns.map((column) => (
                                <td
                                  key={`${scenario.id}-${column.id}`}
                                  className="px-4 py-3 text-sm"
                                >
                                  {column.cell(scenario)}
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
                      escenarios
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          {!pageMeta?.hasPreviousPage || loading ? (
                            <span className="pointer-events-none opacity-50">
                              <PaginationPrevious onClick={() => {}} />
                            </span>
                          ) : (
                            <PaginationPrevious
                              onClick={() => handlePageChange(filters.page - 1)}
                            />
                          )}
                        </PaginationItem>
                        {renderPaginationItems()}
                        <PaginationItem>
                          {!pageMeta?.hasNextPage || loading ? (
                            <span className="pointer-events-none opacity-50">
                              <PaginationNext onClick={() => {}} />
                            </span>
                          ) : (
                            <PaginationNext
                              onClick={() => handlePageChange(filters.page + 1)}
                            />
                          )}
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DialogContent className="w-[650px] max-h-[80vh] mx-auto bg-white overflow-y-auto">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl text-teal-700">
                {selectedScenario
                  ? `Editar Escenario: ${selectedScenario.name}`
                  : "Editar Escenario"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-180px)]">
              {selectedScenario && (
                <>
                  {/* Ubicación */}
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
                      <MapPin className="h-3 w-3 mr-1 text-teal-600" />
                      Ubicación
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <ValidatedSelect
                        id="venue-neighborhood"
                        label="Barrio"
                        value={updateFormData.neighborhoodId}
                        onChange={(value) =>
                          handleUpdateFieldChange("neighborhoodId", value)
                        }
                        options={neighborhoods}
                        error={formErrors.neighborhoodId}
                        placeholder="Seleccione barrio..."
                        required
                      />

                      <ValidatedInput
                        id="venue-address"
                        label="Dirección"
                        value={updateFormData.address}
                        onChange={(value) =>
                          handleUpdateFieldChange("address", value)
                        }
                        error={formErrors.address}
                        required
                      />
                    </div>
                  </div>

                  {/* Información General */}
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
                      <svg
                        className="h-3 w-3 mr-1 text-teal-600"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      Información General
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <ValidatedInput
                        id="venue-name"
                        label="Nombre del Escenario"
                        value={updateFormData.name}
                        onChange={(value) =>
                          handleUpdateFieldChange("name", value)
                        }
                        error={formErrors.name}
                        required
                      />

                      <div className="space-y-1">
                        <Label
                          htmlFor="venue-description"
                          className="text-sm font-medium"
                        >
                          Descripción
                        </Label>
                        <Textarea
                          id="venue-description"
                          value={updateFormData.description || ""}
                          onChange={(e) =>
                            handleUpdateFieldChange(
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Descripción del escenario"
                          className="bg-white resize-none h-20 min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="flex justify-end gap-3 pt-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setSelectedScenario(null);
                  setFormErrors({});
                }}
                className="px-4"
                size="sm"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700 px-4"
                size="sm"
                onClick={handleUpdateScenario}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="w-[650px] max-h-[80vh] mx-auto bg-white overflow-y-auto">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl text-teal-700">
                Crear Escenario
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-180px)]">
              {/* Ubicación */}
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
                  <MapPin className="h-3 w-3 mr-1 text-teal-600" />
                  Ubicación
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <ValidatedSelect
                    id="new-venue-neighborhood"
                    label="Barrio"
                    value={createFormData.neighborhoodId}
                    onChange={(value) =>
                      handleCreateFieldChange("neighborhoodId", value)
                    }
                    options={neighborhoods}
                    error={formErrors.neighborhoodId}
                    placeholder="Seleccione barrio..."
                    required
                  />

                  <ValidatedInput
                    id="new-venue-address"
                    label="Dirección"
                    value={createFormData.address}
                    onChange={(value) =>
                      handleCreateFieldChange("address", value)
                    }
                    error={formErrors.address}
                    placeholder="Dirección completa"
                    required
                  />
                </div>
              </div>

              {/* Información General */}
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
                  <svg
                    className="h-3 w-3 mr-1 text-teal-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Información General
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <ValidatedInput
                    id="new-venue-name"
                    label="Nombre del Escenario"
                    value={createFormData.name}
                    onChange={(value) => handleCreateFieldChange("name", value)}
                    error={formErrors.name}
                    placeholder="Ingrese nombre del escenario"
                    required
                  />

                  <div className="space-y-1">
                    <Label
                      htmlFor="new-venue-description"
                      className="text-sm font-medium"
                    >
                      Descripción
                    </Label>
                    <Textarea
                      id="new-venue-description"
                      value={createFormData.description || ""}
                      onChange={(e) =>
                        handleCreateFieldChange("description", e.target.value)
                      }
                      placeholder="Descripción del escenario"
                      className="bg-white resize-none h-20 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-3 pt-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setCreateFormData({
                    name: "",
                    address: "",
                    neighborhoodId: "",
                    description: "",
                  });
                  setFormErrors({});
                }}
                size="sm"
                className="px-4"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700 px-4"
                onClick={handleCreateScenario}
                size="sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SimpleLayout>
  );
}
