"use client";

import { useEffect, useState } from "react";
import { UnifiedHeader } from "@/shared/components/organisms/unified-header";
import { Reservation } from "@/features/reservations/types/reservation.types";
import { useAuth } from "@/shared/contexts/auth-context";
import { Loader2, Calendar, Clock, MapPin } from "lucide-react";
import { ModernReservationItem } from "@/features/reservations/components/organisms/modern-reservation-item";
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

  // Separar reservas activas y pasadas
  const now = new Date();
  const activeReservations = reservations.filter(r => {
    const reservationDateTime = new Date(`${r.reservationDate}T${r.timeSlot.endTime}`);
    return reservationDateTime >= now;
  });
  
  const pastReservations = reservations.filter(r => {
    const reservationDateTime = new Date(`${r.reservationDate}T${r.timeSlot.endTime}`);
    return reservationDateTime < now;
  });

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col">
        <UnifiedHeader />
        <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Cargando tus reservas</h2>
            <p className="text-gray-600">Un momento por favor...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <UnifiedHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-green-600 
                       bg-clip-text text-transparent mb-4">
            Mis Reservas
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Gestiona todas tus reservas de escenarios deportivos desde un solo lugar
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>Reservas activas: {activeReservations.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>Historial: {pastReservations.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex-grow">
        {reservations.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-full p-8 mb-6">
              <Calendar className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">No tienes reservas</h3>
            <p className="text-center text-gray-600 mb-6 max-w-md leading-relaxed">
              Cuando reserves un escenario deportivo, aparecerá aquí para que puedas gestionarlo fácilmente.
            </p>
            <a 
              href="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       transition-all duration-200 font-medium shadow-sm hover:shadow-md 
                       transform hover:-translate-y-0.5"
            >
              Explorar Escenarios
            </a>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Reservas Activas */}
            {activeReservations.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-800">Reservas Activas</h2>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {activeReservations.length}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeReservations.map((reservation) => (
                    <ModernReservationItem 
                      key={reservation.id} 
                      reservation={reservation}
                      isActive={true}
                      onCancelled={(id) => {
                        setReservations(prev => prev.filter(r => r.id !== id));
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Historial */}
            {pastReservations.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gray-400 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-800">Historial</h2>
                  <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                    {pastReservations.length}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastReservations.map((reservation) => (
                    <ModernReservationItem 
                      key={reservation.id} 
                      reservation={reservation}
                      isActive={false}
                      onCancelled={(id) => {
                        setReservations(prev => prev.filter(r => r.id !== id));
                      }}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
