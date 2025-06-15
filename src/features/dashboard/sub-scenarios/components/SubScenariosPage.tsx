"use client";

import { SubScenariosFiltersCard } from "@/features/sub-scenario/components/molecules/SubScenariosFiltersCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { CreateSubScenarioDialog } from "@/features/sub-scenario/components/organisms/create-sub-scenario-dialog";
import { EditSubScenarioDialog } from "@/features/sub-scenario/components/organisms/edit-sub-scenario-dialog";
import { SubScenarioTable } from "@/features/sub-scenario/components/organisms/sub-scenario-table";
import { Download, Filter, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SubScenariosDataResponse } from "../application/GetSubScenariosDataUseCase";

interface SubScenariosPageProps {
  initialData: SubScenariosDataResponse;
}

export function SubScenariosPage({ initialData }: SubScenariosPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state from initial data
  const [subScenarios] = useState(initialData.subScenarios);
  const [scenarios] = useState(initialData.scenarios);
  const [activityAreas] = useState(initialData.activityAreas);
  const [neighborhoods] = useState(initialData.neighborhoods);
  const [fieldSurfaceTypes] = useState(initialData.fieldSurfaceTypes);
  const [pageMeta] = useState(initialData.meta);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  // Extract filters from URL
  const filters = {
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 7,
    search: searchParams.get('search') || "",
    scenarioId: searchParams.get('scenarioId') ? Number(searchParams.get('scenarioId')) : undefined,
    activityAreaId: searchParams.get('activityAreaId') ? Number(searchParams.get('activityAreaId')) : undefined,
    neighborhoodId: searchParams.get('neighborhoodId') ? Number(searchParams.get('neighborhoodId')) : undefined,
  };

  const onFilterChange = (updatedFilters: any) => {
    const params = new URLSearchParams();
    
    // Add filters
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });

    // Reset to page 1 when filters change
    params.set('page', '1');
    
    router.push(`/dashboard/sub-scenarios?${params.toString()}`);
  };

  const onSearch = (searchQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    params.set('page', '1'); // Reset to page 1
    router.push(`/dashboard/sub-scenarios?${params.toString()}`);
  };

  const onPageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/dashboard/sub-scenarios?${params.toString()}`);
  };

  const refetch = () => {
    router.refresh();
  };

  return (
    <>
      <div className="space-y-6">
        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Sub-Escenarios Deportivos
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" /> Filtros
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Nuevo
            </Button>
          </div>
        </div>

        {/* filters */}
        <SubScenariosFiltersCard
          visible={showFilters}
          filters={filters}
          onChange={onFilterChange}
          onToggle={() => setShowFilters(false)}
        />

        {/* tabs */}
        <Tabs defaultValue="all" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Activos</TabsTrigger>
              <TabsTrigger value="inactive">Inactivos</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Exportar
            </Button>
          </div>

          <TabsContent value="all" className="mt-0">
            <SubScenarioTable
              rows={subScenarios}
              meta={pageMeta}
              loading={false}
              filters={{
                page: filters.page,
                search: filters.search,
              }}
              onPage={onPageChange}
              onSearch={onSearch}
              onEdit={(row) => {
                setSelected(row);
                setEditOpen(true);
              }}
            />
          </TabsContent>

          {/* filtered tabs reuse same table but pre-filtered in memory */}
          {["active", "inactive"].map((k) => (
            <TabsContent key={k} value={k} className="mt-0">
              <SubScenarioTable
                rows={subScenarios.filter(
                  (r) => r.state === (k === "active"),
                )}
                meta={pageMeta}
                loading={false}
                filters={{
                  page: filters.page,
                  search: filters.search,
                }}
                onPage={onPageChange}
                onSearch={onSearch}
                onEdit={(row) => {
                  setSelected(row);
                  setEditOpen(true);
                }}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* dialogs */}
      <CreateSubScenarioDialog 
        open={createOpen} 
        onOpenChange={setCreateOpen}
        onSuccess={() => {
          refetch();
          setCreateOpen(false);
        }}
      />
      <EditSubScenarioDialog
        open={editOpen}
        subScenario={selected}
        onOpenChange={setEditOpen}
        onSuccess={() => {
          refetch();
          setEditOpen(false);
          setSelected(null);
        }}
      />
    </>
  );
}
