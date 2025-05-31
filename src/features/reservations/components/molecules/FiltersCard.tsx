"use client";

import {
  searchActivityAreas,
  searchNeighborhoods,
  searchScenarios,
  searchUsers,
} from "../../api/dashboard-search.service";
import { SearchSelect } from "@/shared/components/molecules/search-select";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Building, Calendar, Filter, MapPin, Tag, User, X } from "lucide-react";
import { useRef, useState } from "react";

type Filters = {
  scenarioId?: number;
  activityAreaId?: number;
  neighborhoodId?: number;
  userId?: number;
  // ⭐ NUEVOS FILTROS DE FECHA
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
};

interface FiltersCardProps {
  open: boolean;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
}

export const FiltersCard = ({
  open,
  filters,
  onFiltersChange,
  onClearFilters,
}: FiltersCardProps) => {
  // ⚠️ TODOS LOS HOOKS DEBEN IR AL INICIO - ANTES DE CUALQUIER RETURN CONDICIONAL
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // ✅ AHORA SÍ PODEMOS HACER RETURN CONDICIONAL
  if (!open) return null;

  /* ─────────── Handlers ─────────── */
  const handleScenarioChange = (value: string | number | null) => {
    const val = value === "all" || value === null ? undefined : Number(value);
    onFiltersChange({ ...filters, scenarioId: val });
    updateChip(
      "scenario",
      val?.toString() ?? "",
      "Escenario seleccionado",
      val !== undefined,
    );
  };

  const handleActivityAreaChange = (value: string | number | null) => {
    const val = value === "all" || value === null ? undefined : Number(value);
    onFiltersChange({ ...filters, activityAreaId: val });
    updateChip(
      "activity",
      val?.toString() ?? "",
      "Actividad seleccionada",
      val !== undefined,
    );
  };

  const handleNeighborhoodChange = (value: string | number | null) => {
    const val = value === "all" || value === null ? undefined : Number(value);
    onFiltersChange({ ...filters, neighborhoodId: val });
    updateChip(
      "neighborhood",
      val?.toString() ?? "",
      "Barrio seleccionado",
      val !== undefined,
    );
  };

  const handleUserChange = (value: string | number | null) => {
    const val = value === "all" || value === null ? undefined : Number(value);
    onFiltersChange({ ...filters, userId: val });
    updateChip(
      "user",
      val?.toString() ?? "",
      "Usuario seleccionado",
      val !== undefined,
    );
  };

  // ⭐ NUEVOS HANDLERS PARA FECHAS
  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || undefined;
    onFiltersChange({ ...filters, dateFrom: value });
    updateChip("dateFrom", value ?? "", `Desde: ${value}`, value !== undefined);
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || undefined;
    onFiltersChange({ ...filters, dateTo: value });
    updateChip("dateTo", value ?? "", `Hasta: ${value}`, value !== undefined);
  };

  /* Debounce de búsqueda - searchTimeout ya está declarado arriba */

  /* ─────────── Chips visuales ─────────── */
  const updateChip = (
    type: string,
    value: string,
    display: string,
    add: boolean,
  ) => {
    setActiveFilters((chips) => {
      const next = [...chips.filter((c) => !c.startsWith(`${type}:`))];
      if (add) next.push(`${type}:${value}:${display}`);
      return next;
    });
  };

  const removeChip = (chip: string) => {
    const [type] = chip.split(":");
    if (type === "scenario") handleScenarioChange("all");
    else if (type === "activity") handleActivityAreaChange("all");
    else if (type === "neighborhood") handleNeighborhoodChange("all");
    else if (type === "user") handleUserChange("all");
    // ⭐ NUEVOS CASOS PARA FECHAS
    else if (type === "dateFrom") {
      onFiltersChange({ ...filters, dateFrom: undefined });
    } else if (type === "dateTo") {
      onFiltersChange({ ...filters, dateTo: undefined });
    }
    setActiveFilters((c) => c.filter((x) => x !== chip));
  };

  const clearAllFilters = () => {
    onClearFilters();
    setActiveFilters([]);
  };

  return (
    <div className="mb-4 animate-fade-in">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filtros de búsqueda
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span>
              Refina los resultados de reservas usando los siguientes filtros
            </span>
            {(filters.scenarioId ||
              filters.activityAreaId ||
              filters.neighborhoodId ||
              filters.userId ||
              filters.dateFrom ||
              filters.dateTo) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Limpiar todo
              </Button>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm backdrop-blur-sm">
            {/* Fila principal */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Escenario */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Escenario
                </label>
                <SearchSelect
                  placeholder="Todos los escenarios"
                  searchPlaceholder="Buscar escenario..."
                  icon={Building}
                  value={filters.scenarioId ?? "all"}
                  onValueChange={handleScenarioChange}
                  onSearch={searchScenarios}
                  emptyMessage="No se encontraron escenarios"
                  className="w-full"
                />
              </div>

              {/* Área deportiva */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Actividad
                </label>
                <SearchSelect
                  placeholder="Todas las actividades"
                  searchPlaceholder="Buscar actividad..."
                  icon={Tag}
                  value={filters.activityAreaId ?? "all"}
                  onValueChange={handleActivityAreaChange}
                  onSearch={searchActivityAreas}
                  emptyMessage="No se encontraron actividades"
                  className="w-full"
                />
              </div>

              {/* Barrio */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Barrio
                </label>
                <SearchSelect
                  placeholder="Todos los barrios"
                  searchPlaceholder="Buscar barrio..."
                  icon={MapPin}
                  value={filters.neighborhoodId ?? "all"}
                  onValueChange={handleNeighborhoodChange}
                  onSearch={searchNeighborhoods}
                  emptyMessage="No se encontraron barrios"
                  className="w-full"
                />
              </div>

              {/* Usuario */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Usuario
                </label>
                <SearchSelect
                  placeholder="Todos los usuarios"
                  searchPlaceholder="Buscar usuario..."
                  icon={User}
                  value={filters.userId ?? "all"}
                  onValueChange={handleUserChange}
                  onSearch={searchUsers}
                  emptyMessage="No se encontraron usuarios"
                  className="w-full"
                />
              </div>

              {/* ⭐ FECHA DESDE */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Fecha Desde
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={filters.dateFrom ?? ""}
                    onChange={handleDateFromChange}
                    className="pl-10 w-full"
                    placeholder="Fecha inicial"
                  />
                </div>
              </div>

              {/* ⭐ FECHA HASTA */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Fecha Hasta
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={filters.dateTo ?? ""}
                    onChange={handleDateToChange}
                    className="pl-10 w-full"
                    placeholder="Fecha final"
                  />
                </div>
              </div>
            </div>

            {/* Chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500 mr-2">
                  Filtros activos:
                </span>
                {activeFilters.map((chip) => {
                  const [, , display] = chip.split(":");
                  return (
                    <Badge
                      key={chip}
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer transition-all duration-200 group px-3 py-1"
                      onClick={() => removeChip(chip)}
                    >
                      {display}
                      <X className="w-3 h-3 ml-1 group-hover:text-blue-900" />
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
