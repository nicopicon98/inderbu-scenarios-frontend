"use client";

import { useState } from "react";
import { SimpleLayout } from "@/shared/components/layout/simple-layout";
import { FilterToolbar } from "@/shared/ui/filter-toolbar";
import { DataTable } from "@/shared/ui/data-table";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/status-badge";
import { Badge } from "@/shared/ui/badge";
import { Drawer } from "@/shared/ui/drawer";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { Plus, FileEdit } from "lucide-react";
import {
  ClientDrawer,
  IClient,
} from "@/features/dashboard/components/client-drawer";

// Mock data
const clients = [
  {
    id: "1001",
    document: "90148313",
    name: "ACADEMIA DE BADMINTON SANTANDER",
    created: "2025-01-13",
    status: "active",
  },
  {
    id: "1002",
    document: "91245678",
    name: "CLUB DEPORTIVO BUCARAMANGA",
    created: "2025-01-15",
    status: "active",
  },
  {
    id: "1003",
    document: "800123456",
    name: "ASOCIACIÓN DEPORTIVA SANTANDER",
    created: "2025-01-20",
    status: "inactive",
  },
];

interface IOption {
  value: string;
  label: string;
}

interface IFilterOption {
  id: string;
  label: string;
  type: "text" | "select" | "date";
  placeholder: string;
  options?: IOption[];
}

// Filter options
const filterOptions: IFilterOption[] = [
  {
    id: "documentOrName",
    label: "Documento/Nombre",
    type: "text",
    placeholder: "Documento/Nombre",
  },
  {
    id: "neighborhood",
    label: "Barrio",
    type: "select",
    placeholder: "Todos los barrios...",
    options: [
      { value: "all", label: "Todos los barrios..." },
      { value: "san-alonso", label: "San Alonso" },
      { value: "provenza", label: "Provenza" },
      { value: "alvarez", label: "Álvarez Las Americas" },
    ],
  },
  {
    id: "createdFrom",
    label: "Creado desde",
    type: "date",
    placeholder: "",
  },
  {
    id: "createdTo",
    label: "Creado hasta",
    type: "date",
    placeholder: "",
  },
  {
    id: "status",
    label: "Estado",
    type: "select",
    placeholder: "Todos los estados...",
    options: [
      { value: "all", label: "Todos los estados..." },
      { value: "active", label: "Activo" },
      { value: "inactive", label: "Inactivo" },
    ],
  },
];

export default function ClientsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleOpenDrawer = (client: any) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  const handleSaveDrawer = async (data: Partial<IClient>) => {
    // Implement
  };

  const handleSearch = (filters: Record<string, string>) => {
    console.log("Search with filters:", filters);
    // Here you would fetch data with the filters
  };

  const columns = [
    {
      id: "id",
      header: "Cód.",
      cell: (row: any) => <span>{row.id}</span>,
    },
    {
      id: "document",
      header: "Documento",
      cell: (row: any) => <span>{row.document}</span>,
    },
    {
      id: "name",
      header: "Nombre",
      cell: (row: any) => <span>{row.name}</span>,
    },
    {
      id: "created",
      header: "Creado",
      cell: (row: any) => <span>{row.created}</span>,
    },
    {
      id: "status",
      header: "Estado",
      cell: (row: any) => <StatusBadge status={row.status} />,
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (row: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenDrawer(row)}
        >
          <FileEdit className="h-4 w-4 mr-1" />
          Abrir
        </Button>
      ),
    },
  ];

  return (
    <SimpleLayout>
      <FilterToolbar filters={filterOptions} onSearch={handleSearch} />
      <div className="bg-white rounded-md border p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold">Listado de Clientes</h2>
          <Badge variant="outline" className="ml-2">
            350
          </Badge>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo
        </Button>
      </div>
      <DataTable
        data={clients}
        columns={columns}
        totalItems={350}
        pageSize={10}
        currentPage={currentPage}
        totalPages={35}
        onPageChange={setCurrentPage}
      />
      {/* Edit Drawer */}
      <ClientDrawer
        open={isDrawerOpen}
        client={selectedClient}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveDrawer}
      />
      ;
    </SimpleLayout>
  );
}
