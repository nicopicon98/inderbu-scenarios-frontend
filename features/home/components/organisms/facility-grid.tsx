import { FacilityCard } from "@/shared/components/organisms/facility-card";
import Link from "next/link";

const facilities = [
  {
    id: "bolera-suramericana",
    title:
      "Bolera Suramericana Unidad Deportiva de Belén Andrés Escobar Saldarriaga",
    type: "BOLERA / UNIDAD DEPORTIVA",
    email: "atencion.ciudadano@inder.gov.co",
    phone: "3699000",
    location: "Rosales",
  },
];

export default function FacilityGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {facilities.map((f) => (
        <Link href={`/scenario/${f.id}`} key={f.id}>
          <FacilityCard {...f} />
        </Link>
      ))}
    </div>
  );
}
