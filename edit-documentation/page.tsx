"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Save, FileDown, Printer, Trash2, ChevronDown, Mic } from "lucide-react";

export default function EditDocumentation() {
  const [docId, setDocId] = useState<string | null>(null);
  const [doc, setDoc] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef(null);
  const [patients, setPatients] = useState<any[]>([]);

  // Get ID from URL on client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("id");
      console.log("URL ID parameter:", id);
      setDocId(id);
    }
  }, []);

  // Load patients for display
  useEffect(() => {
    fetch("http://localhost:4000/api/patients")
      .then(res => res.json())
      .then(setPatients)
      .catch(err => console.error("Fehler beim Laden der Patienten:", err));
  }, []);

  // Load documentation from backend
  useEffect(() => {
    if (!docId) {
      console.log("No docId set yet");
      return;
    }

    const fetchDocumentation = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Fetching documentation with ID:", docId);

        // Fetch documentation
        const docRes = await fetch(
          `http://localhost:4000/api/documentation?documentation_id=${docId}`
        );

        if (!docRes.ok) {
          throw new Error(`API Error: ${docRes.status}`);
        }

        const docDataArray = await docRes.json();
        console.log("Fetched data:", docDataArray);

        if (!Array.isArray(docDataArray) || docDataArray.length === 0) {
          throw new Error("Dokumentation nicht gefunden");
        }

        // Finde das Dokument mit der exakten ID
        const docData = docDataArray.find(doc => String(doc.documentation_id).trim() === String(docId).trim()) || docDataArray[0];

        console.log("Selected document:", docData);
        setDoc(docData);

        // Fetch patient data
        if (docData.patient_id) {
          const patientRes = await fetch(
            `http://localhost:4000/api/patients/${docData.patient_id}`
          );
          if (patientRes.ok) {
            const patientData = await patientRes.json();
            setPatient(patientData);
          }
        }

        // Initialize form data with proper date formatting
        let formattedDate = "";
        if (docData.session_date) {
          const dateObj = new Date(docData.session_date);
          formattedDate = dateObj.toISOString().split('T')[0];
        }

        // Parse content if it's a string
        let parsedContent = docData.content;
        if (typeof docData.content === 'string') {
          try {
            parsedContent = JSON.parse(docData.content);
          } catch (e) {
            parsedContent = { raw_content: docData.content };
          }
        }

        setFormData({
          session_title: docData.session_title || "",
          session_date: formattedDate,
          content: parsedContent || {},
          status: docData.status || "draft",
          full_transcription: docData.full_transcription || "",
          documentation_type: docData.documentation_type || "",
          patient_id: docData.patient_id || null,
        });

        console.log("Form data initialized:", {
          session_title: docData.session_title,
          session_date: formattedDate,
          documentation_type: docData.documentation_type,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Fehler beim Laden der Daten"
        );
        console.error("Fehler:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentation();
  }, [docId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!docId) return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/documentation/${docId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        throw new Error("Fehler beim Aktualisieren des Status");
      }

      setFormData({ ...formData, status: newStatus });
      setStatusMenuOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern");
      console.error("Fehler:", err);
    }
  };

  const handleSave = async () => {
    if (!docId || !formData) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch(
        `http://localhost:4000/api/documentation/${docId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_title: formData.session_title,
            session_date: formData.session_date,
            content: formData.content,
            status: formData.status,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Fehler beim Speichern");
      }

      alert("Änderungen gespeichert!");
      window.location.href = doc?.patient_id
        ? `/patient-details?id=${doc.patient_id}`
        : "/documentation";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern");
      console.error("Fehler:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!docId) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch(
        `http://localhost:4000/api/documentation/${docId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Fehler beim Löschen");
      }

      alert("Dokumentation gelöscht!");
      window.location.href = "/documentation";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Löschen");
      console.error("Fehler:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportPdf = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      archived: "bg-slate-100 text-slate-800 border-slate-200",
    };
    return colors[status] || colors.draft;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Entwurf",
      completed: "Abgeschlossen",
      archived: "Archiviert",
    };
    return labels[status] || status;
  };

  // Show loading while data is being loaded
  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="text-slate-600">Lädt...</div>
      </div>
    );
  }

  if (error || !formData || !doc) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            {error || "Dokumentation konnte nicht geladen werden"}
          </p>
          <p className="text-red-600 text-sm mt-2">
            Debug Info - DocId: {docId}
          </p>
        </div>
      </div>
    );
  }

  const documentationType = formData.documentation_type;
  const content = formData.content || {};

  // Helper function to update content
  const updateContent = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }));
  };

  return (
    <div className="p-6 md:p-8 max-w-full mx-auto">
      <button
        onClick={() => window.location.href = "/documentation"}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors print:hidden"
      >
        <ArrowLeft className="w-4 h-4" />
        Zurück
      </button>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-6">
        <div className="border-b border-slate-100 p-6 print:border-none">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {formData.session_title}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {new Date(formData.session_date).toLocaleDateString("de-DE")} •
                Kind:{" "}
                {patient
                  ? `${patient.first_name} ${patient.last_name}`
                  : "Nicht zugeordnet"}
              </p>
            </div>

            {/* Status Dropdown */}
            <div className="relative print:hidden">
              <button
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-colors cursor-pointer hover:opacity-80 ${getStatusColor(formData.status)}`}
              >
                {getStatusLabel(formData.status)}
                <ChevronDown className="w-3 h-3" />
              </button>

              {statusMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setStatusMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                    <button
                      onClick={() => handleStatusChange("draft")}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Entwurf
                    </button>
                    <button
                      onClick={() => handleStatusChange("completed")}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Abgeschlossen
                    </button>
                    <button
                      onClick={() => handleStatusChange("archived")}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Archiviert
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid: Form + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form (1 column) */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-lg p-6 sticky top-6 max-h-[calc(100vh-60px)] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Bearbeiten
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Common Fields */}
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Sitzungstitel
                </label>
                <input
                  type="text"
                  value={formData.session_title}
                  onChange={(e) =>
                    setFormData({ ...formData, session_title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Sitzungsdatum
                </label>
                <input
                  type="date"
                  value={formData.session_date}
                  onChange={(e) =>
                    setFormData({ ...formData, session_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            <hr className="my-6" />

            {/* Type-specific Forms */}
            {documentationType === 'eingewoehnungsgespraech' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Geführt von
                  </label>
                  <input
                    type="text"
                    value={content.gefuehrt_von || ""}
                    onChange={(e) => updateContent('gefuehrt_von', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Geführt mit
                  </label>
                  <input
                    type="text"
                    value={content.gefuehrt_mit || ""}
                    onChange={(e) => updateContent('gefuehrt_mit', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Besprochene Themen
                  </label>
                  <textarea
                    value={content.themen || ""}
                    onChange={(e) => updateContent('themen', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Absprachen
                  </label>
                  <textarea
                    value={content.absprachen || ""}
                    onChange={(e) => updateContent('absprachen', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Nachbesprechung
                  </label>
                  <input
                    type="text"
                    value={content.nachbesprechung || ""}
                    onChange={(e) => updateContent('nachbesprechung', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Folgetermin
                  </label>
                  <input
                    type="date"
                    value={content.folgetermin || ""}
                    onChange={(e) => updateContent('folgetermin', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            )}

            {documentationType === 'leg_gespraech' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Gesprächspartner
                  </label>
                  <input
                    type="text"
                    value={content.gespraechspartner || ""}
                    onChange={(e) => updateContent('gespraechspartner', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Besprochene Themen
                  </label>
                  <textarea
                    value={content.besprochene_themen || ""}
                    onChange={(e) => updateContent('besprochene_themen', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Vereinbarungen
                  </label>
                  <textarea
                    value={content.vereinbarungen || ""}
                    onChange={(e) => updateContent('vereinbarungen', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Nächste Schritte
                  </label>
                  <textarea
                    value={content.naechste_schritte || ""}
                    onChange={(e) => updateContent('naechste_schritte', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            )}

            {documentationType === 'elterngespraech' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Gesprächspartner
                  </label>
                  <input
                    type="text"
                    value={content.gespraechspartner || ""}
                    onChange={(e) => updateContent('gespraechspartner', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Anlass des Gesprächs
                  </label>
                  <input
                    type="text"
                    value={content.anlass || ""}
                    onChange={(e) => updateContent('anlass', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Besprochene Themen
                  </label>
                  <textarea
                    value={content.themen || ""}
                    onChange={(e) => updateContent('themen', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            )}

            {documentationType === 'vsg_beobachtungsbogen' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Bemerkungen
                  </label>
                  <textarea
                    value={content.remarks || ""}
                    onChange={(e) => updateContent('remarks', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={() => window.location.href = "/documentation"}
                className="flex-1 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? "Wird gespeichert..." : "Speichern"}
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="px-4 py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Preview (2 columns) */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 bg-white border border-slate-300 rounded-lg overflow-hidden shadow-lg">
            {/* Preview Header */}
            <div className="bg-slate-50 p-4 border-b border-slate-300 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900">📄 Vorschau PDF</h3>
              <button
                onClick={handleExportPdf}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                ⬇️ Als PDF
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
                  {/* Header */}
                  <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {formData.session_title}
                      </h1>
                      <p className="text-sm text-slate-500 mt-1">Dokumentation & Entwicklung</p>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <p>Musterstraße 123</p>
                      <p>12345 Musterstadt</p>
                      <p>Tel: 0123-456789</p>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-500 block text-xs uppercase">Kind</span>
                        <span className="font-bold text-slate-900">
                          {patient ? `${patient.first_name} ${patient.last_name}` : "Nicht zugeordnet"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs uppercase">Dokumenttyp</span>
                        <span className="font-semibold text-slate-900">{documentationType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="flex-grow space-y-6">
                    {/* Eingewöhnungsgespräch */}
                    {documentationType === 'eingewoehnungsgespraech' && (
                      <>
                        <div className="border-b pb-4">
                          <h2 className="text-xl font-bold text-slate-800">Eingewöhnungsgespräch</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">Geführt von</h3>
                            <p>{content.gefuehrt_von || "-"}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">Geführt mit</h3>
                            <p>{content.gefuehrt_mit || "-"}</p>
                          </div>
                        </div>
                        {content.themen && (
                          <div>
                            <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-blue-500 pl-3">
                              Besprochene Themen
                            </h3>
                            <div className="bg-slate-50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                              {content.themen}
                            </div>
                          </div>
                        )}
                        {content.absprachen && (
                          <div>
                            <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-green-500 pl-3">
                              Absprachen
                            </h3>
                            <div className="bg-slate-50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                              {content.absprachen}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* LEG-Gespräch */}
                    {documentationType === 'leg_gespraech' && (
                      <>
                        <div className="border-b pb-4">
                          <h2 className="text-xl font-bold text-slate-800">LEG-Gesprächsprotokoll</h2>
                        </div>
                        {content.gespraechspartner && (
                          <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">Gesprächspartner</h3>
                            <p>{content.gespraechspartner}</p>
                          </div>
                        )}
                        {content.besprochene_themen && (
                          <div>
                            <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-blue-500 pl-3">
                              Themen
                            </h3>
                            <div className="bg-slate-50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                              {content.besprochene_themen}
                            </div>
                          </div>
                        )}
                        {content.vereinbarungen && (
                          <div>
                            <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-green-500 pl-3">
                              Vereinbarungen
                            </h3>
                            <div className="bg-slate-50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                              {content.vereinbarungen}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Elterngespräch */}
                    {documentationType === 'elterngespraech' && (
                      <>
                        <div className="border-b pb-4">
                          <h2 className="text-xl font-bold text-slate-800">Elterngespräch</h2>
                        </div>
                        {content.gespraechspartner && (
                          <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">Gesprächspartner</h3>
                            <p>{content.gespraechspartner}</p>
                          </div>
                        )}
                        {content.anlass && (
                          <div>
                            <h3 className="font-bold text-slate-800 mb-2">Anlass</h3>
                            <p className="text-sm">{content.anlass}</p>
                          </div>
                        )}
                        {content.themen && (
                          <div>
                            <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-blue-500 pl-3">
                              Besprochene Themen
                            </h3>
                            <div className="bg-slate-50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                              {content.themen}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* VSG Beobachtungsbogen */}
                    {documentationType === 'vsg_beobachtungsbogen' && (
                      <>
                        <div className="border-b pb-4">
                          <h2 className="text-xl font-bold text-slate-800">VSG Beobachtungsbogen</h2>
                        </div>
                        {content.remarks && (
                          <div>
                            <h3 className="font-bold text-slate-800 mb-2 border-l-4 border-purple-500 pl-3">
                              Bemerkungen
                            </h3>
                            <div className="bg-slate-50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                              {content.remarks}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-400">
                    <p>Erstellt am: {new Date().toLocaleDateString('de-DE')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Dokumentation löschen?
            </h2>
            <p className="text-slate-600 mb-6">
              Möchten Sie diese Dokumentation wirklich löschen? Diese Aktion
              kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Wird gelöscht..." : "Löschen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}