import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ImprintPage() {
  return (
    <main className="min-h-screen bg-[#110c09]">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-light text-[#fcefd1] mb-3">
            Impressum
          </h1>
        </div>

        <Card className="glass-card">
          <CardContent className="p-6 md:p-8 space-y-8">
            <section>
              <h2 className="text-lg font-medium text-[#fcefd1] mb-3">Angaben gemäß § 5 TMG</h2>
              <p className="text-[#fcefd1]/80">
                Daniela Liessel<br />
                Danielas Dream Extensions<br />
                Graf-zu-Toerring-Straße<br />
                80639 München
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-[#fcefd1] mb-3">Kontakt</h2>
              <p className="text-[#fcefd1]/80">
                Telefon: Auf Anfrage<br />
                E-Mail: Über die Website nach Registrierung
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-[#fcefd1] mb-3">Umsatzsteuer-ID</h2>
              <p className="text-[#fcefd1]/80">
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                Auf Anfrage
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-[#fcefd1] mb-3">Berufshaftpflichtversicherung</h2>
              <p className="text-[#fcefd1]/80">
                Name und Sitz des Versicherers:<br />
                Auf Anfrage
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-[#fcefd1] mb-3">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
              <p className="text-[#fcefd1]/80">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-[#fcefd1] mb-3">Haftung für Inhalte</h2>
              <p className="text-[#fcefd1]/80">
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. 
                Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu 
                überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-[#fcefd1] mb-3">Haftung für Links</h2>
              <p className="text-[#fcefd1]/80">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese 
                fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der 
                Seiten verantwortlich.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-[#fcefd1] mb-3">Urheberrecht</h2>
              <p className="text-[#fcefd1]/80">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, 
                Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des 
                jeweiligen Autors bzw. Erstellers.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
