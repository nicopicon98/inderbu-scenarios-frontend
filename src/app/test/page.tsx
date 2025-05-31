"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { UserDrawer } from "@/features/dashboard/components/user-drawer";
import { SimpleLayout } from "@/shared/components/layout/simple-layout";
import { FilterToolbar } from "@/shared/ui/filter-toolbar";
import { Download, FileEdit, Plus } from "lucide-react";
import { StatusBadge } from "@/shared/ui/status-badge";
import { DataTable } from "@/shared/ui/data-table";
import { Button } from "@/shared/ui/button";
import { useEffect, useState } from "react";
import { Badge } from "@/shared/ui/badge";


/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
interface IUser {
  id: number;
  dni: number;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  role: {
    id: number;
    name: string;
    description: string;
  };
  neighborhood: {
    id: number;
    name: string;
  };
  roleId?: number;
  neighborhoodId?: number;
}

interface IPageResponse {
  data: IUser[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

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

const filterOptions: IFilterOption[] = [
  {
    id: "search",
    label: "Buscar",
    type: "text",
    placeholder: "Nombre, Email o DNI",
  },
  {
    id: "roleId",
    label: "Rol",
    type: "select",
    placeholder: "Todos los roles…", // <— stays as placeholder
    options: [
      { value: "1", label: "Administrador" },
      { value: "2", label: "Cliente" },
      { value: "3", label: "Gestor" },
    ],
  },
  {
    id: "neighborhoodId",
    label: "Barrio",
    type: "select",
    placeholder: "Todos los barrios…",
    options: [
      { value: "1", label: "San Alonso" },
      { value: "2", label: "Provenza" },
      { value: "3", label: "Álvarez Las Américas" },
    ],
  },
  {
    id: "isActive",
    label: "Estado",
    type: "select",
    placeholder: "Todos los estados…",
    options: [
      { value: "true", label: "Activo" },
      { value: "false", label: "Inactivo" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Utils                                                                     */
/* -------------------------------------------------------------------------- */

/** Small helper so we don’t repeat response.ok checks everywhere. */
async function fetchJson<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    // You can customise error handling here (logging, toast, etc.)
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function UsersPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [users, setUsers] = useState<IUser[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  /* ---------------------------------------------------------------------- */
  /*  Load data                                                             */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    fetchUsers().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);

  /** Fetch paginated user list (honours filters) */
  const fetchUsers = async () => {
    setLoading(true);

    try {
      // Build query params
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      // Switch to /by-role/:id endpoint if role filter present
      let url = `${API_BASE_URL}/users`;
      if (filters.roleId) {
        url = `${API_BASE_URL}/users/by-role/${filters.roleId}`;
        params.delete("roleId");
      }

      const data = await fetchJson<IPageResponse>(
        `${url}?${params.toString()}`,
      );

      setUsers(data.data);
      setTotalItems(data.meta.totalItems);
      setTotalPages(data.meta.totalPages);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  /** Load one user (full details) and open the drawer */
  const handleOpenDrawer = async (user: IUser) => {
    try {
      // Para asegurarnos de que los campos de nombre siempre estén disponibles
      if (!user.firstName && user.first_name) {
        user.firstName = user.first_name;
      }
      if (!user.lastName && user.last_name) {
        user.lastName = user.last_name;
      }

      const fullUser = await fetchJson<IUser>(
        `${API_BASE_URL}/users/${user.id}`,
      );

      // También asegurar que el usuario completo tenga las propiedades correctas
      if (!fullUser.firstName && fullUser.first_name) {
        fullUser.firstName = fullUser.first_name;
      }
      if (!fullUser.lastName && fullUser.last_name) {
        fullUser.lastName = fullUser.last_name;
      }

      setSelectedUser(fullUser);
      setIsDrawerOpen(true);
    } catch (err) {
      console.error("Error fetching user details:", err);
    }
  };

  /** Create new user or update existing one */
  const handleSaveDrawer = async (data: Partial<IUser>) => {
    const isUpdate = Boolean(selectedUser?.id);

    try {
      await fetchJson(
        `${API_BASE_URL}/users/${isUpdate ? selectedUser!.id : ""}`,
        {
          method: isUpdate ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      // Refresh list
      await fetchUsers();
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*  Search / pagination controls                                          */
  /* ---------------------------------------------------------------------- */

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsDrawerOpen(true);
  };

  const handleSearch = (searchFilters: Record<string, string>) => {
    setFilters(searchFilters);
    setCurrentPage(1);
  };

  /* ---------------------------------------------------------------------- */
  /*  Table columns                                                         */
  /* ---------------------------------------------------------------------- */

  const columns = [
    {
      id: "dni",
      header: "DNI",
      cell: (row: IUser) => <span>{row.dni}</span>,
    },
    {
      id: "name",
      header: "Nombre",
      cell: (row: IUser) => (
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
      cell: (row: IUser) => <span>{row.email}</span>,
    },
    {
      id: "role",
      header: "Rol",
      cell: (row: IUser) => <span>{row.role?.name || "N/A"}</span>,
    },
    {
      id: "neighborhood",
      header: "Barrio",
      cell: (row: IUser) => <span>{row.neighborhood?.name || "N/A"}</span>,
    },
    {
      id: "status",
      header: "Estado",
      cell: (row: IUser) => (
        <StatusBadge status={row.isActive ? "active" : "inactive"} />
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (row: IUser) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenDrawer(row)}
        >
          <FileEdit className="h-4 w-4 mr-1" />
          Editar
        </Button>
      ),
    },
  ];

  /* ---------------------------------------------------------------------- */
  /*  Render                                                                */
  /* ---------------------------------------------------------------------- */

  return (
    <SimpleLayout>
      <FilterToolbar filters={filterOptions} onSearch={handleSearch} />

      <div className="bg-white rounded-md border p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold">Listado de Usuarios</h2>
          <Badge variant="outline" className="ml-2">
            {totalItems}
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
            totalItems={totalItems}
            pageSize={pageSize}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            isLoading={loading}
          />
        </TabsContent>

        <TabsContent value="admin">
          <DataTable
            data={users.filter((user) => user.role?.name === "admin")}
            columns={columns}
            totalItems={
              users.filter((user) => user.role?.name === "admin").length
            }
            pageSize={pageSize}
            currentPage={1}
            totalPages={Math.ceil(
              users.filter((user) => user.role?.name === "admin").length /
              pageSize,
            )}
            onPageChange={setCurrentPage}
            isLoading={loading}
          />
        </TabsContent>

        <TabsContent value="independiente">
          <DataTable
            data={users.filter((user) => user.role?.name === "independiente")}
            columns={columns}
            totalItems={
              users.filter((user) => user.role?.name === "independiente").length
            }
            pageSize={pageSize}
            currentPage={1}
            totalPages={Math.ceil(
              users.filter((user) => user.role?.name === "independiente")
                .length / pageSize,
            )}
            onPageChange={setCurrentPage}
            isLoading={loading}
          />
        </TabsContent>

        <TabsContent value="club-deportivo">
          <DataTable
            data={users.filter((user) => user.role?.name === "club-deportivo")}
            columns={columns}
            totalItems={
              users.filter((user) => user.role?.name === "club-deportivo")
                .length
            }
            pageSize={pageSize}
            currentPage={1}
            totalPages={Math.ceil(
              users.filter((user) => user.role?.name === "club-deportivo")
                .length / pageSize,
            )}
            onPageChange={setCurrentPage}
            isLoading={loading}
          />
        </TabsContent>

        <TabsContent value="entrenador">
          <DataTable
            data={users.filter((user) => user.role?.name === "entrenador")}
            columns={columns}
            totalItems={
              users.filter((user) => user.role?.name === "entrenador").length
            }
            pageSize={pageSize}
            currentPage={1}
            totalPages={Math.ceil(
              users.filter((user) => user.role?.name === "entrenador").length /
              pageSize,
            )}
            onPageChange={setCurrentPage}
            isLoading={loading}
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
    </SimpleLayout>
  );
}
