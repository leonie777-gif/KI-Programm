"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, FileEdit, Video, FileCheck, Users, Mic } from "lucide-react";
import { Shield, Lock, Eye, FileText } from "lucide-react";
import A4DocumentPreview from "@/components/docs/A4DocumentPreview";

declare global {
  interface Window {
    html2pdf: any;
  }
}
interface AudioMicButtonProps {
  onAudioTranscribed: (bulletPoints: string) => void;
  isLoading?: boolean;
}

function AudioMicButton({ 
  onAudioTranscribed,
  isLoading = false 
}: AudioMicButtonProps) {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);


const handleClick = async () => {
    if (!recording) {
      // Aufnahme starten
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          setUploading(true);
          try {
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
            const formData = new FormData();
            formData.append("audio", audioBlob, "aufnahme.wav");

            const res = await fetch("http://localhost:4000/api/ai/upload-audio", {
              method: "POST",
              body: formData,
            });

            if (!res.ok) throw new Error("Upload fehlgeschlagen");

            const data = await res.json();
            
            if (data.bulletPoints && onAudioTranscribed) {
              const bulletPointsText = data.bulletPoints.join("\n");
              onAudioTranscribed(bulletPointsText);
            }
            
            alert("Audio erfolgreich transkribiert!");
          } catch (err) {
            console.error(err);
            alert("Fehler beim Upload");
          } finally {
            setUploading(false);
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop());
            }
          }
        };

        mediaRecorder.start();
        setRecording(true);
      } catch (err) {
        alert("Mikrofon-Zugriff verweigert");
      }
    } else {
      // Aufnahme stoppen - Upload
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setRecording(false);
      }
    }
  };

  const isProcessing = uploading || isLoading;


 return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isProcessing}
      className={`px-2 py-1 text-white rounded-lg transition-all flex items-center gap-1 ${
        recording 
          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
          : isProcessing
          ? 'bg-blue-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-[#001CFF] to-[#0055FF] hover:opacity-90'
      }`}
    >
      {isProcessing ? (
        <>
          <div className="animate-spin">
            <Mic className="w-4 h-4" />
          </div>
          <span className="text-xs">Lädt...</span>
        </>
      ) : recording ? (
        <>
          <span className="text-xs">Stop</span>
        </>
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
}

interface LiveRecordingProps {
  onRecordingComplete: (bulletPoints: string) => void;
  documentationType: string;
}

function LiveRecording({ onRecordingComplete, documentationType }: LiveRecordingProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Mikrofon-Zugriff verweigert");
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    } else if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const handleStopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsPaused(false);
    setIsProcessing(true);
    
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    await new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          const formData = new FormData();
          formData.append("audio", audioBlob, "aufnahme.wav");

          const res = await fetch("http://localhost:4000/api/ai/upload-audio", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) throw new Error("Upload fehlgeschlagen");

          const data = await res.json();
          
          if (data.bulletPoints && onRecordingComplete) {
            const bulletPointsText = data.bulletPoints.join("\n");
            onRecordingComplete(bulletPointsText);
          }
          
          alert("Aufzeichnung erfolgreich verarbeitet!");
        } catch (err) {
          console.error(err);
          alert("Fehler beim Verarbeiten der Aufzeichnung");
        } finally {
          setIsProcessing(false);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }
        }
        resolve();
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-8">
        <div className="text-center">
          {isProcessing ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="animate-spin">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              </div>
              <p className="text-lg font-semibold text-blue-900">Wird verarbeitet...</p>
              <p className="text-sm text-blue-700 mt-2">Das kann einen Moment dauern...</p>
            </>
          ) : (
            <>
              {isRecording ? (
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="text-2xl font-bold text-red-600 font-mono">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              ) : (
                <p className="text-lg font-semibold text-blue-900">
                  {recordingTime > 0 ? `Aufgezeichnet: ${formatTime(recordingTime)}` : 'Bereit zur Aufzeichnung'}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {!isProcessing && (
        <div className="flex gap-3 justify-center">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
              Start
            </button>
          ) : (
            <>
              <button
                onClick={handlePauseRecording}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-semibold transition-colors flex items-center gap-2"
              >
                {isPaused ? '▶' : '⏸'} {isPaused ? 'Fortsetzen' : 'Pause'}
              </button>
              <button
                onClick={handleStopRecording}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors flex items-center gap-2"
              >
                ⏹ Beenden
              </button>
            </>
          )}
        </div>
      )}

      {isProcessing && (
        <div className="text-center">
          <p className="text-slate-600 text-sm">
            Aufzeichnung wird verarbeitet. Bitte warten Sie...
          </p>
        </div>
      )}
    </div>
  );
}



export default function CreateDocumentation() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedGruppe, setSelectedGruppe] = useState("all");
  const [documentationType, setDocumentationType] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [showConsent, setShowConsent] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [eingewoehnungData, setEingewoehnungData] = useState({});
  const [legData, setLegData] = useState({});
  const [vsgData, setVsgData] = useState({});
  const [elterngespraechData, setElterngespraechData] = useState({});
  const previewRef = useRef(null);
  const [gruppen, setGruppen] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

const [loadingStates, setLoadingStates] = useState({
  leg_besprochene_themen: false,
  leg_vereinbarungen: false,
  leg_naechste_schritte: false,
  eingewoehnungData_themen: false,
  eingewoehnungData_absprachen: false,
  vsg_remarks: false,
  elterngespraech_themen: false,
});

