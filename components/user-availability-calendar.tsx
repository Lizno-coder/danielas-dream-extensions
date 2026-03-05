"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Clock, CalendarDays } from "lucide-react";
import { toast } from "sonner";

interface AvailabilitySlot {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  notes: string | null;
}

const daysOfWeek = [
  { value: 0, label: "Sonntag" },
  { value: 1, label: "Montag" },
  { value: 2, label: "Dienstag" },
  { value: 3, label: "Mittwoch" },
  { value: 4, label: "Donnerstag" },
  { value: 5, label: "Freitag" },
  { value: 6, label: "Samstag" },
];

export function UserAvailabilityCalendar() {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const res = await fetch("/api/user/availability");
      if (res.ok) {
        const data = await res.json();
        setAvailability(data.availability || []);
      }
    } catch (error) {
      console.error("Failed to fetch availability:", error);
    }
    setLoading(false);
  };

  const addSlot = async () => {
    if (!selectedDay) {
      toast.error("Bitte einen Tag auswählen");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/user/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: parseInt(selectedDay),
          startTime,
          endTime,
          notes,
        }),
      });

      if (res.ok) {
        toast.success("Verfügbarkeit hinzugefügt");
        setSelectedDay("");
        setNotes("");
        fetchAvailability();
      } else {
        toast.error("Fehler beim Hinzufügen");
      }
    } catch (error) {
      toast.error("Fehler beim Hinzufügen");
    }
    setAdding(false);
  };

  const deleteSlot = async (id: number) => {
    try {
      const res = await fetch("/api/user/availability", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success("Verfügbarkeit entfernt");
        fetchAvailability();
      }
    } catch (error) {
      toast.error("Fehler beim Entfernen");
    }
  };

  const getDayLabel = (dayValue: number) => {
    return daysOfWeek.find((d) => d.value === dayValue)?.label || "";
  };

  // Sort by day of week
  const sortedAvailability = [...availability].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#fcefd1]/60" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add new availability */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-[#fcefd1] text-base">Verfügbarkeit hinzufügen</CardTitle>
          <CardDescription className="text-[#fcefd1]/60 text-sm">
            Wann hast du generell Zeit für Termine?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[#fcefd1] text-sm">Tag</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]">
                  <SelectValue placeholder="Tag wählen" />
                </SelectTrigger>
                <SelectContent className="bg-[#2a2018] border-[#fcefd1]/20">
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#fcefd1] text-sm">Zeitraum</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1] flex-1"
                />
                <span className="text-[#fcefd1]/60">-</span>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1] flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#fcefd1] text-sm">Notizen (optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z.B. nur am Nachmittag"
              className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]"
            />
          </div>

          <Button
            onClick={addSlot}
            disabled={adding || !selectedDay}
            className="w-full bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1]"
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Hinzufügen
          </Button>
        </CardContent>
      </Card>

      {/* Current availability list */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-[#fcefd1] text-base flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Deine Verfügbarkeiten
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedAvailability.length === 0 ? (
            <div className="text-center py-6 text-[#fcefd1]/60">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Noch keine Verfügbarkeiten eingetragen</p>
              <p className="text-xs mt-1">Füge oben deine Zeiten hinzu</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedAvailability.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-3 bg-[#2a2018]/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="border-[#fcefd1]/30 text-[#fcefd1]">
                        {getDayLabel(slot.dayOfWeek)}
                      </Badge>
                      <span className="text-[#fcefd1]/80 text-sm">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    {slot.notes && (
                      <p className="text-xs text-[#fcefd1]/50 mt-1 truncate">{slot.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSlot(slot.id)}
                    className="text-red-400 hover:text-red-300 h-8 w-8 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
