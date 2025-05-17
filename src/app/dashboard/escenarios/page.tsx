"use client";

import { useState } from "react";
import { SimpleLayout } from "@/shared/components/layout/simple-layout";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Switch } from "@/shared/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/shared/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Plus,
  FileEdit,
  Search,
  Filter,
  Download,
  Printer,
  MoreHorizontal,
  MapPin,
} from "lucide-react";

// Mock data
const venues = [
  {
    id: "136",
    name: "ÓVALO AZUL VELODROMO ALFONSO FLOREZ ORTIZ",
    neighborhood: "SAN ALONSO",
    address: "Calle 14 entre carrera 32 y 32ª Villa Olímpica Alfonso López",
    status: "inactive",
  },
  {
    id: "186",
    name: "ÁREA DE CAFETERÍA - PARQUE RECREO- DEPORTIVO LAS AMERICAS",
    neighborhood: "ÁLVAREZ LAS AMERICAS",
    address: "CALLE 35 N 42 - 14",
    status: "inactive",
  },
  {
    id: "208",
    name: "PROVENZA - ZONA DE CALISTENIA - PARQUE DEPORTIVO",
    neighborhood: "PROVENZA",
    address: "Cr 23 Nº 110 -35",
    status: "inactive",
  },
  {
    id: "145",
    name: "PROVENZA - PATINODROMO - PARQUE RECREO- DEPORTIVO",
    neighborhood: "PROVENZA",
    address: "Cr 23 Nº 110 -35",
    status: "active",
  },
  {
    id: "183",
    name: "PROVENZA - PARQUE DEPORTIVO - KIOSKO 2",
    neighborhood: "PROVENZA",
    address: "Cr 23 Nº 110 -35",
    status: "inactive",
  },
];

