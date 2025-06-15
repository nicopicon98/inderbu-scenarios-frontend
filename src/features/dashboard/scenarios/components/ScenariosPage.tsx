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
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { ScenariosFiltersCard } from "@/features/scenarios/components/molecules/ScenariosFiltersCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { memo, useCallback, useState, useTransition } from "react";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { ScenariosDataResponse } from "../application/GetScenariosDataUseCase";
import { createScenarioAction, updateScenarioAction } from "../actions/scenario.actions";
import { Scenario, CreateScenarioDto, UpdateScenarioDto } from "@/services/api";

// COMPONENTES VALIDADOS REUTILIZABLES
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
  )
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
  )
);
ValidatedSelect.displayName = "ValidatedSelect";

// Interfaces para formularios
interface FormData {
  name: string;
  address: string;
  neighborhoodId: number | "";
  description?: string;
}

interface FormErrors {
  name?: string;
  address?: string;
  neighborhoodId?: string;
}

interface ScenariosPageProps {
  initialData: ScenariosDataResponse;
}

export function ScenariosPage({ initialData }: ScenariosPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state from initial data
  const [scenarios] = useState(initialData.scenarios);
  const [neighborhoods] = useState(initialData.neighborhoods);
  const [pageMeta] = useState(initialData.meta);

  // UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Form states
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

  // Extract filters from URL
  const filters = {
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 7,
    search: searchParams.get('search') || "",
    neighborhoodId: searchParams.get('neighborhoodId') ? Number(searchParams.get('neighborhoodId')) : undefined,
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

      // Usar server action
      const result = await createScenarioAction(createData);

      if (result.success) {
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
          description: `${result.data.name} ha sido registrado en el sistema.`,
        });

        // Recargar página
        router.refresh();
      } else {
        toast.error("Error al crear escenario", {
          description: result.error,
        });
      }
    } catch (error: any) {
      console.error("Error creating scenario:", error);
      toast.error("Error al crear escenario", {
        description: error.message || "Ocurrió un error inesperado. Intente nuevamente.",
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

      // Usar server action
      const result = await updateScenarioAction(selectedScenario.id, updateData);

      if (result.success) {
        // Cerrar modal
        setIsDrawerOpen(false);
        setSelectedScenario(null);

        // Mostrar notificación de éxito
        toast.success("Escenario actualizado exitosamente", {
          description: `${result.data.name} ha sido actualizado.`,
        });

        // Recargar página
        router.refresh();
      } else {
        toast.error("Error al actualizar escenario", {
          description: result.error,
        });
      }
    } catch (error: any) {
      console.error("Error updating scenario:", error);
      toast.error("Error al actualizar escenario", {
        description: error.message || "Ocurrió un error inesperado. Intente nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers de formulario optimizados
  const handleCreateFieldChange = useCallback(
    (field: keyof FormData, value: string | number) => {
      setCreateFormData((prev) => ({ ...prev, [field]: value }));
      setFormErrors((prev) => {
        if (prev[field as keyof FormErrors]) {
          const newErrors = { ...prev };
          delete newErrors[field as keyof FormErrors];
          return newErrors;
        }
        return prev;
      });
    },
    []
  );

  const handleUpdateFieldChange = useCallback(
    (field: keyof FormData, value: string | number) => {
      setUpdateFormData((prev) => ({ ...prev, [field]: value }));
      setFormErrors((prev) => {
        if (prev[field as keyof FormErrors]) {
          const newErrors = { ...prev };
          delete newErrors[field as keyof FormErrors];
          return newErrors;
        }
        return prev;
      });
    },
    []
  );

  // Navigation handlers
  const handleSearch = (searchTerm: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/dashboard/scenarios?${params.toString()}`);
  };

  const handleFiltersChange = (newFilters: any) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });

    params.set('page', '1');
    router.push(`/dashboard/scenarios?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/dashboard/scenarios?page=1&limit=7');
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/dashboard/scenarios?${params.toString()}`);
  };

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

  // Render paginación
  const renderPaginationItems = () => {
    if (!pageMeta) return null;

    const items = [];
    const currentPage = filters.page;
    const totalPages = pageMeta.totalPages;

    // Primera página
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

    // Elipsis inicial
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Páginas intermedias
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
        </PaginationItem>
      );
    }

    // Elipsis final
    if (currentPage < totalPages - 2 && totalPages > 4) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Última página
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

  // Columnas para la tabla
  const columns = [
    {
      id: "neighborhood",
      header: "Barrio",
      cell: (row: Scenario) => (
        <span>{row.neighborhood?.name || "No asignado"}</span>
      ),
    },
    {
      id: "name",
      header: "Nombre",
      cell: (row: Scenario) => <span>{row.name}</span>,
    },
    {
      id: "address",
      header: "Dirección",
      cell: (row: Scenario) => <span>{row.address}</span>,
    },
    {
      id: "status",
      header: "Estado",
      cell: (row: Scenario) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-800`}
        >
          Activo
        </span>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (row: Scenario) => (
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

      {/* Filtros */}
      <ScenariosFiltersCard
        open={showFilters}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={clearFilters}
      />

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
                    {scenarios.length > 0 ? (
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
                          No se encontraron escenarios con los filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="flex items-center justify-between px-4 py-2 border-t">
                <div className="text-sm text-gray-500">
                  {pageMeta && (
                    <>
                      Mostrando{" "}
                      <span className="font-medium">{scenarios.length}</span> de{" "}
                      <span className="font-medium">{pageMeta.totalItems}</span>{" "}
                      escenarios (Página {filters.page} de {pageMeta.totalPages})
                    </>
                  )}
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => {
                          if (pageMeta?.hasPreviousPage) {
                            handlePageChange(filters.page - 1);
                          }
                        }}
                      />
                    </PaginationItem>
                    {renderPaginationItems()}
                    <PaginationItem>
                      {pageMeta?.hasNextPage ? (
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

        {/* Otros tabs - simplificados */}
        {["active", "inactive"].map((key) => (
          <TabsContent key={key} value={key} className="mt-0">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>Escenarios {key === "active" ? "Activos" : "Inactivos"}</CardTitle>
                    <Badge variant="outline" className="ml-2">
                      {scenarios.length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  Funcionalidad de filtrado por estado próximamente.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Modal Crear */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[650px] max-h-[80vh] mx-auto bg-white overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl text-teal-700">
              Crear Escenario
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-180px)]">
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
                <MapPin className="h-3 w-3 mr-1 text-teal-600" />
                Ubicación
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <ValidatedSelect
                  id="new-scenario-neighborhood"
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
                  id="new-scenario-address"
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

            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="font-medium text-gray-800 mb-2 text-sm">
                Información General
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <ValidatedInput
                  id="new-scenario-name"
                  label="Nombre del Escenario"
                  value={createFormData.name}
                  onChange={(value) => handleCreateFieldChange("name", value)}
                  error={formErrors.name}
                  placeholder="Ingrese nombre del escenario"
                  required
                />

                <div className="space-y-1">
                  <Label
                    htmlFor="new-scenario-description"
                    className="text-sm font-medium"
                  >
                    Descripción
                  </Label>
                  <Textarea
                    id="new-scenario-description"
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

      {/* Modal Editar */}
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
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-teal-600" />
                    Ubicación
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <ValidatedSelect
                      id="edit-scenario-neighborhood"
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
                      id="edit-scenario-address"
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

                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="font-medium text-gray-800 mb-2 text-sm">
                    Información General
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <ValidatedInput
                      id="edit-scenario-name"
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
                        htmlFor="edit-scenario-description"
                        className="text-sm font-medium"
                      >
                        Descripción
                      </Label>
                      <Textarea
                        id="edit-scenario-description"
                        value={updateFormData.description || ""}
                        onChange={(e) =>
                          handleUpdateFieldChange("description", e.target.value)
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
    </div>
  );
}
