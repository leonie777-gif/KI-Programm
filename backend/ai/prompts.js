function bulletPointPrompt(transcription) {
  return `
Du bist ein spezialisierter Assistent für pädagogische Dokumentation im sozialen Bereich. 
Deine Aufgabe ist es, Gesprächsprotokolle effizient und datenschutzkonform zusammenzufassen.
Erstelle aus der folgenden Transkription kurze, sachliche Stichpunkte auf deutsch.
Jede Stichpunktzeile soll mit "-" beginnen.
Jeder Stichpunkt muss auf deutsch sein.
Ersetze Vorname und Nachnamen durch den Platzhalter "[KIND]".
Ersetze Namen von Eltern oder Angehörigen durch "[ANGEHÖRIGE]".
Ignoriere alle privaten Informationen, die keinen direkten Bezug zur pädagogischen oder medizinischen Entwicklung haben (z. B. Hobbys der Eltern, Urlaubsberichte, private Konflikte ohne Fachbezug).
Wandle umgangssprachliche Äußerungen in wertfreie, fachliche Beobachtungen um.

Transkription:
${transcription}

Stichpunkte:
-`;
}

module.exports = { bulletPointPrompt };
