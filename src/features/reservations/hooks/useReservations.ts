import ReservationService, { ReservationDto } from "@/services/reservation.service";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const useReservations = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Leer parámetros de paginación de la URL o usar valores predeterminados
    const defaultPage = 1;
    const defaultPageSize = 7;
    
    const urlPage = searchParams.get('page') ? parseInt(searchParams.get('page')!) : defaultPage;
    const urlPageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : defaultPageSize;
    
    const [reservations, setReservations] = useState<ReservationDto[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [page, setPage] = useState(urlPage);
    const [pageSize] = useState(urlPageSize); // Fijo en 7, pero obtenido de URL si existe
    const [totalReservations, setTotalReservations] = useState(0);

    // Función para obtener reservas paginadas
    const fetchReservations = async (pageNumber = page) => {
        setLoading(true);
        try {
            const data = await ReservationService.getAllReservations();
            setTotalReservations(data.length); // Guardamos el total para stats y paginación
            
            // Implementamos paginación en el cliente
            const startIndex = (pageNumber - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedData = data.slice(startIndex, endIndex);
            
            setReservations(paginatedData);
            return data; // Retornamos todos los datos para uso en stats
        } catch (error) {
            console.error("Error fetching reservations:", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Función para cambiar de página
    const changePage = async (newPage: number) => {
        // Actualizar URL con los nuevos parámetros de paginación
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        params.set('pageSize', pageSize.toString());
        
        // Navegar a la nueva URL con los parámetros actualizados
        router.push(`/dashboard?${params.toString()}`);
        
        // Actualizar estado local y cargar datos
        setPage(newPage);
        await fetchReservations(newPage);
    };

    // Cargar reservaciones cuando cambian parámetros de URL o al montar el componente
    useEffect(() => {
        fetchReservations(urlPage);
    }, [urlPage, urlPageSize]); // Re-ejecutar cuando cambien los parámetros de URL

    /* ---------- derived state (memoised) ---------- */
    const stats = useMemo(() => {
        const fetchAllReservations = async () => {
            const allData = await ReservationService.getAllReservations();
            const today = new Date().toISOString().split("T")[0];
            const todayQty = allData.filter(r => r.reservationDate === today).length;
            
            return {
                total: allData.length,
                today: todayQty,
                approved: allData.filter(r => r.reservationStateId === 2).length,
                pending: allData.filter(r => r.reservationStateId === 1).length,
                rejected: allData.filter(r => r.reservationStateId === 3).length,
            };
        };
        
        // Llamamos a fetchAllReservations inicialmente
        fetchAllReservations();
        
        // Mientras tanto, devolvemos stats calculadas con los datos actuales
        const today = new Date().toISOString().split("T")[0];
        const todayQty = reservations.filter(r => r.reservationDate === today).length;

        return {
            total: totalReservations,
            today: todayQty,
            approved: reservations.filter(r => r.reservationStateId === 2).length,
            pending: reservations.filter(r => r.reservationStateId === 1).length,
            rejected: reservations.filter(r => r.reservationStateId === 3).length,
        };
    }, [reservations, totalReservations]);

    return { 
        reservations, 
        setReservations, 
        isLoading, 
        stats, 
        refetch: fetchReservations,
        page,
        pageSize,
        totalReservations,
        changePage
    };
};
