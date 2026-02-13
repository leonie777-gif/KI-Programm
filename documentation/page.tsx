"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, FileText, Calendar, User, Users, Upload, ChevronDown } from "lucide-react";

export default function Documentation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState<string | null>(null);

  const [documentation, setDocumentation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [gruppen, setGruppen] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedGruppe, setSelectedGruppe] = useState("all");

  useEffect(() => {
    fetch("http://localhost:4000/api/groups")
      .then(res => res.json())
      .then(setGruppen)
      .catch(err => console.error("Fehler beim Laden der Gruppen:", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:4000/api/patients")
      .then(res => res.json())
      .then(setPatients)
      .catch(err => console.error("Fehler beim Laden der Patienten:", err));
  }, []);

  useEffect(() => {
  fetch("http://localhost:4000/api/documentation")
    .then(res => res.json())
    .then(data => {
      // Sortiere nach session_date absteigend (neueste zuerst)
      const sortedData = data.sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());
      console.log("Loaded documentation:", sortedData);
      setDocumentation(sortedData);
      setLoading(false);
    })
    .catch(err => {
      console.error("Fehler beim Laden der Dokumentationen:", err);
      setLoading(false);
    });
}, []);



  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.patient_id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : "Kein Patient";
  };

  const getDocumentationTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      leg_gespraech: "LEG-Gespräch",
      eingewoehnungsgespraech: "Eingewöhnungsgespräch",
      vsg_beobachtungsbogen: "VSG Beobachtungsbogen",
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE");
  };

  const getPatientGruppeId = (patientId: string) => {
    const patient = patients.find(p => p.patient_id === patientId);
    return patient?.gruppe_id || null;
  };

  const filteredDocs = documentation.filter((doc) => {
    const matchesSearch = doc.session_title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || doc.status === statusFilter;

    if (selectedGruppe === "all") {
      return matchesSearch && matchesStatus;
    }

    const patientGruppeId = getPatientGruppeId(doc.patient_id);
    const matchesGruppe = patientGruppeId === selectedGruppe;

    return matchesSearch && matchesStatus && matchesGruppe;
  });

  if (loading) {
    return <p className="p-8">Lade Dokumentationen…</p>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Dokumentationen
        </h1>
        <p className="text-slate-600">
          Verwalten Sie alle Ihre Dokumentationen
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Dokumentation suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <a href="/create-documentation">
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg whitespace-nowrap">
              <Plus className="w-4 h-4" />
              Neue Dokumentation
            </button>
          </a>
        </div>

        {/* Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Gruppe Filter */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span className="text-sm font-medium text-slate-700">Gruppe:</span>
            <select
              value={selectedGruppe}
              onChange={(e) => setSelectedGruppe(e.target.value)}
              className="px-3 py-1.5 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            >
              <option value="all">Alle Gruppen</option>
              {gruppen.map((gruppe) => (
                <option key={gruppe.gruppe_id} value={gruppe.gruppe_id}>
                  {gruppe.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {["all", "draft", "completed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {status === "all"
                  ? "Alle"
                  : status === "draft"
                  ? "Entwürfe"
                  : "Abgeschlossen"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Documentation List */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded-lg p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {searchTerm ? "Keine Dokumentationen gefunden" : "Noch keine Dokumentationen"}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDocs.map((doc) => {
            const docId = String(doc.documentation_id).trim();
            console.log(`Rendering doc with ID: ${docId}, Title: ${doc.session_title}`);
            
            return (
              <a
                key={doc.documentation_id}
                href={`/edit-documentation?id=${docId}`}
              >
                <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">
                      {doc.session_title}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {formatDate(doc.session_date)}
                    </span>
                  </div>

                  <div className="text-sm text-slate-600 flex flex-wrap gap-3">
                    {doc.patient_id && (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {getPatientName(doc.patient_id)}
                      </span>
                    )}

                    {doc.documentation_type && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                        {getDocumentationTypeLabel(doc.documentation_type)}
                      </span>
                    )}
                  </div>

                  
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}