"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, Plus, Trash2, CalendarDays, Clock, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";

interface Absence {
  id: number;
  startDate: string;
  endDate: string;
  reason: string | null;
  allDay: boolean;
}

interface Appointment {
  id: number;
  datetime: string;
  userName: string;
  userEmail: string;
  type: string;
}

export function AdminCalendar() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [absencesRes, appointmentsRes] = await Promise.all([
        fetch("/api/admin/absences"),
        fetch("/api/appointments"),
      ]);

      if (absencesRes.ok) {
        const absencesData = await absencesRes.json();
        setAbsences(absencesData.absences || []);
      }

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData.appointments || []);
      }
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
    }
    setLoading(false);
  };

  const addAbsence = async () => {
    if (!startDate || !endDate) {
      toast.error("Bitte Start- und Enddatum auswählen");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/admin/absences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          reason,
          allDay: true,
        }),
      });

      if (res.ok) {
        toast.success("Abwesenheit hinzugefügt");
        setDialogOpen(false);
        setStartDate("");
        setEndDate("");
        setReason("");
        fetchData();
      } else {
        toast.error("Fehler beim Hinzufügen");
      }
    } catch (error) {
      toast.error("Fehler beim Hinzufügen");
    }
    setAdding(false);
  };

  const deleteAbsence = async (id: number) => {
    setDeleting(id);
    try {
      const res = await fetch("/api/admin/absences", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success("Abwesenheit entfernt");
        fetchData();
      }
    } catch (error) {
      toast.error("Fehler beim Entfernen");
    }
    setDeleting(null);
  };

  // Get dates with events for calendar highlighting
  const getDatesWithEvents = () => {
    const dates: Date[] = [];
    
    appointments.forEach((appt) => {
      dates.push(new Date(appt.datetime));
    });
    
    absences.forEach((absence) => {
      const start = new Date(absence.startDate);
      const end = new Date(absence.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
    });
    
    return dates;
  };

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
      {/* Calendar View */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-[#fcefd1] text-base flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Kalender
              </CardTitle>
              <CardDescription className="text-[#fcefd1]/60 text-sm">
                Termine und Abwesenheiten
              </CardDescription>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              size="sm"
              className="bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1] w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Abwesenheit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Calendar */}
            <div className="flex-1 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="border-0 bg-transparent text-[#fcefd1] [&_.rdp-day]:text-[#fcefd1] [&_.rdp-day_button:hover]:bg-[#44362c] [&_.rdp-day_button.rdp-day_selected]:bg-[#44362c] [&_.rdp-head_cell]:text-[#fcefd1]/60"
                locale={de}
                modifiers={{
                  withEvent: getDatesWithEvents(),
                }}
                modifiersStyles={{
                  withEvent: {
                    fontWeight: "bold",
                    borderBottom: "2px solid #fcefd1",
                  },
                }}
              />
            </div>

            {/* Events List for selected date */}
            <div className="lg:w-80 space-y-3">
              <h3 className="text-[#fcefd1] font-medium text-sm">
                {selectedDate ? format(selectedDate, "EEEE, d. MMMM", { locale: de }) : "Datum auswählen"}
              </h3>
              
              {selectedDate && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {/* Appointments for this date */}
                  {appointments
                    .filter((appt) => {
                      const apptDate = new Date(appt.datetime);
                      return (
                        apptDate.getDate() === selectedDate.getDate() &&
                        apptDate.getMonth() === selectedDate.getMonth() &&
                        apptDate.getFullYear() === selectedDate.getFullYear()
                      );
                    })
                    .map((appt) => (
                      <div
                        key={appt.id}
                        className="p-3 bg-green-600/20 border border-green-500/30 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-400" />
                          <span className="text-green-400 text-sm font-medium">
                            {format(new Date(appt.datetime), "HH:mm")}
                          </span>
                        </div>
                        <p className="text-[#fcefd1] text-sm mt-1">{appt.userName}</p>
                        <p className="text-[#fcefd1]/60 text-xs">{appt.userEmail}</p>
                      </div>
                    ))}

                  {/* Absences for this date */}
                  {absences
                    .filter((absence) => {
                      const start = new Date(absence.startDate);
                      const end = new Date(absence.endDate);
                      return selectedDate >= start && selectedDate <= end;
                    })
                    .map((absence) => (
                      <div
                        key={absence.id}
                        className="p-3 bg-red-600/20 border border-red-500/30 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-400" />
                            <span className="text-red-400 text-sm font-medium">Abwesend</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAbsence(absence.id)}
                            disabled={deleting === absence.id}
                            className="h-6 w-6 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        {absence.reason && (
                          <p className="text-[#fcefd1]/60 text-xs mt-1">{absence.reason}</p>
                        )}
                      </div>
                    ))}

                  {appointments.filter((appt) => {
                    const apptDate = new Date(appt.datetime);
                    return (
                      apptDate.getDate() === selectedDate.getDate() &&
                      apptDate.getMonth() === selectedDate.getMonth() &&
                      apptDate.getFullYear() === selectedDate.getFullYear()
                    );
                  }).length === 0 &&
                    absences.filter((absence) => {
                      const start = new Date(absence.startDate);
                      const end = new Date(absence.endDate);
                      return selectedDate >= start && selectedDate <= end;
                    }).length === 0 && (
                      <p className="text-[#fcefd1]/40 text-sm text-center py-4">
                        Keine Termine an diesem Tag
                      </p>
                    )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Absences List */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#fcefd1] text-base">Abwesenheiten</CardTitle>
        </CardHeader>
        <CardContent>
          {absences.length === 0 ? (
            <p className="text-[#fcefd1]/40 text-sm text-center py-4">
              Keine Abwesenheiten eingetragen
            </p>
          ) : (
            <div className="space-y-2">
              {absences.map((absence) => (
                <div
                  key={absence.id}
                  className="flex items-center justify-between p-3 bg-red-600/10 border border-red-500/20 rounded-lg"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="destructive">Abwesend</Badge>
                      <span className="text-[#fcefd1]/80 text-sm">
                        {format(new Date(absence.startDate), "dd.MM.")} -
                        {format(new Date(absence.endDate), "dd.MM.yyyy")}
                      </span>
                    </div>
                    {absence.reason && (
                      <p className="text-[#fcefd1]/50 text-xs mt-1 truncate">{absence.reason}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAbsence(absence.id)}
                    disabled={deleting === absence.id}
                    className="text-red-400 hover:text-red-300 h-8 w-8 flex-shrink-0"
                  >
                    {deleting === absence.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Absence Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1a1410] border-[#fcefd1]/10 text-[#fcefd1] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Abwesenheit eintragen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm">Von</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Bis</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Grund (optional)</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="z.B. Urlaub"
                className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-[#fcefd1]/30 text-[#fcefd1] w-full sm:w-auto"
            >
              Abbrechen
            </Button>
            <Button
              onClick={addAbsence}
              disabled={adding || !startDate || !endDate}
              className="bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1] w-full sm:w-auto"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Eintragen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
