"use client";

import { useState } from "react";
import { Search, MapPin, Tag, X, Filter, DollarSign } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { SearchSelect } from "@/shared/components/molecules/search-select";
import { searchActivityAreas, searchNeighborhoods } from "../../api/search.service";
import { ActivityArea, Neighborhood } from "../../types/filters.types";

interface ModernFiltersProps {
  initialActivityAreas: ActivityArea[];
  initialNeighborhoods: Neighborhood[];
  onFiltersChange: (filters: {
    activityAreaId?: number;
    neighborhoodId?: number;
    searchQuery?: string;
    hasCost?: boolean;
  }) => void;
}

export default function ModernFilters({
  initialActivityAreas,
  initialNeighborhoods,
  onFiltersChange,
}: ModernFiltersProps) {
  const [selectedArea, setSelectedArea] = useState<string | number>("all");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | number>("all");
  const [selectedCostFilter, setSelectedCostFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleAreaChange = (value: string | number | null) => {
    const actualValue = value === null || value === "all" ? "all" : value;
    setSelectedArea(actualValue);
    updateFilters({ activityAreaId: actualValue !== "all" ? Number(actualValue) : undefined });
    
    if (actualValue !== "all") {
      // We'll get the display name from the SearchSelect component when available
      updateActiveFilters('area', actualValue.toString(), `Área seleccionada`);
    } else {
      removeActiveFilter('area');
    }
  };

  const handleNeighborhoodChange = (value: string | number | null) => {
    const actualValue = value === null || value === "all" ? "all" : value;
    setSelectedNeighborhood(actualValue);
    updateFilters({ neighborhoodId: actualValue !== "all" ? Number(actualValue) : undefined });
    
    if (actualValue !== "all") {
      // We'll get the display name from the SearchSelect component when available
      updateActiveFilters('neighborhood', actualValue.toString(), `Barrio seleccionado`);
    } else {
      removeActiveFilter('neighborhood');
    }
  };

  const handleCostFilterChange = (value: string) => {
    setSelectedCostFilter(value);
    let hasCost: boolean | undefined;
    
    if (value === "paid") {
      hasCost = true;
      updateActiveFilters('cost', value, "Solo de pago");
    } else if (value === "free") {
      hasCost = false;
      updateActiveFilters('cost', value, "Solo gratuitos");
    } else {
      hasCost = undefined;
      removeActiveFilter('cost');
    }
    
    updateFilters({ hasCost });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      updateFilters({ searchQuery: value });
      if (value) {
        updateActiveFilters('search', value, `"${value}"`);
      } else {
        removeActiveFilter('search');
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  const updateFilters = (newFilters: any) => {
    onFiltersChange({
      activityAreaId: selectedArea && selectedArea !== "all" ? Number(selectedArea) : undefined,
      neighborhoodId: selectedNeighborhood && selectedNeighborhood !== "all" ? Number(selectedNeighborhood) : undefined,
      searchQuery,
      hasCost: selectedCostFilter === "paid" ? true : selectedCostFilter === "free" ? false : undefined,
      ...newFilters,
    });
  };

  const updateActiveFilters = (type: string, value: string, displayName: string) => {
    const newFilters = [...activeFilters];
    const filterIndex = newFilters.findIndex(f => f.startsWith(`${type}:`));
    
    if (filterIndex >= 0) {
      if (value) {
        newFilters[filterIndex] = `${type}:${value}:${displayName}`;
      } else {
        newFilters.splice(filterIndex, 1);
      }
    } else if (value) {
      newFilters.push(`${type}:${value}:${displayName}`);
    }
    
    setActiveFilters(newFilters);
  };

  const removeActiveFilter = (type: string) => {
    setActiveFilters(prev => prev.filter(f => !f.startsWith(`${type}:`)));
  };

  const clearAllFilters = () => {
    setSelectedArea("all");
    setSelectedNeighborhood("all");
    setSelectedCostFilter("all");
    setSearchQuery("");
    setActiveFilters([]);
    onFiltersChange({});
  };

  const clearFilter = (filterToRemove: string) => {
    const [type] = filterToRemove.split(':');
    if (type === 'area') {
      setSelectedArea("all");
      updateFilters({ activityAreaId: undefined });
    } else if (type === 'neighborhood') {
      setSelectedNeighborhood("all");
      updateFilters({ neighborhoodId: undefined });
    } else if (type === 'cost') {
      setSelectedCostFilter("all");
      updateFilters({ hasCost: undefined });
    } else if (type === 'search') {
      setSearchQuery("");
      updateFilters({ searchQuery: "" });
    }
    removeActiveFilter(type);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">Filtrar escenarios</h2>
      </div>

      {/* Main filters row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Search */}
        <div className="md:col-span-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Buscar por nombre
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Ej: Polideportivo, Cancha..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 
                         transition-all duration-200 bg-gray-50/50 hover:bg-white"
            />
          </div>
        </div>

        {/* Activity Area - SearchSelect */}
        <div className="md:col-span-3">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Área deportiva
          </label>
          <SearchSelect
            placeholder="Todas las áreas"
            searchPlaceholder="Ej: fútbol, baloncesto, natación..."
            icon={Tag}
            value={selectedArea}
            onValueChange={handleAreaChange}
            onSearch={searchActivityAreas}
            emptyMessage="No se encontraron áreas deportivas"
            className="w-full"
          />
        </div>

        {/* Neighborhood - SearchSelect */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Barrio
          </label>
          <SearchSelect
            placeholder="Todos"
            searchPlaceholder="Ej: centro, laureles, poblado..."
            icon={MapPin}
            value={selectedNeighborhood}
            onValueChange={handleNeighborhoodChange}
            onSearch={searchNeighborhoods}
            emptyMessage="No se encontraron barrios"
            className="w-full"
          />
        </div>

        {/* Cost Filter */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Costo
          </label>
          <Select value={selectedCostFilter} onValueChange={handleCostFilterChange}>
            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 
                                   bg-gray-50/50 hover:bg-white transition-all duration-200">
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Todos" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="free">Solo gratuitos</SelectItem>
              <SelectItem value="paid">Solo de pago</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear button */}
        <div className="md:col-span-1">
          {activeFilters.length > 0 && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 
                         transition-all duration-200"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500 mr-2">Filtros activos:</span>
          {activeFilters.map((filter) => {
            const [type, value, displayName] = filter.split(':');

            return (
              <Badge
                key={filter}
                variant="secondary"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer 
                         transition-all duration-200 group px-3 py-1"
                onClick={() => clearFilter(filter)}
              >
                {displayName}
                <X className="w-3 h-3 ml-1 group-hover:text-blue-900" />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
