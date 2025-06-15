"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { UserDrawer } from "@/features/dashboard/components/user-drawer";
import { FilterToolbar } from "@/shared/ui/filter-toolbar";
import { Download, FileEdit, Plus } from "lucide-react";
import { StatusBadge } from "@/shared/ui/status-badge";
import { DataTable } from "@/shared/ui/data-table";
import { Button } from "@/shared/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/shared/ui/badge";
import { toast } from "sonner";
import { ClientsDataResponse } from "../application/GetClientsDataUseCase";
import { User } from "../domain/repositories/IUserRepository";
import { createUserAction, updateUserAction, getUserByIdAction } from "../actions/user.actions";

interface ClientsPageProps {
  initialData: ClientsDataResponse;
}

export function ClientsPage({ initialData }: ClientsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state from initial data
  const [users] = useState(initialData.users);
  const [roles] = useState(initialData.roles);
  const [neighborhoods] = useState(initialData.neighborhoods);
  const [meta] = useState(initialData.meta);
  const [filterOptions] = useState(initialData.filterOptions);

  // UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Extract current filters from URL
  const currentFilters = {
    search: searchParams.get('search') || "",
    roleId: searchParams.get('roleId') || "",
    neighborhoodId: searchParams.get('neighborhoodId') || "",
    isActive: searchParams.get('isActive') || "",
  };

  // Current page and pagination
  const currentPage = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
  const pageSize = searchParams.get('limit') ? Number(searchParams.get('limit')) : 10;

  // Filter options for FilterToolbar
  const filterOptionsForToolbar = [
    {
      id: "search",
      label: "Buscar",
      type: "text" as const,
      placeholder: "Nombre, Email o DNI",
    },
    {
      id: "roleId",
      label: "Rol",
      type: "select" as const,
      placeholder: "Todos los roles…",
      options: filterOptions.roles,
    },
    {
      id: "neighborhoodId",
      label: "Barrio",
      type: "select" as const,
      placeholder: "Todos los barrios…",
      options: filterOptions.neighborhoods,
    },
    {
      id: "isActive",
      label: "Estado",
      type: "select" as const,
      placeholder: "Todos los estados…",
      options: filterOptions.status,
    },
  ];

  // Navigation handlers
  const handleSearch = (searchFilters: Record<string, string>) => {
    const params = new URLSearchParams();
    
    // Add filters
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      }
    });

    // Reset to page 1
    params.set('page', '1');
    params.set('limit', pageSize.toString());

    router.push(`/dashboard/clients?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/dashboard/clients?${params.toString()}`);
  };

  // User management handlers
  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsDrawerOpen(true);
  };

  const handleOpenDrawer = async (user: User) => {
    try {
      setLoading(true);
      
      // Get full user details
      const result = await getUserByIdAction(user.id);
      
      if (result.success) {
        setSelectedUser(result.data);
        setIsDrawerOpen(true);
      } else {
        toast.error("Error al cargar usuario", {
          description: result.error,
        });
      }
    } catch (error: any) {
      console.error("Error fetching user details:", error);
      toast.error("Error al cargar usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDrawer = async (data: Partial<User>) => {
    try {
      const isUpdate = Boolean(selectedUser?.id);
      
      if (isUpdate) {
        // Update existing user
        const updateData = {
          dni: data.dni,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          roleId: data.role?.id,
          neighborhoodId: data.neighborhood?.id,
          isActive: data.isActive,
        };

        const result = await updateUserAction(selectedUser!.id, updateData);
        
        if (result.success) {
          toast.success("Usuario actualizado exitosamente");
          router.refresh();
        } else {
          toast.error("Error al actualizar usuario", {
            description: result.error,
          });
        }
      } else {
        // Create new user
        const createData = {
          dni: data.dni!,
          firstName: data.firstName!,
          lastName: data.lastName!,
          email: data.email!,
          phone: data.phone!,
          address: data.address!,
          roleId: data.role!.id,
          neighborhoodId: data.neighborhood!.id,
          isActive: data.isActive ?? true,
        };

        const result = await createUserAction(createData);
        
        if (result.success) {
          toast.success("Usuario creado exitosamente");
          router.refresh();
        } else {
          toast.error("Error al crear usuario", {
            description: result.error,
          });
        }
      }
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast.error("Error al guardar usuario");
    }
  };

  // Table columns definition
  const columns = [
    {
      id: "dni",
      header: "DNI",
      cell: (row: User) => <span>{row.dni}</span>,
    },
    {
      id: "name",
      header: "Nombre",
      cell: (row: User) => (
        <span>
          {(row.firstName || row.first_name || "") +
            " " +
            (row.lastName || row.last_name || "")}
        </span>
      ),
    },
    {
      id: "email",
      header: "Email",
      cell: (row: User) => <span>{row.email}</span>,
    },
    {
      id: "role",
      header: "Rol",
      cell: (row: User) => <span>{row.role?.name || "N/A"}</span>,
    },
    {
      id: "neighborhood",
      header: "Barrio",
      cell: (row: User) => <span>{row.neighborhood?.name || "N/A"}</span>,
    },
    {
      id: "status",
      header: "Estado",
      cell: (row: User) => (
        <StatusBadge status={row.isActive ? "active" : "inactive"} />
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (row: User) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenDrawer(row)}
          disabled={loading}
        >
          <FileEdit className="h-4 w-4 mr-1" />
          Editar
        </Button>
      ),
    },
  ];

  // Filter users by role for tabs
  const filterUsersByRole = (roleName: string) => {
    return users.filter((user) => user.role?.name === roleName);
  };

  return (
    <>
      <FilterToolbar filters={filterOptionsForToolbar} onSearch={handleSearch} />

      <div className="bg-white rounded-md border p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold">Listado de Usuarios</h2>
          <Badge variant="outline" className="ml-2">
            {meta.totalItems}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleCreateUser}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-4">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="admin">Administradores</TabsTrigger>
          <TabsTrigger value="independiente">Independientes</TabsTrigger>
          <TabsTrigger value="club-deportivo">Clubes Deportivos</TabsTrigger>
          <TabsTrigger value="entrenador">Entrenadores</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <DataTable
            data={users}
            columns={columns}
            totalItems={meta.totalItems}
            pageSize={pageSize}
            currentPage={currentPage}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
            isLoading={false}
          />
        </TabsContent>

        <TabsContent value="admin">
          <DataTable
            data={filterUsersByRole("admin")}
            columns={columns}
            totalItems={filterUsersByRole("admin").length}
            pageSize={pageSize}
            currentPage={1}
            totalPages={Math.ceil(filterUsersByRole("admin").length / pageSize)}
            onPageChange={handlePageChange}
            isLoading={false}
          />
        </TabsContent>

        <TabsContent value="independiente">
          <DataTable
            data={filterUsersByRole("independiente")}
            columns={columns}
            totalItems={filterUsersByRole("independiente").length}
            pageSize={pageSize}
            currentPage={1}
            totalPages={Math.ceil(filterUsersByRole("independiente").length / pageSize)}
            onPageChange={handlePageChange}
            isLoading={false}
          />
        </TabsContent>

        <TabsContent value="club-deportivo">
          <DataTable
            data={filterUsersByRole("club-deportivo")}
            columns={columns}
            totalItems={filterUsersByRole("club-deportivo").length}
            pageSize={pageSize}
            currentPage={1}
            totalPages={Math.ceil(filterUsersByRole("club-deportivo").length / pageSize)}
            onPageChange={handlePageChange}
            isLoading={false}
          />
        </TabsContent>

        <TabsContent value="entrenador">
          <DataTable
            data={filterUsersByRole("entrenador")}
            columns={columns}
            totalItems={filterUsersByRole("entrenador").length}
            pageSize={pageSize}
            currentPage={1}
            totalPages={Math.ceil(filterUsersByRole("entrenador").length / pageSize)}
            onPageChange={handlePageChange}
            isLoading={false}
          />
        </TabsContent>
      </Tabs>

      {/* User Drawer */}
      <UserDrawer
        open={isDrawerOpen}
        user={selectedUser}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveDrawer}
      />
    </>
  );
}
