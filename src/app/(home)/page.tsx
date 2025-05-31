import {
  getActivityAreas,
  getNeighborhoods,
  getSubScenarios,
} from "@/features/home/api/home.service";
import HomeMain from "@/features/home/components/organisms/home-main";

interface HomePageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    activityAreaId?: string;
    neighborhoodId?: string;
    hasCost?: string;
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // ✅ Parse parámetros de URL para SSR completo
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 6;
  const searchQuery = searchParams.search || '';
  const activityAreaId = searchParams.activityAreaId ? Number(searchParams.activityAreaId) : undefined;
  const neighborhoodId = searchParams.neighborhoodId ? Number(searchParams.neighborhoodId) : undefined;
  const hasCost = searchParams.hasCost ? searchParams.hasCost === 'true' : undefined;

  try {
    // ✅ Fetch paralelo con filtros incluidos para SSR
    const [activityAreas, neighborhoods, subScenariosResult] = await Promise.all([
      getActivityAreas(),
      getNeighborhoods(),
      getSubScenarios({
        page,
        limit,
        searchQuery,
        activityAreaId: activityAreaId || 0,
        neighborhoodId: neighborhoodId || 0,
        hasCost,
      }),
    ]);

    return (
      <HomeMain
        // ✅ Props existentes
        initialActivityAreas={activityAreas}
        initialNeighborhoods={neighborhoods}
        initialSubScenarios={subScenariosResult.data}
        initialMeta={subScenariosResult.meta}
        
        // ✅ Props para SSR completo con sincronización URL
        initialFilters={{
          searchQuery,
          activityAreaId,
          neighborhoodId,
          hasCost,
        }}
        initialPage={page}
      />
    );
  } catch (error) {
    console.error('Error loading home page:', error);
    
    // ✅ Fallback: cargar solo datos básicos sin filtros
    const [activityAreas, neighborhoods] = await Promise.allSettled([
      getActivityAreas(),
      getNeighborhoods(),
    ]);

    return (
      <HomeMain
        initialActivityAreas={activityAreas.status === 'fulfilled' ? activityAreas.value : []}
        initialNeighborhoods={neighborhoods.status === 'fulfilled' ? neighborhoods.value : []}
        initialSubScenarios={[]}
        initialMeta={{ page: 1, limit: 6, totalPages: 0, totalItems: 0 }}
      />
    );
  }
}
