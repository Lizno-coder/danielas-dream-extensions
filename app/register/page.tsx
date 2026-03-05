"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from "lucide-react";
import { Navigation } from "@/components/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen haben");
      setLoading(false);
      return;
    }

    const success = await register(name, email, password, phone);
    if (success) {
      router.push("/dashboard");
    } else {
      setError("Registrierung fehlgeschlagen. Email möglicherweise bereits vergeben.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#110c09]">
      <Navigation />
      
      <div className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-[#fcefd1]">Account erstellen</CardTitle>
            <CardDescription className="text-[#fcefd1]/60">
              Registriere dich, um Termine zu buchen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#fcefd1]">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-[#fcefd1]/40" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Max Mustermann"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1] placeholder:text-[#fcefd1]/40"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#fcefd1]">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#fcefd1]/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="deine@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1] placeholder:text-[#fcefd1]/40"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[#fcefd1]">Telefon (optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-[#fcefd1]/40" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+49 123 456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1] placeholder:text-[#fcefd1]/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#fcefd1]">Passwort</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#fcefd1]/40" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1] placeholder:text-[#fcefd1]/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#fcefd1]/40 hover:text-[#fcefd1]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#fcefd1]">Passwort bestätigen</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#fcefd1]/40" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1] placeholder:text-[#fcefd1]/40"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrieren...
                  </>
                ) : (
                  "Registrieren"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#fcefd1]/60">
                Bereits registriert?{" "}
                <Link href="/login" className="text-[#fcefd1] hover:underline">
                  Hier anmelden
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
