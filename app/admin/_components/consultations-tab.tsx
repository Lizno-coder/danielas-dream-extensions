"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Phone, MapPin, Check, X, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface ConsultationSlot {
  id: number;
  datetime: string;
  type: "phone" | "in_person";
  status: string;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  notes: string | null;
}

interface ConsultationsTabProps {
  slots: ConsultationSlot[];
  onRefresh: () => void;
}

export function ConsultationsTab({ slots, onRefresh }: ConsultationsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<"phone" | "in_person">("phone");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const createSlot = async () => {
    if (!date || !time) return;
    setLoading(true);
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datetime: new Date(`${date}T${time}`).toISOString(), type, notes }),
      });
      if (res.ok) {
        setDialogOpen(false);
        setDate(""); setTime(""); setNotes("");
        onRefresh();
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateStatus = async (id: number, status: string) => {
    setActionLoading(`slot-${id}`);
    try {
      const res = await fetch(`/api/consultation/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) onRefresh();
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  const deleteSlot = async (id: number) => {
    if (!confirm("Löschen?")) return;
    setActionLoading(`delete-${id}`);
    try {
      const res = await fetch(`/api/consultation/${id}`, { method: "DELETE" });
      if (res.ok) onRefresh();
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-[#fcefd1]">Beratungstermine</h2>
        <Button onClick={() => setDialogOpen(true)} className="bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1]"><Plus className="h-4 w-4 mr-2" />Termin anlegen</Button>
      </div>
      <div className="space-y-3">
        {slots.length === 0 ? (
          <Card className="glass-card"><CardContent className="p-8 text-center text-[#fcefd1]/60"><Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Keine Termine vorhanden</p></CardContent></Card>
        ) : (
          slots.map((slot) => (
            <Card key={slot.id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-[#fcefd1]">{format(new Date(slot.datetime), "EEEE, d. MMMM yyyy", { locale: de })}</h3>
                      <Badge variant="outline" className="border-[#fcefd1]/30 text-[#fcefd1]">{slot.type === "phone" ? <Phone className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}{slot.type === "phone" ? "Telefon" : "Vor Ort"}</Badge>
                    </div>
                    <p className="text-[#fcefd1]/80">{format(new Date(slot.datetime), "HH:mm", { locale: de })} Uhr</p>
                    {slot.userName && <p className="text-sm text-[#fcefd1]/60">Gebucht von: {slot.userName}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {slot.status === "requested" && (
                      <>
                        <Button size="sm" onClick={() => updateStatus(slot.id, "booked")} disabled={actionLoading === `slot-${slot.id}`} className="bg-green-600 hover:bg-green-700 text-white">{actionLoading === `slot-${slot.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}Annehmen</Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(slot.id, "declined")} disabled={actionLoading === `slot-${slot.id}`}><X className="h-4 w-4 mr-1" />Ablehnen</Button>
                      </>
                    )}
                    {slot.status === "booked" && <Badge className="bg-green-600 text-white">Bestätigt</Badge>}
                    {slot.status === "declined" && <Badge variant="destructive">Abgelehnt</Badge>}
                    {slot.status === "available" && <Badge variant="outline" className="border-[#fcefd1]/30 text-[#fcefd1]">Verfügbar</Badge>}
                    <Button size="sm" variant="ghost" onClick={() => deleteSlot(slot.id)} disabled={actionLoading === `delete-${slot.id}`} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1a1410] border-[#fcefd1]/10 text-[#fcefd1]">
          <DialogHeader><DialogTitle>Neuen Beratungstermin anlegen</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Datum</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]" /></div>
              <div><Label>Uhrzeit</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]" /></div>
            </div>
            <div><Label>Art</Label><Select value={type} onValueChange={(v) => setType(v as "phone" | "in_person")}>
              <SelectTrigger className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#2a2018] border-[#fcefd1]/20">
                <SelectItem value="phone">Telefonisch</SelectItem>
                <SelectItem value="in_person">Vor Ort</SelectItem>
              </SelectContent>
            </Select></div>
            <div><Label>Notizen</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="z.B. nur für neue Kunden" className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-[#fcefd1]/30 text-[#fcefd1]">Abbrechen</Button>
            <Button onClick={createSlot} disabled={loading || !date || !time} className="bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1]">{loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Anlegen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
