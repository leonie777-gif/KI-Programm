import React from "react";
import { Mic, Square, Loader2 } from "lucide-react";


export default function VoiceTranscriptionButton({ onTranscriptionComplete, fieldLabel }) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [recordingTime, setRecordingTime] = React.useState(0);
  
  const mediaRecorderRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);
  const timerRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const selectedMimeTypeRef = React.useRef('');

  const startRecording = async () => {
    try {
      console.log('🎤 Starte Aufnahme...');
      setError(null);
      
      // 1. Mikrofon-Zugriff anfordern
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      console.log('✅ Mikrofon-Zugriff erhalten');
      
      // 2. Unterstützten MIME-Type finden
      const mimeTypes = [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ];
      
      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          console.log('✅ Verwende MIME-Type:', mimeType);
          break;
        }
      }
      
      if (!selectedMimeType) {
        throw new Error('Kein unterstütztes Audio-Format gefunden');
      }
      
      selectedMimeTypeRef.current = selectedMimeType;
      
      // 3. MediaRecorder erstellen
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      // 4. Event Handlers registrieren (VOR start!)
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log('📦 Audio-Chunk:', event.data.size, 'bytes');
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstart = () => {
        console.log('▶️ Aufnahme GESTARTET');
        setIsRecording(true);
        setRecordingTime(0);
        
        // Timer starten (wichtig: erst hier!)
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => {
            const newTime = prev + 1;
            console.log('⏱️ Zeit:', newTime);
            return newTime;
          });
        }, 1000);
      };
      
      mediaRecorder.onstop = async () => {
        console.log('⏹️ Aufnahme GESTOPPT');
        
        // Timer stoppen
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Stream beenden
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        setIsRecording(false);
        
        // Audio verarbeiten
        if (audioChunksRef.current.length > 0) {
          await processAudio();
        } else {
          console.error('❌ Keine Audio-Daten');
          setError('Keine Audio-Daten aufgenommen. Bitte erneut versuchen.');
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder Fehler:', event.error);
        setError('Aufnahme-Fehler: ' + (event.error?.message || 'Unbekannter Fehler'));
        cleanupRecording();
      };
      
      // 5. Aufnahme starten
      console.log('🚀 Starte MediaRecorder...');
      mediaRecorder.start(1000); // Daten alle 1 Sekunde
      
      console.log('MediaRecorder State:', mediaRecorder.state);
      
    } catch (error) {
      console.error('❌ Fehler beim Starten:', error);
      
      if (error.name === 'NotAllowedError') {
        setError('Mikrofonzugriff verweigert. Bitte erlauben Sie den Zugriff in den Browser-Einstellungen.');
      } else if (error.name === 'NotFoundError') {
        setError('Kein Mikrofon gefunden. Bitte schließen Sie ein Mikrofon an.');
      } else {
        setError('Fehler beim Starten: ' + error.message);
      }
      
      cleanupRecording();
    }
  };

  const stopRecording = () => {
    console.log('🛑 Stoppe Aufnahme...');
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      console.warn('⚠️ MediaRecorder ist bereits inaktiv');
      cleanupRecording();
    }
  };

  const cleanupRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  const processAudio = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Audio Blob erstellen
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: selectedMimeTypeRef.current 
      });
      
      console.log('🎵 Audio Blob erstellt:', {
        size: audioBlob.size,
        type: audioBlob.type,
        sizeMB: (audioBlob.size / 1024 / 1024).toFixed(2)
      });

      if (audioBlob.size < 1000) {
        throw new Error('Aufnahme zu kurz oder leer. Bitte mindestens 2 Sekunden sprechen.');
      }

      // FormData erstellen
      const formData = new FormData();
      const fileExtension = audioBlob.type.includes('webm') ? 'webm' : 
                           audioBlob.type.includes('ogg') ? 'ogg' : 
                           audioBlob.type.includes('mp4') ? 'mp4' : 'wav';
      
      console.log('📤 Step 1: Lade Audio-Datei hoch...');
      
      // Step 1: Convert blob to File object
      const audioFile = new File([audioBlob], `recording.${fileExtension}`, { 
        type: audioBlob.type 
      });
      
      // Upload audio file
      const { file_url } = await base44.integrations.Core.UploadFile({
        file: audioFile
      });
      
      console.log('✅ Audio hochgeladen:', file_url);
      console.log('📤 Step 2: Sende zur Transkription...');

      // Step 2: Send file URL to processing function
      console.log('🔧 Payload:', { audio_url: file_url });
      
      const response = await base44.functions.invoke('processDictation', {
        audio_url: file_url
      });

      console.log('📥 Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      const data = response.data;
      console.log('✅ Transkription erhalten:', data);

      if (!data.success) {
        throw new Error(data.error || 'Transkription fehlgeschlagen');
      }

      const { transcription, transcript, bulletPoints } = data;
      const finalTranscript = transcription || transcript;

      if (!finalTranscript) {
        throw new Error('Keine Transkription erhalten');
      }

      console.log('✅ Erfolg:', finalTranscript.substring(0, 100));
      console.log('✅ Stichpunkte erhalten:', bulletPoints);

      onTranscriptionComplete({
        transcription: finalTranscript,
        bulletPoints: bulletPoints || [],
      });

      setError(null);
      
    } catch (error) {
      console.error('❌ Transkriptions-Fehler:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMsg = error.response?.data?.error || error.message || 'Verarbeitung fehlgeschlagen';
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
      audioChunksRef.current = [];
    }
  };

  // Cleanup beim Unmount
  React.useEffect(() => {
    return () => {
      cleanupRecording();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      {!isRecording && !isProcessing && (
        <Button
          type="button"
          onClick={startRecording}
          variant="outline"
          className="border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          <Mic className="w-4 h-4 mr-2" />
          Sprachdiktat starten
        </Button>
      )}
      
      {isRecording && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Square className="w-4 h-4 mr-2" />
              Aufnahme beenden
            </Button>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span className="font-mono text-slate-700">{formatTime(recordingTime)}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">🎤 Sprechen Sie jetzt...</p>
        </div>
      )}
      
      {isProcessing && (
        <div className="space-y-2">
          <Button disabled className="bg-slate-400 cursor-not-allowed">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Wird transkribiert...
          </Button>
          <p className="text-xs text-slate-500">⏳ Transkription läuft, bitte warten...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription className="text-sm whitespace-pre-wrap">
            ❌ {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}