'use client';

import { PaginatedReservations } from '@/entities/reservation/model/types';
import { UserReservationsGuard } from '@/features/auth';
import { MainHeader } from '@/shared/components/organisms/main-header';
import { ReservationsContainer } from '@/widgets/reservations-list';

// ✅ Updated interface to include access metadata from DDD use case
interface ReservationsPageProps {
  userId: number;
  initialData?: PaginatedReservations | null;
  accessMetadata?: {
    userId: number;
    accessedAt: Date;
    accessedBy: string;
    accessLevel: string;
  };
}

// ✅ Atomic: Page-level component (template with real data)
// ✅ FSD: Template layer - orchestrates widgets and features
export function ReservationsPage({ 
  userId, 
  initialData, 
  accessMetadata 
}: ReservationsPageProps) {
  return (
    <main className="min-h-screen flex flex-col">
      <MainHeader />

      {/* 🔒 Feature: Auth guard handles client-side protection */}
      <UserReservationsGuard userId={userId}>
        {/* 📊 Widget: Complex orchestration component */}
        <ReservationsContainer
          userId={userId}
          initialData={initialData}
          accessMetadata={accessMetadata}
        />
      </UserReservationsGuard>
    </main>
  );
}
