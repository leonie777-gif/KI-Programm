import React, { useState } from "react";
import { ChevronDown, ChevronUp, Save } from "lucide-react";

export default function VSGAssessmentForm({
  formData: initialFormData = {},
  setFormData: externalSetFormData,
  patientName: propPatientName = "",
  patientDOB = "",
  patients = [],
  selectedPatientId = "",
  onPatientChange,
  onSave
}) {
  // Immer lokalen State verwenden für Bearbeitungen
  const [formData, setFormData] = useState(initialFormData);
  const [expandedTranscription, setExpandedTranscription] = useState(false);

  // Berechne den Patientennamen aus der Auswahl oder verwende die übergebene Prop
  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const patientName = selectedPatient
    ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
    : propPatientName;

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      vsg_patient_id: selectedPatientId,
      vsg_patient_name: patientName
    };
    
    console.log('Saving form data:', dataToSave);
    
    if (onSave) {
      onSave(dataToSave);
    } else {
      alert('Formular gespeichert!\n\n' + JSON.stringify(dataToSave, null, 2));
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Selection */}
      {patients && patients.length > 0 && onPatientChange && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold">Kind auswählen</h3>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              <label htmlFor="patient-select" className="block text-sm font-medium text-gray-700">Kind:</label>
              <select
                id="patient-select"
                value={selectedPatientId || ""}
                onChange={(e) => {
                  onPatientChange(e.target.value);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Kind auswählen...</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold">Persönliche Informationen</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="vsg_name" className="block text-sm font-medium text-gray-700">Name:</label>
              <input
                id="vsg_name"
                type="text"
                value={patientName || "Kein Patient ausgewählt"}
                disabled
                className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="vsg_geburtsdatum" className="block text-sm font-medium text-gray-700">Geburtsdatum:</label>
              <input
                id="vsg_geburtsdatum"
                type="date"
                value={formData.vsg_geburtsdatum || ""}
                onChange={(e) => handleInputChange('vsg_geburtsdatum', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="vsg_geschlecht" className="block text-sm font-medium text-gray-700">Geschlecht:</label>
              <input
                id="vsg_geschlecht"
                type="text"
                value={formData.vsg_geschlecht || ""}
                onChange={(e) => handleInputChange('vsg_geschlecht', e.target.value)}
                placeholder="z.B. männlich, weiblich, divers"
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="vsg_therapien" className="block text-sm font-medium text-gray-700">Therapien:</label>
              <input
                id="vsg_therapien"
                type="text"
                value={formData.vsg_therapien || ""}
                onChange={(e) => handleInputChange('vsg_therapien', e.target.value)}
                placeholder="z.B. Logopädie, Ergotherapie"
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="vsg_therapien_seit" className="block text-sm font-medium text-gray-700">Seit:</label>
              <input
                id="vsg_therapien_seit"
                type="text"
                value={formData.vsg_therapien_seit || ""}
                onChange={(e) => handleInputChange('vsg_therapien_seit', e.target.value)}
                placeholder="z.B. 01/2023"
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Categories */}
      {Object.entries(categories).map(([categoryKey, category]) => (
        <div key={categoryKey} className="bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="bg-blue-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold">{category.title}</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {category.items.map((item, itemIndex) => {
                const selectedValue = getAssessmentValue(categoryKey, itemIndex);
                const sonstigesText = getSonstigesText(categoryKey, itemIndex);

                return (
                  <div key={itemIndex} className="space-y-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <p className="font-medium text-slate-900">{item}</p>
                    <div className="flex flex-wrap gap-3">
                      {likertOptions.map((option) => {
                        const isChecked = selectedValue === option.value;
                        return (
                          <label
                            key={option.value}
                            className={`flex items-center space-x-2 cursor-pointer px-3 py-2 rounded transition-colors border ${
                              isChecked 
                                ? 'bg-blue-100 border-blue-300' 
                                : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`${categoryKey}-${itemIndex}`}
                              value={option.value}
                              checked={isChecked}
                              onChange={(e) => {
                                handleAssessmentChange(categoryKey, itemIndex, e.target.value);
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-sm text-gray-700 cursor-pointer">{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                   
                    {selectedValue === "sonstiges" && (
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder="Bitte spezifizieren..."
                          value={sonstigesText}
                          onChange={(e) => handleSonstigesTextChange(categoryKey, itemIndex, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {/* Additional Remarks */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold">Sonstige Bemerkungen</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <label htmlFor="vsg_bemerkungen" className="block text-sm font-medium text-gray-700">Bemerkungen</label>
            <textarea
              id="vsg_bemerkungen"
              value={formData.vsg_bemerkungen || ""}
              onChange={(e) => handleInputChange('vsg_bemerkungen', e.target.value)}
              placeholder="Weitere Bemerkungen oder Beobachtungen..."
              rows={6}
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
           
            {formData.vsg_bemerkungen_transcription && (
              <div className="border border-slate-200 bg-slate-50 rounded-lg p-4">
                <button
                  type="button"
                  onClick={() => setExpandedTranscription(!expandedTranscription)}
                  className="w-full flex justify-between items-center text-sm font-medium text-slate-700 hover:text-slate-900 mb-2 focus:outline-none"
                >
                  <span>Vollständige Transkription</span>
                  {expandedTranscription ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
               
                {expandedTranscription && (
                  <textarea
                    value={formData.vsg_bemerkungen_transcription || ""}
                    onChange={(e) => handleInputChange('vsg_bemerkungen_transcription', e.target.value)}
                    rows={8}
                    className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-0 bg-white border-t-2 border-slate-200 pt-4 pb-4 shadow-lg rounded-t-lg">
        <div className="flex justify-end items-center">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium shadow-sm"
          >
            <Save className="w-5 h-5" />
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}