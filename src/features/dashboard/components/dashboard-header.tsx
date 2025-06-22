"use client";

import { useAuth } from "@/shared/contexts/auth-context";
import { Button } from "@/shared/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";


export function DashboardHeader() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="https://inderbu.gov.co/wp-content/uploads/2022/09/logo_gov_co.png"
                alt="INDERBU"
                width={120}
                height={40}
                style={{ height: "auto" }}
              />
              <span className="font-bold text-xl hidden md:inline">
                Panel Administrativo
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={24} />
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center">
                <span className="font-bold text-white text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium">{user?.email}</span>
            </div>
            <Button
              variant="ghost"
              className="text-white hover:bg-blue-700"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-blue-700">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="font-bold text-white text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <Button
                variant="ghost"
                className="text-white hover:bg-blue-700"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
