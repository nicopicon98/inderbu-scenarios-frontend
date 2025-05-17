"use client";

import { FC } from "react";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-8">
          <div className="bg-white shadow-md rounded-lg p-8 mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-4">Bienvenido al Dashboard Administrativo</h1>
            <p className="text-gray-600">
              Desde aquí podrás administrar los escenarios, horarios, reservas y usuarios del sistema.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-medium text-gray-800 mb-2">Escenarios</h3>
              <p className="text-3xl font-bold text-blue-600">12</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-medium text-gray-800 mb-2">Usuarios</h3>
              <p className="text-3xl font-bold text-blue-600">45</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-medium text-gray-800 mb-2">Reservas Hoy</h3>
              <p className="text-3xl font-bold text-blue-600">8</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-medium text-gray-800 mb-2">Pendientes</h3>
              <p className="text-3xl font-bold text-blue-600">3</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
