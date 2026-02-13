"use client";

import React from "react";

export default function Patients() {
  React.useEffect(() => {
    // Zu Home weiterleiten
    window.location.href = "/home";
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-slate-600">Wird weitergeleitet...</div>
    </div>
  );
}