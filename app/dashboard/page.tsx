"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Phone, User, Loader2, CheckCircle, XCircle, Clock3 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Appointment {
  id: number;
  datetime: string;
  type: string;
  status: string;
  address: string;
  notes: string | null;
}

interface Consultation {
  id: number;
  datetime: string;
  type: "phone" | "in_person";
  status: string;
  notes: string | null;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      // Fetch appointments
      const apptRes = await fetch("/api/appointments");
      if (apptRes.ok) {
        const apptData = await apptRes.json();
        setAppointments(apptData.appointments);
      }

      // Fetch consultations (need to filter for user's bookings)
      const consultRes = await fetch("/api/consultation?all=true");
      if (consultRes.ok) {
        const consultData = await consultRes.json();
        const myConsultations = consultData.slots.filter(
          (s: Consultation) => s.userId === user?.id
        );
        setConsultations(myConsultations);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
      case "booked":
        return <Badge className="bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1" /> Bestätigt</Badge>;
      case "pending":
      case "requested":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500"><Clock3 className="h-3 w-3 mr-1" /> Ausstehend</Badge>;
      case "declined":
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Abgelehnt</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "phone" ? <Phone className="h-4 w-4" /> : <MapPin className="h-4 w-4" />;
  };

  const getTypeLabel = (type: string) => {
    if (type === "phone") return "Telefonisch";
    if (type === "in_person") return "Vor Ort";
    return type;
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[#110c09]">
        <Navigation />
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#fcefd1]/60" />
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#110c09]">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-light text-[#fcefd1] mb-2">
            Willkommen, {user.name}
          </h1>
          <p className="text-[#fcefd1]/60">
            Hier findest du alle deine Termine und Buchungen
          </p>
        </div>

        <Tabs defaultValue="consultations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#2a2018]">
            <TabsTrigger value="consultations" className="data-[state=active]:bg-[#44362c] data-[state=active]:text-[#fcefd1]">
              Beratungstermine
            </TabsTrigger>
            <TabsTrigger value="appointments" className="data-[state=active]:bg-[#44362c] data-[state=active]:text-[#fcefd1]">
              Haarverlängerungen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consultations" className="mt-6">
            {consultations.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-[#fcefd1]/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#fcefd1] mb-2">
                    Keine Beratungstermine
                  </h3>
                  <p className="text-[#fcefd1]/60 mb-4">
                    Du hast noch keine Beratungstermine gebucht.
                  </p>
                  <Link href="/consultation">
                    <Button className="bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1]">
                      Termin buchen
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <Card key={consultation.id} className="glass-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-[#fcefd1]">
                          Beratungstermin
                        </CardTitle>
                        {getStatusBadge(consultation.status)}
                      </div>
                      <CardDescription className="text-[#fcefd1]/60">
                        {format(new Date(consultation.datetime), "EEEE, d. MMMM yyyy 'um' HH:mm", { locale: de })} Uhr
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-[#fcefd1]/80">
                        {getTypeIcon(consultation.type)}
                        <span>{getTypeLabel(consultation.type)}</span>
                      </div>
                      {consultation.notes && (
                        <p className="mt-3 text-sm text-[#fcefd1]/60">{consultation.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="appointments" className="mt-6">
            {appointments.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-[#fcefd1]/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#fcefd1] mb-2">
                    Keine Haarverlängerungstermine
                  </h3>
                  <p className="text-[#fcefd1]/60">
                    Du hast noch keine Haarverlängerungstermine. Diese werden von Daniela nach der Beratung für dich festgelegt.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <Card key={appointment.id} className="glass-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-[#fcefd1]">
                          Haarverlängerung
                        </CardTitle>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <CardDescription className="text-[#fcefd1]/60">
                        {format(new Date(appointment.datetime), "EEEE, d. MMMM yyyy 'um' HH:mm", { locale: de })} Uhr
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-[#fcefd1]/80">
                        <MapPin className="h-4 w-4" />
                        <span>{appointment.address}</span>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-[#fcefd1]/60">{appointment.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
