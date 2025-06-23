"use client";

import {
  Download,
  Filter,
  Loader2,
  MapPin,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { ScenariosFiltersCard } from "@/features/scenarios/components/molecules/ScenariosFiltersCard";
import { createScenarioAction, updateScenarioAction } from "../actions/scenario.actions";
import { Scenario, CreateScenarioDto, UpdateScenarioDto } from "@/services/api";
import { ScenariosDataResponse } from "../application/GetScenariosDataUseCase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { memo, useCallback, useState, useTransition } from "react";
import { useScenariosData } from "../hooks/use-scenarios-data";
import { ScenariosTable } from "./organisms/scenarios-table";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "sonner";

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
  const [isPending, startTransition] = useTransition();

  // Pagination and filters using standardized hook
  const {
    filters,
    onPageChange,
    onLimitChange,
    onSearch,
    onFilterChange,
    buildPageMeta,
  } = useScenariosData();

  // Local state from initial data
  const [scenarios] = useState(initialData.scenarios);
  const [neighborhoods] = useState(initialData.neighborhoods);

  // Build page meta from initial data
  const pageMeta = buildPageMeta(initialData.meta.totalItems);

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
          description: `${(result.data as Scenario).name} ha sido registrado en el sistema.`,
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

      console.log("Updating scenario with data:", updateData);
      console.log("Selected scenario ID:", selectedScenario.id);

      // Usar server action
      const result = await updateScenarioAction(selectedScenario.id, updateData);

      if (result.success) {
        // Cerrar modal
        setIsDrawerOpen(false);
        setSelectedScenario(null);

        // Mostrar notificación de éxito
        toast.success("Escenario actualizado exitosamente", {
          description: `${(result.data as Scenario).name} ha sido actualizado.`,
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

  // Navigation handlers - now using standardized hooks
  const handleFiltersChange = (newFilters: any) => {
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({ search: "", neighborhoodId: undefined });
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
        filters={filters as any}
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
          <ScenariosTable
            rows={scenarios}
            meta={pageMeta}
            loading={false}
            filters={{
              page: pageMeta?.page || 1,
              search: filters.search || '',
            }}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
            onSearch={onSearch}
            onEdit={handleOpenDrawer}
          />
        </TabsContent>

        {/* Filtered tabs reuse same table but pre-filtered in memory */}
        {["active", "inactive"].map((k) => (
          <TabsContent key={k} value={k} className="mt-0">
            <ScenariosTable
              rows={scenarios.filter(
                (r) => r.status === k,
              )}
              meta={pageMeta}
              loading={false}
              filters={{
                page: pageMeta?.page || 1,
                search: filters.search || '',
              }}
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
              onSearch={onSearch}
              onEdit={handleOpenDrawer}
            />
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
