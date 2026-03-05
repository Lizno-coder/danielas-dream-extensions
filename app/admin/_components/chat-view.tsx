"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Calendar, ChevronLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ChatMessage {
  id: number;
  senderId: number;
  content: string;
  createdAt: string;
  senderName?: string;
}

interface Chat {
  userId: number;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface ChatViewProps {
  chat: Chat;
  onBack: () => void;
  onCreateAppointment: (user: { id: number; name: string; email: string; phone: string | null }) => void;
}

export function ChatView({ chat, onBack, onCreateAppointment }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchMessages(); }, [chat.userId]);
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/chats?userId=${chat.userId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: chat.userId, content: newMessage }),
      });
      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (e) { console.error(e); }
    setSending(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Button variant="ghost" onClick={onBack} className="mb-4 text-[#fcefd1]/60 hover:text-[#fcefd1]">
        <ChevronLeft className="h-4 w-4 mr-1" />Zurück
      </Button>
      <Card className="glass-card h-[calc(100vh-200px)]">
        <CardHeader className="border-b border-[#fcefd1]/10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#fcefd1]">{chat.userName}</CardTitle>
              <CardDescription className="text-[#fcefd1]/60">{chat.userEmail}</CardDescription>
            </div>
            <Button onClick={() => onCreateAppointment({ id: chat.userId, name: chat.userName, email: chat.userEmail, phone: null })} className="bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1]">
              <Calendar className="h-4 w-4 mr-2" />Termin erstellen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-[#fcefd1]/60" /></div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-[#fcefd1]/40">Noch keine Nachrichten</div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === 1 ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${msg.senderId === 1 ? "bg-[#44362c] text-[#fcefd1] rounded-br-md" : "bg-[#2a2018] text-[#fcefd1] rounded-bl-md"}`}>
                      <p>{msg.content}</p>
                      <p className="text-xs text-[#fcefd1]/50 mt-1">{format(new Date(msg.createdAt), "HH:mm")}</p>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            )}
          </ScrollArea>
          <div className="p-4 border-t border-[#fcefd1]/10">
            <div className="flex gap-2">
              <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())} placeholder="Nachricht schreiben..." className="flex-1 bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]" />
              <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1]">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
