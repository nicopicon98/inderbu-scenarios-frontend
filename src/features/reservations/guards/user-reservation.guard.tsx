"use client"

import { useAuth } from "@/features/auth";
import { EUserRole } from "@/shared/enums/user-role.enum";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserReservationsPageGuard({
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
        // Si no hay usuario autenticado, no tiene acceso
        if (!user) return false;

        // Solo el usuario puede ver sus propias reservas
        if (user.id === userIdNumber) return true;

        // Los admins pueden ver cualquier reserva
        if (user.role === EUserRole.SUPER_ADMIN || user.role === EUserRole.ADMIN) return true;

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