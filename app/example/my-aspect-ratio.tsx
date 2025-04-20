import { AspectRatio } from "@/shared/ui/aspect-ratio";
import Image from "next/image";

export function MyAspectRatio() {
  return (
    <div className="w-[200px]">
      <AspectRatio ratio={1 / 1}>
        <Image
          fill
          alt="something"
          src="https://inderbu.gov.co/wp-content/uploads/2025/03/ESCUELAS-2025-banner-PEQU.jpg"
        />
      </AspectRatio>
    </div>
  );
}
