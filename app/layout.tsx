import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { ChatWidget } from "@/components/chat-widget";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Danielas Dream Extensions | Professionelle Haarverlängerung",
  description: "Premium Haarverlängerung in München. Über ein Jahrzehnt Erfahrung. Termin vereinbaren für Beratung oder Haarverlängerung.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-[#110c09]">
        <AuthProvider>
          {children}
          <ChatWidget />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
