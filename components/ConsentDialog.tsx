import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function ConsentDialog({ isOpen, onClose, onConsent }) {
  const [accepted, setAccepted] = React.useState(false);

  const handleConsent = () => {
    if (accepted) {
      onConsent();
      setAccepted(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Shield className="w-6 h-6 text-blue-600" />
            Datenschutzhinweis & Einwilligung
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto flex-1">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-slate-700 leading-relaxed">
              Die Aufzeichnung dieser Therapiesitzung erfolgt ausschließlich zum Zweck der medizinischen 
              Dokumentation und unterliegt den strengen Bestimmungen der DSGVO (Datenschutz-Grundverordnung).
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-600" />
              Ihre Rechte gemäß DSGVO
            </h3>
            
            <div className="space-y-3 pl-7">
              <div className="flex items-start gap-3">
                <Eye className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900 text-sm">Zugriff & Transparenz</p>
                  <p className="text-sm text-slate-600">
                    Sie haben jederzeit das Recht auf Auskunft über Ihre gespeicherten Daten.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900 text-sm">Zweckbindung</p>
                  <p className="text-sm text-slate-600">
                    Die Aufzeichnung wird ausschließlich für therapeutische Dokumentation verwendet.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900 text-sm">Datensicherheit</p>
                  <p className="text-sm text-slate-600">
                    Alle Daten werden verschlüsselt gespeichert und sind nur für autorisierte Therapeuten zugänglich.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900 text-sm">Widerruf möglich</p>
                  <p className="text-sm text-slate-600">
                    Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Durch Ihre Einwilligung bestätigen Sie, dass Sie über die Aufzeichnung informiert wurden und 
              mit der Verarbeitung Ihrer personenbezogenen Daten zu den genannten Zwecken einverstanden sind. 
              Die Speicherdauer richtet sich nach den gesetzlichen Aufbewahrungsfristen für medizinische Dokumentation.
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <Checkbox 
              id="consent" 
              checked={accepted}
              onCheckedChange={setAccepted}
            />
            <label
              htmlFor="consent"
              className="text-sm font-medium leading-relaxed text-slate-900 cursor-pointer"
            >
              Ich habe die Datenschutzinformationen zur Kenntnis genommen und willige in die Aufzeichnung 
              dieser Therapiesitzung ein.
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-shrink-0 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleConsent} 
            disabled={!accepted}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Einwilligung erteilen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}