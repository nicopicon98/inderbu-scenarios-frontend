// API Services para search de areas y neighborhoods
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ActivityAreaOption {
  id: number;
  name: string;
}

export interface NeighborhoodOption {
  id: number;
  name: string;
}

export async function searchActivityAreas(search: string = ""): Promise<ActivityAreaOption[]> {
  try {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.append('search', search.trim());
    }
    // Cargar al menos 10 resultados iniciales
    params.append('limit', '20');
    
    const url = `${API_BASE_URL}/activity-areas${params.toString() ? `?${params.toString()}` : '?limit=20'}`;
    console.log('Fetching activity areas from:', url);
    const response = await fetch(url, { cache: "no-store" });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch activity areas: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log('Activity areas response:', responseData);
    
    // El backend SIEMPRE devuelve { data: [...], meta: {...}, message: "Success" }
    const activityAreas = responseData.data || [];
    
    return activityAreas.map((item: any) => ({
      id: Number(item.id),
      name: item.name || ''
    }));
  } catch (error) {
    console.error('Error fetching activity areas:', error);
    return [];
  }
}

export async function searchNeighborhoods(search: string = ""): Promise<NeighborhoodOption[]> {
  try {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.append('search', search.trim());
    }
    // Cargar al menos 10 resultados iniciales
    params.append('limit', '20');
    
    const url = `${API_BASE_URL}/neighborhoods${params.toString() ? `?${params.toString()}` : '?limit=20'}`;
    console.log('Fetching neighborhoods from:', url);
    const response = await fetch(url, { cache: "no-store" });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch neighborhoods: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log('Neighborhoods response:', responseData);
    
    // El backend SIEMPRE devuelve { data: [...], meta: {...}, message: "Success" }
    const neighborhoods = responseData.data || [];
    
    return neighborhoods.map((item: any) => ({
      id: Number(item.id),
      name: item.name || ''
    }));
  } catch (error) {
    console.error('Error fetching neighborhoods:', error);
    return [];
  }
}
