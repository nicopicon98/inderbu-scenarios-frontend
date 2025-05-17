import { FacilityCard } from "@/shared/components/organisms/facility-card";
import { SubScenario } from "@/features/home/types/filters.types";
import { FC, useState, useEffect } from "react";

interface FacilityGridProps {
  subScenarios: SubScenario[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const FacilityGrid: FC<FacilityGridProps> = ({ 
  subScenarios, 
  isLoading = false,
  emptyMessage = "No hay escenarios disponibles bajo esos criterios de búsqueda, intenta con otros."
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, index) => (
          <div 
            key={`skeleton-${index}`} 
            className="bg-gray-100 rounded-lg h-64 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (subScenarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg 
          className="w-16 h-16 text-gray-400 mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <p className="text-center text-gray-600 font-medium">{emptyMessage}</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
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
          <FacilityCard subScenario={sub} />
        </div>
      ))}
    </div>
  );
};

export default FacilityGrid;