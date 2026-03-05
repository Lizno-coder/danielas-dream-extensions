"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "./auth-provider";
import Link from "next/link";

interface Message {
  id: number;
  senderId: number;
  content: string;
  createdAt: string;
  senderName?: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load messages when opened
  useEffect(() => {
    if (isOpen && user) {
      loadMessages();
      intervalRef.current = setInterval(loadMessages, 3000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, user]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        setNewMessage("");
        await loadMessages();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-[#44362c] hover:bg-[#5a4a3c] shadow-lg"
      >
        <MessageCircle className="h-6 w-6 text-[#fcefd1]" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[90vw] max-w-[380px] h-[500px] max-h-[70vh] glass-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#fcefd1]/10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-[#44362c] flex items-center justify-center">
            <User className="h-4 w-4 text-[#fcefd1]" />
          </div>
          <div>
            <h3 className="font-medium text-[#fcefd1]">Daniela</h3>
            <p className="text-xs text-[#fcefd1]/60">Antwortet meist innerhalb weniger Stunden</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="text-[#fcefd1]/60 hover:text-[#fcefd1] hover:bg-[#fcefd1]/10"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!user ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <MessageCircle className="h-12 w-12 text-[#fcefd1]/30" />
            <p className="text-[#fcefd1]/70">
              Melde dich an, um mit Daniela zu chatten
            </p>
            <Link href="/login">
              <Button className="bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1]">
                Anmelden
              </Button>
            </Link>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="h-12 w-12 text-[#fcefd1]/30 mb-3" />
            <p className="text-[#fcefd1]/70">
              Schreibe Daniela eine Nachricht
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                  msg.senderId === user?.id
                    ? "bg-[#44362c] text-[#fcefd1] rounded-br-md"
                    : "bg-[#2a2018] text-[#fcefd1] rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {user && (
        <form onSubmit={sendMessage} className="p-4 border-t border-[#fcefd1]/10">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nachricht schreiben..."
              className="flex-1 bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1] placeholder:text-[#fcefd1]/40"
            />
            <Button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1] px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
