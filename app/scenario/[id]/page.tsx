import { ChevronLeft, ChevronRight} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { SubHeader } from "@/shared/components/organisms/sub-header"
import { TimeSlots } from "@/shared/components/organisms/time-slots"
import { Calendar } from "@/shared/components/organisms/calendar"
import { Header } from "@/shared/components/organisms/header"
import { Button } from "@/shared/ui/button"

interface PageProps {
  params: {
    id: string
  }
}

export default function InstalacionPage({ params }: PageProps) {
  // En un caso real, usaríamos el ID para obtener los datos de la instalación
  // Para este ejemplo, usamos datos estáticos para la cancha de baloncesto Aragón
  const instalacion = {
    id: params.id,
    nombre: "Cancha de baloncesto Aragón",
    tipo: "Cancha Baloncesto - Barrial",
    correo: "atencion.ciudadano@inder.gov.co",
    telefono: "3699000",
    direccion: "Medellín (001) - San Antonio de Prado - CR 55D 53S",
    longitud: "-75.63822",
    latitud: "6.17593",
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <SubHeader />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-teal-500 mb-2">{instalacion.nombre}</h1>
        <p className="text-gray-600 mb-6">{instalacion.tipo}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="relative bg-teal-500 rounded-md overflow-hidden h-[300px] flex items-center justify-center">
            <Image src="/field-icon.svg" alt="Campo deportivo" width={150} height={150} className="text-white" />

            <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 text-white">
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 text-white">
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium text-gray-700">Correo electrónico:</h2>
              <p className="text-gray-600">{instalacion.correo}</p>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-700">Teléfono:</h2>
              <p className="text-gray-600">{instalacion.telefono}</p>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-700">Dirección:</h2>
              <p className="text-gray-600">{instalacion.direccion}</p>
            </div>

            <div className="flex space-x-4">
              <div>
                <h2 className="text-lg font-medium text-gray-700">Longitud:</h2>
                <p className="text-gray-600">{instalacion.longitud}</p>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-700">Latitud:</h2>
                <p className="text-gray-600">{instalacion.latitud}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-700 mb-4">
            Por favor selecciona la división del escenario deportivo que deseas reservar
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="bg-pink-300 hover:bg-pink-400 text-white h-16 text-lg">Completa</Button>

            {/* Aquí se pueden agregar más opciones de división si es necesario */}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Calendar />

          <div>
            <h2 className="text-xl font-medium text-gray-700 mb-4">Horarios disponibles</h2>
            <TimeSlots />
          </div>
        </div>
      </div>

      <footer className="bg-teal-500 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Image src="/inder-logo-white.svg" alt="INDER Medellín" width={150} height={60} />
            <div className="flex space-x-4">
              <Link href="#" className="hover:underline">
                <Image src="/facebook-icon.svg" alt="Facebook" width={24} height={24} />
              </Link>
              <Link href="#" className="hover:underline">
                <Image src="/twitter-icon.svg" alt="Twitter" width={24} height={24} />
              </Link>
              <Link href="#" className="hover:underline">
                <Image src="/instagram-icon.svg" alt="Instagram" width={24} height={24} />
              </Link>
              <Link href="#" className="hover:underline">
                <Image src="/youtube-icon.svg" alt="YouTube" width={24} height={24} />
              </Link>
            </div>
          </div>
        </div>
      </footer>

    </main>
  )
}

