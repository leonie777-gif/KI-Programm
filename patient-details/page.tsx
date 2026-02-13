"use client";


import React, { useState } from "react";
import { Plus, Search, User, Users } from "lucide-react";


export default function Home() {
 const [searchTerm, setSearchTerm] = useState("");
 const [selectedGruppe, setSelectedGruppe] = useState("own");
 const [user] = useState({
   full_name: "Demo User",
   email: "demo@example.com",
   einrichtungsart: "kindertagesstaette",
   gruppe: "gruppe-1"
 });


 // Demo-Daten
 const gruppen = [
   { id: "gruppe-1", name: "Sonnengruppe" },
   { id: "gruppe-2", name: "Mondgruppe" },
   { id: "gruppe-3", name: "Sternengruppe" },
 ];


 const patients = [
   { id: "1", first_name: "Max", last_name: "Mustermann", patient_id: "K001", gruppe_id: "gruppe-1" },
   { id: "2", first_name: "Anna", last_name: "Schmidt", patient_id: "K002", gruppe_id: "gruppe-1" },
   { id: "3", first_name: "Leon", last_name: "Meyer", patient_id: "K003", gruppe_id: "gruppe-2" },
   { id: "4", first_name: "Sophie", last_name: "Weber", patient_id: "K004", gruppe_id: "gruppe-2" },
   { id: "5", first_name: "Paul", last_name: "Wagner", patient_id: "K005", gruppe_id: "gruppe-3" },
   { id: "6", first_name: "Emma", last_name: "Becker", patient_id: "K006", gruppe_id: "gruppe-1" },
 ];


 const isKindertagesstaette = user?.einrichtungsart === 'kindertagesstaette';


 const filteredPatients = patients.filter(patient => {
   const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
   const search = searchTerm.toLowerCase();
   const matchesSearch = fullName.includes(search) || patient.patient_id?.toLowerCase().includes(search);
  
   // Nach Gruppe filtern
   if (selectedGruppe === "all") {
     return matchesSearch;
   } else if (selectedGruppe === "own" && user?.gruppe) {
     return matchesSearch && patient.gruppe_id === user.gruppe;
   } else if (selectedGruppe !== "own") {
     return matchesSearch && patient.gruppe_id === selectedGruppe;
   }
   return matchesSearch;
 });


 const getGruppeName = (gruppeId) => {
   const gruppe = gruppen.find(g => g.id === gruppeId);
   return gruppe?.name || "Keine Gruppe";
 };


 return (
   <div className="p-6 md:p-8 max-w-7xl mx-auto">
     {/* Header Section */}
     <div className="mb-8">
       <h1 className="text-3xl font-bold text-slate-900 mb-2">
         {isKindertagesstaette ? 'Kinder' : 'Patienten'}
       </h1>
       <p className="text-slate-600">
         {isKindertagesstaette
           ? 'Verwalten Sie Ihre Kinderakten und erstellen Sie Dokumentationen'
           : 'Verwalten Sie Ihre Patientenakten und erstellen Sie Dokumentationen'
         }
       </p>
     </div>


     {/* Search and Add Section */}
     <div className="flex flex-col sm:flex-row gap-4 mb-4">
       <div className="relative flex-1">
         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
         <input
           type="text"
           placeholder={isKindertagesstaette ? "Kind suchen..." : "Patient suchen..."}
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
         />
       </div>
       <a href="/add-patient">
         <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors w-full sm:w-auto">
           <Plus className="w-4 h-4" />
           {isKindertagesstaette ? 'Neues Kind' : 'Neuer Patient'}
         </button>
       </a>
     </div>


     {/* Group Filter */}
     {isKindertagesstaette && (
       <div className="mb-6">
         <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
           <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
           <span className="text-sm font-medium text-slate-700">Gruppe:</span>
           <select
             value={selectedGruppe}
             onChange={(e) => setSelectedGruppe(e.target.value)}
             className="px-3 py-1.5 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
           >
             {user?.gruppe && (
               <option value="own">
                 Meine Gruppe ({gruppen.find(g => g.id === user.gruppe)?.name})
               </option>
             )}
             <option value="all">Alle Kinder anzeigen</option>
             {gruppen.map((gruppe) => (
               <option key={gruppe.id} value={gruppe.id}>
                 {gruppe.name}
               </option>
             ))}
           </select>
           {selectedGruppe !== "all" && selectedGruppe !== "own" && (
             <span className="text-xs text-slate-500">
               ({filteredPatients.length} Kinder)
             </span>
           )}
         </div>
       </div>
     )}


     {/* Patient List */}
     {filteredPatients.length === 0 ? (
       <div className="bg-white border border-slate-200 border-dashed rounded-lg p-12">
         <div className="flex flex-col items-center justify-center text-center">
           <User className="w-12 h-12 text-slate-300 mb-4" />
           <h3 className="text-lg font-medium text-slate-900 mb-2">
             {searchTerm
               ? (isKindertagesstaette ? "Keine Kinder gefunden" : "Keine Patienten gefunden")
               : (isKindertagesstaette ? "Noch keine Kinder" : "Noch keine Patienten")
             }
           </h3>
           <p className="text-slate-500 mb-4">
             {searchTerm
               ? "Versuchen Sie einen anderen Suchbegriff"
               : (isKindertagesstaette
                 ? "Fügen Sie Ihr erstes Kind hinzu, um zu beginnen"
                 : "Fügen Sie Ihren ersten Patienten hinzu, um zu beginnen"
               )
             }
           </p>
           {!searchTerm && (
             <a href="/add-patient">
               <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                 <Plus className="w-4 h-4" />
                 {isKindertagesstaette ? 'Neues Kind' : 'Neuer Patient'}
               </button>
             </a>
           )}
         </div>
       </div>
     ) : (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
         {filteredPatients.map((patient) => (
           <a key={patient.id} href={`/patient-details?id=${patient.id}`}>
             <div className="bg-white border border-slate-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group h-[140px] flex flex-col">
               <div className="pb-2 pt-3 px-4">
                 <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit">
                   {getGruppeName(patient.gruppe_id)}
                 </div>
               </div>
               <div className="flex-1 flex items-center justify-center px-4 pb-4">
                 <div className="text-center">
                   <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:from-blue-200 group-hover:to-blue-300 transition-all">
                     <User className="w-5 h-5 text-blue-700" />
                   </div>
                   <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                     {patient.first_name} {patient.last_name}
                   </h3>
                 </div>
               </div>
             </div>
           </a>
         ))}
       </div>
     )}
   </div>
 );
}
