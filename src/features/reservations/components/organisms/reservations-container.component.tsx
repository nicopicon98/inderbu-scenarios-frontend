'use client';

import { PaginatedReservations, ReservationDto } from '@/entities/reservation/model/types';
import { useAuth } from '@/features/auth';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  Plus,
  Search,
  Settings,
  User,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useReservationsWidget } from '../../hooks/use-reservation-widget.hook';

// UI Components - reusing existing ones
import { Pagination } from '@/shared/components/organisms/pagination';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ModifyReservationModal } from '@/features/reservations/components/organisms/modify-reservation-modal';
import { ReservationItem } from '@/features/reservations/components/organisms/reservation-item';

interface ReservationsContainerProps {
  userId: number;
  initialData?: PaginatedReservations | null;
}

export function ReservationsContainer({ userId, initialData }: ReservationsContainerProps) {
  const router = useRouter();

  // Local UI state
  const [selectedReservation, setSelectedReservation] = useState<ReservationDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Widget hook
  const {
    data: reservations,
    activeReservations,
    pastReservations,
    meta,
    stats,
    isLoading,
    isFetching,
    error,
    filters,
    updateFilters,
    clearFilters,
    changePage,
    refetch,
    invalidateAndRefetch,
  } = useReservationsWidget({
    userId,
    initialData,
  });

  // Handlers
  const handleModifyReservation = (reservation: ReservationDto) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleReservationUpdated = () => {
    invalidateAndRefetch();
  };

  const handleReservationCancelled = (reservationId: number) => {
    // Update data immediately
    invalidateAndRefetch();
  };

  const handleCreateNewReservation = (subScenarioId: number) => {
    router.push(`/scenario/${subScenarioId}`);
  };

  const handleSearchChange = (searchQuery: string) => {
    updateFilters({ searchQuery });
  };

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error al cargar reservas
          </h3>
          <p className="text-red-600 mb-4">
            {error.message || 'Ha ocurrido un error inesperado'}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Intentar nuevamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section with Stats */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <User className="h-8 w-8 text-blue-600" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
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

      <div className="container mx-auto px-4">
        {/* Loading indicator for refetching */}
        {isFetching && !isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Actualizando reservas...</span>
            </div>
          </div>
        )}

        {/* Welcome banner for new users */}
        {reservations.length > 0 && reservations.length <= 3 && (
          <WelcomeBanner />
        )}

        {/* Search and Filters */}
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

            <div className="flex items-center gap-2">
              {filters.searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Filtros activos
                  <button
                    onClick={clearFilters}
                    className="ml-1 hover:bg-gray-200 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <Button
                onClick={() => router.push('/')}
                className="shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Reserva
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingState />
        ) : reservations.length === 0 ? (
          <EmptyState
            hasFilters={!!filters.searchQuery}
            onClearFilters={clearFilters}
            onCreateNew={() => router.push('/')}
          />
        ) : (
          <ReservationsContent
            activeReservations={activeReservations}
            pastReservations={pastReservations}
            onEdit={handleModifyReservation}
            onCancelled={handleReservationCancelled}
            pagination={{
              currentPage: meta.page,
              totalPages: meta.totalPages,
            }}
            onPageChange={changePage}
          />
        )}

        {/* Modal */}
        <ModifyReservationModal
          reservation={selectedReservation}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onReservationUpdated={handleReservationUpdated}
          onCreateNewReservation={handleCreateNewReservation}
        />
      </div>
    </div>
  );
}

// Loading component
function LoadingState() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty state component
function EmptyState({
  hasFilters,
  onClearFilters,
  onCreateNew
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
  onCreateNew: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-full p-8 mb-6">
        <Calendar className="w-16 h-16 text-gray-400" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-800 mb-3">
        {hasFilters ? "No se encontraron reservas" : "No tienes reservas"}
      </h3>
      <p className="text-center text-gray-600 mb-6 max-w-md leading-relaxed">
        {hasFilters
          ? "Intenta con otros términos de búsqueda o limpia los filtros."
          : "Cuando reserves un escenario deportivo, aparecerá aquí para que puedas gestionarlo fácilmente."}
      </p>
      {hasFilters ? (
        <Button variant="outline" onClick={onClearFilters}>
          Limpiar filtros
        </Button>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Primera Reserva
          </Button>
          <Button variant="outline" asChild>
            <a href="/">Explorar Escenarios</a>
          </Button>
        </div>
      )}
    </div>
  );
}

// Welcome banner component
function WelcomeBanner() {
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-xl p-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-3 shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ¡Bienvenido a tu panel de reservas!
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
  );
}

// Reservations content component
function ReservationsContent({
  activeReservations,
  pastReservations,
  onEdit,
  onCancelled,
  pagination,
  onPageChange,
}: {
  activeReservations: ReservationDto[];
  pastReservations: ReservationDto[];
  onEdit: (reservation: ReservationDto) => void;
  onCancelled: (reservationId: number) => void;
  pagination: { currentPage: number; totalPages: number };
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="space-y-12">
      {/* Active Reservations */}
      {activeReservations.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800">Reservas Activas</h2>
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                {activeReservations.length}
              </Badge>
            </div>

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
                {index === 0 && activeReservations.length === 1 && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium shadow-lg animate-pulse">
                      👆 ¡Gestiona aquí!
                    </div>
                  </div>
                )}
                <ReservationItem
                  reservation={reservation}
                  isActive={true}
                  onModify={() => onEdit(reservation)}
                  onCancelled={onCancelled}
                  highlightManageButton={index === 0 && activeReservations.length <= 3}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Past Reservations */}
      {pastReservations.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gray-400 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800">Historial</h2>
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                {pastReservations.length}
              </Badge>
            </div>

            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                <CheckCircle2 className="h-3 w-3" />
                <span>Reservas completadas o canceladas</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastReservations.map((reservation) => (
              <ReservationItem
                key={reservation.id}
                reservation={reservation}
                isActive={false}
                onModify={() => onEdit(reservation)}
                onCancelled={onCancelled}
              />
            ))}
          </div>
        </section>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
