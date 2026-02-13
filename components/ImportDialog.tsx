import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, FileText, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ImportDialog({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [selectedPatient, setSelectedPatient] = useState("");
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list('-created_date'),
    initialData: [],
  });

  const createDocMutation = useMutation({
    mutationFn: (data) => base44.entities.Documentation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentation'] });
    },
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      const allowedExtensions = ['csv', 'docx', 'txt', 'pdf'];
      
      if (allowedExtensions.includes(fileExtension)) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Bitte wählen Sie eine gültige Datei (CSV, DOCX, TXT oder PDF)');
        setFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!selectedPatient || !file) {
      setError('Bitte wählen Sie einen Patienten und eine Datei aus');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setImportResult(null);

    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Extract data from file using AI
      const extractionResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            documentations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  session_title: { type: "string" },
                  session_date: { type: "string" },
                  content: { type: "string" },
                  documentation_type: { 
                    type: "string",
                    enum: ["leg_gespraech", "eingewoehnungsgespraech", "vsg_beobachtungsbogen"]
                  }
                }
              }
            }
          }
        }
      });

      if (extractionResult.status === "error") {
        setError(`Fehler beim Verarbeiten der Datei: ${extractionResult.details}`);
        setIsProcessing(false);
        return;
      }

      const documentations = extractionResult.output?.documentations || [];

      if (documentations.length === 0) {
        setError('Keine Dokumentationen in der Datei gefunden');
        setIsProcessing(false);
        return;
      }

      // Create documentation entries
      const patientName = patients.find(p => p.id === selectedPatient);
      const patientDisplayName = patientName ? `${patientName.first_name} ${patientName.last_name}` : '';

      for (const doc of documentations) {
        await createDocMutation.mutateAsync({
          patient_id: selectedPatient,
          documentation_type: doc.documentation_type || "leg_gespraech",
          session_title: doc.session_title || `Import - ${file.name}`,
          session_date: doc.session_date || new Date().toISOString().split('T')[0],
          recording_method: "file_upload",
          content: doc.content || "",
          status: "draft",
          uploaded_file_url: file_url
        });
      }

      setImportResult({
        count: documentations.length,
        patientName: patientDisplayName
      });

      // Reset form after 2 seconds
      setTimeout(() => {
        setSelectedPatient("");
        setFile(null);
        setImportResult(null);
        onClose();
      }, 2000);

    } catch (err) {
      setError(`Fehler beim Import: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setSelectedPatient("");
      setFile(null);
      setError(null);
      setImportResult(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Dokumentationen importieren
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label htmlFor="patient">Patient auswählen *</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient} disabled={isProcessing}>
              <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Patient auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name}
                    {patient.patient_id && ` (ID: ${patient.patient_id})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Datei hochladen *</Label>
            <Input
              id="file"
              type="file"
              accept=".csv,.docx,.txt,.pdf"
              onChange={handleFileChange}
              disabled={isProcessing}
              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500">
              Unterstützte Formate: CSV, DOCX, TXT, PDF
            </p>
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-slate-700 flex-1">{file.name}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {importResult && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Erfolgreich {importResult.count} Dokumentation(en) für {importResult.patientName} importiert!
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedPatient || !file || isProcessing || importResult}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wird importiert...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Importieren
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}