const setLoading = (key: string, value: boolean) => {
  setLoadingStates(prev => ({
    ...prev,
    [key]: value
  }));
};

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
        "Bewegungen sind flüssig / Lateralität",
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



  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.async = true;
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
  fetch("http://localhost:4000/api/groups")
    .then(res => res.json())
    .then(setGruppen)
    .catch(err =>
      console.error("Fehler beim Laden der Gruppen:", err)
    );
}, []);

useEffect(() => {
  fetch("http://localhost:4000/api/patients")
    .then(res => res.json())
    .then(setPatients)
    .catch(err =>
      console.error("Fehler beim Laden der Patienten:", err)
    );
}, []);


  const documentationTypes = [
    { id: 'leg_gespraech', label: 'LEG-Gespräch', allowsRecording: true },
    { id: 'eingewoehnungsgespraech', label: 'Eingewöhnungsgespräch', allowsRecording: true },
    { id: 'vsg_beobachtungsbogen', label: 'VSG Beobachtungsbogen', allowsRecording: false },
    { id: 'elterngespraech', label: 'Elterngespräch', allowsRecording: true }
  ];

  const filteredPatients = patients.filter(patient => {
    if (selectedGruppe === "all") return true;
    return patient.gruppe_id === selectedGruppe;
  });

  const handleTypeSelect = (typeId) => {
    setDocumentationType(typeId);
    const type = documentationTypes.find(t => t.id === typeId);
    if (!type.allowsRecording) {
      setSelectedMode('manual');
    }
  };

  const handleModeSelect = (mode) => {
    if (mode === 'recording') {
      setShowConsent(true);
    } else {
      setSelectedMode(mode);
    }
  };

  const handleConsentGiven = () => {
    setShowConsent(false);
    setSelectedMode('recording');
  };

  const handleBack = () => {
    if (selectedMode) {
      setSelectedMode(null);
    } else if (documentationType) {
      setDocumentationType(null);
    } else {
      window.location.href = "/documentation";
    }
  };

  const handleEingewoehnungChange = (field, value) => {
    setEingewoehnungData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEingewoehnungSave = async () => {
  if (!selectedPatient) return alert("Bitte ein Kind auswählen");

  const patientName = patients.find(p => p.id === selectedPatient);
  const payload = {
    patient_id: selectedPatient,
    documentation_type: "eingewoehnungsgespraech",
    session_title: `Eingewöhnungsgespräch ${new Date().toLocaleDateString("de-DE")}`,
    session_date: new Date().toISOString().split("T")[0], // yyyy-mm-dd
    recording_method: "manual",
    content: eingewoehnungData
  };

  try {
    const res = await fetch("http://localhost:4000/api/documentation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Fehler beim Speichern");
    }

    const savedDoc = await res.json();
    console.log("Eingewöhnungsgespräch gespeichert:", savedDoc);
    alert("Eingewöhnungsgespräch erfolgreich gespeichert!");
  } catch (error) {
    console.error(error);
    alert("Fehler: " + error.message);
  }
};


  const handleLegChange = (field, value) => {
    setLegData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLegSave = async () => {
  if (!selectedPatient) return alert("Bitte ein Kind auswählen");

  const payload = {
    patient_id: selectedPatient,
    documentation_type: "leg_gespraech",
    session_title: `LEG-Gespräch ${new Date().toLocaleDateString("de-DE")}`,
    session_date: new Date().toISOString().split("T")[0],
    recording_method: "manual",
    content: legData
  };

  try {
    const res = await fetch("http://localhost:4000/api/documentation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Fehler beim Speichern");
    }

    const savedDoc = await res.json();
    console.log("LEG-Gespräch gespeichert:", savedDoc);
    alert("LEG-Gespräch erfolgreich gespeichert!");
  } catch (error) {
    console.error(error);
    alert("Fehler: " + error.message);
  }
};

  const handleElterngespraechChange = (field, value) => {
    setElterngespraechData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleElterngespraechSave = async () => {
  if (!selectedPatient) return alert("Bitte ein Kind auswählen");

  const payload = {
    patient_id: selectedPatient,
    documentation_type: "elterngespraech",
    session_title: `Elterngespräch ${new Date().toLocaleDateString("de-DE")}`,
    session_date: new Date().toISOString().split("T")[0],
    recording_method: "manual",
    content: elterngespraechData
  };

  try {
    const res = await fetch("http://localhost:4000/api/documentation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Fehler beim Speichern");
    }

    const savedDoc = await res.json();
    console.log("Elterngespräch gespeichert:", savedDoc);
    alert("Elterngespräch erfolgreich gespeichert!");
  } catch (error) {
    console.error(error);
    alert("Fehler: " + error.message);
  }
};

  const currentType = documentationTypes.find(t => t.id === documentationType);

  const handleDownloadPDF = () => {
    const element = previewRef.current;
    if (!element) {
      alert('Preview nicht gefunden');
      return;
    }

    if (!window.html2pdf) {
      alert('PDF-Library wird noch geladen. Bitte versuchen Sie es in einer Sekunde erneut.');
      return;
    }

    const patientName = patients.find(p => p.id === selectedPatient);
    const filename = `${patientName?.first_name || 'Dokument'}_${currentType?.label || 'dokumentation'}.pdf`;

    const options = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, allowTaint: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    window.html2pdf().set(options).from(element).save();
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {selectedMode ? 'Zurück zur Auswahl' : documentationType ? 'Zurück zur Dokumentationsart' : 'Zurück'}
      </button>

      {/* Group and Child Selector */}
      {!selectedMode && !documentationType && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Kind auswählen</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Gruppe</label>
            <select
              value={selectedGruppe}
              onChange={(e) => setSelectedGruppe(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="all">Alle Gruppen</option>
              {gruppen.map((gruppe) => (
  <option key={gruppe.gruppe_id} value={gruppe.gruppe_id}>
    {gruppe.name}
  </option>
))}

            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredPatients.map((patient) => (
              <button
                key={patient.patient_id}
                onClick={() => setSelectedPatient(patient.patient_id)}
                className={`p-4 border-2 rounded-lg transition-all text-center ${
                  selectedPatient === patient.patient_id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                  selectedPatient === patient.patient_id
                    ? 'bg-blue-200'
                    : 'bg-slate-100'
                }`}>
                  <Users className={`w-6 h-6 ${
                    selectedPatient === patient.patient_id ? 'text-blue-700' : 'text-slate-600'
                  }`} />
                </div>
                <p className="text-sm font-medium text-slate-900">{patient.first_name}</p>
                <p className="text-xs text-slate-500">{patient.last_name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Documentation Type Selection */}
      {!documentationType && !selectedMode && (
        <div className="mt-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Neue Dokumentation</h1>
          <p className="text-slate-600 mb-8">Wählen Sie die Dokumentationsart</p>

          <div className="grid grid-cols-1 gap-4">
            {documentationTypes.map((type) => (
              <div
                key={type.id}
                onClick={() => selectedPatient && handleTypeSelect(type.id)}
                className={`bg-white border-2 rounded-lg transition-all duration-200 ${
                  selectedPatient
                    ? 'border-slate-200 hover:border-blue-400 hover:shadow-xl cursor-pointer'
                    : 'border-slate-200 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileCheck className="w-7 h-7 text-blue-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{type.label}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {type.allowsRecording 
                          ? 'Live-Aufnahme oder manuelle Eingabe möglich' 
                          : 'Nur manuelle Eingabe'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!selectedPatient && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Bitte wählen Sie zuerst ein Kind aus.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mode Selection */}
      {documentationType && !selectedMode && currentType?.allowsRecording && (
        <div className="mt-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{currentType.label}</h1>
          <p className="text-slate-600 mb-8">Wählen Sie eine Methode zur Erstellung der Dokumentation</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={() => handleModeSelect('recording')}
              className="bg-white border-2 border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-xl transition-all duration-200 cursor-pointer"
            >
              <div className="text-center p-6 pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                  <Video className="w-8 h-8 text-red-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Live-Aufnahme</h3>
              </div>
              <div className="text-center p-6 pt-0">
                <p className="text-slate-600 mb-4">Zeichnen Sie auf und erhalten Sie automatische Transkription.</p>
              </div>
            </div>

            <div
              onClick={() => handleModeSelect('manual')}
              className="bg-white border-2 border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-xl transition-all duration-200 cursor-pointer"
            >
              <div className="text-center p-6 pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <FileEdit className="w-8 h-8 text-blue-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Eigene Eingabe</h3>
              </div>
              <div className="text-center p-6 pt-0">
                <p className="text-slate-600 mb-4">Erstellen Sie die Dokumentation durch Texteingabe.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content with Live Preview */}
      {selectedMode && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-screen">
          {/* Left: Form (1 column) */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-lg p-8 sticky top-6 max-h-[calc(100vh-60px)] overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                {currentType?.label}
              </h2>

              <p className="text-slate-600 mb-4">
                Patient: {patients.find(p => p.patient_id === selectedPatient)?.first_name} {patients.find(p => p.id === selectedPatient)?.last_name}
              </p>
              <hr className="mb-6"/>

              {selectedMode === 'recording' && (
                <LiveRecording 
                  documentationType={documentationType}
                  onRecordingComplete={(bulletPoints) => {
                    setSelectedMode('manual');
                    
                    if (documentationType === 'leg_gespraech') {
                      handleLegChange('besprochene_themen', bulletPoints);
                    } else if (documentationType === 'eingewoehnungsgespraech') {
                      handleEingewoehnungChange('themen', bulletPoints);
                    } else if (documentationType === 'elterngespraech') {
                      handleElterngespraechChange('themen', bulletPoints);
                    }
                  }}
                />
              )}

              {/* Eingewöhnungsgespräch */}
              {documentationType === 'eingewoehnungsgespraech' && selectedMode === 'manual' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Gespräch geführt von</label>
                    <input
                      type="text"
                      value={eingewoehnungData.gefuehrt_von || ""}
                      onChange={(e) => handleEingewoehnungChange('gefuehrt_von', e.target.value)}
                      placeholder="Name der Fachkraft"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Gespräch geführt mit</label>
                    <input
                      type="text"
                      value={eingewoehnungData.gefuehrt_mit || ""}
                      onChange={(e) => handleEingewoehnungChange('gefuehrt_mit', e.target.value)}
                      placeholder="Erziehungsberechtigte"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
           <div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">Besprochene Themen</label>
  
  {loadingStates.eingewoehnungData_themen ? (
    <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-blue-50 flex items-center gap-2">
      <div className="animate-spin">
        <Mic className="w-4 h-4 text-blue-600" />
      </div>
      <span className="text-sm text-blue-600">Transkription läuft...</span>
    </div>
  ) : (
    <textarea
      value={eingewoehnungData.themen || ""}
      onChange={(e) => handleEingewoehnungChange('themen', e.target.value)}
      placeholder="Besprochene Themen eingeben..."
      rows={4}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    />
  )}
  
  <div className="flex justify-end">
    <AudioMicButton 
      onAudioTranscribed={(bulletPoints) => {
        setLoading('eingewoehnungData_themen', false);
        handleEingewoehnungChange('themen', (eingewoehnungData.themen || '') + '\n' + bulletPoints);
      }}
      isLoading={loadingStates.eingewoehnungData_themen}
    />
  </div>
</div>

<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">Wünsche der Eltern</label>
  
  {loadingStates.eingewoehnungData_themen ? (
    <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-blue-50 flex items-center gap-2">
      <div className="animate-spin">
        <Mic className="w-4 h-4 text-blue-600" />
      </div>
      <span className="text-sm text-blue-600">Transkription läuft...</span>
    </div>
  ) : (
    <textarea
      value={eingewoehnungData.themen || ""}
      onChange={(e) => handleEingewoehnungChange('themen', e.target.value)}
      placeholder="Besprochene Themen eingeben..."
      rows={4}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    />
  )}
  
  <div className="flex justify-end">
    <AudioMicButton 
      onAudioTranscribed={(bulletPoints) => {
        setLoading('eingewoehnungData_themen', false);
        handleEingewoehnungChange('themen', (eingewoehnungData.themen || '') + '\n' + bulletPoints);
      }}
      isLoading={loadingStates.eingewoehnungData_themen}
    />
  </div>
</div>

<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">Bedenken der Eltern</label>
  
  {loadingStates.eingewoehnungData_themen ? (
    <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-blue-50 flex items-center gap-2">
      <div className="animate-spin">
        <Mic className="w-4 h-4 text-blue-600" />
      </div>
      <span className="text-sm text-blue-600">Transkription läuft...</span>
    </div>
  ) : (
    <textarea
      value={eingewoehnungData.themen || ""}
      onChange={(e) => handleEingewoehnungChange('themen', e.target.value)}
      placeholder="Besprochene Themen eingeben..."
      rows={4}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    />
  )}
  
  <div className="flex justify-end">
    <AudioMicButton 
      onAudioTranscribed={(bulletPoints) => {
        setLoading('eingewoehnungData_themen', false);
        handleEingewoehnungChange('themen', (eingewoehnungData.themen || '') + '\n' + bulletPoints);
      }}
      isLoading={loadingStates.eingewoehnungData_themen}
    />
  </div>
</div>

<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">Was erzählt das Kind zuhause?</label>
  
  {loadingStates.eingewoehnungData_themen ? (
    <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-blue-50 flex items-center gap-2">
      <div className="animate-spin">
        <Mic className="w-4 h-4 text-blue-600" />
      </div>
      <span className="text-sm text-blue-600">Transkription läuft...</span>
    </div>
  ) : (
    <textarea
      value={eingewoehnungData.themen || ""}
      onChange={(e) => handleEingewoehnungChange('themen', e.target.value)}
      placeholder="Besprochene Themen eingeben..."
      rows={4}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    />
  )}
  
  <div className="flex justify-end">
    <AudioMicButton 
      onAudioTranscribed={(bulletPoints) => {
        setLoading('eingewoehnungData_themen', false);
        handleEingewoehnungChange('themen', (eingewoehnungData.themen || '') + '\n' + bulletPoints);
      }}
      isLoading={loadingStates.eingewoehnungData_themen}
    />
  </div>
</div>


                   <div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">Absprachen/Vereinbarungen</label>
  
  {loadingStates.eingewoehnungData_absprachen ? (
    <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-blue-50 flex items-center gap-2">
      <div className="animate-spin">
        <Mic className="w-4 h-4 text-blue-600" />
      </div>
      <span className="text-sm text-blue-600">Transkription läuft...</span>
    </div>
  ) : (
    <textarea
      value={eingewoehnungData.absprachen || ""}
      onChange={(e) => handleEingewoehnungChange('absprachen', e.target.value)}
      placeholder="Absprachen eingeben..."
      rows={4}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    />
  )}
  
  <div className="flex justify-end">
    <AudioMicButton 
      onAudioTranscribed={(bulletPoints) => {
        setLoading('eingewoehnungData_absprachen', false);
        handleEingewoehnungChange('absprachen', (eingewoehnungData.absprachen || '') + '\n' + bulletPoints);
      }}
      isLoading={loadingStates.eingewoehnungData_absprachen}
    />
  </div>
</div>



                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Nachbesprechung</label>
                    <input
                      type="text"
                      value={eingewoehnungData.nachbesprechung || ""}
                      onChange={(e) => handleEingewoehnungChange('nachbesprechung', e.target.value)}
                      placeholder="z.B. Nach 4 Wochen"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Folgetermin</label>
                    <input
                      type="date"
                      value={eingewoehnungData.folgetermin || ""}
                      onChange={(e) => handleEingewoehnungChange('folgetermin', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleEingewoehnungSave}
                    className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Speichern
                  </button>
                </div>
              )}


              {/* LEG-Gespräch */}
              {documentationType === 'leg_gespraech' && selectedMode === 'manual' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Gesprächspartner</label>
                    <input
                      type="text"
                      value={legData.gespraechspartner || ""}
                      onChange={(e) => handleLegChange('gespraechspartner', e.target.value)}
                      placeholder="Name des Gesprächspartners"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
               <div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">Besprochene Themen</label>
  
  {loadingStates.leg_besprochene_themen ? (
    <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-blue-50 flex items-center gap-2">
      <div className="animate-spin">
        <Mic className="w-4 h-4 text-blue-600" />
      </div>
      <span className="text-sm text-blue-600">Transkription läuft...</span>
    </div>
  ) : (
    <textarea
      value={legData.besprochene_themen || ""}
      onChange={(e) => handleLegChange('besprochene_themen', e.target.value)}
      placeholder="Themen eingeben..."
      rows={4}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    />
  )}
  
  <div className="flex justify-end mt-1">
  <AudioMicButton 
    
    onStartLoading={() => setLoading('leg_besprochene_themen', true)}
    
    onAudioTranscribed={(bulletPoints) => {
      
      setLoading('leg_besprochene_themen', false);
      handleLegChange('besprochene_themen', (legData.besprochene_themen || '') + '\n' + bulletPoints);
    }}
    isLoading={loadingStates.leg_besprochene_themen}
  />
</div>
</div>
                <div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">Vereinbarungen</label>
  
  {loadingStates.leg_vereinbarungen ? (
    <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-blue-50 flex items-center gap-2">
      <div className="animate-spin">
        <Mic className="w-4 h-4 text-blue-600" />
      </div>
      <span className="text-sm text-blue-600">Transkription läuft...</span>
    </div>
  ) : (
    <textarea
      value={legData.vereinbarungen || ""}
      onChange={(e) => handleLegChange('vereinbarungen', e.target.value)}
      placeholder="Vereinbarungen eingeben..."
      rows={4}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    />
  )}
  
  <div className="flex justify-end mt-1">
    <AudioMicButton 
      onAudioTranscribed={(bulletPoints) => {
        setLoading('leg_vereinbarungen', false);
        handleLegChange('vereinbarungen', (legData.vereinbarungen || '') + '\n' + bulletPoints);
      }}
      isLoading={loadingStates.leg_vereinbarungen}
    />
  </div>
</div>


                 <div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">Nächste Schritte</label>
  
  {loadingStates.leg_naechste_schritte ? (
    <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-blue-50 flex items-center gap-2">
      <div className="animate-spin">
        <Mic className="w-4 h-4 text-blue-600" />
      </div>
      <span className="text-sm text-blue-600">Transkription läuft...</span>
    </div>
  ) : (
    <textarea
      value={legData.naechste_schritte || ""}
      onChange={(e) => handleLegChange('naechste_schritte', e.target.value)}
      placeholder="Nächste Schritte..."
      rows={4}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    />
  )}
  
  <div className="flex justify-end mt-1">
    <AudioMicButton 
      onAudioTranscribed={(bulletPoints) => {
        setLoading('leg_naechste_schritte', false);
        handleLegChange('naechste_schritte', (legData.naechste_schritte || '') + '\n' + bulletPoints);
      }}
      isLoading={loadingStates.leg_naechste_schritte}
    />
  </div>
</div>


                  <button
                    onClick={handleLegSave}
                    className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Speichern
                  </button>
                </div>
              )}

              {/* Elterngespräch */}
              {documentationType === 'elterngespraech' && selectedMode === 'manual' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Gesprächspartner</label>
                    <input
                      type="text"
                      value={elterngespraechData.gespraechspartner || ""}
                      onChange={(e) => handleElterngespraechChange('gespraechspartner', e.target.value)}
                      placeholder="Name des Gesprächspartners (Eltern/Erziehungsberechtigte)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Anlass des Gesprächs</label>
                    <input
                      type="text"
                      value={elterngespraechData.anlass || ""}
                      onChange={(e) => handleElterngespraechChange('anlass', e.target.value)}
                      placeholder="Anlass des Gesprächs eingeben"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Besprochene Themen</label>
                    
                    {loadingStates.elterngespraech_themen ? (
                      <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-blue-50 flex items-center gap-2">
                        <div className="animate-spin">
                          <Mic className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm text-blue-600">Transkription läuft...</span>
                      </div>
                    ) : (
                      <textarea
                        value={elterngespraechData.themen || ""}
                        onChange={(e) => handleElterngespraechChange('themen', e.target.value)}
                        placeholder="Besprochene Themen eingeben..."
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                    
                    <div className="flex justify-end">
                      <AudioMicButton 
                        onAudioTranscribed={(bulletPoints) => {
                          setLoading('elterngespraech_themen', false);
                          handleElterngespraechChange('themen', (elterngespraechData.themen || '') + '\n' + bulletPoints);
                        }}
                        isLoading={loadingStates.elterngespraech_themen}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleElterngespraechSave}
                    className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Speichern
                  </button>
                </div>
              )}

              {/* VSG Beobachtungsbogen */}
              {documentationType === 'vsg_beobachtungsbogen' && selectedMode === 'manual' && (
                <VSGAssessmentFormInlineWithAI
                  patients={patients}
                  selectedPatientId={selectedPatient}
                  onSave={async (data) => {
  if (!selectedPatient) return alert("Bitte ein Kind auswählen");

  const payload = {
    patient_id: selectedPatient,
    documentation_type: "vsg_beobachtungsbogen",
    session_title: `VSG Beobachtungsbogen ${new Date().toLocaleDateString("de-DE")}`,
    session_date: new Date().toISOString().split("T")[0],
    recording_method: "manual",
    content: data
  };

  try {
    const res = await fetch("http://localhost:4000/api/documentation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Fehler beim Speichern");
    }

    const savedDoc = await res.json();
    setVsgData(data); 
    console.log("VSG-Beobachtungsbogen gespeichert:", savedDoc);
    alert("VSG-Beobachtungsbogen erfolgreich gespeichert!");
  } catch (error) {
    console.error(error);
    alert("Fehler: " + error.message);
  }
}}

                  initialData={vsgData}
                />
              )}
            </div>
          </div>

          {/* Right: Live Preview (2 columns) */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 bg-white border border-slate-300 rounded-lg overflow-hidden shadow-lg">
              {/* Preview Header */}
              <div className="bg-slate-50 p-4 border-b border-slate-300 flex justify-between items-center">
                <h3 className="font-semibold text-slate-900">📄 Vorschau PDF</h3>
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                  ⬇️ Als PDF herunterladen
                </button>
              </div>

              {/* Preview Content */}
              <div className="bg-gray-100 p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 150px)', scrollbarWidth: 'thin' }}>
                <div style={{ scale: '0.75', transformOrigin: 'top center', marginBottom: '-150px' }}>
                  <div 
                    ref={previewRef}
                    className="bg-white shadow-lg w-[210mm] min-h-[297mm] mx-auto flex flex-col"
                    style={{ 
                      fontFamily: 'Arial, sans-serif',
                      fontSize: '11pt',
                      color: '#1e293b',
                      padding: '20mm',
                      margin: 0,
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Kopfzeile */}
                    <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                      <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{currentType?.label || 'Dokumentation'}</h1>
                        <p className="text-sm text-slate-500 mt-1">Dokumentation & Entwicklung</p>
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        <p>Musterstraße 123</p>
                        <p>12345 Musterstadt</p>
                        <p>Tel: 0123-456789</p>
                      </div>
                    </div>

                    {/* Kind Information */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-slate-500 block text-xs uppercase">Kind</span>
                          <span className="font-bold text-slate-900">{patients.find(p => p.id === selectedPatient)?.first_name} {patients.find(p => p.id === selectedPatient)?.last_name}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-xs uppercase">Dokumenttyp</span>
                          <span className="font-semibold text-slate-900">{currentType?.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow space-y-6">
                      {/* Eingewöhnungsgespräch Preview */}
                      {documentationType === 'eingewoehnungsgespraech' && selectedMode === 'manual' && (
                        <>
                          <div className="border-b pb-4">
                            <h2 className="text-xl font-bold text-slate-800">Protokoll zum Eingewöhnungsgespräch</h2>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">Geführt von</h3>
                              <p className="text-slate-900">{eingewoehnungData.gefuehrt_von || "-"}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">Geführt mit</h3>
                              <p className="text-slate-900">{eingewoehnungData.gefuehrt_mit || "-"}</p>
                            </div>
                          </div>
                          {eingewoehnungData.themen && (
                            <div>
                              <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-blue-500 pl-3">Besprochene Themen</h3>
                              <div className="bg-slate-50 p-4 rounded-lg text-slate-800 whitespace-pre-wrap text-sm">
                                {eingewoehnungData.themen}
                              </div>
                            </div>
                          )}
                          {eingewoehnungData.absprachen && (
                            <div>
                              <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-green-500 pl-3">Absprachen/Vereinbarungen</h3>
                              <div className="bg-slate-50 p-4 rounded-lg text-slate-800 whitespace-pre-wrap text-sm">
                                {eingewoehnungData.absprachen}
                              </div>
                            </div>
                          )}
                          {eingewoehnungData.nachbesprechung && (
                            <div>
                              <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-purple-500 pl-3">Nachbesprechung</h3>
                              <p className="text-slate-900">{eingewoehnungData.nachbesprechung}</p>
                            </div>
                          )}
                          {eingewoehnungData.folgetermin && (
                            <div>
                              <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-orange-500 pl-3">Folgetermin</h3>
                              <p className="text-slate-900">{new Date(eingewoehnungData.folgetermin).toLocaleDateString('de-DE')}</p>
                            </div>
                          )}
                        </>
                      )}

                      {/* LEG-Gespräch Preview */}
                      {documentationType === 'leg_gespraech' && selectedMode === 'manual' && (
                        <>
                          <div className="border-b pb-4">
                            <h2 className="text-xl font-bold text-slate-800">LEG-Gesprächsprotokoll</h2>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">Gesprächspartner</h3>
                            <p className="text-slate-900">{legData.gespraechspartner || "-"}</p>
                          </div>
                          {legData.anlass && (
                            <div>
                              <h3 className="font-bold text-slate-800 mb-2">Anlass</h3>
                              <p className="text-slate-700 text-sm">{legData.anlass}</p>
                            </div>
                          )}
                          {legData.besprochene_themen && (
                            <div>
                              <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-blue-500 pl-3">Themen</h3>
                              <div className="bg-slate-50 p-4 rounded-lg text-slate-800 whitespace-pre-wrap text-sm">
                                {legData.besprochene_themen}
                              </div>
                            </div>
                          )}
                          {legData.vereinbarungen && (
                            <div>
                              <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-green-500 pl-3">Vereinbarungen</h3>
                              <div className="bg-slate-50 p-4 rounded-lg text-slate-800 whitespace-pre-wrap text-sm">
                                {legData.vereinbarungen}
                              </div>
                            </div>
                          )}
                          {legData.naechste_schritte && (
                            <div>
                              <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-orange-500 pl-3">Nächste Schritte</h3>
                              <div className="bg-orange-50 p-4 rounded-lg text-slate-800 whitespace-pre-wrap text-sm">
                                {legData.naechste_schritte}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Eltern-Gespräch Preview */}
                      {documentationType === 'elterngespraech' && selectedMode === 'manual' && (
                        <>
                          <div className="border-b pb-4">
                            <h2 className="text-xl font-bold text-slate-800">Eltern-Gesprächsprotokoll</h2>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">Gesprächspartner</h3>
                            <p className="text-slate-900">{elterngespraechData.gespraechspartner || "-"}</p>
                          </div>
                          {elterngespraechData.anlass && (
                            <div>
                              <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-purple-500 pl-3">Anlass des Gesprächs</h3>
                              <p className="text-slate-700 text-sm">{elterngespraechData.anlass}</p>
                            </div>
                          )}
                          {elterngespraechData.themen && (
                            <div>
                              <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-blue-500 pl-3">Besprochene Themen</h3>
                              <div className="bg-slate-50 p-4 rounded-lg text-slate-800 whitespace-pre-wrap text-sm">
                                {elterngespraechData.themen}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* VSG Beobachtungsbogen Preview */}
                      {documentationType === 'vsg_beobachtungsbogen' && selectedMode === 'manual' && (
                        <>
                          <div className="border-b pb-4">
                            <h2 className="text-xl font-bold text-slate-800">VSG Beobachtungsbogen</h2>
                          </div>
                          
                          {vsgData.vsg_assessments ? (
                            <div className="space-y-8">
                              {/* Likert-Skalen Tabelle */}
                              <table className="w-full border-collapse text-xs">
                                {/* Header mit Optionen */}
                                <thead>
                                  <tr>
                                    <th className="border border-slate-300 p-2 text-left font-bold bg-slate-100">
                                      Kategorie / Frage
                                    </th>
                                    <th className="border border-slate-300 p-2 text-center font-semibold bg-blue-100">
                                      Sicher
                                    </th>
                                    <th className="border border-slate-300 p-2 text-center font-semibold bg-blue-100">
                                      Überwiegend
                                    </th>
                                    <th className="border border-slate-300 p-2 text-center font-semibold bg-blue-100">
                                      Teilweise
                                    </th>
                                    <th className="border border-slate-300 p-2 text-center font-semibold bg-blue-100">
                                      Noch nicht
                                    </th>
                                    <th className="border border-slate-300 p-2 text-center font-semibold bg-blue-100">
                                      Sonstiges
                                    </th>
                                  </tr>
                                </thead>

                                {/* Body mit Daten */}
                                <tbody>
                                  {Object.entries(vsgData.vsg_assessments).map(([categoryKey, assessments]) => {
                                    const categoryIndex = Object.keys(categories).indexOf(categoryKey);
                                    const categoryEntries = Object.entries(categories);
                                    if (categoryIndex === -1) return null;

                                    const [catKey, catData] = categoryEntries[categoryIndex];
                                    const items = catData.items;

                                    return (
                                      <React.Fragment key={categoryKey}>
                                        {/* Kategorie-Header */}
                                        <tr>
                                          <td colSpan={6} className="bg-slate-200 p-2 font-bold text-slate-800">
                                            {catData.title}
                                          </td>
                                        </tr>

                                        {/* Items/Fragen */}
                                        {Object.entries(assessments).map(([itemIndex, assessment]) => (
                                          <tr key={`${categoryKey}-${itemIndex}`} className="hover:bg-slate-50">
                                            <td className="border border-slate-300 p-3 text-slate-700">
                                              {items[parseInt(itemIndex)]}
                                            </td>

                                            {/* Sicher */}
                                            <td className="border border-slate-300 p-2 text-center">
                                              {assessment.value === 'sicher' ? (
                                                <span className="text-lg font-bold text-blue-600">✓</span>
                                              ) : (
                                                <span className="text-slate-300">-</span>
                                              )}
                                            </td>

                                            {/* Überwiegend */}
                                            <td className="border border-slate-300 p-2 text-center">
                                              {assessment.value === 'ueberwiegend' ? (
                                                <span className="text-lg font-bold text-blue-600">✓</span>
                                              ) : (
                                                <span className="text-slate-300">-</span>
                                              )}
                                            </td>

                                            {/* Teilweise */}
                                            <td className="border border-slate-300 p-2 text-center">
                                              {assessment.value === 'teilweise' ? (
                                                <span className="text-lg font-bold text-blue-600">✓</span>
                                              ) : (
                                                <span className="text-slate-300">-</span>
                                              )}
                                            </td>

                                            {/* Noch nicht */}
                                            <td className="border border-slate-300 p-2 text-center">
                                              {assessment.value === 'noch_nicht' ? (
                                                <span className="text-lg font-bold text-blue-600">✓</span>
                                              ) : (
                                                <span className="text-slate-300">-</span>
                                              )}
                                            </td>

                                            {/* Sonstiges */}
                                            <td className="border border-slate-300 p-2 text-center text-xs">
                                              {assessment.value === 'sonstiges' ? (
                                                <span className="text-blue-600 font-semibold">
                                                  {assessment.sonstigesText || '✓'}
                                                </span>
                                              ) : (
                                                <span className="text-slate-300">-</span>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </React.Fragment>
                                    );
                                  })}
                                </tbody>
                              </table>

                              {/* Sonstige Bemerkungen */}
                              {vsgData.remarks && (
                                <div>
                                  <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-purple-500 pl-3">
                                    Sonstige Bemerkungen
                                  </h3>
                                  <div className="bg-slate-50 p-4 rounded-lg text-slate-800 whitespace-pre-wrap text-sm">
                                    {vsgData.remarks}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-slate-500 italic">Keine Bewertungen vorhanden</p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Fußzeile */}
                    <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex justify-between">
                      <p>Erstellt am: {new Date().toLocaleDateString('de-DE')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consent Dialog */}
      {showConsent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center gap-3 p-6 border-b">
              <Shield className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-slate-900">Datenschutzhinweis & Einwilligung</h2>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-slate-700 font-semibold">Zur Unterstützung der Dokumentation wird im Rahmen des Gesprächs eine lokal betriebene Künstliche Intelligenz (KI) verwendet.
               </p>
               <p className="text-sm text-slate-700">
                Der Einsatz dient ausschließlich der internen Dokumentation des Gesprächs.
                Die Verarbeitung erfolgt unter Beachtung der geltenden datenschutzrechtlichen Bestimmungen.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor="consent" className="text-sm font-medium text-slate-900 cursor-pointer">
                  Ich willige hiermit ein, dass im Rahmen der Dokumentation eine Live-Audioaufzeichnung des Gesprächs erstellt wird.

                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-white">
              <button
                onClick={() => setShowConsent(false)}
                className="px-4 py-2 rounded-lg border text-slate-700 hover:bg-slate-100 transition"
              >
                Abbrechen
              </button>
              <button
                onClick={handleConsentGiven}
                disabled={!consentAccepted}
                className={`px-4 py-2 rounded-lg text-white transition ${
                  consentAccepted ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-300 cursor-not-allowed"
                }`}
              >
                Einwilligung erteilen
              </button>
            </div>
          </div>
        </div>
  )}
<footer className="mt-12 py-6 border-t border-slate-200 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <p className="text-xs text-slate-600 leading-relaxed">
          <span className="font-semibold text-slate-700">Hinweis zur Künstlichen Intelligenz:</span> Diese Anwendung nutzt Künstliche Intelligenz, um aus Ihren Stichpunkten strukturierte Textvorschläge zu generieren. Die KI ersetzt keine fachliche Beurteilung. Als verantwortliche Fachkraft obliegt Ihnen die finale Prüfung und Korrektur der generierten Inhalte, um eine präzise Dokumentation des Entwicklungsstandes zu gewährleisten.
        </p>
      </div>
    </footer>
    </div>
  );
}

// VSG Komponente
function VSGAssessmentFormInlineWithAI({ patients, selectedPatientId, onSave, initialData }) {
  const [formData, setFormData] = useState(initialData || {});
  const [remarks, setRemarks] = useState(initialData?.remarks || "");
  const [loadingRemarks, setLoadingRemarks] = useState(false);

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

  const likertOptions = [
    { value: "sicher", label: "sicher" },
    { value: "ueberwiegend", label: "überwiegend" },
    { value: "teilweise", label: "teilweise" },
    { value: "noch_nicht", label: "noch nicht" },
    { value: "sonstiges", label: "sonstiges" }
  ];

  const handleAssessmentChange = (categoryKey, itemIndex, value) => {
    setFormData(prev => {
      const assessments = prev.vsg_assessments || {};
      const categoryAssessments = assessments[categoryKey] || {};
      return {
        ...prev,
        vsg_assessments: {
          ...assessments,
          [categoryKey]: {
            ...categoryAssessments,
            [itemIndex]: {
              ...(categoryAssessments[itemIndex] || {}),
              value: value
            }
          }
        }
      };
    });
  };

  const handleSonstigesTextChange = (categoryKey, itemIndex, text) => {
    setFormData(prev => {
      const assessments = prev.vsg_assessments || {};
      const categoryAssessments = assessments[categoryKey] || {};
      return {
        ...prev,
        vsg_assessments: {
          ...assessments,
          [categoryKey]: {
            ...categoryAssessments,
            [itemIndex]: {
              ...(categoryAssessments[itemIndex] || {}),
              sonstigesText: text
            }
          }
        }
      };
    });
  };

  const getAssessmentValue = (categoryKey, itemIndex) => {
    return formData.vsg_assessments?.[categoryKey]?.[itemIndex]?.value || "";
  };

  const getSonstigesText = (categoryKey, itemIndex) => {
    return formData.vsg_assessments?.[categoryKey]?.[itemIndex]?.sonstigesText || "";
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const patientName = selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : "";

  const handleSaveWithRemarks = () => {
    onSave({
      ...formData,
      remarks: remarks
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">VSG Beobachtungsbogen ausfüllen</h3>
      
      {Object.entries(categories).map(([categoryKey, category]) => (
        <div key={categoryKey} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <h4 className="font-bold text-slate-800 mb-4">{category.title}</h4>
          <div className="space-y-4">
            {category.items.map((item, itemIndex) => (
              <div key={itemIndex} className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700 mb-3 font-medium">{item}</p>
                <div className="flex gap-2 flex-wrap">
                  {likertOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleAssessmentChange(categoryKey, itemIndex, option.value)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        getAssessmentValue(categoryKey, itemIndex) === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-700 hover:border-blue-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {getAssessmentValue(categoryKey, itemIndex) === 'sonstiges' && (
                  <input
                    type="text"
                    value={getSonstigesText(categoryKey, itemIndex)}
                    onChange={(e) => handleSonstigesTextChange(categoryKey, itemIndex, e.target.value)}
                    placeholder="Bitte erläutern..."
                    className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

       {/* Sonstige Bemerkungen mit KI-Button */}
      <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
  <div className="space-y-2">
    <h4 className="font-bold text-slate-800">Sonstige Bemerkungen</h4>
    
         {loadingRemarks ? (
  <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-blue-50 flex items-center gap-2">
    <div className="animate-spin">
      <Mic className="w-4 h-4 text-blue-600" />
    </div>
    <span className="text-sm text-blue-600">Transkription läuft...</span>
  </div>
) : (
  <textarea
    value={remarks}
    onChange={(e) => setRemarks(e.target.value)}
    placeholder="Zusätzliche Bemerkungen eingeben..."
    rows={4}
    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
  />
)}

<div className="flex justify-end">
  <AudioMicButton 
    onAudioTranscribed={(bulletPoints) => {
      setLoadingRemarks(false);
      setRemarks((remarks || '') + '\n' + bulletPoints);
    }}
    isLoading={loadingRemarks}
  />
</div>
        </div>
      </div>

      <button
        onClick={handleSaveWithRemarks}
        className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Speichern
      </button>
    </div>
  );
}