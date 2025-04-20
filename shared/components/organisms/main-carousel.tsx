import * as React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/ui/carousel";
import { slides } from "@/mock-data/slides";

export function MainCarousel() {
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
                  fill
                  sizes="100vw"
                  priority
                  style={{ 
                    objectFit: "cover",
                    width: "100%",
                    height: "100%"
                  }}
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
        </div>
      </Carousel>
    </div>
  );
}