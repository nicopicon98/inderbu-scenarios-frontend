"use client";

import { ReservationsContainer } from "@/features/reservations/reservations-container";
import { SimpleLayout } from "@/shared/components/layout/simple-layout";


export default function ReservationsPage() {
  return (
    <SimpleLayout>
      <ReservationsContainer />
    </SimpleLayout>
  );
}
