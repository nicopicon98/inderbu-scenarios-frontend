'use server';

import { createReservationRepository } from '@/entities/reservation/api/reservationRepository';
import { CreateReservationDto, CreateReservationSchema } from '@/entities/reservation/model/types';
import { HttpClientFactory } from '@/shared/api/http-client';
import { createServerAuthContext } from '@/shared/api/server-auth';
import { createFormDataValidator } from '@/shared/lib/validation';
import { revalidateTag } from 'next/cache';

export interface CreateReservationResult {
  success: boolean;
  data?: { id: number; reservationDate: string };
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

const validateCreateReservation = createFormDataValidator(CreateReservationSchema);

export async function createReservationAction(
  prevState: CreateReservationResult | null,
  formData: FormData
): Promise<CreateReservationResult> {
  try {
    // Validate input
    const command = validateCreateReservation(formData);

    // Create repository
    const authContext = createServerAuthContext();
    const httpClient = HttpClientFactory.createServerClientSync(authContext);
    const repository = createReservationRepository(httpClient);

    // Execute command
    const reservation = await repository.create(command);

    // Invalidate cache
    revalidateTag('reservations');
    revalidateTag(`reservations-user-${reservation.userId}`);

    console.log(`✅ Reservation created successfully: ${reservation.id}`);

    return {
      success: true,
      data: {
        id: reservation.id,
        reservationDate: reservation.reservationDate,
      },
    };
  } catch (error) {
    console.error('❌ Error creating reservation:', error);

    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return {
          success: false,
          error: 'Datos de entrada inválidos',
          fieldErrors: { general: [error.message] },
        };
      }

      return {
        success: false,
        error: error.message || 'Error interno del servidor',
      };
    }

    return {
      success: false,
      error: 'Error inesperado al crear la reserva',
    };
  }
}

// Simplified version for direct calls (not form-based)
export async function createReservation(command: CreateReservationDto): Promise<CreateReservationResult> {
  try {
    // Validate input
    const validatedCommand = CreateReservationSchema.parse(command);

    // Create repository
    const authContext = createServerAuthContext();
    const httpClient = HttpClientFactory.createServerClientSync(authContext);
    const repository = createReservationRepository(httpClient);

    // Execute command
    const reservation = await repository.create(validatedCommand);

    // Invalidate cache
    revalidateTag('reservations');
    revalidateTag(`reservations-user-${reservation.userId}`);

    return {
      success: true,
      data: {
        id: reservation.id,
        reservationDate: reservation.reservationDate,
      },
    };
  } catch (error) {
    console.error('❌ Error creating reservation:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error inesperado',
    };
  }
}
