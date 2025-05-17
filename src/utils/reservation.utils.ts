// Mapeo de los estados de reserva que vienen del backend a los que usa el frontend
export const reservationStateMap: Record<string, string> = {
  'PENDIENTE': 'pending',
  'CONFIRMADA': 'approved',
  'RECHAZADA': 'rejected',
  'CANCELADA': 'canceled'
};

// Colores para los estados
export const stateColors: Record<string, string> = {
  'pending': '#f59e0b', // Amber/Orange
  'approved': '#22c55e', // Green
  'rejected': '#ef4444', // Red
  'canceled': '#6b7280'  // Gray
};

// IDs de los estados en el backend
export const reservationStateIds: Record<string, number> = {
  'PENDIENTE': 1,
  'CONFIRMADA': 2,
  'RECHAZADA': 3,
  'CANCELADA': 4
};

// Utilidad para mapear estados entre backend y frontend
export function mapReservationState(backendState: string): string {
  return reservationStateMap[backendState] || 'pending';
}

// Utilidad para mapear estados entre frontend y backend
export function getReservationStateId(frontendState: string): number {
  // Invertir el mapeo para buscar por valor
  const backendState = Object.keys(reservationStateMap).find(
    key => reservationStateMap[key] === frontendState
  );
  
  return backendState ? reservationStateIds[backendState] : 1; // Default a PENDIENTE (1)
}

// Utilidad para obtener el color de un estado
export function getStateColor(state: string): string {
  return stateColors[state] || stateColors['pending'];
}

// Función para formatear fecha
export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  };
  return new Date(dateString).toLocaleDateString('es-ES', options);
}
