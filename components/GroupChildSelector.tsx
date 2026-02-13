"use client";

import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, User, ArrowLeft, Check } from "lucide-react";

export default function GroupChildSelector({ selectedPatient, onSelectPatient }) {
  const [selectedGroup, setSelectedGroup] = useState(null);

  const { data: gruppen } = useQuery({
    queryKey: ['gruppen'],
    queryFn: () => base44.entities.Gruppe.list(),
    initialData: [],
  });

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list('-created_date'),
    initialData: [],
  });

  const filteredPatients = selectedGroup 
    ? patients.filter(p => p.gruppe_id === selectedGroup)
    : [];

  const selectedPatientData = patients.find(p => p.id === selectedPatient);
  const selectedGroupData = gruppen.find(g => g.id === selectedGroup);

  // If patient is already selected, show compact view
  if (selectedPatient && selectedPatientData) {
    return (
      <Card className="border-slate-200 shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Ausgewähltes Kind</p>
                <p className="font-semibold text-slate-900">
                  {selectedPatientData.first_name} {selectedPatientData.last_name}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                onSelectPatient(null);
                setSelectedGroup(null);
              }}
            >
              Ändern
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 1: Group Selection
  if (!selectedGroup) {
    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Gruppe auswählen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gruppen.map((gruppe) => {
            const childCount = patients.filter(p => p.gruppe_id === gruppe.id).length;
            return (
              <Card
                key={gruppe.id}
                className="border-2 border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => setSelectedGroup(gruppe.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all">
                    <Users className="w-7 h-7 text-blue-700" />
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {gruppe.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {childCount} {childCount === 1 ? 'Kind' : 'Kinder'}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Step 2: Child Selection within Group
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedGroup(null)}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Zurück
        </Button>
        <h2 className="text-xl font-semibold text-slate-900">
          {selectedGroupData?.name} - Kind auswählen
        </h2>
      </div>
      
      {filteredPatients.length === 0 ? (
        <Card className="border-slate-200 border-dashed">
          <CardContent className="py-12 text-center">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Keine Kinder in dieser Gruppe</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className={`border-2 transition-all duration-200 cursor-pointer group h-[120px] flex flex-col ${
                selectedPatient === patient.id 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : 'border-slate-200 hover:border-blue-400 hover:shadow-lg'
              }`}
              onClick={() => onSelectPatient(patient.id)}
            >
              <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                  selectedPatient === patient.id
                    ? 'bg-blue-500'
                    : 'bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300'
                }`}>
                  {selectedPatient === patient.id ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-blue-700" />
                  )}
                </div>
                <h3 className={`font-semibold text-center text-sm transition-colors ${
                  selectedPatient === patient.id ? 'text-blue-700' : 'text-slate-900 group-hover:text-blue-700'
                }`}>
                  {patient.first_name} {patient.last_name}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}