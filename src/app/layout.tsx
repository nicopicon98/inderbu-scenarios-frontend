import Footer from "@/features/home/components/organisms/footer";
import { AuthProvider } from "@/shared/contexts/auth-context";
import type { Metadata } from "next/types";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import type React from "react";
import "./globals.css";



const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "INDER Medellín - Reservas",
  description: "Instituto de Deportes y Recreación de Medellín",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
