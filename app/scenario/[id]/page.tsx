import { Calendar } from "@/shared/components/organisms/calendar"
import { Header } from "@/shared/components/organisms/header"
import { SubHeader } from "@/shared/components/organisms/sub-header"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { ChevronLeft, CalendarIcon, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface PageProps {
  params: {
    id: string
  }
}

// Componente TimeSlots simplificado
function TimeSlots() {
  const timeSlots = [
    { time: "08:00 - 09:00", available: true },
    { time: "09:00 - 10:00", available: true },
    { time: "10:00 - 11:00", available: false },
    { time: "11:00 - 12:00", available: true },
    { time: "12:00 - 13:00", available: false },
    { time: "13:00 - 14:00", available: true },
    { time: "14:00 - 15:00", available: true },
  ]

  return (
    <div className="grid grid-cols-2 gap-2">
      {timeSlots.map((slot, index) => (
        <Button
          key={index}
          disabled={!slot.available}
          className={`py-1 px-1 rounded-md text-sm ${
            slot.available
              ? "bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 cursor-pointer"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {slot.time}
        </Button>
      ))}
    </div>
  )
}

export default function InstalacionPage({ params }: PageProps) {
  // En un caso real, usaríamos el ID para obtener los datos de la instalación
  // Para este ejemplo, usamos datos estáticos
  const instalacion = {
    id: params.id,
    name: "Cancha de baloncesto Aragón",
    hasCost: false,
    numberOfSpectators: 200,
    numberOfPlayers: 10,
    recommendations:
      "Se recomienda traer hidratación y usar calzado deportivo adecuado. No se permite el consumo de alimentos dentro de la cancha.",
    scenario: "Cancha múltiple",
    activityArea: "Baloncesto",
    fieldSurfaceType: "Concreto pulido",
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <SubHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start gap-2 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Link href="/instalaciones" className="text-teal-600 hover:text-teal-700 text-sm flex items-center">
                <ChevronLeft className="h-4 w-4" />
                Volver a instalaciones
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-teal-600 mb-2">{instalacion.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                {instalacion.scenario}
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {instalacion.hasCost ? "Con costo" : "Gratuito"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="relative bg-teal-500 rounded-lg overflow-hidden h-[300px] flex items-center justify-center">
              <Image 
                src="https://inderbu.gov.co/escenarios/content/fields/35/83711.jpeg"
                alt="Instalación"
                fill
                className="object-cover rounded-lg shadow-lg"
                priority
                sizes="(max-width: 768px) 100vw, (min-width: 768px) 50vw"
              />
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Información de la instalación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Área de actividad:</h3>
                    <p className="text-gray-600">{instalacion.activityArea}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Tipo de superficie:</h3>
                    <p className="text-gray-600">{instalacion.fieldSurfaceType}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Capacidad de jugadores:</h3>
                    <p className="text-gray-600">{instalacion.numberOfPlayers}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Capacidad de espectadores:</h3>
                    <p className="text-gray-600">{instalacion.numberOfSpectators}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700">Recomendaciones:</h3>
                  <p className="text-gray-600">{instalacion.recommendations}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Reserva tu espacio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Selecciona una fecha y horario para reservar esta instalación.</p>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-2 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-teal-600" />
                    Selecciona una fecha
                  </h3>
                  <Calendar />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-teal-600" />
                    Horarios disponibles
                  </h3>
                  <TimeSlots />
                </div>

                <Button className="w-full mt-6 bg-teal-600 hover:bg-teal-700">Confirmar reserva</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
