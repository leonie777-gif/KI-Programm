const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Datei für Persistierung
const PATIENTS_FILE = path.join(__dirname, "../data/patients.json");

// Stelle sicher, dass das data Verzeichnis existiert
const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Funktion zum Laden von Patienten aus Datei
const loadPatients = () => {
  try {
    if (fs.existsSync(PATIENTS_FILE)) {
      const data = fs.readFileSync(PATIENTS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Fehler beim Laden der Patienten:", err);
  }
  return [];
};

// Funktion zum Speichern von Patienten in Datei
const savePatients = (patients) => {
  try {
    fs.writeFileSync(PATIENTS_FILE, JSON.stringify(patients, null, 2));
  } catch (err) {
    console.error("Fehler beim Speichern der Patienten:", err);
  }
};

// GET alle Patienten
router.get("/", (req, res) => {
  const patients = loadPatients();
  res.json(patients);
});

// GET Patient nach ID
router.get("/:id", (req, res) => {
  const patients = loadPatients();
  const patient = patients.find(p => p.patient_id === req.params.id);
  
  if (!patient) {
    console.log(`Patient nicht gefunden: ${req.params.id}`);
    console.log(`Verfügbare IDs:`, patients.map(p => p.patient_id));
    return res.status(404).json({ error: "Patient nicht gefunden" });
  }
  
  res.json(patient);
});

// POST neuer Patient
router.post("/", (req, res) => {
  const patients = loadPatients();
  const patient = req.body;
  
  if (!patient.first_name || !patient.last_name) {
    return res.status(400).json({ error: "first_name und last_name sind Pflicht" });
  }
  
  // Generiere eindeutige ID, wenn nicht vorhanden
  if (!patient.patient_id || patient.patient_id === "") {
    patient.patient_id = `p-${Date.now()}`;
  }
  
  patients.push(patient);
  savePatients(patients);
  
  console.log("Patient erstellt:", patient);
  res.status(201).json(patient);
});

// PATCH Patient bearbeiten
router.patch("/:id", (req, res) => {
  const patients = loadPatients();
  const patient = patients.find(p => p.patient_id === req.params.id);
  
  if (!patient) {
    return res.status(404).json({ error: "Patient nicht gefunden" });
  }
  
  // Felder überschreiben mit neuen Werten
  Object.assign(patient, req.body);
  savePatients(patients);
  
  console.log("Patient aktualisiert:", patient);
  res.json(patient);
});

// DELETE Patient
router.delete("/:id", (req, res) => {
  const patients = loadPatients();
  const initialLength = patients.length;
  
  const filteredPatients = patients.filter(p => p.patient_id !== req.params.id);
  
  if (filteredPatients.length === initialLength) {
    return res.status(404).json({ error: "Patient nicht gefunden" });
  }
  
  savePatients(filteredPatients);
  
  console.log(`Patient gelöscht: ${req.params.id}`);
  res.json({ success: true, message: "Patient gelöscht" });
});

module.exports = router;