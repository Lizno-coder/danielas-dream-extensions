"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Phone, MapPin, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";

interface ConsultationSlot {
  id: number;
  datetime: string;
  type: "phone" | "in_person";
  status: string;
  notes: string | null;
}

export default function ConsultationPage() {
  const [slots, setSlots] = useState<ConsultationSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await fetch("/api/consultation");
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots);
      }
    } catch (error) {
      console.error("Failed to fetch slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const bookSlot = async (slotId: number) => {
    if (!user) return;
    
    setBookingId(slotId);
    try {
      const res = await fetch(`/api/consultation/${slotId}/book`, {
        method: "POST",
      });

      if (res.ok) {
        await fetchSlots();
      }
    } catch (error) {
      console.error("Failed to book slot:", error);
    } finally {
      setBookingId(null);
    }
  };

  const getTypeLabel = (type: string) => {
    return type === "phone" ? "Telefonisch" : "Vor Ort";
  };

  const getTypeIcon = (type: string) => {
    return type === "phone" ? <Phone className="h-4 w-4" /> : <MapPin className="h-4 w-4" />;
  };

  return (
    <main className="min-h-screen bg-[#110c09]">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-light text-[#fcefd1] mb-3">
            Beratungstermin vereinbaren
          </h1>
          <p className="text-[#fcefd1]/60 max-w-xl mx-auto">
            Daniela nimmt sich extra Zeit für all deine Fragen. Wähle einen passenden Termin.
          </p>
        </div>

        {!user ? (
          <Card className="glass-card max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 text-[#fcefd1]/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#fcefd1] mb-2">
                Anmeldung erforderlich
              </h3>
              <p className="text-[#fcefd1]/60 mb-4">
                Melde dich an, um einen Beratungstermin zu buchen.
              </p>
              <Link href="/login">
                <Button className="bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1]">
                  Zum Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#fcefd1]/60" />
          </div>
        ) : slots.filter(s => s.status === "available").length === 0 ? (
          <Card className="glass-card max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 text-[#fcefd1]/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#fcefd1] mb-2">
                Keine Termine verfügbar
              </h3>
              <p className="text-[#fcefd1]/60">
                Aktuell sind keine Beratungstermine verfügbar. Bitte versuche es später erneut oder kontaktiere uns über den Chat.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots
              .filter((slot) => slot.status === "available")
              .map((slot) => (
                <Card key={slot.id} className="glass-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-[#fcefd1]">
                        {format(new Date(slot.datetime), "EEEE, d. MMMM", { locale: de })}
                      </CardTitle>
                      <Badge variant="outline" className="border-[#fcefd1]/30 text-[#fcefd1]">
                        {getTypeIcon(slot.type)}
                        <span className="ml-1">{getTypeLabel(slot.type)}</span>
                      </Badge>
                    </div>
                    <CardDescription className="text-[#fcefd1]/60">
                      {format(new Date(slot.datetime), "HH:mm", { locale: de })} Uhr
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {slot.notes && (
                      <p className="text-sm text-[#fcefd1]/60 mb-3">{slot.notes}</p>
                    )}
                    <Button
                      onClick={() => bookSlot(slot.id)}
                      disabled={bookingId === slot.id}
                      className="w-full bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1]"
                    >
                      {bookingId === slot.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Wird gebucht...
                        </>
                      ) : (
                        "Termin anfragen"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg text-[#fcefd1]">Warum ein Beratungstermin?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#fcefd1]/60">
                Daniela nimmt sich extra Zeit für dich und beantwortet all deine Fragen zur Haarverlängerung. 
                Gemeinsam findet ihr die perfekte Lösung für deinen Haartraum.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg text-[#fcefd1]">Wie läuft es ab?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[#44362c] flex items-center justify-center flex-shrink-0 text-sm text-[#fcefd1]">1</div>
                <p className="text-[#fcefd1]/60">Wähle einen passenden Termin aus</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[#44362c] flex items-center justify-center flex-shrink-0 text-sm text-[#fcefd1]">2</div>
                <p className="text-[#fcefd1]/60">Daniela bestätigt deine Anfrage</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[#44362c] flex items-center justify-center flex-shrink-0 text-sm text-[#fcefd1]">3</div>
                <p className="text-[#fcefd1]/60">Gemeinsam besprechen wir deine Wünsche</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
