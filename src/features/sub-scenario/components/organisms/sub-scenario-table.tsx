"use client";

import { DashboardPagination } from "@/shared/components/organisms/dashboard-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { FileEdit, Loader2, Search } from "lucide-react";
import { PageMeta } from "@/shared/hooks/use-dashboard-pagination";
import { SubScenario } from "@/services/api";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";


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
  onPageChange(page: number): void;
  onLimitChange?(limit: number): void;
  onSearch(term: string): void;
  onEdit(row: SubScenario): void;
}

export function SubScenarioTable({
  rows,
  meta,
  loading,
  filters,
  onPageChange,
  onLimitChange,
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

        {meta && (
          <div className="border-t p-4">
            <DashboardPagination
              meta={meta}
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
              showLimitSelector={!!onLimitChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
