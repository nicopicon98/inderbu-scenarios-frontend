import { Header } from "@/components/header";
import { MainNavigation } from "@/components/main-navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col">
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

      <div>
        <p>From here</p>
      </div>
    </main>
  );
}
