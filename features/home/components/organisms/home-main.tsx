import { MainCarousel } from "@/shared/components/organisms/main-carousel";
import { SubHeader } from "@/shared/components/organisms/sub-header";
import { Pagination } from "@/shared/components/organisms/pagination";
import { Header } from "@/shared/components/organisms/header";
import FiltersSection from "./filters-section";
import FacilityGrid from "./facility-grid";
import Footer from "./footer";

export default function HomeMain() {
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

        <FiltersSection />
        <FacilityGrid />

        <Pagination currentPage={1} totalPages={42} />
      </div>

      <Footer />
    </main>
  );
}
