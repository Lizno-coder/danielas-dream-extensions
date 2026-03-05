"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Trash2, Loader2, AlertTriangle, MapPin } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Appointment {
  id: number;
  datetime: string;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  status: string;
  address: string;
  notes: string | null;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

interface AppointmentsTabProps {
  appointments: Appointment[];
  selectedUser: User | null;
  onCloseDialog: () => void;
  onRefresh: () => void;
}

export function AppointmentsTab({ appointments, selectedUser, onCloseDialog, onRefresh }: AppointmentsTabProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("Graf-zu-Toerring-Straße");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [warning, setWarning] = useState<{ open: boolean; existing?: Appointment }>({ open: false });

  const createAppointment = async (force = false) => {
    if (!selectedUser || !date || !time) return;
    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, datetime: new Date(`${date}T${time}`).toISOString(), type: "extension", address, notes, force }),
      });
      const data = await res.json();
      if (res.status === 409 && data.warning) {
        setWarning({ open: true, existing: data.existingAppointment });
        setLoading(false);
        return;
      }
      if (res.ok) {
        onCloseDialog();
        setDate(""); setTime(""); setNotes("");
        setWarning({ open: false });
        onRefresh();
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const deleteAppointment = async (id: number) => {
    if (!confirm("Löschen?")) return;
    setActionLoading(`delete-${id}`);
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (res.ok) onRefresh();
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  return (
    <div>
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <Card className="glass-card"><CardContent className="p-8 text-center text-[#fcefd1]/60"><Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Keine Termine vorhanden</p></CardContent></Card>
        ) : (
          appointments.map((appt) => (
            <Card key={appt.id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-[#fcefd1]">{format(new Date(appt.datetime), "EEEE, d. MMMM yyyy", { locale: de })}</h3>
                    <p className="text-[#fcefd1]/80">{format(new Date(appt.datetime), "HH:mm", { locale: de })} Uhr</p>
                    <p className="text-sm text-[#fcefd1]/60">Kunde: {appt.userName} ({appt.userEmail})</p>
                    <div className="flex items-center gap-1 text-sm text-[#fcefd1]/40"><MapPin className="h-3 w-3" />{appt.address}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600 text-white">Bestätigt</Badge>
                    <Button size="sm" variant="ghost" onClick={() => deleteAppointment(appt.id)} disabled={actionLoading === `delete-${appt.id}`} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Appointment Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && onCloseDialog()}>
        <DialogContent className="bg-[#1a1410] border-[#fcefd1]/10 text-[#fcefd1]">
          <DialogHeader>
            <DialogTitle>Haarverlängerungstermin erstellen</DialogTitle>
            <DialogDescription className="text-[#fcefd1]/60">Für: {selectedUser?.name} ({selectedUser?.email})</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Datum</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]" /></div>
              <div><Label>Uhrzeit</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]" /></div>
            </div>
            <div><Label>Adresse</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]" /></div>
            <div><Label>Notizen</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseDialog} className="border-[#fcefd1]/30 text-[#fcefd1]">Abbrechen</Button>
            <Button onClick={() => createAppointment()} disabled={loading || !date || !time} className="bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1]">{loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Erstellen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Double Booking Warning */}
      <Dialog open={warning.open} onOpenChange={(open) => setWarning({ open })}>
        <DialogContent className="bg-[#1a1410] border-red-500/50 text-[#fcefd1]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400"><AlertTriangle className="h-5 w-5" />Doppelbuchung!</DialogTitle>
            <DialogDescription className="text-[#fcefd1]/60">
              Es gibt bereits einen Termin am {warning.existing && format(new Date(warning.existing.datetime), "dd.MM.yyyy 'um' HH:mm")} Uhr.<br />
              Möchtest du wirklich fortfahren?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarning({ open: false })} className="border-[#fcefd1]/30 text-[#fcefd1]">Abbrechen</Button>
            <Button onClick={() => createAppointment(true)} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">{loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Trotzdem erstellen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
