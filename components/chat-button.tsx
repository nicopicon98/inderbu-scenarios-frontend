import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

export function ChatButton() {
  return (
    <div className="fixed bottom-4 right-4">
      <div className="absolute -top-10 right-0 bg-white rounded-lg shadow-lg p-2 text-sm whitespace-nowrap">
        Chatea con nosotros 👋
      </div>
      <Button size="icon" className="h-14 w-14 rounded-full bg-teal-500 hover:bg-teal-600 relative">
        <MessageSquare className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          2
        </span>
      </Button>
    </div>
  )
}

