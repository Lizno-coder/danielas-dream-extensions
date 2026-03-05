"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ImageIcon } from "lucide-react";
import Image from "next/image";

interface GalleryImage {
  id: number;
  url: string;
  caption: string | null;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/gallery");
      if (res.ok) {
        const data = await res.json();
        setImages(data.images);
      }
    } catch (error) {
      console.error("Failed to fetch images:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#110c09]">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-light text-[#fcefd1] mb-3">
            Galerie
          </h1>
          <p className="text-[#fcefd1]/60 max-w-xl mx-auto">
            Entdecke atemberaubende Haarverlängerungen von Daniela
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#fcefd1]/60" />
          </div>
        ) : images.length === 0 ? (
          <Card className="glass-card max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <ImageIcon className="h-12 w-12 text-[#fcefd1]/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#fcefd1] mb-2">
                Noch keine Bilder
              </h3>
              <p className="text-[#fcefd1]/60">
                Die Galerie wird bald mit wunderschönen Ergebnissen gefüllt.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="break-inside-avoid rounded-xl overflow-hidden bg-[#1a1410] border border-[#fcefd1]/10"
              >
                <div className="relative">
                  <Image
                    src={image.url}
                    alt={image.caption || "Haarverlängerung"}
                    width={400}
                    height={600}
                    className="w-full h-auto"
                  />
                  {image.caption && (
                    <div className="p-3 bg-[#1a1410]">
                      <p className="text-sm text-[#fcefd1]/80">{image.caption}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
