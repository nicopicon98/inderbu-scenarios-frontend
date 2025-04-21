import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTodayLocalISO(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm   = String(now.getMonth() + 1).padStart(2, '0')  // Mes: 0‑11 → +1
  const dd   = String(now.getDate()).padStart(2, '0')       // Día del mes
  return `${yyyy}-${mm}-${dd}`
}

