import * as React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function MainCarousel() {
  const slides = [
    {
      id: 1,
      title: "Escenarios deportivos para todos",
      description: "Encuentra y reserva los mejores espacios deportivos de Medellín",
      imageUrl: "https://inderbu.gov.co/wp-content/uploads/2025/03/ESCUELAS-2025-banner-PEQU.jpg",
      buttonText: "Reservar ahora",
      buttonLink: "/reservas"
    },
    {
      id: 2,
      title: "Actividades para toda la familia",
      description: "Programas recreativos para todas las edades",
      imageUrl: "https://inderbu.gov.co/wp-content/uploads/2025/03/BANNER-HEVS-ajustado.jpg",
      buttonText: "Ver programas",
      buttonLink: "/programas"
    },
  ];

  return (
    <div className="w-full relative">
      <Carousel className="w-full">
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="p-0">
              <div className="relative w-full h-96">
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  layout="fill"
                  objectFit="cover"
                  className="brightness-75"
                />
                <div className="absolute inset-0 flex flex-col justify-center items-start z-10">
                  <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-white mb-2">{slide.title}</h2>
                    <p className="text-xl text-white mb-6 max-w-lg">{slide.description}</p>
                    <button className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-6 rounded-md transition duration-300">
                      {slide.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="container mx-auto px-4 relative">
          <CarouselPrevious className="absolute left-4 z-20" />
          <CarouselNext className="absolute right-4 z-20" />
          <h3>
            This is the new content
          </h3>
        </div>
      </Carousel>
    </div>
  );
}