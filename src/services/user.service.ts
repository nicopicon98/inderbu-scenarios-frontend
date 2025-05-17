// Definir la URL base del API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Tipos
export interface UserDto {
  id: number;
  name: string;
  document: string;
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
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error getting users:', error);
      // Para desarrollo, retornamos datos de ejemplo si la API no está disponible
      return mockUsers();
    }
  },
};

// Mock users para desarrollo cuando no haya API disponible
function mockUsers(): UserDto[] {
  return [
    {
      id: 1,
      name: "ACADEMIA DE BADMINTON SANTANDER",
      document: "90148313",
      email: "academia.badminton@example.com",
      phone: "3105551234",
      neighborhood: "ALFONSO LÓPEZ",
      address: "Calle 45 #23-45",
      role: "client",
      active: true
    },
    {
      id: 2,
      name: "CLUB DEPORTIVO BUCARAMANGA",
      document: "91245678",
      email: "club.deportivo@example.com",
      phone: "3116667890",
      neighborhood: "PROVENZA",
      address: "Carrera 23 #110-35",
      role: "client",
      active: true
    },
    {
      id: 3,
      name: "ASOCIACIÓN DEPORTIVA SANTANDER",
      document: "800123456",
      email: "asociacion.deportiva@example.com",
      phone: "3207778888",
      neighborhood: "SAN ALONSO",
      address: "Calle 14 entre Cr 32 y 32A",
      role: "client",
      active: true
    }
  ];
}

export default UserService;
