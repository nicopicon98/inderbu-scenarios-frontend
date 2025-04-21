"use client";

import { useState } from "react";
import { FiCalendar, FiCheck, FiClock, FiGrid, FiMapPin, FiTag, FiUser, FiUsers } from "react-icons/fi";

import { TimeSlots } from "@/features/scenarios/components/organisms/time-slots";
import { SimpleCalendar } from "@/shared/components/organisms/simple-calendar";
import { SimpleCarousel } from "@/shared/components/organisms/simple-carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ScenarioWithRelations } from "../../api/scenario.service";
import { Recommendations } from "./recommendations";
import { Button } from "@/shared/ui/button";
import { getTodayLocalISO } from "@/lib/utils";

interface ScenarioDetailProps {
  subScenario: ScenarioWithRelations;
}

export function ScenarioDetail({ subScenario }: ScenarioDetailProps) {
  const today = getTodayLocalISO()
  const [date, setDate] = useState<string>(today)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

      {/* Imagen e información */}
      <div className="lg:col-span-2 space-y-6">
        <div className="relative bg-teal-500 rounded-lg overflow-hidden h-[300px]">
          <SimpleCarousel />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del esubscenario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <h3 className="text-base font-medium text-gray-700 flex items-center gap-1">
                  <FiGrid className="text-teal-600" /> <span>Actividad</span>
                </h3>
                <p className="text-gray-600 text-sm pt-1">
                  {subScenario.activityArea?.name}
                </p>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-700 flex items-center gap-1">
                  <FiMapPin className="text-teal-600" /> Superficie
                </h3>
                <p className="text-gray-600 text-sm pt-1">
                  {subScenario.fieldSurfaceType?.name}
                </p>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-700 flex items-center gap-1">
                  <FiUser className="text-teal-600" /> Jugadores
                </h3>
                <p className="text-gray-600 text-sm pt-1">
                  {subScenario.numberOfPlayers}
                </p>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-700 flex items-center gap-1">
                  <FiUsers className="text-teal-600" /> Espectadores
                </h3>
                <p className="text-gray-600 text-sm pt-1">
                  {subScenario.numberOfSpectators}
                </p>
              </div>
              <div className="lg:col-span-2">
                <h3 className="text-base font-medium text-gray-700 flex items-center gap-1">
                  <FiMapPin className="text-teal-600" /> Dirección
                </h3>
                <p className="text-gray-600 text-sm pt-1">
                  {subScenario.scenario.address}
                </p>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-700 flex items-center gap-1">
                  <FiMapPin className="text-teal-600" /> Barrio
                </h3>
                <p className="text-gray-600 text-sm pt-1">
                  {subScenario.scenario.neighborhood.name}
                </p>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-700 flex items-center gap-1">
                  <FiTag className="text-teal-600" /> Costo
                </h3>
                <p className="text-gray-600 text-sm pt-1">0 COP</p>
              </div>
            </div>

            <Recommendations />
          </CardContent>
        </Card>
      </div>

      {/* Panel de reserva */}
     {/* Panel de reserva */}
     <div className="lg:col-span-1 space-y-6">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <FiCalendar className="text-teal-600" />
            Selecciona una fecha
          </h3>
          <SimpleCalendar selectedDate={date} onDateChange={setDate} />
        </div>

        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <FiClock className="text-teal-600" />
            Horarios disponibles
          </h3>
          <TimeSlots subScenarioId={subScenario.id} date={date} />
        </div>

        <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white cursor-pointer flex items-center justify-center gap-2">
          <FiCheck className="h-5 w-5 mr-2" />
          Confirmar reserva
        </Button>
      </div>
    </div>
  );
}
