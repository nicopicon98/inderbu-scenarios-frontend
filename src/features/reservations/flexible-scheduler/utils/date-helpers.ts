import { format, parseISO } from "date-fns";

/**
 * Obtiene la fecha de hoy en formato ISO
 */
export const getTodayISO = (): string => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Formatea una fecha de manera segura
 */
export const formatDateSafe = (dateStr: string | undefined): string => {
  if (!dateStr) return "";
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy");
  } catch {
    return dateStr;
  }
};

/**
 * Valida si una fecha final es mayor que la inicial
 */
export const validateDateRange = (startDate: string, endDate: string): boolean => {
  return endDate >= startDate;
};
