import { forwardRef, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Download, ZoomIn, ZoomOut, FileText } from 'lucide-react';

const A4DocumentPreview = forwardRef(({ patient, documentation, type }, ref) => {
  const [zoom, setZoom] = useState(100);
  const [html2pdfReady, setHtml2pdfReady] = useState(false);

  // Lade html2pdf.js am Anfang
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => setHtml2pdfReady(true);
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Hilfsfunktion für Datumsformatierung
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('de-DE');
    try {
      return format(new Date(dateString), 'PPP', { locale: de });
    } catch (e) {
      return dateString;
    }
  };

  // Hilfsfunktion für Namen
  const getPatientName = () => {
    if (!patient) return "Unbekannt";
    const first = patient.first_name || patient.firstName || "";
    const last = patient.last_name || patient.lastName || "";
    return `${first} ${last}`.trim();
  };

  const getPatientDOB = () => {
    if (!patient) return "-";
    const dob = patient.date_of_birth || patient.dateOfBirth;
    return dob ? formatDate(dob) : "-";
  };

  // PDF Download Funktion
  const handleDownloadPDF = async () => {
    const element = ref.current;
    if (!element || !html2pdfReady) {
      alert('PDF-Download wird vorbereitet. Bitte versuchen Sie es in einer Sekunde erneut.');
      return;
    }

    try {
      const html2pdf = window.html2pdf?.default || window.html2pdf;
      if (!html2pdf) {
        alert('PDF-Library nicht verfügbar');
        return;
      }

      const opt = {
        margin: 10,
        filename: `${getPatientName()}_${type}_${format(new Date(), 'dd-MM-yyyy')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF Download Error:', error);
      alert('PDF Download fehlgeschlagen: ' + error.message);
    }
  };

  // Zoom Funktionen
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const resetZoom = () => {
    setZoom(100);
  };

  // --- RENDER LOGIK: EINGEWÖHNUNGSGESPRÄCH ---
  const renderEingewoehnungContent = () => (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-slate-800">Protokoll zum Eingewöhnungsgespräch</h2>
        <p className="text-sm text-slate-500 mt-1">
          Datum: {formatDate(new Date())}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Gespräch geführt von</h3>
          <p className="text-slate-900">{documentation?.gefuehrt_von || "-"}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Gespräch geführt mit</h3>
          <p className="text-slate-900">{documentation?.gefuehrt_mit || "-"}</p>
        </div>
      </div>

      {documentation?.themen && (
        <div className="mt-6">
          <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-blue-500 pl-3">Besprochene Themen</h3>
          <div className="bg-slate-50 p-4 rounded-lg text-slate-800 whitespace-pre-wrap text-sm leading-relaxed">
            {documentation.themen}
          </div>
        </div>
      )}

      {documentation?.absprachen && (
        <div className="mt-6">
          <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-green-500 pl-3">Absprachen & Vereinbarungen</h3>
          <div className="bg-slate-50 p-4 rounded-lg text-slate-800 whitespace-pre-wrap text-sm leading-relaxed">
            {documentation.absprachen}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-200">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Nachbesprechung</h3>
          <p className="text-slate-900">{documentation?.nachbesprechung || "-"}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Folgetermin</h3>
          <p className="text-slate-900">{documentation?.folgetermin ? formatDate(documentation.folgetermin) : "-"}</p>
        </div>
      </div>
    </div>
  );

  // --- RENDER LOGIK: LEG GESPRÄCH ---
  const renderLEGContent = () => (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-slate-800">LEG-Gesprächsprotokoll</h2>
        <p className="text-sm text-slate-500 mt-1">
          Datum: {formatDate(new Date())}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Gesprächspartner</h3>
        <p className="text-slate-900 font-medium">{documentation?.gespraechspartner || "-"}</p>
      </div>

      {documentation?.anlass && (
        <div className="mt-4">
          <h3 className="font-bold text-slate-800 mb-2">Anlass des Gesprächs</h3>
          <p className="text-slate-700 text-sm">{documentation.anlass}</p>
        </div>
      )}

      {documentation?.besprochene_themen && (
        <div className="mt-6">
          <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-blue-500 pl-3">Themen</h3>
          <div className="bg-slate-50 p-4 rounded-lg text-slate-800 whitespace-pre-wrap text-sm leading-relaxed">
            {documentation.besprochene_themen}
          </div>
        </div>
      )}

      {documentation?.vereinbarungen && (
        <div className="mt-6">
          <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-green-500 pl-3">Vereinbarungen</h3>
          <div className="bg-slate-50 p-4 rounded-lg text-slate-800 whitespace-pre-wrap text-sm leading-relaxed">
            {documentation.vereinbarungen}
          </div>
        </div>
      )}

      {documentation?.naechste_schritte && (
        <div className="mt-6">
          <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-orange-500 pl-3">Nächste Schritte</h3>
          <div className="bg-orange-50 p-4 rounded-lg text-slate-800 whitespace-pre-wrap text-sm leading-relaxed">
            {documentation.naechste_schritte}
          </div>
        </div>
      )}
    </div>
  );

  // --- RENDER LOGIK: VSG BEOBACHTUNGSBOGEN ---
  const renderVSGContent = () => {
    const categories = {
      A: { title: "A: Sozialverhalten/Konfliktverhalten", items: ["spielt mit anderen Kindern", "kommt im allgemeinen mit Kindern gut aus", "kann Kritik annehmen", "kann gesetzte Regeln einhalten", "ist bemüht Konflikte verbal zu lösen"] },
      B: { title: "B: Selbstständigkeit", items: ["kann die Toilette ohne Hilfe benutzen", "kann Mantel und Jacke anziehen und schließen", "kann die Schuhe zubinden", "kann seinen Namen und seine Adresse angeben"] },
      C: { title: "C: Arbeitsverhalten/Merkfähigkeit", items: ["kann kleine Arbeitsaufträge durchführen", "beteiligt sich aktiv an Gruppenaktivitäten", "fragt nach, wenn es etwas nicht verstanden hat", "kann sich mit einer Sache ausdauernd beschäftigen", "kann Arbeitsaufträge zusammen mit anderen Kindern ausführen", "kommt gern in den Kindergarten"] },
      D: { title: "D: Zahlenverständnis/Mengenverständnis", items: ["zählt sicher bis 10", "Simultanerfassung des Würfels und Mengenerfassung bis 6", "kann sich Reihenfolgen sicher merken"] },
      E: { title: "E: Sprache", items: ["spricht in ganzen Sätzen", "erzählt zusammenhängend und verständlich", "spricht deutlich und artikuliert", "beherrscht die deutsche Sprache", "spricht grammatikalisch korrekt"] },
      F: { title: "F: Farben und Formen", items: ["erkennt und benennt die wichtigsten Farben", "erkennt und benennt Kreis, Viereck und Dreieck", "kann einzelne Formen herausfinden und kennzeichnen"] },
      G: { title: "G: Grobmotorik", items: ["kann das Gleichgewicht halten", "Bewegungen sind flüssig / Laterialität", "Bewegungsabläufe sind altersgerecht entwickelt"] },
      H: { title: "H: Feinmotorik/Graphomotorik", items: ["beherrscht Dreipunktgriff", "kann die Mittellinie kreuzen", "arbeitet aus dem Handgelenk", "kann auf der Linie schneiden"] }
    };

    const likertLabels = { sicher: "sicher", ueberwiegend: "überwiegend", teilweise: "teilweise", noch_nicht: "noch nicht", sonstiges: "sonstiges" };

    return (
      <>
        <div className="mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-slate-800">VSG Beobachtungsbogen</h2>
          <p className="text-sm text-slate-600">Übergang zur Schule</p>
        </div>

        <div className="bg-slate-50 p-4 rounded mb-6 border border-slate-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
             <div><span className="font-semibold">Geburtsdatum:</span> {documentation?.vsg_geburtsdatum ? formatDate(documentation.vsg_geburtsdatum) : "-"}</div>
             <div><span className="font-semibold">Geschlecht:</span> {documentation?.vsg_geschlecht || "-"}</div>
             <div><span className="font-semibold">Therapien:</span> {documentation?.vsg_therapien || "-"}</div>
             <div><span className="font-semibold">Seit:</span> {documentation?.vsg_therapien_seit || "-"}</div>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(categories).map(([key, category]) => {
            return (
              <div key={key} className="break-inside-avoid border border-slate-300 rounded overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 border-b border-slate-300 font-bold text-sm">
                  {category.title}
                </div>
                <table className="w-full text-xs sm:text-sm">
                  <tbody>
                    {category.items.map((item, index) => {
                      const val = documentation?.vsg_assessments?.[key]?.[index]?.value;
                      const text = documentation?.vsg_assessments?.[key]?.[index]?.sonstigesText;
                      
                      if (!val) return null;

                      return (
                        <tr key={index} className="border-b border-slate-100 last:border-0">
                          <td className="p-2 w-2/3 align-top">{item}</td>
                          <td className="p-2 w-1/3 align-top font-medium text-slate-700 bg-slate-50/50">
                            {likertLabels[val] || val}
                            {val === 'sonstiges' && text && <div className="text-xs text-slate-500 italic mt-1">"{text}"</div>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        {documentation?.vsg_bemerkungen && (
          <div className="mt-6 break-inside-avoid">
            <h3 className="font-bold text-slate-800 mb-2">Sonstige Bemerkungen</h3>
            <div className="border border-slate-300 rounded p-4 text-sm min-h-[100px] whitespace-pre-wrap">
              {documentation.vsg_bemerkungen}
            </div>
          </div>
        )}
      </>
    );
  };

  // --- HAUPT RENDER ---
  return (
    <div className="w-full bg-gray-100 py-8 print:p-0 print:bg-white min-h-screen flex flex-col">
      {/* Toolbar mit Zoom und Download */}
      <div className="flex justify-center mb-6 gap-2 flex-wrap px-4 sticky top-0 bg-gray-100 py-4 z-10">
        <button
          onClick={handleZoomOut}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          disabled={zoom <= 50}
        >
          <ZoomOut className="w-4 h-4" />
          Verkleinern
        </button>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-300">
          <span className="text-sm font-medium text-slate-700 min-w-[50px]">{zoom}%</span>
          <button
            onClick={resetZoom}
            className="text-xs text-slate-600 hover:text-slate-900 underline"
          >
            Zurücksetzen
          </button>
        </div>

        <button
          onClick={handleZoomIn}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          disabled={zoom >= 200}
        >
          <ZoomIn className="w-4 h-4" />
          Vergrößern
        </button>

        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          disabled={!html2pdfReady}
        >
          <Download className="w-4 h-4" />
          PDF herunterladen
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <FileText className="w-4 h-4" />
          Drucken
        </button>
      </div>

      {/* Dokument Container mit Zoom */}
      <div className="flex justify-center flex-1 pb-8">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease'
          }}
        >
          <div 
            ref={ref}
            className="bg-white shadow-lg print:shadow-none w-[210mm] min-h-[297mm] p-[20mm] mx-auto flex flex-col"
            style={{ 
              fontFamily: 'Arial, sans-serif',
              fontSize: '11pt',
              color: '#1e293b'
            }}
          >
            {/* Kopfzeile */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kinderbetreuung Mustereinrichtung</h1>
                <p className="text-sm text-slate-500 mt-1">Dokumentation & Entwicklung</p>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p>Musterstraße 123</p>
                <p>12345 Musterstadt</p>
                <p>Tel: 0123-456789</p>
              </div>
            </div>

            {/* Kind Information Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8 text-sm">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-slate-500 block text-xs uppercase">Kind</span>
                  <span className="font-bold text-slate-900 text-base">{getPatientName()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs uppercase">Geburtsdatum</span>
                  <span className="font-semibold text-slate-900">{getPatientDOB()}</span>
                </div>
              </div>
            </div>

            {/* Dynamischer Inhalt */}
            <div className="flex-grow">
              {(type === 'eingewoehnungsgespraech' || type === 'eingewoehnung') && renderEingewoehnungContent()}
              {(type === 'vsg_beobachtungsbogen' || type === 'vsg') && renderVSGContent()}
              {(type === 'leg_gespraech' || type === 'leg') && renderLEGContent()}
              
              {!['eingewoehnungsgespraech', 'eingewoehnung', 'vsg_beobachtungsbogen', 'vsg', 'leg_gespraech', 'leg'].includes(type) && (
                <div className="text-center text-gray-400 py-10">
                  <p>Vorschau für Dokumentationstyp "{type}" nicht verfügbar.</p>
                </div>
              )}
            </div>

            {/* Fußzeile */}
            <div className="mt-12 pt-6 border-t border-slate-200 text-[10px] text-slate-400 flex justify-between items-center">
              <p>Erstellt am: {format(new Date(), 'PPP', { locale: de })}</p>
              <p>Vertrauliches Dokument - Nur für Berechtigte.</p>
              <p>Seite 1 von 1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

A4DocumentPreview.displayName = 'A4DocumentPreview';

export default A4DocumentPreview;