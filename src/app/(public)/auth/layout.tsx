import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Autenticación - Inderbu',
  description: 'Inicia sesión o regístrate en Inderbu',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
