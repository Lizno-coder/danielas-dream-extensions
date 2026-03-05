"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Calendar, Users, Clock, Loader2 } from "lucide-react";
import { ChatView } from "./_components/chat-view";
import { ConsultationsTab } from "./_components/consultations-tab";
import { AppointmentsTab } from "./_components/appointments-tab";
import { GalleryTab } from "./_components/gallery-tab";

const ADMIN_PASSWORD = "DLGZTS10WKBG";

interface Chat {
  userId: number;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface ConsultationSlot {
  id: number;
  datetime: string;
  type: "phone" | "in_person";
  status: string;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  userPhone: string | null;
  notes: string | null;
}

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

interface GalleryImage {
  id: number;
  url: string;
  caption: string | null;
  carousel: boolean;
  order: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

interface Stats {
  unreadMessages: number;
  pendingConsultations: number;
  upcomingAppointments: number;
  totalUsers: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [slots, setSlots] = useState<ConsultationSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [apptDialogUser, setApptDialogUser] = useState<User | null>(null);

  useEffect(() => {
    if (authenticated) {
      fetchAllData();
      const interval = setInterval(fetchAllData, 5000);
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  const fetchAllData = async () => {
    await Promise.all([fetchStats(), fetchChats(), fetchSlots(), fetchAppointments(), fetchImages()]);
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) { const data = await res.json(); setStats(data.stats); }
    } catch (e) { console.error(e); }
  };

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/admin/chats");
      if (res.ok) { const data = await res.json(); setChats(data.chats || []); }
    } catch (e) { console.error(e); }
  };

  const fetchSlots = async () => {
    try {
      const res = await fetch("/api/consultation?all=true");
      if (res.ok) { const data = await res.json(); setSlots(data.slots || []); }
    } catch (e) { console.error(e); }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointments");
      if (res.ok) { const data = await res.json(); setAppointments(data.appointments || []); }
    } catch (e) { console.error(e); }
  };

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/gallery");
      if (res.ok) { const data = await res.json(); setImages(data.images || []); }
    } catch (e) { console.error(e); }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setAuthenticated(true);
    else alert("Falsches Passwort");
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#110c09]">
        <Navigation />
        <div className="flex items-center justify-center px-4 py-24">
          <Card className="w-full max-w-md glass-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-[#fcefd1]">Admin Zugang</CardTitle>
              <CardDescription className="text-[#fcefd1]/60">Gib das Admin-Passwort ein</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input type="password" placeholder="Passwort" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]" />
                <Button type="submit" className="w-full bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1]">Zugang</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (selectedChat) {
    return (
      <main className="min-h-screen bg-[#110c09]">
        <Navigation />
        <ChatView 
          chat={selectedChat} 
          onBack={() => { setSelectedChat(null); fetchChats(); fetchStats(); }} 
          onCreateAppointment={setApptDialogUser}
        />
        {apptDialogUser && (
          <div className="hidden">
            <AppointmentsTab 
              appointments={appointments} 
              selectedUser={apptDialogUser} 
              onCloseDialog={() => setApptDialogUser(null)} 
              onRefresh={() => { fetchAppointments(); fetchStats(); }} 
            />
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#110c09]">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-light text-[#fcefd1] mb-6">Admin Dashboard</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#2a2018] mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#44362c] data-[state=active]:text-[#fcefd1]">Übersicht</TabsTrigger>
            <TabsTrigger value="chats" className="data-[state=active]:bg-[#44362c] data-[state=active]:text-[#fcefd1]">
              Chats {stats && stats.unreadMessages > 0 && <Badge className="ml-1 bg-red-500 text-white">{stats.unreadMessages}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="consultations" className="data-[state=active]:bg-[#44362c] data-[state=active]:text-[#fcefd1]">
              Beratungen {stats && stats.pendingConsultations > 0 && <Badge className="ml-1 bg-yellow-500 text-black">{stats.pendingConsultations}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="appointments" className="data-[state=active]:bg-[#44362c] data-[state=active]:text-[#fcefd1]">Termine</TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-[#44362c] data-[state=active]:text-[#fcefd1]">Galerie</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass-card cursor-pointer hover:bg-[#1a1410]" onClick={() => setActiveTab("chats")}>
                <CardContent className="p-4 text-center">
                  <MessageCircle className="h-8 w-8 text-[#fcefd1]/60 mx-auto mb-2" />
                  <p className="text-3xl font-light text-[#fcefd1]">{stats?.unreadMessages || 0}</p>
                  <p className="text-sm text-[#fcefd1]/60">Ungelesene Nachrichten</p>
                </CardContent>
              </Card>
              <Card className="glass-card cursor-pointer hover:bg-[#1a1410]" onClick={() => setActiveTab("consultations")}>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-[#fcefd1]/60 mx-auto mb-2" />
                  <p className="text-3xl font-light text-[#fcefd1]">{stats?.pendingConsultations || 0}</p>
                  <p className="text-sm text-[#fcefd1]/60">Ausstehende Beratungen</p>
                </CardContent>
              </Card>
              <Card className="glass-card cursor-pointer hover:bg-[#1a1410]" onClick={() => setActiveTab("appointments")}>
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 text-[#fcefd1]/60 mx-auto mb-2" />
                  <p className="text-3xl font-light text-[#fcefd1]">{stats?.upcomingAppointments || 0}</p>
                  <p className="text-sm text-[#fcefd1]/60">Kommende Termine</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-[#fcefd1]/60 mx-auto mb-2" />
                  <p className="text-3xl font-light text-[#fcefd1]">{stats?.totalUsers || 0}</p>
                  <p className="text-sm text-[#fcefd1]/60">Registrierte Nutzer</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="chats">
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-[#fcefd1]/60" /></div>
              ) : chats.length === 0 ? (
                <Card className="glass-card"><CardContent className="p-8 text-center text-[#fcefd1]/60"><MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Noch keine Chats vorhanden</p></CardContent></Card>
              ) : (
                chats.map((chat) => (
                  <Card key={chat.userId} className="glass-card cursor-pointer hover:bg-[#1a1410] transition-colors" onClick={() => setSelectedChat(chat)}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-[#fcefd1]">{chat.userName}</h3>
                          {chat.unreadCount > 0 && <Badge className="bg-red-500 text-white">{chat.unreadCount} neu</Badge>}
                        </div>
                        <p className="text-sm text-[#fcefd1]/60 truncate">{chat.lastMessage}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="consultations">
            <ConsultationsTab slots={slots} onRefresh={() => { fetchSlots(); fetchStats(); }} />
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentsTab appointments={appointments} selectedUser={apptDialogUser} onCloseDialog={() => setApptDialogUser(null)} onRefresh={() => { fetchAppointments(); fetchStats(); }} />
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryTab images={images} onRefresh={() => fetchImages()} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
