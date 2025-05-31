"use client";

import { User, BookIcon, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/ui/dropdown-menu";
import { useAuth } from "@/shared/contexts/auth-context";
import { Button } from "@/shared/ui/button";
import { AuthModal } from "./auth-modal";

export function MainHeader() {
  const { user, logout, login, isAuthenticated } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLoginSuccess = (id: number, email: string, role: number, token: string) => {
    login(id, email, role, token);
    setModalOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* Top bar with gov.co - fondo azul */}
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 flex items-center justify-between py-2">
          <Link 
            href="https://www.gov.co" 
            target="_blank"
            className="opacity-90 hover:opacity-100 transition-opacity"
          >
            <Image
              src="https://inderbu.gov.co/wp-content/uploads/2022/09/logo_gov_co.png"
              alt="gov.co"
              width={100}
              height={30}
              className="h-5 w-auto"
            />
          </Link>
          
          {/* User actions - solo para admin/dashboard en top */}
          <div className="flex items-center gap-2">
            {isAuthenticated && (user?.role === 1 || user?.role === 2) && (
              <Link href="/dashboard" className="text-white hover:text-blue-200 text-sm transition-colors">
                Panel de Control
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation - fondo blanco */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 flex items-center justify-between py-4">
          <Link href="/" className="flex items-center">
            <Image
              src="https://inderbu.gov.co/wp-content/uploads/2024/07/LOGO-3.png"
              alt="INDERBU"
              width={280}
              height={65}
              className="h-16 w-auto"
            />
          </Link>

          {/* Actions - Login y Reservas */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Mis Reservas: solo super admin (1) o cualquier otro que no sea admin (2) */}
                {(user?.role === 1 || user?.role !== 2) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hidden md:flex items-center gap-2 border-blue-200 text-blue-700 
                             hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                    asChild
                  >
                    <Link href={`/reservations/${user?.id}`}>
                      <BookIcon className="w-4 h-4" />
                      <span>Mis Reservas</span>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-1"></div>
                    </Link>
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-2 text-gray-700 hover:text-blue-600 
                               hover:bg-blue-50 transition-all duration-200 rounded-lg px-3"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 
                                  rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user?.email?.[0]?.toUpperCase()}
                      </div>
                      <span className="hidden md:block text-sm font-medium max-w-32 truncate">
                        {user?.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white text-black shadow-lg border border-gray-200 rounded-lg">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                      <p className="text-xs text-gray-500">Cuenta activa</p>
                    </div>
                    <Link href={`/reservations/${user?.id}`} className="md:hidden">
                      <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 text-blue-600">
                        <BookIcon className="mr-2 h-4 w-4" />
                        Mis Reservas
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                variant="outline" 
                className="bg-white text-blue-600 hover:bg-blue-50 border-blue-200 
                         hover:border-blue-300 transition-all duration-200 shadow-sm"
                onClick={() => setModalOpen(true)}
              >
                <User className="w-4 h-4 mr-2" />
                <span>Iniciar Sesión</span>
              </Button>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden ml-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="container mx-auto px-4 py-4 space-y-3">
              {!isAuthenticated ? (
                <Button 
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => {
                    setModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </Button>
              ) : (
                <>
                  {/* Mis Reservas: solo super admin (1) o cualquier otro que no sea admin (2) */}
                  {(user?.role === 1 || user?.role !== 2) && (
                    <Button 
                      variant="outline" 
                      className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                      asChild
                    >
                      <Link href={`/reservations/${user?.id}`} onClick={() => setIsMenuOpen(false)}>
                        <BookIcon className="w-4 h-4 mr-2" />
                        Mis Reservas
                      </Link>
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal para Login / Register / Reset */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </header>
  );
}
