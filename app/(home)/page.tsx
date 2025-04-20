import {
  getActivityAreas,
  getNeighborhoods,
  getSubScenarios,
} from "@/features/home/api/home.service";
import HomeMain from "@/features/home/components/organisms/home-main";
import {
  ActivityArea,
  Neighborhood,
} from "@/features/home/types/filters.types";

export default async function HomePage() {
  // Obtener datos del servidor
  const activityAreasPromise: Promise<ActivityArea[]> = getActivityAreas();
  const neighborhoodsPromise: Promise<Neighborhood[]> = getNeighborhoods();

  // Esperar que ambas promesas se resuelvan
  const [activityAreas, neighborhoods] = await Promise.all([
    activityAreasPromise,
    neighborhoodsPromise,
  ]);

  const { data: initialSubScenarios, meta: initialMeta } =
    await getSubScenarios({ page: 1, limit: 6 });

  return (
    <HomeMain
      initialActivityAreas={activityAreas}
      initialNeighborhoods={neighborhoods}
      initialSubScenarios={initialSubScenarios}
      initialMeta={initialMeta}
    />
  );
}
