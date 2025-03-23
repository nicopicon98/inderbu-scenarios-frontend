import { Button } from "@/components/ui/button"
import { Sun, Plus, Minus, ShipWheelIcon as Wheelchair } from "lucide-react"

export function AccessibilityTools() {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 flex flex-col">
      <Button variant="outline" size="icon" className="rounded-none bg-blue-500 text-white hover:bg-blue-600">
        <Plus className="h-5 w-5" />
      </Button>
      <Button variant="outline" size="icon" className="rounded-none bg-blue-500 text-white hover:bg-blue-600">
        <Minus className="h-5 w-5" />
      </Button>
      <Button variant="outline" size="icon" className="rounded-none bg-blue-500 text-white hover:bg-blue-600">
        <Sun className="h-5 w-5" />
      </Button>
      <Button variant="outline" size="icon" className="rounded-none bg-blue-500 text-white hover:bg-blue-600">
        <Wheelchair className="h-5 w-5" />
      </Button>
    </div>
  )
}

