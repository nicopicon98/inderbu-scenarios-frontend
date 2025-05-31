// Definir la URL base del API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Tipos
export interface ScenarioDto {
  id: number;
  name: string;
  address: string;
  locationId: number;
  location?: LocationDto;
  subScenarios?: SubScenarioDto[];
  active?: boolean;
}

export interface LocationDto {
  id: number;
  name: string;
}

export interface SubScenarioDto {
  id: number;
  name: string;
  description?: string;
  scenarioId: number;
  active?: boolean;
}

// Servicio de escenarios
const ScenarioService = {
  // Obtener todos los escenarios
  getAllScenarios: async (search?: string): Promise<ScenarioDto[]> => {
    try {
      let url = `${API_URL}/scenarios`;
      // Si hay un término de búsqueda, añadirlo como parámetro
      if (search) {
        url += `?search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const scenarios = await response.json();
      return scenarios.data;
    } catch (error) {
      console.error("Error getting scenarios:", error);
      throw new Error(`Error ${error}`);
    }
  },

  // Obtener un escenario por ID
  getScenarioById: async (id: number): Promise<ScenarioDto> => {
    try {
      const response = await fetch(`${API_URL}/scenarios/${id}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Error getting scenario ${id}:`, error);
      throw new Error(`Scenario with id ${id} not found`);
    }
  },

  // Obtener todos los subescenarios
  getAllSubScenarios: async (): Promise<SubScenarioDto[]> => {
    try {
      const response = await fetch(`${API_URL}/sub-scenarios`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error getting subscenarios:", error);
      throw new Error(`Error ${error}`);
    }
  },

  // Buscar subescenarios con filtro de escenario
  searchSubScenarios: async (
    scenarioId?: number,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<any> => {
    try {
      let url = `${API_URL}/sub-scenarios?page=${page}&limit=${limit}`;
      if (scenarioId) {
        url += `&scenarioId=${scenarioId}`;
      }
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
      console.error("Error searching sub-scenarios:", error);
      throw error;
    }
  },

  // Obtener todas las ubicaciones
  getAllLocations: async (): Promise<LocationDto[]> => {
    try {
      const response = await fetch(`${API_URL}/locations`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error getting locations:", error);
      // Para desarrollo, retornamos datos de ejemplo si la API no está disponible
      throw new Error(`Error ${error}`);
    }
  },
};

export default ScenarioService;
