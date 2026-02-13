"use client";

import React, { useState } from "react";
import { User, Shield, Bell, Mail, FileText, BookOpen, Info, Users, ChevronRight } from "lucide-react";

export default function Settings() {
  const [user] = useState({
    full_name: "Demo User",
    email: "demo@example.com",
    einrichtungsart: "kindertagesstaette",
    berufsbezeichnung: "Heilpädagoge/in",
    gruppe: "gruppe-1"
  });

  const [profileData, setProfileData] = useState({
    full_name: user.full_name,
    berufsbezeichnung: user.berufsbezeichnung,
    gruppe: user.gruppe,
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const gruppen = [
    { id: "gruppe-1", name: "Sonnengruppe" },
    { id: "gruppe-2", name: "Mondgruppe" },
    { id: "gruppe-3", name: "Sternengruppe" },
  ];

  const isKindertagesstaette = user?.einrichtungsart === 'kindertagesstaette';

  const handleProfileUpdate = () => {
    setIsUpdating(true);
    console.log("Profil wird aktualisiert:", profileData);
    
    setTimeout(() => {
      setIsUpdating(false);
      alert("Profil erfolgreich aktualisiert");
    }, 1000);
  };

  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      alert("Die Passwörter stimmen nicht überein");
      return;
    }
    if (passwordData.new.length < 8) {
      alert("Das Passwort muss mindestens 8 Zeichen lang sein");
      return;
    }
    
    console.log("Passwort wird geändert");
    alert("Passwort erfolgreich geändert");
    setPasswordData({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Einstellungen</h1>
        <p className="text-slate-600">Verwalten Sie Ihre Kontoeinstellungen und Präferenzen</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Profil</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="full_name" className="block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  id="full_name"
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  placeholder="Ihr vollständiger Name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              {/* Berufsbezeichnung */}
              <div className="space-y-2">
                <label htmlFor="berufsbezeichnung" className="block text-sm font-medium text-slate-700">
                  Berufsbezeichnung
                </label>
                <input
                  id="berufsbezeichnung"
                  type="text"
                  value={profileData.berufsbezeichnung}
                  onChange={(e) => setProfileData({ ...profileData, berufsbezeichnung: e.target.value })}
                  placeholder="z.B. Heilpädagoge, Ergotherapeutin"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              {/* Gruppe */}
              {isKindertagesstaette && (
                <div className="space-y-2">
                  <label htmlFor="gruppe" className="block text-sm font-medium text-slate-700">
                    Meine Gruppe
                  </label>
                  <select
                    id="gruppe"
                    value={profileData.gruppe}
                    onChange={(e) => setProfileData({ ...profileData, gruppe: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="">Gruppe wählen</option>
                    {gruppen.map((gruppe) => (
                      <option key={gruppe.id} value={gruppe.id}>
                        {gruppe.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500">Diese Gruppe wird beim Öffnen der Kinderliste vorausgewählt</p>
                </div>
              )}

              {/* Email (disabled) */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  E-Mail-Adresse
                </label>
                <input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500">Die E-Mail-Adresse kann nicht geändert werden</p>
              </div>

              <button
                onClick={handleProfileUpdate}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Wird gespeichert..." : "Profil speichern"}
              </button>
            </div>

            <div className="border-t border-slate-200 my-6"></div>

            {/* Passwort ändern */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-900">Passwort ändern</h3>
              
              <div className="space-y-2">
                <label htmlFor="current_password" className="block text-sm font-medium text-slate-700">
                  Aktuelles Passwort
                </label>
                <input
                  id="current_password"
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  placeholder="Aktuelles Passwort eingeben"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="new_password" className="block text-sm font-medium text-slate-700">
                  Neues Passwort
                </label>
                <input
                  id="new_password"
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  placeholder="Neues Passwort eingeben"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm_password" className="block text-sm font-medium text-slate-700">
                  Passwort bestätigen
                </label>
                <input
                  id="confirm_password"
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  placeholder="Neues Passwort bestätigen"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Passwort ändern
              </button>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Datenschutz & Sicherheit</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900 mb-1">DSGVO-konform</p>
                <p className="text-sm text-slate-600">
                  Alle Kinderdaten werden gemäß DSGVO verschlüsselt gespeichert und verarbeitet.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support & Rechtliches */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Support & Rechtliches</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-50 transition-colors text-left">
                <Mail className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="font-medium text-slate-900">E-Mail Support</p>
                  <p className="text-sm text-slate-600">support@x.de</p>
                </div>
              </button>

              <div className="border-t border-slate-200 my-3"></div>

              <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-50 transition-colors text-left">
                <Shield className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="font-medium text-slate-900">Datenschutzerklärung</p>
                  <p className="text-sm text-slate-600">DSGVO-Hinweise und Datenschutz</p>
                </div>
              </button>

              <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-50 transition-colors text-left">
                <FileText className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="font-medium text-slate-900">Impressum</p>
                  <p className="text-sm text-slate-600">Rechtliche Informationen</p>
                </div>
              </button>

              <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-50 transition-colors text-left">
                <BookOpen className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="font-medium text-slate-900">Nutzungsbedingungen</p>
                  <p className="text-sm text-slate-600">Allgemeine Geschäftsbedingungen (AGB)</p>
                </div>
              </button>
            </div>

            <div className="border-t border-slate-200 my-6"></div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dies ist ein Pilotprojekt. Die Software befindet sich in der Entwicklung. Alle Daten werden vertraulich behandelt und entsprechend 
                  den geltenden Datenschutzbestimmungen verarbeitet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}