"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, LayoutDashboard, BookIcon, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { useAuth } from "@/shared/contexts/auth-context";
import { AuthModal } from "./auth-modal";

export function Header() {
  const { user, logout, login, isAuthenticated } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);

  const handleLoginSuccess = (email: string, role: number, token: string) => {
    login(email, role, token);
    setModalOpen(false);
  };

  return (
    <div className="bg-blue-600 text-white py-2">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo gov.co */}
        <Link
          href="https://www.gov.co"
          target="_blank"
          className="inline-flex items-center"
        >
          <Image
            src="https://inderbu.gov.co/wp-content/uploads/2022/09/logo_gov_co.png"
            alt="gov.co"
            width={150}
            height={60}
            style={{ height: "auto", objectFit: "contain" }}
          />
        </Link>

        {/* Acciones de usuario */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Button
                variant="outline"
                className="text-blue-600 bg-white hover:bg-gray-100 mr-2"
                asChild
              >
                <Link href="/reservations">
                  <BookIcon className="mr-2 h-4 w-4" />
                  Mis reservas
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="text-blue-600 bg-white hover:bg-gray-100">
                    <User className="mr-2 h-4 w-4" />
                    {user?.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white text-black">
                  {user?.role === 1 && (
                    <Link href="/admin" passHref>
                      <DropdownMenuItem className="cursor-pointer hover:bg-gray-100">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Panel de Control
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-red-600 hover:bg-gray-100"
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
              className="text-blue-600 bg-white hover:bg-gray-100"
              onClick={() => setModalOpen(true)}
            >
              <User className="mr-2 h-4 w-4" />
              Iniciar Sesión
            </Button>
          )}
        </div>
      </div>

      {/* Modal para Login / Register / Reset */}
      <AuthModal
        isModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
);
}
