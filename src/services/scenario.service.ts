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
  getAllScenarios: async (): Promise<ScenarioDto[]> => {
    try {
      const response = await fetch(`${API_URL}/scenarios`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const scenarios = await response.json();
      return scenarios.data
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

  // Obtener subescenarios por ID de escenario
  getSubScenariosByScenarioId: async (
    scenarioId: number
  ): Promise<SubScenarioDto[]> => {
    try {
      const response = await fetch(
        `${API_URL}/scenarios/${scenarioId}/sub-scenarios`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(
        `Error getting subscenarios for scenario ${scenarioId}:`,
        error
      );
      // Para desarrollo, retornamos datos de ejemplo si la API no está disponible
      throw new Error(`Error ${error}`);
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
