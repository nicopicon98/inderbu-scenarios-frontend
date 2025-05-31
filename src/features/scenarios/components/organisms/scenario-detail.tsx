"use client";

import { IGetScenarioByIdResponse } from "../../interfaces/get-scenario-by-id-res.interface";
import { ScenarioImageCarousel } from "./scenario-image-carousel";
import { ScenarioInfoCard } from "./scenario-info-card";
import { ReservationPanel } from "./reservation-panel";


interface Props {
  subScenario: IGetScenarioByIdResponse;
}

export function ScenarioDetail({ subScenario }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      {/* Left side ----------------------------------------------------------- */}
      <div className="lg:col-span-2 space-y-6">
        <ScenarioImageCarousel />
        <ScenarioInfoCard subScenario={subScenario} />
      </div>

      {/* Right side ---------------------------------------------------------- */}
      <div className="lg:col-span-1 space-y-6">
        <ReservationPanel subScenarioId={subScenario.id} />
      </div>
    </div>
  );
}
