import { ScenarioDetail } from "@/features/scenarios/components/organisms/scenario-detail";
import { IGetScenarioByIdRequest } from "@/features/scenarios/interfaces/get-scenario-by-id-req.interface";
import { IGetScenarioByIdResponse } from "@/features/scenarios/interfaces/get-scenario-by-id-res.interface";
import { ScenarioService } from "@/features/scenarios/services/scenario.service";
import { MainHeader } from "@/shared/components/organisms/main-header";
import { Badge } from "@/shared/ui/badge";
import Link from "next/link";
import { FiChevronLeft, FiGrid, FiTag } from "react-icons/fi";

interface PageProps {
  params: { id: string };
}

export default async function ScenarioPage({ params }: PageProps) {
  const { id } = await params;
  const subscenario: IGetScenarioByIdResponse = await ScenarioService.getById({
    id,
  } as IGetScenarioByIdRequest);

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <MainHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Header básico */}
        <div className="flex flex-col md:flex-row items-start gap-2 mb-6">
          <div className="flex-1">
            <Link
              href="/"
              className="inline-flex items-center text-teal-600 hover:text-teal-700 text-sm mb-2"
            >
              <FiChevronLeft className="h-4 w-4 mr-1" />
              Volver a todos los escenarios
            </Link>

            <h1 className="text-3xl md:text-4xl font-bold text-teal-600">
              {subscenario.name}
            </h1>

            <div className="flex items-center gap-2 mt-4">
              <Badge className="flex items-center bg-teal-50 text-teal-700 border-teal-200">
                <FiGrid className="h-4 w-4 mr-1" />
                {subscenario.scenario.name}
              </Badge>
              <Badge className="flex items-center bg-green-50 text-green-700 border-green-200">
                <FiTag className="h-4 w-4 mr-1" />
                {subscenario.hasCost ? "De pago" : "Gratuito"}
              </Badge>
            </div>
          </div>
        </div>

        <ScenarioDetail subScenario={subscenario} />
      </div>
    </main>
  );
}
