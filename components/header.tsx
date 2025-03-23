import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function Header() {
  return (
    <div className="bg-blue-600 text-white py-2">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="#" className="font-bold">
          GOV.CO
        </Link>

        <div className="flex items-center space-x-6">
          <div className="text-sm">Contador visitas: 538763</div>

          <div className="flex items-center space-x-2">
            <span>Idioma:</span>
            <span className="font-bold">ES</span>
          </div>

          <div className="flex items-center space-x-2">
            <span>Traducir a:</span>
            <Select>
              <SelectTrigger className="bg-white text-black border-none w-44 h-8">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}

