"use client";

import { ReservationDto } from "@/services/reservation.service";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  UserReservationList,
  getUserReservations,
} from "../api/user-reservations.service";


interface UseUserReservationsProps {
  userId: number;
  initialPage?: number;
  initialLimit?: number;
}

type Filters = {
  searchQuery: string;
};

export const useUserReservations = ({
  userId,
  initialPage = 1,
  initialLimit = 6,
}: UseUserReservationsProps) => {
  // Estados principales
  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [meta, setMeta] = useState({
    page: initialPage,
    limit: initialLimit,
    totalItems: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState<number>(initialPage);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filters, setFilters] = useState<Filters>({ searchQuery: "" });

  // Función memoizada para obtener reservas
  const fetchReservations = useCallback(async (
    pageNumber: number = page,
    currentFilters: Filters = filters,
  ) => {
    if (!userId) {
      console.log("❌ No userId provided, skipping fetch");
      return;
    }

    console.log(`🔄 Fetching reservations - Page: ${pageNumber}, UserId: ${userId}`);
    setIsLoading(true);
    setError(null);

    try {
      const userReservations: UserReservationList = await getUserReservations({
        userId,
        page: pageNumber,
        limit: initialLimit,
        searchQuery: currentFilters.searchQuery,
      });

      console.log(`✅ User reservations fetched: ${userReservations.data.length} items`);

      setReservations(userReservations.data);
      setMeta(userReservations.meta);
    } catch (error) {
      console.error("❌ Error fetching user reservations:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, initialLimit]); // Solo depende de valores estables

  // Efectos
  useEffect(() => {
    console.log(`📊 useUserReservations effect triggered - Page: ${page}, Filters:`, filters);
    fetchReservations(page, filters);
  }, [page, filters, fetchReservations]);

  // Funciones de control memoizadas
  const handlePageChange = useCallback((newPage: number) => {
    console.log(`📄 Page change: ${page} → ${newPage}`);
    setPage(newPage);
  }, [page]);

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    console.log(`🔍 Filters change:`, newFilters);
    setFilters(newFilters);
    setPage(1); // Resetear a la primera página cuando cambian los filtros
  }, []);

  const clearFilters = useCallback(() => {
    console.log(`🧹 Clearing filters`);
    setFilters({ searchQuery: "" });
    setPage(1);
  }, []);

  const refetch = useCallback(() => {
    console.log(`🔄 Manual refetch triggered`);
    fetchReservations(page, filters);
  }, [fetchReservations, page, filters]);

  // Estados derivados con useMemo
  const { activeReservations, pastReservations, stats } = useMemo(() => {
    const now = new Date();

    const active = reservations.filter((r) => {
      const reservationDateTime = new Date(
        `${r.reservationDate}T${r.timeSlot.endTime}`,
      );
      return (
        reservationDateTime >= now && r.reservationState.state !== "CANCELADA"
      );
    });

    const past = reservations.filter((r) => {
      const reservationDateTime = new Date(
        `${r.reservationDate}T${r.timeSlot.endTime}`,
      );
      return (
        reservationDateTime < now || r.reservationState.state === "CANCELADA"
      );
    });

    const statistics = {
      total: meta.totalItems,
      active: active.length,
      past: past.length,
      pending: reservations.filter(
        (r) => r.reservationState.state === "PENDIENTE",
      ).length,
      confirmed: reservations.filter(
        (r) => r.reservationState.state === "CONFIRMADA",
      ).length,
      cancelled: reservations.filter(
        (r) => r.reservationState.state === "CANCELADA",
      ).length,
    };

    return {
      activeReservations: active,
      pastReservations: past,
      stats: statistics,
    };
  }, [reservations, meta.totalItems]);

  return {
    // Datos
    reservations,
    activeReservations,
    pastReservations,
    meta,
    stats,

    // Estados
    isLoading,
    error,
    page,
    filters,

    // Funciones
    handlePageChange,
    handleFiltersChange,
    clearFilters,
    refetch,
    setReservations, // Para actualizar después de operaciones como cancelar
  };
};
