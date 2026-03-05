"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Image as ImageIcon, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";

interface GalleryImage {
  id: number;
  url: string;
  caption: string | null;
  carousel: boolean;
  order: number;
}

interface GalleryTabProps {
  images: GalleryImage[];
  onRefresh: () => void;
}

export function GalleryTab({ images, onRefresh }: GalleryTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [carousel, setCarousel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const addImage = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, caption, carousel }),
      });
      if (res.ok) {
        setDialogOpen(false);
        setUrl(""); setCaption(""); setCarousel(false);
        onRefresh();
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const deleteImage = async (id: number) => {
    if (!confirm("Bild löschen?")) return;
    setActionLoading(`delete-${id}`);
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (res.ok) onRefresh();
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  const toggleCarousel = async (img: GalleryImage) => {
    setActionLoading(`toggle-${img.id}`);
    try {
      const res = await fetch(`/api/gallery/${img.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carousel: !img.carousel }),
      });
      if (res.ok) onRefresh();
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-[#fcefd1]">Galerie</h2>
        <Button onClick={() => setDialogOpen(true)} className="bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1]"><Plus className="h-4 w-4 mr-2" />Bild hinzufügen</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.length === 0 ? (
          <Card className="glass-card col-span-full"><CardContent className="p-8 text-center text-[#fcefd1]/60"><ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Keine Bilder vorhanden</p></CardContent></Card>
        ) : (
          images.map((img) => (
            <Card key={img.id} className="glass-card overflow-hidden">
              <div className="relative aspect-square">
                <Image src={img.url} alt={img.caption || "Bild"} fill className="object-cover" />
              </div>
              <CardContent className="p-3">
                <p className="text-sm text-[#fcefd1]/80 truncate">{img.caption || "Ohne Titel"}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id={`carousel-${img.id}`} checked={img.carousel} onCheckedChange={() => toggleCarousel(img)} disabled={actionLoading === `toggle-${img.id}`} />
                    <label htmlFor={`carousel-${img.id}`} className="text-xs text-[#fcefd1]/60">Carousel</label>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteImage(img.id)} disabled={actionLoading === `delete-${img.id}`} className="text-red-400 hover:text-red-300 h-8 w-8 p-0"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1a1410] border-[#fcefd1]/10 text-[#fcefd1]">
          <DialogHeader><DialogTitle>Bild hinzufügen</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Bild-URL</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]" /></div>
            <div><Label>Beschreibung (optional)</Label><Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="z.B. Vorher-Nachher" className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]" /></div>
            <div className="flex items-center gap-2">
              <Checkbox id="new-carousel" checked={carousel} onCheckedChange={(c) => setCarousel(c as boolean)} />
              <label htmlFor="new-carousel" className="text-[#fcefd1]/80">Im Carousel anzeigen</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-[#fcefd1]/30 text-[#fcefd1]">Abbrechen</Button>
            <Button onClick={addImage} disabled={loading || !url} className="bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1]">{loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Hinzufügen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
