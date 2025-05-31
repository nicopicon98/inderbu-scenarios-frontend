import { useEffect, useState } from "react";
import { toast } from "sonner";
import { INeighborhood } from "../interfaces/neighborhood.interface";
import { AuthService } from "../services/auth-service";

export function useNeighborhoods() {
    const [neighborhoods, setNeighborhoods] = useState<INeighborhood[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNeighborhoods = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await AuthService.getNeighborhoods();
            setNeighborhoods(data);
        } catch (error: any) {
            const errorMsg = "No se pudieron cargar los barrios";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNeighborhoods();
    }, []);

    return { neighborhoods, loading, error, refetch: fetchNeighborhoods };
}