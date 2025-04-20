import { Button } from '@/shared/ui/button';
import { Search, ChevronDown } from 'lucide-react';
  
export default function FiltersSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/** Áreas de interés */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Áreas de interés</label>
        <div className="relative">
          <div className="flex items-center border rounded-md p-2 bg-gray-100">
            <span className="flex-1">Todas las áreas de interés</span>
            <button className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/** Barrios */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Barrios</label>
        <div className="relative">
          <div className="flex items-center border rounded-md p-2 bg-gray-100">
            <span className="flex-1">Todos los barrios</span>
            <button className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/** Búsqueda por nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del escenario deportivo</label>
        <div className="flex">
          <input
            type="text"
            className="flex-1 border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Buscar escenario"
          />
          <Button className="rounded-l-none bg-teal-500 hover:bg-teal-600">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
