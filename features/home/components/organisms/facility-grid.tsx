import { FacilityCard } from "@/shared/components/organisms/facility-card";
import { SubScenario } from "@/features/home/types/filters.types";

interface FacilityGridProps {
  subScenarios: SubScenario[];
}

export default function FacilityGrid({ subScenarios }: FacilityGridProps) {
  if (subScenarios.length === 0) return <p className="text-center py-8">No hay escenarios disponibles.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {subScenarios.map((sub) => (
        <FacilityCard key={sub.id} subScenario={sub} />
      ))}
    </div>
  );
}
