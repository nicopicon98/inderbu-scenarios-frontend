"use client";

import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

interface DataTableProps<T> {
  data: T[];
  columns: {
    id: string;
    header: string;
    cell: (item: T) => React.ReactNode;
    sortable?: boolean;
  }[];
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
  isLoading?: boolean; // Añadida la propiedad isLoading
}

export function DataTable<T>({
  data,
  columns,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  currentPage = 1,
  totalPages = 1,
  isLoading = false, // Añadido valor por defecto
}: DataTableProps<T>) {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const toggleSelectAll = () => {
    if (selectedItems.size === data.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(
        new Set(Array.from({ length: data.length }, (_, i) => i)),
      );
    }
  };

  const toggleSelectItem = (index: number) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(index)) {
      newSelectedItems.delete(index);
    } else {
      newSelectedItems.add(index);
    }
    setSelectedItems(newSelectedItems);
  };

  return (
    <div className="rounded-md border bg-white">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={
                    selectedItems.size === data.length && data.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead key={column.id} className="font-medium">
                  {column.header}
                  {column.sortable && (
                    <button className="ml-1 inline-flex">
                      <span className="sr-only">Sort by {column.header}</span>
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </button>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Estado de carga
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <span>Cargando datos...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              // Sin datos
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  No hay datos disponibles.
                </TableCell>
              </TableRow>
            ) : (
              // Datos normales
              data.map((item, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={selectedItems.has(index)}
                      onChange={() => toggleSelectItem(index)}
                    />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={`${index}-${column.id}`}>
                      {column.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalItems > 0 && !isLoading && (
        <div className="flex items-center justify-between px-4 py-2 border-t">
          <div className="text-sm text-gray-700">
            Mostrando registros del {(currentPage - 1) * pageSize + 1} al{" "}
            {Math.min(currentPage * pageSize, totalItems)} de un total de{" "}
            {totalItems}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange?.(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">Primera página</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Página anterior</span>
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber =
                currentPage <= 3
                  ? i + 1
                  : currentPage >= totalPages - 2
                    ? totalPages - 4 + i
                    : currentPage - 2 + i;

              if (pageNumber <= 0 || pageNumber > totalPages) return null;

              return (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onPageChange?.(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Página siguiente</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange?.(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Última página</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
