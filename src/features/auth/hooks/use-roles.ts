import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IRole } from "../interfaces/role.interface";
import { AuthService } from "../services/auth-service";

export function useRoles() {
    const [roles, setRoles] = useState<IRole[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRoles = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await AuthService.getRoles();
            setRoles(data);
        } catch (error: any) {
            const errorMsg = "No se pudieron cargar los roles";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    return { roles, loading, error, refetch: fetchRoles };
}