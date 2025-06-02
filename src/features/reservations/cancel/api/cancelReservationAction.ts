'use server';

import { createReservationRepository } from '@/entities/reservation/api/reservationRepository';
import { HttpClientFactory } from '@/shared/api/http-client';
import { createServerAuthContext } from '@/shared/api/server-auth';
import { revalidateTag } from 'next/cache';

export interface CancelReservationResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function cancelReservationAction(
  reservationId: number,
  reason?: string
): Promise<CancelReservationResult> {
  try {
    // Create repository
    const authContext = createServerAuthContext();
    const httpClient = HttpClientFactory.createServerClientSync(authContext);
    const repository = createReservationRepository(httpClient);

    // Update reservation state to CANCELLED (assuming ID 3 is CANCELADA)
    // Note: The current service shows stateId: 3 for cancel operations
    await repository.updateState(reservationId, {
      stateId: 3, // CANCELADA
    });

    // Invalidate cache
    revalidateTag('reservations');
    revalidateTag(`reservation-${reservationId}`);

    console.log(`✅ Reservation ${reservationId} cancelled successfully`);

    return {
      success: true,
      message: 'Reserva cancelada exitosamente',
    };
  } catch (error) {
    console.error(`❌ Error cancelling reservation ${reservationId}:`, error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al cancelar la reserva',
    };
  }
}

// Batch cancel reservations
export async function cancelMultipleReservationsAction(
  reservationIds: number[],
  reason?: string
): Promise<CancelReservationResult> {
  try {
    const authContext = createServerAuthContext();
    const httpClient = HttpClientFactory.createServerClientSync(authContext);
    const repository = createReservationRepository(httpClient);

    // Cancel all reservations in parallel
    await Promise.all(
      reservationIds.map(id =>
        repository.updateState(id, {
          stateId: 3, // CANCELADA
        })
      )
    );

    // Invalidate cache
    revalidateTag('reservations');
    reservationIds.forEach(id => revalidateTag(`reservation-${id}`));

    console.log(`✅ ${reservationIds.length} reservations cancelled successfully`);

    return {
      success: true,
      message: `${reservationIds.length} reservas canceladas exitosamente`,
    };
  } catch (error) {
    console.error('❌ Error cancelling multiple reservations:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al cancelar las reservas',
    };
  }
}
