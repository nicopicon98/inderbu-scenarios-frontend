import { EUserRole } from "../enums/user-role.enum";
import { IUser } from "./user.interface";

export interface IAuthContextType {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  authReady: boolean;                 // ← bandera para saber cuándo terminó el chequeo
  login: (id: number, email: string, role: EUserRole, token: string) => void;
  logout: () => void;
}