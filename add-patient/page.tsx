"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddPatient() {
  const router = useRouter();

  const [user] = useState({
    full_name: "Demo User",
    email: "demo@example.com",
    einrichtungsart: "kindertagesstaette",
    gruppe: "gruppe-1"
  });
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    patient_id: "",
    gruppe_id: user?.gruppe || "",
    eltern_vorname: "",
    eltern_nachname: "",
    phone: "",
    notes: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isKindertagesstaette = user?.einrichtungsart === 'kindertagesstaette';

  const [gruppen, setGruppen] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/groups")
      .then(res => res.json())
      .then(setGruppen)
      .catch(err => console.error("Fehler beim Laden der Gruppen:", err));
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validierung
      if (!formData.first_name || !formData.last_name) {
        throw new Error("Vorname und Nachname sind erforderlich");
      }

      const res = await fetch("http://localhost:4000/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Fehler beim Erstellen");
      }

      const newPatient = await res.json();
      console.log("Patient erstellt:", newPatient);

      alert("Kind erfolgreich hinzugefügt!");
      
      // Redirect zur Home-Seite nach erfolgreichem Speichern
      router.push("/home");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Fehler beim Speichern";
      setError(errorMsg);
      console.error("Fehler:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/home");
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <button
        onClick={handleCancel}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Zurück zu Kindern
      </button>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            {isKindertagesstaette ? 'Neues Kind' : 'Neuer Patient'}
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            {isKindertagesstaette ? 'Kindinformationen eingeben' : 'Patienteninformationen eingeben'}
          </p>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vorname */}
              <div className="space-y-2">
                <label htmlFor="first_name" className="block text-sm font-medium text-slate-700">
                  Vorname *
                </label>
                <input
                  id="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>
              
              {/* Nachname */}
              <div className="space-y-2">
                <label htmlFor="last_name" className="block text-sm font-medium text-slate-700">
                  Nachname *
                </label>
                <input
                  id="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              {/* Geburtsdatum */}
              <div className="space-y-2">
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-slate-700">
                  Geburtsdatum
                </label>
                <input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              {/* Kind-ID */}
              <div className="space-y-2">
                <label htmlFor="patient_id" className="block text-sm font-medium text-slate-700">
                  {isKindertagesstaette ? 'Kind-ID (optional)' : 'Patienten-ID (optional)'}
                </label>
                <input
                  id="patient_id"
                  type="text"
                  value={formData.patient_id}
                  onChange={(e) => handleInputChange('patient_id', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="z.B. K001 (wird automatisch generiert)"
                />
              </div>

              {/* Gruppe  */}
              {isKindertagesstaette && (
                <div className="space-y-2">
                  <label htmlFor="gruppe_id" className="block text-sm font-medium text-slate-700">
                    Gruppe
                  </label>
                  <select
                    id="gruppe_id"
                    value={formData.gruppe_id}
                    onChange={(e) => handleInputChange('gruppe_id', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="">Gruppe wählen</option>
                    {gruppen.map(gruppe => (
                      <option key={gruppe.gruppe_id} value={gruppe.gruppe_id}>
                        {gruppe.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Vorname Eltern */}
              <div className="space-y-2">
                <label htmlFor="eltern_vorname" className="block text-sm font-medium text-slate-700">
                  Vorname Eltern/Erziehungsberechtigte
                </label>
                <input
                  id="eltern_vorname"
                  type="text"
                  value={formData.eltern_vorname}
                  onChange={(e) => handleInputChange('eltern_vorname', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              {/* Nachname Eltern */}
              <div className="space-y-2">
                <label htmlFor="eltern_nachname" className="block text-sm font-medium text-slate-700">
                  Nachname Eltern/Erziehungsberechtigte
                </label>
                <input
                  id="eltern_nachname"
                  type="text"
                  value={formData.eltern_nachname}
                  onChange={(e) => handleInputChange('eltern_nachname', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              {/* Telefon */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                  Telefon der Eltern/Erziehungsberechtigten
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="z.B. 0151 12345678"
                />
              </div>

              {/* Notizen */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
                  Notizen
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all min-h-24 resize-y"
                  placeholder="Zusätzliche Informationen..."
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Wird gespeichert..." : (isKindertagesstaette ? "Kind speichern" : "Patient speichern")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}