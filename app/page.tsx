import { AccessibilityTools } from "@/components/accessibility-tools";
import { MainNavigation } from "@/components/main-navigation";
import { FacilityCard } from "@/components/facility-card";
import { ChatButton } from "@/components/chat-button";
import { Pagination } from "@/components/pagination";
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import Image from "next/image";
import Link from "next/link";
import { Carousel } from "@/components/ui/carousel";
import { MainCarousel } from "@/components/main-carousel";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col w-full">
      <Header />

      <div className="bg-gradient-to-r from-teal-500 to-lime-500 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/inder-logo.svg"
              alt="INDER Medellín"
              width={150}
              height={60}
              className="mr-4"
            />
            <div className="text-white text-sm border-l border-white pl-4 max-w-[240px]">
              <p>Instituto de</p>
              <p>Deportes y Recreación</p>
              <p>de Medellín</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="#" className="text-white hover:underline">
              Transparencia y acceso a la información pública
            </Link>

            <div className="relative">
              <Link
                href="#"
                className="text-white hover:underline flex items-center"
              >
                Atención y servicio a la ciudadanía
                <ChevronDown className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <Link href="#" className="text-white hover:underline">
              Participa
            </Link>

            <Button
              variant="outline"
              size="icon"
              className="bg-white rounded-full"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <MainNavigation />
      <MainCarousel />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-teal-700 mb-4">Reservas</h1>
          <p className="text-gray-600">
            Encuentra los{" "}
            <span className="font-medium">Escenarios deportivos</span>{" "}
            disponibles del INDER Medellín.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Áreas de interés
            </label>
            <div className="relative">
              <div className="flex items-center border rounded-md p-2 bg-gray-100">
                <span className="flex-1">Todas las áreas de interés</span>
                <button className="text-gray-400 hover:text-gray-600">×</button>
              </div>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Barrios
            </label>
            <div className="relative">
              <div className="flex items-center border rounded-md p-2 bg-gray-100">
                <span className="flex-1">Todos los barrios</span>
                <button className="text-gray-400 hover:text-gray-600">×</button>
              </div>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del escenario deportivo
            </label>
            <div className="flex">
              <input
                type="text"
                className="flex-1 border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Buscar escenario"
              />
              <Button className="rounded-l-none bg-teal-500 hover:bg-teal-600">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/instalacion/bolera-suramericana">
            <FacilityCard
              title="Bolera Suramericana Unidad Deportiva de Belén Andrés Escobar Saldarriaga"
              type="BOLERA / UNIDAD DEPORTIVA"
              email="atencion.ciudadano@inder.gov.co"
              phone="3699000"
              location="Rosales"
            />
          </Link>

          <Link href="/instalacion/cancha-aragon">
            <FacilityCard
              title="Cancha de baloncesto Aragón"
              type="CANCHA BALONCESTO / BARRIAL"
              email="atencion.ciudadano@inder.gov.co"
              phone="3699000"
              location="San Antonio de Prado"
            />
          </Link>

          <Link href="/instalacion/cancha-balcon-miraflores">
            <FacilityCard
              title="Cancha de baloncesto Balcón de Miraflores"
              type="CANCHA BALONCESTO / BARRIAL"
              email="atencion.ciudadano@inder.gov.co"
              phone="3699000"
              location="Cataluña"
            />
          </Link>

          <Link href="/instalacion/cancha-betania">
            <FacilityCard
              title="Cancha de baloncesto Betania Guayabal"
              type="CANCHA BALONCESTO / BARRIAL"
              email="atencion.ciudadano@inder.gov.co"
              phone="3699000"
              location="Loreto"
            />
          </Link>

          <Link href="/instalacion/cancha-campo-amor">
            <FacilityCard
              title="Cancha de baloncesto Campo Amor"
              type="CANCHA BALONCESTO / BARRIAL"
              email="atencion.ciudadano@inder.gov.co"
              phone="3699000"
              location="Campo Valdes Nº 1"
            />
          </Link>

          <Link href="/instalacion/cancha-cordoba">
            <FacilityCard
              title="Cancha de baloncesto Córdoba"
              type="CANCHA BALONCESTO / BARRIAL"
              email="atencion.ciudadano@inder.gov.co"
              phone="3699000"
              location="Enciso"
            />
          </Link>
        </div>

        <Pagination currentPage={1} totalPages={42} />
      </div>

      <footer className="bg-teal-500 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Image
              src="/inder-logo-white.svg"
              alt="INDER Medellín"
              width={150}
              height={60}
            />
            <div className="flex space-x-4">
              <Link href="#" className="hover:underline">
                <Image
                  src="/facebook-icon.svg"
                  alt="Facebook"
                  width={24}
                  height={24}
                />
              </Link>
              <Link href="#" className="hover:underline">
                <Image
                  src="/twitter-icon.svg"
                  alt="Twitter"
                  width={24}
                  height={24}
                />
              </Link>
              <Link href="#" className="hover:underline">
                <Image
                  src="/instagram-icon.svg"
                  alt="Instagram"
                  width={24}
                  height={24}
                />
              </Link>
              <Link href="#" className="hover:underline">
                <Image
                  src="/youtube-icon.svg"
                  alt="YouTube"
                  width={24}
                  height={24}
                />
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <AccessibilityTools />
      <ChatButton />
    </main>
  );
}
