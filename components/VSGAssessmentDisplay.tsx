
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function VSGAssessmentDisplay({ vsgData }) {
  const categories = {
    A: {
      title: "A: Sozialverhalten/Konfliktverhalten",
      items: [
        "spielt mit anderen Kindern",
        "kommt im allgemeinen mit Kindern gut aus",
        "kann Kritik annehmen",
        "kann gesetzte Regeln einhalten",
        "ist bemüht Konflikte verbal zu lösen"
      ]
    },
    B: {
      title: "B: Selbstständigkeit",
      items: [
        "kann die Toilette ohne Hilfe benutzen",
        "kann Mantel und Jacke anziehen und schließen",
        "kann die Schuhe zubinden",
        "kann seinen Namen und seine Adresse angeben"
      ]
    },
    C: {
      title: "C: Arbeitsverhalten/Merkfähigkeit",
      items: [
        "kann kleine Arbeitsaufträge durchführen",
        "beteiligt sich aktiv an Gruppenaktivitäten",
        "fragt nach, wenn es etwas nicht verstanden hat",
        "kann sich mit einer Sache ausdauernd beschäftigen",
        "kann Arbeitsaufträge zusammen mit anderen Kindern ausführen",
        "kommt gern in den Kindergarten"
      ]
    },
    D: {
      title: "D: Zahlenverständnis/Mengenverständnis",
      items: [
        "zählt sicher bis 10",
        "Simultanerfassung des Würfels und Mengenerfassung bis 6",
        "kann sich Reihenfolgen sicher merken"
      ]
    },
    E: {
      title: "E: Sprache",
      items: [
        "spricht in ganzen Sätzen",
        "erzählt zusammenhängend und verständlich",
        "spricht deutlich und artikuliert",
        "beherrscht die deutsche Sprache",
        "spricht grammatikalisch korrekt"
      ]
    },
    F: {
      title: "F: Farben und Formen",
      items: [
        "erkennt und benennt die wichtigsten Farben",
        "erkennt und benennt Kreis, Viereck und Dreieck",
        "kann einzelne Formen herausfinden und kennzeichnen"
      ]
    },
    G: {
      title: "G: Grobmotorik",
      items: [
        "kann das Gleichgewicht halten",
        "Bewegungen sind flüssig / Laterialität",
        "Bewegungsabläufe sind altersgerecht entwickelt"
      ]
    },
    H: {
      title: "H: Feinmotorik/Graphomotorik",
      items: [
        "beherrscht Dreipunktgriff",
        "kann die Mittellinie kreuzen",
        "arbeitet aus dem Handgelenk",
        "kann auf der Linie schneiden"
      ]
    }
  };

  const likertLabels = {
    sicher: "sicher",
    ueberwiegend: "überwiegend",
    teilweise: "teilweise",
    noch_nicht: "noch nicht",
    sonstiges: "sonstiges"
  };

  if (!vsgData) return null;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Basic Information */}
      <Card className="border-slate-200 print:shadow-none">
        <CardHeader className="bg-slate-50 print:bg-white">
          <CardTitle className="text-lg">Persönliche Informationen</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {vsgData.vsg_geburtsdatum && (
              <div>
                <span className="font-medium">Geburtsdatum:</span> {new Date(vsgData.vsg_geburtsdatum).toLocaleDateString('de-DE')}
              </div>
            )}
            {vsgData.vsg_geschlecht && (
              <div>
                <span className="font-medium">Geschlecht:</span> {vsgData.vsg_geschlecht}
              </div>
            )}
            {vsgData.vsg_therapien && (
              <div className="col-span-2">
                <span className="font-medium">Therapien:</span> {vsgData.vsg_therapien}
              </div>
            )}
            {vsgData.vsg_therapien_seit && (
              <div>
                <span className="font-medium">Seit:</span> {vsgData.vsg_therapien_seit}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assessment Matrix */}
      {Object.entries(categories).map(([categoryKey, category]) => {
        const hasAssessments = vsgData.vsg_assessments?.[categoryKey];
        if (!hasAssessments) return null;

        return (
          <Card key={categoryKey} className="border-slate-200 print:shadow-none print:break-inside-avoid">
            <CardHeader className="bg-blue-50 print:bg-white">
              <CardTitle className="text-base">{category.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 print:pt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Kompetenz</TableHead>
                    <TableHead>Bewertung</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {category.items.map((item, itemIndex) => {
                    const assessment = vsgData.vsg_assessments?.[categoryKey]?.[itemIndex];
                    if (!assessment?.value) return null;

                    return (
                      <TableRow key={itemIndex}>
                        <TableCell className="font-medium">{item}</TableCell>
                        <TableCell>
                          {likertLabels[assessment.value] || assessment.value}
                          {assessment.value === "sonstiges" && assessment.sonstigesText && (
                            <span className="text-slate-600 ml-2">({assessment.sonstigesText})</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}

      {/* Additional Remarks */}
      {vsgData.vsg_bemerkungen && (
        <Card className="border-slate-200 print:shadow-none print:break-inside-avoid">
          <CardHeader className="bg-slate-50 print:bg-white">
            <CardTitle className="text-base">Sonstige Bemerkungen</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 print:pt-2">
            <p className="text-sm whitespace-pre-wrap">{vsgData.vsg_bemerkungen}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
