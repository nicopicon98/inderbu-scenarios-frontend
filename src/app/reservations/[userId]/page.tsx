"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UnifiedHeader } from "@/shared/components/organisms/unified-header";
import { Pagination } from "@/shared/components/organisms/pagination";
import { ModernReservationItem } from "@/features/reservations/components/organisms/modern-reservation-item";
import { ModifyReservationModal } from "@/features/reservations/components/organisms/ModifyReservationModal";
import { useUserReservations } from "@/features/reservations/hooks/useUserReservations";
import { useAuth } from "@/shared/contexts/auth-context";
import { ReservationDto } from "@/services/reservation.service";
import Footer from "@/features/home/components/organisms/footer";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { 
  Loader2, 
  Calendar, 
  Clock, 
  Search, 
  AlertCircle,
  User,
  Settings,
  Filter,
  X
} from "lucide-react";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default function UserReservationsPage({ params }: PageProps) {
  const router = useRouter();
  const { user, isAuthenticated, authReady } = useAuth();
  const [selectedReservation, setSelectedReservation] = useState<ReservationDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Unwrap params usando React.use()
  const { userId } = use(params);
  const userIdNumber = parseInt(userId);
  
  // Debug: Si userId es "undefined", mostrar información de debug
  if (userId === "undefined") {
    return (
      <main className="min-h-screen flex flex-col">
        <UnifiedHeader />
        <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-50">
          <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-lg">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error de Usuario</h2>
            <p className="text-gray-600 mb-4">No se pudo obtener el ID del usuario del token.</p>
            <div className="text-left bg-gray-100 p-4 rounded-lg mb-4">
              <p className="text-sm font-mono">
                <strong>User object:</strong><br/>
                {JSON.stringify(user, null, 2)}
              </p>
            </div>
            <Button onClick={() => router.push("/")}>Volver al inicio</Button>
          </div>
        </div>
      </main>
    );
  }
  
  const {
    reservations,
    activeReservations,
    pastReservations,
    meta,
    stats,
    isLoading,
    error,
    page,
    filters,
    handlePageChange,
    handleFiltersChange,
    clearFilters,
    refetch,
    setReservations,
  } = useUserReservations({ 
    userId: userIdNumber, 
    initialPage: 1, 
    initialLimit: 6 
  });

  // Verificar autenticación y permisos
  useEffect(() => {
    if (!authReady) return;
    
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    
    // Solo permitir ver reservas propias o si es admin
    if (user?.id !== userIdNumber && user?.role !== 1) {
      router.push("/");
      return;
    }
  }, [authReady, isAuthenticated, user, userIdNumber, router]);

  // Handlers
  const handleModifyReservation = (reservation: ReservationDto) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleReservationUpdated = (reservationId: number) => {
    refetch();
  };

  const handleCreateNewReservation = (subScenarioId: number) => {
    router.push(`/scenario/${subScenarioId}`);
  };

  const handleSearchChange = (searchQuery: string) => {
    handleFiltersChange({ searchQuery });
  };

  // Loading y error states
  if (!authReady || isLoading) {
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

  if (error) {
    return (
      <main className="min-h-screen flex flex-col">
        <UnifiedHeader />
        <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-50">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar reservas</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refetch}>Intentar de nuevo</Button>
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
          <div className="flex items-center justify-center gap-2 mb-4">
            <User className="h-8 w-8 text-blue-600" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-green-600 
                         bg-clip-text text-transparent">
              Mis Reservas
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Gestiona todas tus reservas de escenarios deportivos desde un solo lugar
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>Activas: {stats.active}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              <span>Confirmadas: {stats.confirmed}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span>Pendientes: {stats.pending}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Total: {stats.total}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex-grow">
        {/* Filtros y búsqueda */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar reservas..."
                  value={filters.searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="shrink-0"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>

            {(filters.searchQuery) && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  Filtros activos
                  <button onClick={clearFilters} className="ml-1 hover:bg-gray-200 rounded">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Contenido principal */}
        {reservations.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-full p-8 mb-6">
              <Calendar className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              {filters.searchQuery ? "No se encontraron reservas" : "No tienes reservas"}
            </h3>
            <p className="text-center text-gray-600 mb-6 max-w-md leading-relaxed">
              {filters.searchQuery 
                ? "Intenta con otros términos de búsqueda o limpia los filtros."
                : "Cuando reserves un escenario deportivo, aparecerá aquí para que puedas gestionarlo fácilmente."
              }
            </p>
            {filters.searchQuery ? (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : (
              <a 
                href="/"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         transition-all duration-200 font-medium shadow-sm hover:shadow-md 
                         transform hover:-translate-y-0.5"
              >
                Explorar Escenarios
              </a>
            )}
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
                      onModify={() => handleModifyReservation(reservation)}
                      onCancelled={handleReservationUpdated}
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
                      onModify={() => handleModifyReservation(reservation)}
                      onCancelled={handleReservationUpdated}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Paginación */}
            <Pagination
              currentPage={page}
              totalPages={meta.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Modal para modificar reserva */}
      <ModifyReservationModal
        reservation={selectedReservation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReservationUpdated={handleReservationUpdated}
        onCreateNewReservation={handleCreateNewReservation}
      />

      <Footer />
    </main>
  );
}
