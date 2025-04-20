"use client";

import { MainCarousel } from "@/shared/components/organisms/main-carousel";
import {
  ActivityArea,
  Neighborhood,
  SubScenario,
} from "../../types/filters.types";
import { Pagination } from "@/shared/components/organisms/pagination";
import { SubHeader } from "@/shared/components/organisms/sub-header";
import { Header } from "@/shared/components/organisms/header";
import FiltersSection from "./filters-section";
import FacilityGrid from "./facility-grid";
import Footer from "./footer";

interface HomeMainProps {
  initialActivityAreas?: ActivityArea[];
  initialNeighborhoods?: Neighborhood[];
  subScenarios?: SubScenario[];
}

export default function HomeMain({
  initialActivityAreas,
  initialNeighborhoods,
  subScenarios = [],
}: HomeMainProps) {
  return (
    <main className="min-h-screen flex flex-col w-full">
      <Header />
      <SubHeader />
      <MainCarousel />

      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-4xl font-bold text-teal-700 mb-4">Reservas</h1>
        <p className="text-gray-600 mb-8">
          Encuentra los{" "}
          <span className="font-medium">Escenarios deportivos</span> disponibles
          del INDER Medellín.
        </p>

        <FiltersSection
          initialActivityAreas={initialActivityAreas!}
          initialNeighborhoods={initialNeighborhoods!}
        />
        <FacilityGrid subScenarios={subScenarios} />

        <Pagination currentPage={1} totalPages={42} />
      </div>

      <Footer />
    </main>
  );
}
