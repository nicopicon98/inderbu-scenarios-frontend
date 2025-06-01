import { UserReservationsContent } from "@/features/reservations/components/organisms/user-reservation-content";
import { UserReservationsPageGuard } from "@/features/reservations/guards/user-reservation.guard";
import { MainHeader } from "@/shared/components/organisms/main-header";
import { use } from "react";

interface PageProps {
  params: Promise<{ userId: string }>;
}

// Componente principal con protección
export default function UserReservationsPage({ params }: PageProps) {
  const { userId } = use(params);

  return (
    <main className="min-h-screen flex flex-col">
      <MainHeader />
      <UserReservationsPageGuard userId={userId}>
        <UserReservationsContent userId={userId} />
      </UserReservationsPageGuard>
    </main>
  );
}
