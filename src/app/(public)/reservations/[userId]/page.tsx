"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Settings,
  User,
  X
} from "lucide-react";
import { ModifyReservationModal } from "@/features/reservations/components/organisms/ModifyReservationModal";
import { ModernReservationItem } from "@/features/reservations/components/organisms/modern-reservation-item";
import { ErrorReservationsLoading } from "@/features/reservations/components/organisms/error-loading";
import { ReservationsLoader } from "@/features/reservations/components/organisms/reservations-loader";
import { useUserReservations } from "@/features/reservations/hooks/use-user-reservations.hook";
import { UserNotFound } from "@/features/reservations/components/organisms/user-not-found";
import { MainHeader } from "@/shared/components/organisms/main-header";
import { Pagination } from "@/shared/components/organisms/pagination";
import Footer from "@/features/home/components/organisms/footer";
import { ReservationDto } from "@/services/reservation.service";
import { EUserRole } from "@/shared/enums/user-role.enum";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Button } from "@/shared/ui/button";
import { useRouter } from "next/navigation";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { use, useState } from "react";



interface PageProps {
  params: Promise<{ userId: string }>;
}

// Componente de contenido principal (sin protección)
function UserReservationsContent({ userId }: { userId: string }) {

  const router = useRouter();
  const { user } = useAuth();
  const [selectedReservation, setSelectedReservation] = useState<ReservationDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const userIdNumber = parseInt(userId);

  // Debug: Si userId es "undefined", mostrar información de debug
  if (userId === "undefined" || isNaN(userIdNumber)) <UserNotFound
    user={user}
    router={router}
  />

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
    initialLimit: 6,
  });

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
  if (isLoading) <ReservationsLoader />

  if (error) <ErrorReservationsLoading
    error={error}
    refetch={refetch}
  />

  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <User className="h-8 w-8 text-blue-600" />
            <h1
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-green-600 
                         bg-clip-text text-transparent"
            >
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
        {/* Banner flotante de ayuda para usuarios nuevos */}
        {reservations.length > 0 && reservations.length <= 3 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-xl p-6 relative overflow-hidden">
              {/* Elementos decorativos */}
              <div className="absolute top-2 right-2 text-4xl opacity-20">✨</div>
              <div className="absolute bottom-2 left-2 text-3xl opacity-20">🎆</div>

              <div className="relative z-10">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-3 shadow-lg">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      🎉 ¡Bienvenido a tu panel de reservas!
                    </h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      Desde aquí puedes <strong>gestionar todas tus reservas</strong> de manera
                      fácil y rápida. 📱 Solo haz clic en el botón azul{" "}
                      <strong>"Gestionar reserva"</strong> en cualquier tarjeta.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-semibold text-green-700 text-sm">
                            Cambiar Estado
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Pendiente → Confirmada</p>
                      </div>

                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-semibold text-blue-700 text-sm">
                            Cambiar Fecha
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Nueva reserva automática</p>
                      </div>

                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="font-semibold text-red-700 text-sm">Cancelar</span>
                        </div>
                        <p className="text-xs text-gray-600">Con confirmación segura</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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

            {filters.searchQuery && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  Filtros activos
                  <button
                    onClick={clearFilters}
                    className="ml-1 hover:bg-gray-200 rounded"
                  >
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
                : "Cuando reserves un escenario deportivo, aparecerá aquí para que puedas gestionarlo fácilmente."}
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
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-800">Reservas Activas</h2>
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {activeReservations.length}
                    </div>
                  </div>

                  {/* Quick Actions para reservas activas */}
                  <div className="hidden md:flex items-center gap-2 text-sm text-blue-600">
                    <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg">
                      <Settings className="h-3 w-3" />
                      <span className="font-medium">Gestiona tus reservas →</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeReservations.map((reservation, index) => (
                    <div key={reservation.id} className="relative">
                      {/* Indicador visual para la primera reserva */}
                      {index === 0 && activeReservations.length === 1 && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <div className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium shadow-lg animate-pulse">
                            👆 ¡Gestiona aquí!
                          </div>
                        </div>
                      )}
                      <ModernReservationItem
                        reservation={reservation}
                        isActive={true}
                        onModify={() => handleModifyReservation(reservation)}
                        onCancelled={handleReservationUpdated}
                        highlightManageButton={index < 2 && reservations.length <= 3}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Historial */}
            {pastReservations.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-gray-400 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-800">Historial</h2>
                    <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                      {pastReservations.length}
                    </div>
                  </div>

                  {/* Info para historial */}
                  <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Reservas completadas o canceladas</span>
                    </div>
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
    </>
  );
}

// Componente principal con protección
export default function UserReservationsPage({ params }: PageProps) {
  const { userId } = use(params);

  return (
    <main className="min-h-screen flex flex-col">
      <MainHeader />

      <UserReservationsPageGuard userId={userId}>
        <UserReservationsContent userId={userId} />
      </UserReservationsPageGuard>

      <Footer />
    </main>
  );
}

// Guard personalizado para verificar acceso a reservas específicas del usuario
function UserReservationsPageGuard({
  userId,
  children
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const userIdNumber = parseInt(userId);

  // Verificar si el usuario puede ver estas reservas
  const canViewReservations = (): boolean => {
    if (!user) return false;

    // El usuario puede ver sus propias reservas
    if (user.id === userIdNumber) return true;

    // Los admins pueden ver cualquier reserva
    if (user.role === EUserRole.SUPER_ADMIN || user.role === EUserRole.ADMIN) return true;

    // Los moderadores pueden ver cualquier reserva
    if (user.role === EUserRole.MODERATOR) return true;

    return false;
  };

  // Si no tiene acceso, redirigir
  if (!canViewReservations()) {
    router.push("/");
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600">
            No tienes permisos para ver estas reservas.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
