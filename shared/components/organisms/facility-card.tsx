import Image from "next/image"

interface FacilityCardProps {
  title: string
  type: string
  email: string
  phone: string
  location: string
}

export function FacilityCard({ title, type, email, phone, location }: FacilityCardProps) {
  return (
    <div className="border rounded-md overflow-hidden shadow-sm bg-white h-full">
      <div className="bg-teal-500 p-8 flex justify-center items-center">
        <Image src="/field-icon.svg" alt="Campo deportivo" width={100} height={100} className="text-white" />
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-teal-500 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-4">{type}</p>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Correo:</span> {email}
          </div>
          <div>
            <span className="font-medium">Teléfono:</span> {phone}
          </div>
          <div>
            <span className="font-medium">Ubicación:</span> {location}
          </div>
        </div>

        <div className="block mt-4 text-teal-500 hover:underline">Conoce más</div>
      </div>
    </div>
  )
}

