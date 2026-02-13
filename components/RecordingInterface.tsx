"use client";

import React, { useState, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Mic, Square, Save, Clock, Loader2 } from "lucide-react";
import EingewoehnungsForm from "./EingewoehnungsForm";

// Typen für Props
interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface EingewoehnungData {
  session_date: string;
  eingewoehnung_gefuehrt_von: string;
  eingewoehnung_gefuehrt_mit: string;
  eingewoehnung_themen: string;
  eingewoehnung_absprachen: string;
  eingewoehnung_nachbesprechung: string;
  eingewoehnung_folgetermin: string;
}

interface RecordingInterfaceProps {
  selectedPatient: string;
  patients: Patient[];
  consentGiven: boolean;
  documentationType: string;
  sessionTitle?: string;
  sessionDate?: string;
}

export default function RecordingInterface({
  selectedPatient,
  patients,
  consentGiven,
  documentationType,
  sessionTitle: initialTitle,
  sessionDate: initialDate
}: RecordingInterfaceProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [bulletPoints, setBulletPoints] = useState<string[]>([]);
  const [sessionTitle, setSessionTitle] = useState(initialTitle || "");
  const [sessionDate, setSessionDate] = useState(initialDate || new Date().toISOString().split("T")[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [eingewoehnungData, setEingewoehnungData] = useState<EingewoehnungData>({
    session_date: new Date().toISOString().split("T")[0],
    eingewoehnung_gefuehrt_von: "",
    eingewoehnung_gefuehrt_mit: "",
    eingewoehnung_themen: "",
    eingewoehnung_absprachen: "",
    eingewoehnung_nachbesprechung: "",
    eingewoehnung_folgetermin: ""
  });

  const timerRef = useRef<NodeJS.Timer | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const selectedMimeTypeRef = useRef<string>("");

  const { data: allPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: () => base44.entities.Patient.list(),
    initialData: [] as Patient[]
  });

  const patient = allPatients.find(p => p.id === selectedPatient);
  const patientName = patient ? `${patient.first_name} ${patient.last_name}` : "";

  const createDocMutation = useMutation({
    mutationFn: (data: any) => base44.entities.Documentation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentation"] });
      navigate(createPageUrl("Documentation"));
    }
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const cleanupRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  const startRecording = async () => {
    try {
      setError(null);
      setTranscript("");
      setBulletPoints([]);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 44100 }
      });

      streamRef.current = stream;

      const mimeTypes = ["audio/webm", "audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4"];
      const selectedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));
      if (!selectedMimeType) throw new Error("Kein unterstütztes Audio-Format gefunden");

      selectedMimeTypeRef.current = selectedMimeType;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = e => e.data.size > 0 && audioChunksRef.current.push(e.data);

      mediaRecorder.onstart = () => {
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      };

      mediaRecorder.onstop = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        setIsRecording(false);

        if (audioChunksRef.current.length > 0) await processAudio();
      };

      mediaRecorder.onerror = e => {
        setError("Aufnahme-Fehler: " + (e.error?.message || "Unbekannter Fehler"));
        cleanupRecording();
      };

      mediaRecorder.start(1000);
    } catch (err: any) {
      setError(err.message || "Fehler beim Starten der Aufnahme");
      cleanupRecording();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else cleanupRecording();
  };

  const processAudio = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: selectedMimeTypeRef.current });
      if (audioBlob.size < 1000) throw new Error("Aufnahme zu kurz. Mindestens 2 Sekunden erforderlich.");

      const ext = audioBlob.type.includes("webm") ? "webm" : audioBlob.type.includes("ogg") ? "ogg" : audioBlob.type.includes("mp4") ? "mp4" : "wav";
      const audioFile = new File([audioBlob], `recording.${ext}`, { type: audioBlob.type });
      const { file_url } = await base44.integrations.Core.UploadFile({ file: audioFile });
      const response = await base44.functions.invoke("processDictation", { audio_url: file_url });
      const data = response.data;

      if (!data.success) throw new Error(data.error || "Transkription fehlgeschlagen");

      const finalTranscript = data.transcription || data.transcript;
      if (!finalTranscript) throw new Error("Keine Transkription erhalten");

      setTranscript(finalTranscript);
      setBulletPoints(data.bulletPoints || []);

      if (documentationType === "eingewoehnungsgespraech") {
        const formattedBulletPoints = data.bulletPoints?.length ? data.bulletPoints.map((p: string) => `• ${p}`).join("\n") : finalTranscript;
        setEingewoehnungData(prev => ({ ...prev, eingewoehnung_themen: formattedBulletPoints }));
      }

      setError(null);
    } catch (err: any) {
      setError(err.message || "Verarbeitung fehlgeschlagen");
    } finally {
      setIsProcessing(false);
      audioChunksRef.current = [];
    }
  };

  const handleSave = () => {
    const formattedContent = bulletPoints.length ? bulletPoints.map(p => `• ${p}`).join("\n") : transcript;

    const payload = documentationType === "eingewoehnungsgespraech" 
      ? { 
          patient_id: selectedPatient,
          documentation_type: documentationType,
          session_title: `Eingewöhnungsgespräch - ${patientName}`,
          session_date: eingewoehnungData.session_date,
          recording_method: "live_recording",
          content: JSON.stringify(eingewoehnungData),
          status: "completed",
          consent_given: consentGiven,
          duration_minutes: Math.floor(recordingTime / 60),
          ...eingewoehnungData
        }
      : {
          patient_id: selectedPatient,
          documentation_type: documentationType,
          session_title: sessionTitle,
          session_date: sessionDate,
          recording_method: "live_recording",
          content: formattedContent,
          status: "completed",
          consent_given: consentGiven,
          duration_minutes: Math.floor(recordingTime / 60),
          full_transcription: transcript
        };

    createDocMutation.mutate(payload);
  };

  // --- Render ---
  if (documentationType === "eingewoehnungsgespraech" && transcript && !isRecording) {
    return (
      <div className="space-y-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Eingewöhnungsgespräch - Aufnahme abgeschlossen</CardTitle>
            <p className="text-sm text-slate-600 mt-1">Bitte vervollständigen Sie die folgenden Felder</p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <EingewoehnungsForm formData={eingewoehnungData} setFormData={setEingewoehnungData} patientName={patientName} />
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => navigate(createPageUrl("Documentation"))}>Abbrechen</Button>
              <Button onClick={handleSave} disabled={createDocMutation.isPending || !eingewoehnungData.eingewoehnung_gefuehrt_von} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {createDocMutation.isPending ? "Wird gespeichert..." : "Dokumentation speichern"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle>Live-Aufnahme</CardTitle>
          <p className="text-sm text-slate-600 mt-1">Einwilligung erteilt • DSGVO-konforme Aufzeichnung</p>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">

          {/* Session Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session_title">Sitzungstitel *</Label>
              <Input id="session_title" value={sessionTitle} onChange={e => setSessionTitle(e.target.value)} disabled={isRecording} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session_date">Sitzungsdatum *</Label>
              <Input id="session_date" type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)} disabled={isRecording} />
            </div>
          </div>

          {/* Recording Controls */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 flex flex-col items-center gap-6">
            {!isRecording && !transcript && (
              <>
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                  <Mic className="w-12 h-12 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Bereit zur Aufnahme</h3>
                <Button onClick={startRecording} disabled={!sessionTitle && documentationType !== "eingewoehnungsgespraech"} className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg" size="lg">
                  <Mic className="w-5 h-5 mr-2" /> Aufnahme starten
                </Button>
              </>
            )}

            {isRecording && (
              <>
                <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                  <Mic className="w-12 h-12 text-white" />
                </div>
                <Badge className="bg-red-600 text-white mb-3 px-4 py-1">● AUFNAHME LÄUFT</Badge>
                <div className="flex items-center gap-2 text-2xl font-mono font-bold text-slate-900">
                  <Clock className="w-6 h-6" /> {formatTime(recordingTime)}
                </div>
                {isProcessing && <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mt-2" />}
                {error && <Alert variant="destructive"><AlertDescription>❌ {error}</AlertDescription></Alert>}
                <Button onClick={stopRecording} variant="outline" className="border-slate-300 px-8 py-6 text-lg" size="lg">
                  <Square className="w-5 h-5 mr-2" /> Aufnahme stoppen
                </Button>
              </>
            )}

          </div>

          {/* Transcript Editor */}
          {transcript && !isRecording && documentationType !== "eingewoehnungsgespraech" && (
            <>
              <Label htmlFor="transcript">Transkript</Label>
              <Textarea id="transcript" value={transcript} onChange={e => setTranscript(e.target.value)} placeholder="Transkript wird hier erscheinen..." className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 min-h-64 font-mono text-sm" />
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => navigate(createPageUrl("Documentation"))}>Abbrechen</Button>
                <Button onClick={handleSave} disabled={!sessionTitle || !transcript || createDocMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" /> {createDocMutation.isPending ? "Wird gespeichert..." : "Dokumentation speichern"}
                </Button>
              </div>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
