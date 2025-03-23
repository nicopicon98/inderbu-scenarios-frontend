import Link from "next/link"
import { ChevronDown, User } from "lucide-react"

export function MainNavigation() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="py-4 font-medium text-gray-700 hover:text-teal-500">
              Inicio
            </Link>

            <div className="relative group">
              <Link href="#" className="py-4 flex items-center font-medium text-gray-700 hover:text-teal-500">
                Información general
                <ChevronDown className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="relative group">
              <Link href="#" className="py-4 flex items-center font-medium text-gray-700 hover:text-teal-500">
                Programas institucionales
                <ChevronDown className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <Link href="#" className="py-4 font-medium text-gray-700 hover:text-teal-500">
              Trámites y servicios
            </Link>

            <Link href="#" className="py-4 font-medium text-gray-700 hover:text-teal-500">
              Aprende con el Inder
            </Link>

            <Link href="#" className="py-4 font-medium text-gray-700 hover:text-teal-500">
              Contacto Inder en tu comuna
            </Link>

            <Link href="#" className="py-4 font-medium text-gray-700 hover:text-teal-500">
              Política Pública
            </Link>
          </div>

          <Link href="#" className="py-4 flex items-center font-medium text-gray-700 hover:text-teal-500">
            Ingresar
            <User className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </nav>
  )
}

