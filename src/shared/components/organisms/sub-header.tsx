import Image from "next/image";
import { Search } from "lucide-react";
import Link from "next/link";

export function SubHeader() {
  return (
    <div className="bg-white py-3 border-b">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href={"/"}>
            <Image
              src="https://inderbu.gov.co/wp-content/uploads/2024/07/LOGO-3.png"
              alt="INDERBU Logo"
              width={300}
              height={60}
              style={{
                height: "auto",
                objectFit: "contain",
              }}
            />
          </Link>
        </div>

        <div className="relative">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Buscar en la sede electrónica"
              className="border border-green-500 rounded-l-full py-2 px-4 w-48 md:w-64 text-sm focus:outline-hidden text-gray-700"
            />
            <button className="bg-black text-white rounded-r-full p-2 h-full">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
