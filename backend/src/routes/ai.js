// /backend/src/routes/ai.js
const express = require("express");
const multer = require("multer");
const fs = require("fs-extra");
const { spawn } = require("child_process");
const { runMistralOllama } = require("../../ai/mistral"); // Ollama/Mistral
const { bulletPointPrompt } = require("../../ai/prompts"); // Prompt-Funktion

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Entfernt Intel MKL Warnings aus der Transkription
function cleanTranscription(text) {
  return text
    .replace(/Intel MKL WARNING[\s\S]*?instructions\./g, "")
    .trim();
}

console.log("AI routes geladen");

// POST /api/ai/upload-audio
router.post("/upload-audio", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Keine Audio-Datei hochgeladen" });
    }

    const filePath = req.file.path;
    console.log("📁 Audio-Datei empfangen:", filePath);

  
    // Whisper via Python

    let transcription = "";
    let errorOutput = "";

    console.log("Starte Whisper-Transkription...");

    const pyProcess = spawn("python3", ["python/transcribe.py", filePath]);

    pyProcess.stdout.on("data", (data) => {
      transcription += data.toString();
    });

    pyProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pyProcess.on("close", async (code) => {
      // Audiodatei nach Verarbeitung löschen
      await fs.remove(filePath);

      if (code !== 0) {
        console.error("❌ Whisper-Fehler:", errorOutput);
        return res.status(500).json({ error: "Transkription fehlgeschlagen", details: errorOutput });
      }

      // Transkription säubern
      transcription = cleanTranscription(transcription);
      console.log("✅ Transkription fertig:", transcription);

   
      //  Mistral und Bulletpoints

      const prompt = bulletPointPrompt(transcription);
      let bulletPoints;

      try {
        const mistralOutput = await runMistralOllama(prompt);

        // Bulletpoints extrahieren 
        bulletPoints = mistralOutput
          .split("\n")
          .filter(line => line.trim().startsWith("-"))
          .map(line => line.trim());

        console.log("✅ Bulletpoints erstellt:", bulletPoints);
      } catch (err) {
        console.error("❌ Mistral-Fehler:", err);
        // Fallback: Transkription als einzelner Punkt
        bulletPoints = [transcription];
      }

      // Antwort ans Frontend
      return res.json({
        success: true,
        bulletPoints: bulletPoints,
        transcription: transcription, // optional, falls Frontend Originaltext will
        timestamp: new Date().toISOString()
      });
    });

  } catch (err) {
    console.error("❌ Fehler bei Audio-Upload:", err);
    return res.status(500).json({ error: "Fehler beim Verarbeiten der Audio-Datei", details: err.message });
  }
});

module.exports = router;
