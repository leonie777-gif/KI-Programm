// backend/src/whisper.js
const whisper = require("whisper-node"); 
const fs = require("fs");

async function transcribeAudio(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("Datei existiert nicht: " + filePath);
    }

    const options = {
      modelName: "base", 
      whisperOptions: {
        language: "de" 
      }
    };

    const segments = await whisper(filePath, options); 
    const text = segments.map(s => s.speech).join(" "); 

    return text;
  } catch (err) {
    console.error("Fehler bei Whisper:", err);
    return "";
  }
}

module.exports = { transcribeAudio };

