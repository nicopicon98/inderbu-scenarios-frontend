// Definir la URL base del API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
      
      return response.json();
    } catch (error) {
      console.error('Error getting scenarios:', error);
      // Para desarrollo, retornamos datos de ejemplo si la API no está disponible
      return mockScenarios();
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
      // Para desarrollo, retornamos un escenario de ejemplo si la API no está disponible
      const mockData = mockScenarios();
      const found = mockData.find(s => s.id === id);
      if (!found) throw new Error(`Scenario with id ${id} not found`);
      return found;
    }
  },

  // Obtener todos los subescenarios
  getAllSubScenarios: async (): Promise<SubScenarioDto[]> => {
    try {
      const response = await fetch(`${API_URL}/subscenarios`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error getting subscenarios:', error);
      // Para desarrollo, retornamos datos de ejemplo si la API no está disponible
      const scenarios = mockScenarios();
      return scenarios.flatMap(s => s.subScenarios || []);
    }
  },

  // Obtener subescenarios por ID de escenario
  getSubScenariosByScenarioId: async (scenarioId: number): Promise<SubScenarioDto[]> => {
    try {
      const response = await fetch(`${API_URL}/scenarios/${scenarioId}/subscenarios`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error getting subscenarios for scenario ${scenarioId}:`, error);
      // Para desarrollo, retornamos datos de ejemplo si la API no está disponible
      const scenarios = mockScenarios();
      const scenario = scenarios.find(s => s.id === scenarioId);
      return scenario?.subScenarios || [];
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
      console.error('Error getting locations:', error);
      // Para desarrollo, retornamos datos de ejemplo si la API no está disponible
      return mockLocations();
    }
  }
};

// Mock de escenarios para desarrollo cuando no haya API disponible
function mockScenarios(): ScenarioDto[] {
  return [
    {
      id: 1,
      name: "COMPLEJO DEPORTIVO PRINCIPAL",
      address: "Calle 45 #23-45",
      locationId: 1,
      location: { id: 1, name: "ALFONSO LÓPEZ" },
      active: true,
      subScenarios: [
        {
          id: 1,
          name: "COLISEO BICENTENARIO ALEJANDRO GALVIS RAMIREZ",
          description: "Cancha profesional para eventos deportivos",
          scenarioId: 1,
          active: true
        },
        {
          id: 2,
          name: "CANCHA AUXILIAR",
          description: "Cancha auxiliar para entrenamiento",
          scenarioId: 1,
          active: true
        }
      ]
    },
    {
      id: 2,
      name: "PARQUE RECREATIVO PROVENZA",
      address: "Carrera 23 #110-35",
      locationId: 2,
      location: { id: 2, name: "PROVENZA" },
      active: true,
      subScenarios: [
        {
          id: 3,
          name: "PROVENZA - PATINODROMO - PARQUE RECREO- DEPORTIVO",
          description: "Pista para patinaje",
          scenarioId: 2,
          active: true
        },
        {
          id: 4,
          name: "PROVENZA - ZONA DE CALISTENIA - PARQUE DEPORTIVO",
          description: "Área para ejercicios de calistenia",
          scenarioId: 2,
          active: true
        },
        {
          id: 5,
          name: "PROVENZA - PARQUE DEPORTIVO - KIOSKO 2",
          description: "Área de servicios y descanso",
          scenarioId: 2,
          active: true
        }
      ]
    },
    {
      id: 3,
      name: "VELÓDROMO SAN ALONSO",
      address: "Calle 14 entre Cr 32 y 32A",
      locationId: 3,
      location: { id: 3, name: "SAN ALONSO" },
      active: true,
      subScenarios: [
        {
          id: 6,
          name: "ÓVALO AZUL VELODROMO ALFONSO FLOREZ ORTIZ",
          description: "Pista de ciclismo profesional",
          scenarioId: 3,
          active: true
        }
      ]
    },
    {
      id: 4,
      name: "COMPLEJO ÁLVAREZ LAS AMÉRICAS",
      address: "CALLE 35 N 42 - 14",
      locationId: 4,
      location: { id: 4, name: "ÁLVAREZ LAS AMERICAS" },
      active: true,
      subScenarios: [
        {
          id: 7,
          name: "ÁREA DE CAFETERÍA - PARQUE RECREO- DEPORTIVO LAS AMERICAS",
          description: "Área de servicios y alimentación",
          scenarioId: 4,
          active: true
        }
      ]
    }
  ];
}

// Mock de ubicaciones
function mockLocations(): LocationDto[] {
  return [
    { id: 1, name: "ALFONSO LÓPEZ" },
    { id: 2, name: "PROVENZA" },
    { id: 3, name: "SAN ALONSO" },
    { id: 4, name: "ÁLVAREZ LAS AMERICAS" }
  ];
}

export default ScenarioService;
