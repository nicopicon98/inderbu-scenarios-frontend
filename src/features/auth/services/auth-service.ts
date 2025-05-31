import { IGetAllNeighborhoodsResponse } from "../interfaces/neighborhood.interface";
import { IGetAllRolesResponse, IRole } from "../interfaces/role.interface";
import { TLoginData, TRegisterData, TResetData } from "../schemas/auth-schemas";
import { authApiClient } from "@/shared/api";

interface LoginApiResponse {
  data: {
    access_token: string;
    refresh_token?: string;
    user: {
      id: number;
      email: string;
      role: number;
    };
  };
}

export class AuthService {
  static async login(data: TLoginData): Promise<LoginApiResponse["data"]> {
    const response = await authApiClient.post<LoginApiResponse, TLoginData>(
      "/auth/login",
      data,
    );
    return response.data;
  }

  static async register(
    data: TRegisterData,
  ): Promise<{ id: number; email: string }> {
    const { confirmPassword, ...payload } = data;
    const response = await authApiClient.post<{ data: any }, typeof payload>(
      "/users",
      payload,
    );
    return response.data;
  }

  static async resetPassword(data: TResetData): Promise<void> {
    await authApiClient.post<void, TResetData>("/auth/reset-password", data);
  }

  static async logout(token: string): Promise<void> {
    await authApiClient.post<void, {}>(
      "/auth/logout",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  }

  static async refreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token?: string }> {
    const response = await authApiClient.post<
      { data: any },
      { refresh_token: string }
    >("/auth/refresh", { refresh_token: refreshToken });
    return response.data;
  }

  static async getCurrentUser(
    token: string,
  ): Promise<{ id: number; email: string; role: number }> {
    const response = await authApiClient.request<{ data: any }>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
      cacheStrategy: "NoCache",
    });
    return response.data;
  }

  // Datos estáticos con cache
  static async getRoles(): Promise<IGetAllRolesResponse[]> {
    return await authApiClient.getCollection<IGetAllRolesResponse>("/roles", {
      cacheStrategy: "LongTerm",
    });
  }

  static async getNeighborhoods(): Promise<IGetAllNeighborhoodsResponse[]> {
    return await authApiClient.getCollection<IGetAllNeighborhoodsResponse>(
      "/neighborhoods",
      {
        cacheStrategy: "Medium",
      },
    );
  }
}
