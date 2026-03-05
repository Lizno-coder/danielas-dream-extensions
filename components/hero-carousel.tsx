"use client";

import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface CarouselImage {
  id: number;
  url: string;
  caption: string | null;
}

export function HeroCarousel() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    fetchCarouselImages();
  }, []);

  const fetchCarouselImages = async () => {
    try {
      const res = await fetch("/api/gallery?carousel=true");
      if (res.ok) {
        const data = await res.json();
        setImages(data.images);
      }
    } catch (error) {
      console.error("Failed to fetch carousel images:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] md:h-[70vh] bg-[#1a1410] animate-pulse flex items-center justify-center">
        <ImageIcon className="h-12 w-12 text-[#fcefd1]/20" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="h-[60vh] md:h-[70vh] bg-[#1a1410] flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="h-16 w-16 text-[#fcefd1]/20 mx-auto mb-4" />
          <p className="text-[#fcefd1]/40">Bilder werden bald hinzugefügt</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((image) => (
            <div key={image.id} className="flex-[0_0_100%] min-w-0 relative h-full">
              <Image
                src={image.url}
                alt={image.caption || "Haarverlängerung Ergebnis"}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#110c09]/80 via-[#110c09]/20 to-transparent" />
              {image.caption && (
                <div className="absolute bottom-20 left-0 right-0 text-center px-4">
                  <p className="text-[#fcefd1]/80 text-sm md:text-base">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-[#110c09]/50 text-[#fcefd1] hover:bg-[#110c09]/70"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-[#110c09]/50 text-[#fcefd1] hover:bg-[#110c09]/70"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}
    </div>
  );
}
