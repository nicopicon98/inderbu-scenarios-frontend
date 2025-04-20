"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Search, ChevronDown } from "lucide-react";

import { ActivityArea, Neighborhood } from "../../types/filters.types";
import { useHomeFilters } from "../../hooks/use-home-filters.hook";

interface FiltersSectionProps {
  initialActivityAreas: ActivityArea[];
  initialNeighborhoods: Neighborhood[];
}

export default function FiltersSection({
  initialActivityAreas,
  initialNeighborhoods,
}: FiltersSectionProps) {
  const {
    activityAreas,
    neighborhoods,
    filters,
    updateActivityArea,
    updateNeighborhood,
    updateSearchQuery,
  } = useHomeFilters({
    initialActivityAreas,
    initialNeighborhoods,
  });

  // mostrar actividades y barrios
  console.log("activityAreas", activityAreas);
  console.log("neighborhoods", neighborhoods);

  const [searchValue, setSearchValue] = useState("");
  const [showActivityAreasDropdown, setShowActivityAreasDropdown] =
    useState(false);
  const [showNeighborhoodsDropdown, setShowNeighborhoodsDropdown] =
    useState(false);

  // Encuentra el nombre del área seleccionada
  const selectedActivityArea = filters.activityArea
    ? activityAreas.find(
        (activityArea: ActivityArea) => activityArea.id === filters.activityArea
      )?.name
    : "Todas las áreas de interés";

  // Encuentra el nombre del barrio seleccionado
  const selectedNeighborhood = filters.neighborhood
    ? neighborhoods.find(
        (neighborhood: Neighborhood) => neighborhood.id === filters.neighborhood
      )?.name
    : "Todos los barrios";

  const handleSearch = () => {
    updateSearchQuery(searchValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Cerrar dropdowns cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActivityAreasDropdown || showNeighborhoodsDropdown) {
        const target = event.target as Node;
        if (
          !event.target ||
          !document.querySelector(".filters-container")?.contains(target)
        ) {
          setShowActivityAreasDropdown(false);
          setShowNeighborhoodsDropdown(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showActivityAreasDropdown, showNeighborhoodsDropdown]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 filters-container">
      {/** Áreas de interés */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Áreas de interés
        </label>
        <div className="relative">
          <div
            className="flex items-center border border-gray-300 rounded-md p-2 bg-gray-100 cursor-pointer"
            onClick={() =>
              setShowActivityAreasDropdown(!showActivityAreasDropdown)
            }
          >
            <span className="flex-1">{selectedActivityArea}</span>
            {filters.activityArea && (
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  updateActivityArea(null);
                }}
              >
                x
              </button>
            )}
            <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
          </div>

          {showActivityAreasDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border  border-gray-300 overflow-auto max-h-60">
              <div
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  updateActivityArea(null);
                  setShowActivityAreasDropdown(false);
                }}
              >
                Todas las áreas de interés
              </div>
              {activityAreas.map((area: ActivityArea) => (
                <div
                  key={area.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    updateActivityArea(area.id);
                    setShowActivityAreasDropdown(false);
                  }}
                >
                  {area.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/** Barrios */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Barrios
        </label>
        <div className="relative">
          <div
            className="flex items-center border border-gray-300 rounded-md p-2 bg-gray-100 cursor-pointer"
            onClick={() =>
              setShowNeighborhoodsDropdown(!showNeighborhoodsDropdown)
            }
          >
            <span className="flex-1">{selectedNeighborhood}</span>
            {filters.neighborhood && (
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  updateNeighborhood(null);
                }}
              >
                ×
              </button>
            )}
            <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
          </div>

          {showNeighborhoodsDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 overflow-auto max-h-60">
              <div
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  updateNeighborhood(null);
                  setShowNeighborhoodsDropdown(false);
                }}
              >
                Todos los barrios
              </div>
              {neighborhoods.map((neighborhood: Neighborhood) => (
                <div
                  key={neighborhood.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    updateNeighborhood(neighborhood.id);
                    setShowNeighborhoodsDropdown(false);
                  }}
                >
                  {neighborhood.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/** Búsqueda por nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre del escenario deportivo
        </label>
        <div className="flex">
          <input
            type="text"
            className="flex-1 border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Buscar escenario"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button
            className="rounded-l-none bg-teal-500 hover:bg-teal-600"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
