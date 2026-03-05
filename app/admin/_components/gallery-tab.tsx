"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Image as ImageIcon, Trash2, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

interface GalleryImage {
  id: number;
  url: string;
  r2Key: string | null;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [carousel, setCarousel] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    try {
      // 1. Get presigned URL from API
      const presignRes = await fetch("/api/r2/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedFile.name,
          contentType: selectedFile.type,
          folder: carousel ? "carousel" : "gallery",
        }),
      });

      if (!presignRes.ok) throw new Error("Failed to get upload URL");
      const { presignedUrl, publicUrl, key } = await presignRes.json();

      // 2. Upload to R2
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        body: selectedFile,
        headers: { "Content-Type": selectedFile.type },
      });

      if (!uploadRes.ok) throw new Error("Upload to R2 failed");

      // 3. Save to database
      const dbRes = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: publicUrl,
          r2Key: key,
          caption,
          carousel,
        }),
      });

      if (dbRes.ok) {
        setDialogOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        setCaption("");
        setCarousel(false);
        onRefresh();
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload fehlgeschlagen. Bitte versuche es erneut.");
    }
    setUploading(false);
  };

  const deleteImage = async (img: GalleryImage) => {
    if (!confirm("Bild wirklich löschen?")) return;
    
    setLoading(`delete-${img.id}`);
    try {
      // Delete from R2 if key exists
      if (img.r2Key) {
        await fetch("/api/r2/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: img.r2Key }),
        });
      }

      // Delete from database
      const res = await fetch(`/api/gallery/${img.id}`, { method: "DELETE" });
      if (res.ok) onRefresh();
    } catch (error) {
      console.error("Delete error:", error);
    }
    setLoading(null);
  };

  const toggleCarousel = async (img: GalleryImage) => {
    setLoading(`toggle-${img.id}`);
    try {
      const res = await fetch(`/api/gallery/${img.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carousel: !img.carousel }),
      });
      if (res.ok) onRefresh();
    } catch (error) {
      console.error("Toggle error:", error);
    }
    setLoading(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-[#fcefd1]">Galerie</h2>
        <Button onClick={() => setDialogOpen(true)} className="bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1]">
          <Plus className="h-4 w-4 mr-2" />Bild hinzufügen
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.length === 0 ? (
          <Card className="glass-card col-span-full">
            <CardContent className="p-8 text-center text-[#fcefd1]/60">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Bilder vorhanden. Füge Bilder zur Galerie hinzu.</p>
            </CardContent>
          </Card>
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
                    <Checkbox 
                      id={`carousel-${img.id}`} 
                      checked={img.carousel} 
                      onCheckedChange={() => toggleCarousel(img)} 
                      disabled={loading === `toggle-${img.id}`} 
                    />
                    <label htmlFor={`carousel-${img.id}`} className="text-xs text-[#fcefd1]/60">Carousel</label>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => deleteImage(img)} 
                    disabled={loading === `delete-${img.id}`} 
                    className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1a1410] border-[#fcefd1]/10 text-[#fcefd1] max-w-md">
          <DialogHeader>
            <DialogTitle>Bild hochladen</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* File Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#fcefd1]/20 rounded-lg p-8 text-center cursor-pointer hover:border-[#fcefd1]/40 transition-colors"
            >
              {previewUrl ? (
                <div className="relative w-full aspect-video">
                  <Image src={previewUrl} alt="Preview" fill className="object-contain rounded" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto mb-2 text-[#fcefd1]/40" />
                  <p className="text-[#fcefd1]/60">Klicke oder ziehe Bild hierher</p>
                  <p className="text-xs text-[#fcefd1]/40 mt-1">JPG, PNG, WebP (max 10MB)</p>
                </>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div>
              <Label>Beschreibung (optional)</Label>
              <Input 
                value={caption} 
                onChange={(e) => setCaption(e.target.value)} 
                placeholder="z.B. Vorher-Nachher" 
                className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]" 
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox 
                id="new-carousel" 
                checked={carousel} 
                onCheckedChange={(c) => setCarousel(c as boolean)} 
              />
              <label htmlFor="new-carousel" className="text-[#fcefd1]/80">Im Carousel anzeigen</label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => { setDialogOpen(false); setSelectedFile(null); setPreviewUrl(null); }}
              className="border-[#fcefd1]/30 text-[#fcefd1]"
            >
              Abbrechen
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={uploading || !selectedFile} 
              className="bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1]"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              Hochladen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
