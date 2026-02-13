const express = require("express");
const router = express.Router();

// In-memory Speicherung
let groups = [
  { gruppe_id: 'g-1', name: 'Sonnengruppe', beschreibung: 'Kinder im Alter von 3-4 Jahren' },
  { gruppe_id: 'g-2', name: 'Mondgruppe', beschreibung: 'Kinder im Alter von 4-5 Jahren' },
  { gruppe_id: 'g-3', name: 'Sternengruppe', beschreibung: 'Kinder im Alter von 5-6 Jahren' },
];

// GET alle Gruppen
router.get("/", (req, res) => {
  res.json(groups);
});

// POST neue Gruppe
router.post("/", (req, res) => {
  const { name, beschreibung } = req.body;
  if (!name) return res.status(400).json({ error: "name ist Pflicht" });

  const newGroup = {
    gruppe_id: `g-${Date.now()}`,
    name,
    beschreibung: beschreibung || ""
  };

  groups.push(newGroup);
  res.status(201).json(newGroup);
});


// PATCH Gruppe bearbeiten
router.patch("/:id", (req, res) => {
  const group = groups.find(g => g.gruppe_id === req.params.id);
  if (!group) return res.status(404).json({ error: "Gruppe nicht gefunden" });

  const { name, beschreibung } = req.body;
  if (name !== undefined) group.name = name;
  if (beschreibung !== undefined) group.beschreibung = beschreibung;

  res.json(group);
});


// DELETE Gruppe
router.delete("/:id", (req, res) => {
  const index = groups.findIndex(g => g.gruppe_id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Gruppe nicht gefunden" });

  groups.splice(index, 1);
  res.json({ success: true, message: "Gruppe gelöscht" });
});


module.exports = router;
