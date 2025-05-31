import { UserCircle } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 h-16 bg-white border-b border-gray-200 flex items-center px-4">
      <div className="ml-4 text-xl font-semibold">
        Escenarios Deportivos Inderbu XD
      </div>
      <div className="ml-auto">
        <button className="rounded-full bg-blue-500 text-white p-1">
          {/* <UserCircle className="h-8 w-8" /> */}
        </button>
      </div>
    </header>
  );
}
