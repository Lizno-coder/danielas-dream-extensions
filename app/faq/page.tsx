import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Clock, Euro, MapPin, Calendar, MessageCircle } from "lucide-react";

const faqs = [
  {
    question: "Warum sollte ich einen extra Beratungstermin vereinbaren?",
    answer: "Daniela nimmt sich extra Zeit für dich und beantwortet all deine Fragen ausführlich. In der Beratung besprechen wir deine Wünsche, die passende Methode und klären alle Details, damit du dich optimal auf deine Haarverlängerung vorbereiten kannst."
  },
  {
    question: "Wie viel kostet eine Haarverlängerung?",
    answer: "Die Haarverlängerung kostet nur 2€ pro Strähne. Das ist deutlich weniger als beim Friseur, da Daniela ihre Arbeit mit Leidenschaft macht und faire Preise bietet. Die genauen Kosten hängen von der gewünschten Anzahl an Strähnen ab - das besprechen wir in der Beratung."
  },
  {
    question: "Wie läuft ein Beratungstermin ab?",
    answer: "Der Beratungstermin findet entweder telefonisch oder vor Ort bei der Graf-zu-Toerring-Straße statt. Du kannst im Vorfeld auswählen, welche Art der Beratung du bevorzugst. Daniela nimmt sich Zeit für all deine Fragen und berät dich individuell."
  },
  {
    question: "Wie lange dauert die Haarverlängerung?",
    answer: "Die Dauer hängt von der gewünschten Anzahl an Strähnen ab. In der Beratung bekommst du eine genaue Einschätzung, wie lange deine Behandlung dauern wird."
  },
  {
    question: "Wie erfahren ist Daniela?",
    answer: "Daniela hat über ein Jahrzehnt Erfahrung in der Haarverlängerung. Seit mehr als 10 Jahren verwandelt sie mit viel Leidenschaft und handwerklichem Können die Haarträume ihrer Kundinnen in Realität."
  },
  {
    question: "Wo findet die Behandlung statt?",
    answer: "Die Behandlung findet bei der Graf-zu-Toerring-Straße statt. Eine genaue Adresse erhältst du nach der Terminbuchung. Bitte beachte, dass Termine nur nach Vereinbarung möglich sind."
  },
  {
    question: "Wie kann ich einen Termin buchen?",
    answer: "Registriere dich einfach auf der Website, melde dich an und wähle unter 'Beratung' einen passenden Termin aus. Daniela wird deine Anfrage bestätigen und sich mit dir in Verbindung setzen."
  },
  {
    question: "Kann ich während der Behandlung mit Daniela kommunizieren?",
    answer: "Ja! Über den Chat auf der Website kannst du jederzeit mit Daniela in Kontakt treten. Egal ob Fragen vor dem Termin oder nach der Behandlung - sie ist für dich da."
  }
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#110c09]">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-light text-[#fcefd1] mb-3">
            Häufig gestellte Fragen
          </h1>
          <p className="text-[#fcefd1]/60 max-w-xl mx-auto">
            Hier findest du Antworten auf die wichtigsten Fragen
          </p>
        </div>

        <Card className="glass-card">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-b border-[#fcefd1]/10 last:border-0"
                >
                  <AccordionTrigger className="text-[#fcefd1] hover:no-underline py-4 text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[#fcefd1]/60 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Euro className="h-6 w-6 text-[#fcefd1]/60 mx-auto mb-2" />
              <p className="text-sm text-[#fcefd1]/60">2€ pro Strähne</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-[#fcefd1]/60 mx-auto mb-2" />
              <p className="text-sm text-[#fcefd1]/60">10+ Jahre Erfahrung</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <MapPin className="h-6 w-6 text-[#fcefd1]/60 mx-auto mb-2" />
              <p className="text-sm text-[#fcefd1]/60">München</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-6 w-6 text-[#fcefd1]/60 mx-auto mb-2" />
              <p className="text-sm text-[#fcefd1]/60">Direkter Chat</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
