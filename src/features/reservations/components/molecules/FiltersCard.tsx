"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/ui/card";
import { FilterToolbar } from "@/shared/ui/filter-toolbar";
import { Filter } from "lucide-react";
import { reservationFilters } from "../../constants/filterOptions";


interface FiltersCardProps {
  open: boolean;
  onSearch: (filters: Record<string, string>) => void;
}

export const FiltersCard = ({ open, onSearch }: FiltersCardProps) => {
  if (!open) return null;

  return (
    <div className="mb-4 animate-fade-in">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filtros de búsqueda
          </CardTitle>
          <CardDescription>
            Refina los resultados usando los siguientes filtros
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FilterToolbar
            filters={reservationFilters}
            onSearch={onSearch}
          />
        </CardContent>
      </Card>
    </div>
  );
};
