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
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { FileEdit, Loader2, MoreHorizontal } from "lucide-react";
import { PageMeta, SubScenario } from "@/services/api";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Search } from "lucide-react";
import { JSX } from "react";


interface Column {
  id: string;
  header: string;
  cell: (row: SubScenario) => React.ReactNode;
}

interface Props {
  rows: SubScenario[];
  meta: PageMeta | null;
  loading: boolean;
  filters: { page: number; search: string };
  onPage(page: number): void;
  onSearch(term: string): void;
  onEdit(row: SubScenario): void;
}

export function SubScenarioTable({
  rows,
  meta,
  loading,
  filters,
  onPage,
  onSearch,
  onEdit,
}: Props) {
  const columns: Column[] = [
    {
      id: "scenario",
      header: "Escenario",
      cell: (r) => r.scenario?.name ?? "—",
    },
    { id: "name", header: "Nombre", cell: (r) => r.name },
    {
      id: "activity",
      header: "Área",
      cell: (r) => r.activityArea?.name ?? "—",
    },
    {
      id: "state",
      header: "Estado",
      cell: (r) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium
          ${r.state ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-800"}`}
        >
          {r.state ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2"
            onClick={() => onEdit(r)}
          >
            <FileEdit className="h-4 w-4 mr-1" /> Editar
          </Button>
        </div>
      ),
    },
  ];

  // ─── Pagination helpers ─────────────────────────────────────────────────────
  const renderPaginationItems = () => {
    if (!meta) return null;

    const items: JSX.Element[] = [];
    const { page } = filters;
    const total = meta.totalPages;

    // first page
    items.push(
      <PaginationItem key={1}>
        <PaginationLink isActive={page === 1} onClick={() => onPage(1)}>
          1
        </PaginationLink>
      </PaginationItem>,
    );

    if (page > 3)
      items.push(
        <PaginationItem key="e1">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(total - 1, page + 1);
      i++
    ) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink isActive={page === i} onClick={() => onPage(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }
    if (page < total - 2)
      items.push(
        <PaginationItem key="e2">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    if (total > 1) {
      items.push(
        <PaginationItem key={total}>
          <PaginationLink
            isActive={page === total}
            onClick={() => onPage(total)}
          >
            {total}
          </PaginationLink>
        </PaginationItem>,
      );
    }
    return items;
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Listado de Sub-Escenarios</CardTitle>
            <Badge variant="outline">{meta?.totalItems ?? 0}</Badge>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Buscar…"
              value={filters.search}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {columns.map((c) => (
                  <th
                    key={c.id}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500"
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center"
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mr-2 inline-block" />{" "}
                    Cargando…
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    {columns.map((c) => (
                      <td key={c.id} className="px-4 py-3 text-sm">
                        {c.cell(r)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-8 text-center text-sm text-gray-500"
                  >
                    No se encontraron resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t">
          {meta && (
            <span className="text-sm text-gray-500">
              Mostrando {rows.length} de {meta.totalItems} (pág. {filters.page}/
              {meta.totalPages})
            </span>
          )}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => filters.page > 1 && onPage(filters.page - 1)}
                  className={filters.page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {renderPaginationItems()}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => meta && filters.page < meta.totalPages && onPage(filters.page + 1)}
                  className={meta && filters.page >= meta.totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
