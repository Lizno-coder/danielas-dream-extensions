"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, Save, User, Calendar, MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { UserAvailabilityCalendar } from "@/components/user-availability-calendar";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  birthday: string | null;
  address: string | null;
  gender: "female" | "male" | "other" | "prefer_not_to_say" | null;
  profileImageUrl: string | null;
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState<string>("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) fetchProfile();
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setName(data.user.name || "");
        setPhone(data.user.phone || "");
        setBirthday(data.user.birthday || "");
        setAddress(data.user.address || "");
        setGender(data.user.gender || "");
        setProfileImageUrl(data.user.profileImageUrl);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          birthday,
          address,
          gender,
        }),
      });

      if (res.ok) {
        toast.success("Profil aktualisiert");
        fetchProfile();
      } else {
        toast.error("Fehler beim Speichern");
      }
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // Get presigned URL
      const presignRes = await fetch("/api/r2/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: "profiles",
        }),
      });

      if (!presignRes.ok) throw new Error("Failed to get upload URL");
      const { presignedUrl, publicUrl, key } = await presignRes.json();

      // Upload to R2
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      // Update profile with new image URL
      const updateRes = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImageUrl: publicUrl }),
      });

      if (updateRes.ok) {
        setProfileImageUrl(publicUrl);
        toast.success("Profilbild aktualisiert");
      }
    } catch (error) {
      toast.error("Upload fehlgeschlagen");
    }
    setUploadingImage(false);
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

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#110c09]">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-light text-[#fcefd1] mb-6">Einstellungen</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-[#2a2018] mb-6">
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#44362c] data-[state=active]:text-[#fcefd1]">Profil</TabsTrigger>
            <TabsTrigger value="availability" className="data-[state=active]:bg-[#44362c] data-[state=active]:text-[#fcefd1]">Verfügbarkeit</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-[#fcefd1]">Profil bearbeiten</CardTitle>
                <CardDescription className="text-[#fcefd1]/60">
                  Aktualisiere deine persönlichen Daten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Image */}
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24 border-2 border-[#fcefd1]/20">
                    <AvatarImage src={profileImageUrl || undefined} />
                    <AvatarFallback className="bg-[#44362c] text-[#fcefd1] text-2xl">
                      {name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="border-[#fcefd1]/30 text-[#fcefd1] hover:bg-[#fcefd1]/10"
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Profilbild ändern
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#fcefd1]"><User className="h-4 w-4 inline mr-2" />Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#fcefd1]"><Mail className="h-4 w-4 inline mr-2" />Email</Label>
                    <Input
                      value={profile?.email || ""}
                      disabled
                      className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]/60"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#fcefd1]"><Phone className="h-4 w-4 inline mr-2" />Telefon</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+49 123 456789"
                      className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#fcefd1]"><Calendar className="h-4 w-4 inline mr-2" />Geburtstag</Label>
                    <Input
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[#fcefd1]"><MapPin className="h-4 w-4 inline mr-2" />Adresse</Label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Musterstraße 123, 12345 München"
                      className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[#fcefd1]">Geschlecht</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="bg-[#2a2018] border-[#fcefd1]/20 text-[#fcefd1]">
                        <SelectValue placeholder="Bitte wählen" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a2018] border-[#fcefd1]/20">
                        <SelectItem value="female">Weiblich</SelectItem>
                        <SelectItem value="male">Männlich</SelectItem>
                        <SelectItem value="other">Divers</SelectItem>
                        <SelectItem value="prefer_not_to_say">Keine Angabe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1]"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Speichern
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability">
            <UserAvailabilityCalendar />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}


