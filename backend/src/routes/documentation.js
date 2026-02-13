const express = require("express");
const router = express.Router();

// In-memory Speicherung
let documents = [];

// GET alle Dokumente 
router.get("/", (req, res) => {
  const { patient_id } = req.query;

  if (patient_id) {
    return res.json(documents.filter(d => d.patient_id === patient_id));
  }

  res.json(documents);
});

// POST neues Dokument
router.post("/", (req, res) => {
  const {
    patient_id,
    documentation_type,
    session_title,
    session_date,
    recording_method,
    content
  } = req.body;

  if (!patient_id || !session_title || !session_date || !recording_method) {
    return res.status(400).json({
      error: "patient_id, session_title, session_date und recording_method sind Pflicht"
    });
  }

  const newDoc = {
    documentation_id: `d-${Date.now()}`,
    patient_id,
    documentation_type,
    session_title,
    session_date,
    recording_method,
    content: content || {},
    status: "draft",
    created_at: new Date().toISOString()
  };

  documents.push(newDoc);
  res.status(201).json(newDoc);
});

// PATCH Dokument bearbeiten
router.patch("/:id", (req, res) => {
  const doc = documents.find(d => d.documentation_id === req.params.id);
  if (!doc) return res.status(404).json({ error: "Dokument nicht gefunden" });

  Object.assign(doc, req.body);
  res.json(doc);
});

// DELETE Dokument
router.delete("/:id", (req, res) => {
  const index = documents.findIndex(d => d.documentation_id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Dokument nicht gefunden" });
  }

  documents.splice(index, 1);
  res.json({ success: true });
});

module.exports = router;
