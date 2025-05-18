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
};

export default UserService;
