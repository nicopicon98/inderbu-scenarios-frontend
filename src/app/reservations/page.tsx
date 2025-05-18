"use client";

import { useEffect, useState } from "react";
import { Header } from "@/shared/components/organisms/header";
import { SubHeader } from "@/shared/components/organisms/sub-header";
import { Reservation } from "@/features/reservations/types/reservation.types";
import { useAuth } from "@/shared/contexts/auth-context";
import { Card } from "@/shared/ui/card";
import { Loader2 } from "lucide-react";
import { ReservationItem } from "@/features/reservations/components/organisms/reservation-item";
import Footer from "@/features/home/components/organisms/footer";
import ReservationService from "@/services/reservation.service";

export default function ReservationsPage() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        if (token) {
          setIsLoading(true);
          const data = await ReservationService.getAllReservations();
          setReservations(data);
        }
      } catch (error) {
        console.error("Error fetching reservations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, [token]);

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <SubHeader />

      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold text-teal-700 mb-4">Mis Reservas</h1>
        <p className="text-gray-600 mb-8">
          Aquí encontrarás todas tus reservas activas y el historial de reservas anteriores.
        </p>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        ) : reservations.length === 0 ? (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-medium text-gray-800 mb-2">
              No tienes reservas activas
            </h2>
            <p className="text-gray-600">
              Cuando reserves un escenario, aparecerá en esta sección.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Reservas Activas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reservations.map((reservation) => (
                <ReservationItem 
                  key={reservation.id} 
                  reservation={reservation}
                  onCancelled={(id) => {
                    setReservations(prev => prev.filter(r => r.id !== id));
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
