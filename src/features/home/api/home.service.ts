import {
  ActivityArea,
  Neighborhood,
  SubScenario,
} from "../types/filters.types";

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

export interface SubScenarioList {
  data: SubScenario[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

interface ISubScenarioParams {
  scenarioId?: number;
  page?: number;
  limit?: number;
  search?: string;
  activityAreaId?: number;
  neighborhoodId?: number;
  hasCost?: boolean;
}

export async function getSubScenarios({
  scenarioId = 0,
  page = 1,
  limit = 10,
  search = "",
  activityAreaId = 0,
  neighborhoodId = 0,
  hasCost,
}: ISubScenarioParams = {}): Promise<SubScenarioList> {
  const url = new URL("http://localhost:3001/sub-scenarios");
  url.searchParams.set("scenarioId", scenarioId.toString() == "0" ? "" : scenarioId.toString());
  url.searchParams.set("search", search);
  url.searchParams.set("activityAreaId", activityAreaId.toString() == "0" ? "" : activityAreaId.toString());
  url.searchParams.set("neighborhoodId", neighborhoodId.toString() == "0" ? "" : neighborhoodId.toString());
  
  // Add hasCost filter if provided
  if (hasCost !== undefined) {
    url.searchParams.set("hasCost", hasCost.toString());
  }
  
  // Set default values for page and limit if not provided
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", limit.toString());
  console.log(url.toString());
  const res = await fetch(url.toString(), { cache: "no-store" });
  const resJson = await res.json();
  console.log(resJson.data);
  if (!res.ok) {
    throw new Error(`Failed to load sub-scenarios: ${res.status}`);
  }
  return (resJson) as SubScenarioList;
}
