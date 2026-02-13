const { spawn } = require("child_process");

/**
 * Ruft Mistral über Ollama auf und liefert die Ausgabe
 * @param {string} prompt - Text, aus dem Bulletpoints erstellt werden sollen
 * @returns {Promise<string>} - Rohtext von Mistral
 */
function runMistralOllama(prompt) {
  return new Promise((resolve, reject) => {
    const ollama = spawn("ollama", ["run", "mistral:latest"]);

    let output = "";
    let error = "";

    ollama.stdout.on("data", (data) => {
      output += data.toString();
    });

    ollama.stderr.on("data", (data) => {
      error += data.toString();
    });

    ollama.on("close", (code) => {
      if (code !== 0) return reject(error);
      resolve(output);
    });

    // Prompt 
    ollama.stdin.write(prompt + "\n");
    ollama.stdin.end();
  });
}

module.exports = { runMistralOllama };
