// webapp/app/components/documentation/VoiceDictationButton.tsx
"use client";

import React, { useState } from "react";
// Stellen Sie sicher, dass dieser Pfad existiert, sonst nutzen Sie einen normalen <button>
import { Button } from "@/components/ui/button"; 
import { Mic, Loader2, Square } from "lucide-react";

// HINWEIS: base44 Import entfernt, da kein Backend vorhanden
// import { base44 } from "@/api/base44Client"; 

export default function VoiceDictationButton({ onTranscriptComplete, placeholder = "Sprechen Sie..." }) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartDictation = async () => {
    setIsListening(true);
    
    // Simuliert Aufnahme für 2 Sekunden
    setTimeout(async () => {
      setIsListening(false);
      setIsProcessing(true);
      
      try {
        // Simulation der Transkription (da keine echte API verbunden ist)
        setTimeout(() => {
            const dummyResult = "Dies ist ein simulierter Text. Der Patient wirkte heute sehr entspannt und hat gut mitgemacht. (Automatisch generiert)";
            onTranscriptComplete(dummyResult);
            setIsProcessing(false);
        }, 1500);

        /* ORIGINAL CODE (Auskommentiert bis Backend existiert):
        const simulatedSpeech = "Der Patient hat heute über seine Fortschritte berichtet...";
        const result = await base44.integrations.Core.InvokeLLM({ ... });
        onTranscriptComplete(result);
        */

      } catch (error) {
        console.error("Dictation error:", error);
        onTranscriptComplete("\n\nFehler bei der Spracherkennung.");
        setIsProcessing(false);
      }
    }, 2000);
  };

  const handleStopDictation = () => {
    setIsListening(false);
  };

  if (isProcessing) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        className="border-blue-200"
      >
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Verarbeite...
      </Button>
    );
  }

  if (isListening) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleStopDictation}
        className="border-red-200 text-red-700 hover:bg-red-50"
      >
        <Square className="w-4 h-4 mr-2" />
        Stoppen
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleStartDictation}
      className="border-blue-200 text-blue-700 hover:bg-blue-50"
    >
      <Mic className="w-4 h-4 mr-2" />
      Diktieren
    </Button>
  );
}