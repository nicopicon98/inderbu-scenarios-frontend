"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, LogOut, LayoutDashboard, BookIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { LoginModal } from "@/shared/components/organisms/login-modal";
import { useAuth } from "@/shared/contexts/auth-context";
import { Button } from "@/shared/ui/button";

export function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLoginSuccess = (email: string, role: number, token: string) => {
    console.log(email, role, token);
    login(email, role, token);
  };

  return (
    <div className="bg-blue-600 text-white py-2">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="https://www.gov.co" className="font-bold" target="_blank">
          <Image
            src="https://inderbu.gov.co/wp-content/uploads/2022/09/logo_gov_co.png"
            alt="gov.co"
            width={150}
            height={60}
            style={{
              height: "auto", // This fixes the aspect ratio warning
              objectFit: "contain",
            }}
          />
        </Link>

        <div>
          {isAuthenticated ? (
            <>
              <Button
                variant="outline"
                className="text-blue-600 hover:text-blue-700 bg-white hover:bg-gray-100 mr-2 cursor-pointer"
              >
                <BookIcon className="mr-2 h-4 w-4" />
                Mis reservas
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-blue-600 hover:text-blue-700 bg-white hover:bg-gray-100 cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {user?.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white dark:bg-gray-800 text-black dark:text-white"
                >
                  {/* If user.role = 1, which means is a super-admin, then allow user to go to dashboard */}
                  {user?.role === 1 && (
                    <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer hover:bg-gray-100">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Panel de Control
                      </DropdownMenuItem>
                    </Link>
                  )}
                  {/* If user.role = 2, which is admin, then allow user to go to dashboard */}
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-600 cursor-pointer hover:bg-gray-100"
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
              className="text-blue-600 hover:text-blue-700 bg-white hover:bg-gray-100 cursor-pointer"
              onClick={() => setIsLoginModalOpen(true)}
            >
              <User className="mr-2 h-4 w-4" />
              Iniciar Sesión
            </Button>
          )}
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
