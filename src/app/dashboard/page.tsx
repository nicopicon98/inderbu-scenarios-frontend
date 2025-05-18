"use client";

import { SimpleLayout } from "@/shared/components/layout/simple-layout";
import { ReservationsContainer } from "@/features/reservations/ReservationsContainer";

export default function ReservationsPage() {
  return (
    <SimpleLayout>
      <ReservationsContainer />
    </SimpleLayout>
  );
}
