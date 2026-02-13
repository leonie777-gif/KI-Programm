import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, FileText, Mic, Upload, User } from "lucide-react";
import VoiceDictationButton from "./VoiceDictationButton";
import EingewoehnungsForm from "./EingewoehnungsForm";
import VSGForm from "./VSGAssessmentForm";
import A4DocumentPreview from "./A4DocumentPreview";
import LEGEditingForm from "./LEGEditingForm";
import EingewoehnungEditingForm from "./EingewoehnungEditingForm";

export default function ManualInputInterface({ selectedPatient: initialPatientId, patients, documentationType, sessionTitle, sessionDate }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || null);
  const [content, setContent] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // For Eingewöhnungsgespräch
  const [eingewoehnungData, setEingewoehnungData] = useState({
    gefuehrt_von: "",
    gefuehrt_mit: "",
    themen: "",
    absprachen: "",
    nachbesprechung: "",
    folgetermin: ""
  });

  // For LEG
  const [legData, setLEGData] = useState({
    gespraechspartner: "",
    anlass: "",
    besprochene_themen: "",
    vereinbarungen: "",
    naechste_schritte: ""
  });

  // For VSG
  const [vsgData, setVSGData] = useState({
    vsg_geburtsdatum: "",
    vsg_geschlecht: "",
    vsg_therapien: "",
    vsg_therapien_seit: "",
    vsg_assessments: {},
    vsg_bemerkungen: ""
  });

  const patient = patients?.find(p => p.id === selectedPatientId);
  const patientName = patient ? `${patient.first_name} ${patient.last_name}` : "";
  const patientDOB = patient?.date_of_birth || "";

  const createDocumentationMutation = useMutation({
    mutationFn: (data) => base44.entities.Documentation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentation'] });
      navigate(createPageUrl("Documentation"));
    },
  });

  const handleSave = () => {
    let documentationData = {
      patient_id: selectedPatientId,
      documentation_type: documentationType,
      session_title: sessionTitle,
      session_date: sessionDate,
      recording_method: "manual_input",
      status: "draft",
      uploaded_file_url: uploadedFileUrl,
    };

    if (documentationType === 'eingewoehnungsgespraech') {
      documentationData = {
        ...documentationData,
        eingewoehnung_gefuehrt_von: eingewoehnungData.gefuehrt_von,
        eingewoehnung_gefuehrt_mit: eingewoehnungData.gefuehrt_mit,
        eingewoehnung_themen: eingewoehnungData.themen,
        eingewoehnung_absprachen: eingewoehnungData.absprachen,
        eingewoehnung_nachbesprechung: eingewoehnungData.nachbesprechung,
        eingewoehnung_folgetermin: eingewoehnungData.folgetermin,
        content: JSON.stringify(eingewoehnungData)
      };
    } else if (documentationType === 'vsg_beobachtungsbogen') {
      documentationData = {
        ...documentationData,
        vsg_geburtsdatum: vsgData.vsg_geburtsdatum,
        vsg_geschlecht: vsgData.vsg_geschlecht,
        vsg_therapien: vsgData.vsg_therapien,
        vsg_therapien_seit: vsgData.vsg_therapien_seit,
        vsg_assessments: vsgData.vsg_assessments,
        vsg_bemerkungen: vsgData.vsg_bemerkungen,
        content: JSON.stringify(vsgData)
      };
    } else if (documentationType === 'leg_gespraech') {
      documentationData = {
        ...documentationData,
        content: JSON.stringify(legData)
      };
    } else {
      documentationData = {
        ...documentationData,
        content: content
      };
    }

    createDocumentationMutation.mutate(documentationData);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploadedFileUrl(file_url);
    setIsUploading(false);
  };

  // Split-screen layout for LEG, Eingewöhnungsgespräch, and VSG
  if (documentationType === 'leg_gespraech' || documentationType === 'eingewoehnungsgespraech' || documentationType === 'vsg_beobachtungsbogen') {
    return (
      <div className="h-screen flex flex-col">
        {/* Patient Info Bar */}
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600">Ausgewähltes Kind</p>
              <p className="font-semibold text-slate-900">{patientName || "Kein Kind ausgewählt"}</p>
              {!selectedPatientId && (
                <p className="text-xs text-red-600 mt-1">⚠️ Bitte wählen Sie ein Kind aus</p>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-slate-600">Datum:</span>
              <span className="font-medium text-slate-900">{new Date(sessionDate).toLocaleDateString('de-DE')}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left side - Editing area */}
          <div className="w-1/2 overflow-auto border-r border-slate-200 bg-white">
            <div className="p-6">
              <Card className="border-slate-200">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-xl">
                    {documentationType === 'leg_gespraech' && 'LEG-Gespräch'}
                    {documentationType === 'eingewoehnungsgespraech' && 'Eingewöhnungsgespräch'}
                    {documentationType === 'vsg_beobachtungsbogen' && 'VSG Beobachtungsbogen'}
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    Dokumentation bearbeiten
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  {documentationType === 'leg_gespraech' && (
                    <LEGEditingForm
                      data={legData}
                      onChange={setLEGData}
                    />
                  )}
                  {documentationType === 'eingewoehnungsgespraech' && (
                    <EingewoehnungEditingForm
                      data={eingewoehnungData}
                      onChange={setEingewoehnungData}
                    />
                  )}
                  {documentationType === 'vsg_beobachtungsbogen' && (
                    <VSGForm
                      formData={vsgData}
                      setFormData={setVSGData}
                      patientName={patientName}
                      patientDOB={patientDOB}
                      patients={patients}
                      selectedPatientId={selectedPatientId}
                      onPatientChange={setSelectedPatientId}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right side - A4 Preview */}
          <div className="w-1/2">
            <A4DocumentPreview
              title={sessionTitle}
              date={sessionDate}
              patientName={patientName}
              content={documentationType === 'leg_gespraech' ? legData : documentationType === 'eingewoehnungsgespraech' ? eingewoehnungData : vsgData}
              documentType={documentationType}
            />
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="border-t border-slate-200 bg-white p-4 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("Documentation"))}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSave}
            disabled={createDocumentationMutation.isPending || !selectedPatientId}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {createDocumentationMutation.isPending ? "Wird gespeichert..." : "Speichern"}
          </Button>
        </div>
      </div>
    );
  }

  // Original layout for other types (shouldn't be reached in current implementation)
  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Manuelle Eingabe</CardTitle>
              <p className="text-sm text-slate-600">Dokumentation manuell erstellen</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text">
                <FileText className="w-4 h-4 mr-2" />
                Text
              </TabsTrigger>
              <TabsTrigger value="voice">
                <Mic className="w-4 h-4 mr-2" />
                Sprachdiktat
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="w-4 h-4 mr-2" />
                Datei hochladen
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="content">Dokumentationsinhalt</Label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Geben Sie hier den Inhalt der Dokumentation ein..."
                  className="w-full min-h-[400px] p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </TabsContent>

            <TabsContent value="voice" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 mb-3">
                    Verwenden Sie das Sprachdiktat, um Ihre Dokumentation zu diktieren. 
                    Der Text wird automatisch eingefügt.
                  </p>
                  <VoiceDictationButton
                    onTranscriptionComplete={(text) => setContent(prev => prev + "\n" + text)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dictated_content">Diktierter Inhalt</Label>
                  <textarea
                    id="dictated_content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Der diktierte Text erscheint hier..."
                    className="w-full min-h-[350px] p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-900 mb-3">
                    Laden Sie eine Datei hoch (PDF, Word, Bild), die als Dokumentation gespeichert werden soll.
                  </p>
                  <Input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    disabled={isUploading}
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {uploadedFileUrl && (
                    <p className="text-sm text-green-600 mt-2">✓ Datei erfolgreich hochgeladen</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl("Documentation"))}
        >
          Abbrechen
        </Button>
        <Button
          onClick={handleSave}
          disabled={createDocumentationMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {createDocumentationMutation.isPending ? "Wird gespeichert..." : "Speichern"}
        </Button>
      </div>
    </div>
  );
}