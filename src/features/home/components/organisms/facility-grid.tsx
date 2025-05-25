import { ModernFacilityCard } from "@/shared/components/organisms/modern-facility-card";
import { SubScenario } from "@/features/home/types/filters.types";
import { FC, useState, useEffect } from "react";

interface FacilityGridProps {
  subScenarios: SubScenario[];
  isLoading?: boolean;
  emptyMessage?: string;
  onClearFilters?: () => void;
}

export const FacilityGrid: FC<FacilityGridProps> = ({ 
  subScenarios, 
  isLoading = false,
  emptyMessage = "No hay escenarios disponibles bajo esos criterios de búsqueda, intenta con otros.",
  onClearFilters
}) => {
  const [animateItems, setAnimateItems] = useState(false);
  
  useEffect(() => {
    // Animar items al cargar
    if (!isLoading && subScenarios.length > 0) {
      setAnimateItems(false);
      setTimeout(() => setAnimateItems(true), 150);
    }
  }, [subScenarios, isLoading]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {[...Array(6)].map((_, index) => (
          <div 
            key={`skeleton-${index}`} 
            className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl h-80 animate-pulse 
                       shadow-sm border border-gray-100"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="p-4 h-full flex flex-col">
              <div className="bg-gray-200 rounded-lg h-48 mb-4 animate-pulse" />
              <div className="space-y-3 flex-1">
                <div className="bg-gray-200 rounded h-4 w-3/4 animate-pulse" />
                <div className="bg-gray-200 rounded h-3 w-1/2 animate-pulse" />
                <div className="bg-gray-200 rounded h-3 w-full animate-pulse" />
                <div className="flex justify-between pt-2">
                  <div className="bg-gray-200 rounded h-3 w-1/4 animate-pulse" />
                  <div className="bg-gray-200 rounded h-3 w-1/4 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (subScenarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-full p-6 mb-6">
          <svg 
            className="w-12 h-12 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No encontramos escenarios</h3>
        <p className="text-center text-gray-600 mb-6 max-w-md leading-relaxed">
          {emptyMessage}
        </p>
        <button 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                    transition-all duration-200 font-medium shadow-sm hover:shadow-md 
                    transform hover:-translate-y-0.5"
          onClick={onClearFilters}
        >
          Reiniciar filtros
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {subScenarios.map((sub, index) => (
        <div 
          key={sub.id} 
          className={`transform transition-all duration-300 ${
            animateItems ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{ transitionDelay: `${index * 75}ms` }}
        >
          <ModernFacilityCard subScenario={sub} priority={index < 3} />
        </div>
      ))}
    </div>
  );
};

export default FacilityGrid;