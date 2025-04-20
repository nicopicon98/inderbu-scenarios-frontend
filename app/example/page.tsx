"use client";

import HomeMain from "@/features/home/components/organisms/home-main";
import ClientComponentWithInteractivity from "./client.component";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* <ClientComponentWithInteractivity /> */}
      <HomeMain />
    </div>
  );
}
