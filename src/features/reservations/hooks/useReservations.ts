import ReservationService, { ReservationDto } from "@/services/reservation.service";
import { useEffect, useState, useMemo } from "react";// barrel-export services

export const useReservations = () => {
    const [reservations, setReservations] = useState<ReservationDto[]>([]);
    const [isLoading, setLoading] = useState(true);

    // Fetch once
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                setReservations(await ReservationService.getAllReservations());
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* ---------- derived state (memoised) ---------- */
    const stats = useMemo(() => {
        const today = new Date().toISOString().split("T")[0];
        const todayQty = reservations.filter(r => r.reservationDate === today).length;

        return {
            total: reservations.length,
            today: todayQty,
            approved: reservations.filter(r => r.reservationStateId === 2).length,
            pending: reservations.filter(r => r.reservationStateId === 1).length,
            rejected: reservations.filter(r => r.reservationStateId === 3).length,
        };
    }, [reservations]);

    return { reservations, setReservations, isLoading, stats };
};
