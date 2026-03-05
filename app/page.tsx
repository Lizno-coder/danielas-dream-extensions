import { Navigation } from "@/components/navigation";
import { HeroCarousel } from "@/components/hero-carousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Scissors, Calendar, MessageCircle, Award, Clock, MapPin, Sparkles, Heart } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative">
        <HeroCarousel />
        <div className="absolute inset-0 bg-gradient-to-t from-[#110c09] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light text-[#fcefd1] mb-4">
              Dein Traumhaar wartet
            </h1>
            <p className="text-base md:text-lg text-[#fcefd1]/80 mb-6 max-w-2xl mx-auto">
              Professionelle Haarverlängerung mit über einem Jahrzehnt Erfahrung. 
              Daniela Liessel verwandelt deinen Haartraum in Realität.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/consultation">
                <Button size="lg" className="bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1] w-full sm:w-auto">
                  <Calendar className="h-5 w-5 mr-2" />
                  Beratungstermin
                </Button>
              </Link>
              <Link href="/gallery">
                <Button size="lg" variant="outline" className="border-[#fcefd1]/30 text-[#fcefd1] hover:bg-[#fcefd1]/10 w-full sm:w-auto">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Ergebnisse ansehen
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-light text-[#fcefd1] mb-3">
              Warum Danielas Dream Extensions?
            </h2>
            <p className="text-[#fcefd1]/60 max-w-xl mx-auto">
              Über 10 Jahre Erfahrung in der Haarverlängerung mit Leidenschaft und Präzision
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-[#44362c] flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-[#fcefd1]" />
                </div>
                <h3 className="text-lg font-medium text-[#fcefd1] mb-2">
                  Über 10 Jahre Erfahrung
                </h3>
                <p className="text-sm text-[#fcefd1]/60">
                  Daniela ist seit über einem Jahrzehnt im Bereich Haarverlängerung tätig
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-[#44362c] flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-[#fcefd1]" />
                </div>
                <h3 className="text-lg font-medium text-[#fcefd1] mb-2">
                  Mit Leidenschaft
                </h3>
                <p className="text-sm text-[#fcefd1]/60">
                  Weniger Kosten als beim Friseur, dafür mit Herzblut gemacht
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-[#44362c] flex items-center justify-center mx-auto mb-4">
                  <Scissors className="h-6 w-6 text-[#fcefd1]" />
                </div>
                <h3 className="text-lg font-medium text-[#fcefd1] mb-2">
                  Premium Qualität
                </h3>
                <p className="text-sm text-[#fcefd1]/60">
                  Nur 2€ pro Strähne - faire Preise für erstklassige Arbeit
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Location & Process */}
      <section className="py-16 md:py-24 px-4 bg-[#1a1410]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-light text-[#fcefd1] mb-6">
                So funktioniert&apos;s
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-[#44362c] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-[#fcefd1]">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-[#fcefd1] mb-1">Beratungstermin vereinbaren</h3>
                    <p className="text-sm text-[#fcefd1]/60">
                      Daniela nimmt sich Zeit für all deine Fragen - telefonisch oder vor Ort
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-[#44362c] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-[#fcefd1]">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-[#fcefd1] mb-1">Persönliche Beratung</h3>
                    <p className="text-sm text-[#fcefd1]/60">
                      Gemeinsam finden wir die perfekte Lösung für deinen Haartraum
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-[#44362c] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-[#fcefd1]">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-[#fcefd1] mb-1">Termin für die Verlängerung</h3>
                    <p className="text-sm text-[#fcefd1]/60">
                      Anschließend wird ein Termin für die Haarverlängerung festgelegt
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="glass-card">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-[#44362c] flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-[#fcefd1]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-[#fcefd1] mb-1">Standort</h3>
                    <p className="text-[#fcefd1]/80">Graf-zu-Toerring-Straße</p>
                    <p className="text-sm text-[#fcefd1]/60">Termin nur nach Vereinbarung</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#44362c] flex items-center justify-center">
                    <Clock className="h-6 w-6 text-[#fcefd1]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-[#fcefd1] mb-1">Kosten</h3>
                    <p className="text-[#fcefd1]/80">2€ pro Strähne</p>
                    <p className="text-sm text-[#fcefd1]/60">Weniger als beim Friseur</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-light text-[#fcefd1] mb-4">
            Bereit für deinen Haartraum?
          </h2>
          <p className="text-[#fcefd1]/60 mb-8 max-w-xl mx-auto">
            Vereinbare jetzt einen Beratungstermin und lass dich von Daniela beraten.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/consultation">
              <Button size="lg" className="bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1] w-full sm:w-auto">
                <Calendar className="h-5 w-5 mr-2" />
                Jetzt Termin vereinbaren
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-[#fcefd1]/30 text-[#fcefd1] hover:bg-[#fcefd1]/10 w-full sm:w-auto">
                <MessageCircle className="h-5 w-5 mr-2" />
                Account erstellen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#fcefd1]/10 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-light text-[#fcefd1]">Danielas Dream Extensions</h3>
              <p className="text-sm text-[#fcefd1]/60">Professionelle Haarverlängerung</p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/imprint" className="text-[#fcefd1]/60 hover:text-[#fcefd1]">
                Impressum
              </Link>
              <Link href="/privacy" className="text-[#fcefd1]/60 hover:text-[#fcefd1]">
                Datenschutz
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-[#fcefd1]/10 text-center text-sm text-[#fcefd1]/40">
            © {new Date().getFullYear()} Danielas Dream Extensions. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </main>
  );
}