// Filter options
const filterOptions = [
  {
    id: "codeOrName",
    label: "Código/Nombre",
    type: "text",
    placeholder: "Código/Nombre",
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

// Stats
const stats = [
  {
    title: "Total Escenarios",
    value: "201",
    change: "+2",
    trend: "up",
    icon: MapPin,
  },
  {
    title: "Escenarios Activos",
    value: "42",
    change: "0",
    trend: "neutral",
    icon: MapPin,
  },
  {
    title: "Barrios Cubiertos",
    value: "18",
    change: "+1",
    trend: "up",
    icon: MapPin,
  },
  {
    title: "Reservas Activas",
    value: "124",
    change: "+15%",
    trend: "up",
    icon: MapPin,
  },
];

type Venue = {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  status: string;
};

export default function FacilityManagement() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenDrawer = (venue: any) => {
    setSelectedVenue(venue);
    setIsDrawerOpen(true);
  };

  const handleSearch = (filters: any) => {
    console.log("Search with filters:", filters);
    setShowFilters(false);
  };

  // Filter venues based on search query
  const filteredVenues = venues.filter((venue) => {
    if (!searchQuery) return true;

    return (
      venue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Columns for data table
  const columns = [
    {
      id: "id",
      header: "Cód.",
      cell: (row: any) => <span>{row.id}</span>,
    },
    {
      id: "neighborhood",
      header: "Barrio",
      cell: (row: any) => <span>{row.neighborhood}</span>,
    },
    {
      id: "name",
      header: "Nombre",
      cell: (row: any) => <span>{row.name}</span>,
    },
    {
      id: "address",
      header: "Dirección",
      cell: (row: any) => <span>{row.address}</span>,
    },
    {
      id: "status",
      header: "Estado",
      cell: (row: any) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.status === "active"
              ? "bg-orange-100 text-orange-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status === "active" ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenDrawer(row)}
            className="h-8 px-2 py-0"
          >
            <FileEdit className="h-4 w-4 mr-1" />
            Abrir
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Ver detalles</DropdownMenuItem>
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Desactivar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <SimpleLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Escenarios Deportivos
          </h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button onClick={() => setIsModalOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Escenario
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-xs ${
                    stat.trend === "up"
                      ? "text-green-600"
                      : stat.trend === "down"
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {stat.change} desde el mes pasado
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Activos</TabsTrigger>
              <TabsTrigger value="inactive">Inactivos</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Tab All */}
          <TabsContent value="all" className="mt-0">
            {showFilters && (
              <div className="mb-4 animate-in fade-in">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Filtros de búsqueda
                    </CardTitle>
                    <CardDescription>
                      Refina los resultados usando los siguientes filtros
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {filterOptions.map((filter) => (
                        <div key={filter.id} className="space-y-2">
                          <Label htmlFor={filter.id}>{filter.label}</Label>
                          {filter.type === "text" ? (
                            <Input
                              id={filter.id}
                              placeholder={filter.placeholder}
                            />
                          ) : (
                            <select
                              id={filter.id}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {filter.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button onClick={() => handleSearch({})}>Buscar</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>Listado de Escenarios</CardTitle>
                    <Badge variant="outline" className="ml-2">
                      {venues.length}
                    </Badge>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar escenario..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        {columns.map((column) => (
                          <th
                            key={column.id}
                            className="px-4 py-3 text-left text-sm font-medium text-gray-500"
                          >
                            {column.header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVenues.length > 0 ? (
                        filteredVenues.map((venue) => (
                          <tr
                            key={venue.id}
                            className="border-b hover:bg-gray-50"
                          >
                            {columns.map((column) => (
                              <td
                                key={`${venue.id}-${column.id}`}
                                className="px-4 py-3 text-sm"
                              >
                                {column.cell(venue)}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="px-4 py-8 text-center text-sm text-gray-500"
                          >
                            No se encontraron escenarios con los filtros
                            aplicados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between px-4 py-2 border-t">
                  <div className="text-sm text-gray-500">
                    Mostrando{" "}
                    <span className="font-medium">{filteredVenues.length}</span>{" "}
                    de <span className="font-medium">{venues.length}</span>{" "}
                    escenarios
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === Math.ceil(venues.length / 10)}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tabs Filtered */}
          {[
            {
              key: "active",
              label: "Escenarios Activos",
              count: venues.filter((v) => v.status === "active").length,
            },
            {
              key: "inactive",
              label: "Escenarios Inactivos",
              count: venues.filter((v) => v.status === "inactive").length,
            },
          ].map(({ key, label, count }) => (
            <TabsContent key={key} value={key} className="mt-0">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle>{label}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {count}
                      </Badge>
                    </div>
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar escenario..."
                        className="pl-8"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          {columns.map((column) => (
                            <th
                              key={column.id}
                              className="px-4 py-3 text-left text-sm font-medium text-gray-500"
                            >
                              {column.header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {venues
                          .filter((venue) => venue.status === key)
                          .map((venue) => (
                            <tr
                              key={venue.id}
                              className="border-b hover:bg-gray-50"
                            >
                              {columns.map((column) => (
                                <td
                                  key={`${venue.id}-${column.id}`}
                                  className="px-4 py-3 text-sm"
                                >
                                  {column.cell(venue)}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 border-t">
                    <div className="text-sm text-gray-500">
                      Mostrando <span className="font-medium">{count}</span>{" "}
                      escenarios
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" disabled={true}>
                        Anterior
                      </Button>
                      <Button variant="outline" size="sm" disabled={true}>
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit Drawer */}
        <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
          <DrawerContent className="w-full sm:w-[480px]">
            <DrawerHeader>
              <DrawerTitle>
                {selectedVenue
                  ? `Editar Código ${selectedVenue.id}`
                  : "Editar Escenario"}
              </DrawerTitle>
            </DrawerHeader>

            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
              {selectedVenue && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="venue-code">Código*</Label>
                      <Input
                        id="venue-code"
                        value={selectedVenue.id}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue-neighborhood">Barrio*</Label>
                      <Input
                        id="venue-neighborhood"
                        defaultValue={selectedVenue.neighborhood}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue-name">Nombre*</Label>
                    <Input id="venue-name" defaultValue={selectedVenue.name} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue-address">Dirección*</Label>
                    <Input
                      id="venue-address"
                      defaultValue={selectedVenue.address}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue-description">Descripción</Label>
                    <Textarea
                      id="venue-description"
                      placeholder="Descripción del escenario"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <Label htmlFor="venue-status">Estado</Label>
                    <Switch
                      id="venue-status"
                      defaultChecked={selectedVenue.status === "active"}
                    />
                  </div>
                </>
              )}
            </div>

            <DrawerFooter>
              <Button className="w-full bg-green-500 hover:bg-green-600">
                Guardar
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Cancelar
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Create Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Crear Escenario</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-venue-code">Código*</Label>
                  <Input id="new-venue-code" placeholder="Código" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-venue-neighborhood">Barrio*</Label>
                  <select
                    id="new-venue-neighborhood"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Seleccione barrio...</option>
                    <option value="san-alonso">San Alonso</option>
                    <option value="provenza">Provenza</option>
                    <option value="alvarez">Álvarez Las Americas</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-venue-name">Nombre*</Label>
                <Input id="new-venue-name" placeholder="Nombre del escenario" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-venue-address">Dirección*</Label>
                <Input id="new-venue-address" placeholder="Dirección" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-venue-description">Descripción</Label>
                <Textarea
                  id="new-venue-description"
                  placeholder="Descripción del escenario"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="new-venue-status">Estado</Label>
                <Switch id="new-venue-status" />
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="bg-green-500 hover:bg-green-600"
                onClick={() => {
                  // Handle save logic here
                  setIsModalOpen(false);
                }}
              >
                Guardar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SimpleLayout>
  );
}
