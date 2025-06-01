import { EUserRole } from "../enums/user-role.enum";

export const getRedirectPath = (userRole: EUserRole | undefined = undefined): string => {
    switch (userRole) {
        case EUserRole.INDEPENDIENTE:
        case EUserRole.CLUB_DEPORTIVO:
        case EUserRole.ENTRENADOR:
            return "/";
        default:
            return "/dashboard";
    }
};