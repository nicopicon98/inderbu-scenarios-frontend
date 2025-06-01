import { AuthProvider } from "@/shared/contexts/auth-context";
import { Toaster } from "@/shared/ui/sonner";
import { Inter } from "next/font/google";
import type { Metadata } from "next/types";
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
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        > */}
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
