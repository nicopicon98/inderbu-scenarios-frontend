const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Tipos
export interface UserDto {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  neighborhood?: string;
  address?: string;
  role?: string;
  active?: boolean;
}

export interface PagedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

// Servicio de usuarios
const UserService = {
  // Obtener todos los usuarios (clientes)
  getAllUsers: async (): Promise<UserDto[]> => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const users = await response.json();
      return users.data;
    } catch (error) {
      console.error("Error getting users:", error);
      throw new Error(`Error ${error}`);
    }
  },

  // Buscar usuarios paginados con término de búsqueda
  searchUsers: async (
    search?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PagedResponse<UserDto>> => {
    try {
      let url = `${API_URL}/users?page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  },

  // Obtener usuario por ID
  getUserById: async (id: number): Promise<UserDto | null> => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Error getting user ${id}:`, error);
      return null;
    }
  },
};

export default UserService;
