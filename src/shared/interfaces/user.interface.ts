import { EUserRole } from "../enums/user-role.enum";

export interface IUser {
  id: number;
  email: string;
  role: EUserRole;
  token?: string;
}
