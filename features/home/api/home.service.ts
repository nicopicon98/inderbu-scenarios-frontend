import { ActivityArea, Neighborhood } from "../types/filters.types";

export async function getActivityAreas(): Promise<ActivityArea[]> {
  try {
    const response = await fetch("http://localhost:3001/activity-areas", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Error fetching activity areas: ${response.status}`);
    }

    const { data } = await response.json();

    // Asegurarse de que los datos son un array y mapearlos al tipo correcto
    if (!Array.isArray(data)) {
      console.error("Activity areas response is not an array:", data);
      return [];
    }

    // Mapear los datos al tipo ActivityArea
    return data.map(
      (item: any): ActivityArea => ({
        id: item.id?.toString() || "",
        name: item.name || "",
        // Mapear otros campos según sea necesario
      })
    );
  } catch (error) {
    console.error("Failed to fetch activity areas:", error);
    return [];
  }
}

export async function getNeighborhoods(): Promise<Neighborhood[]> {
  try {
    const response = await fetch("http://localhost:3001/neighborhoods", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Error fetching neighborhoods: ${response.status}`);
    }

    const { data } = await response.json();

    // Asegurarse de que los datos son un array y mapearlos al tipo correcto
    if (!Array.isArray(data)) {
      console.error("Neighborhoods response is not an array:", data);
      return [];
    }

    // Mapear los datos al tipo Neighborhood
    return data.map(
      (item: any): Neighborhood => ({
        id: item.id?.toString() || "",
        name: item.name || "",
        // Mapear otros campos según sea necesario
      })
    );
  } catch (error) {
    console.error("Failed to fetch neighborhoods:", error);
    return [];
  }
}
