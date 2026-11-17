# Stellwerk-Simulator (Neustadt & Teutschenthal)

Tablet-optimiertes Gleisbildstellwerk-Spiel (HTML5 + SVG + Vanilla JS) – Bahnhof mit 6 Gleisen, zwei Abstellgleisen, Nebenbahn-Abzweig und zweigleisiger Strecke; ICE-Durchfahrten, Überholungen, Störungen und Fahrstraßenspeicher – in einer einzigen Datei: `index.html`.

## Starten
- **Lokal:** `index.html` im Browser öffnen (Doppelklick) – keine Installation, keine externen Abhängigkeiten.
- **Tablet:** Datei auf das Tablet kopieren und im Browser öffnen, oder per GitHub Pages / beliebigem Webserver bereitstellen
  (z. B. `python3 -m http.server 8000` im Ordner, dann am Tablet `http://<PC-IP>:8000` aufrufen).
- Tipp: „Zum Home-Bildschirm hinzufügen“ für Vollbild ohne Browserleiste.

## Bedienung (Kurzfassung)
1. Startsignal antippen → Zielsignal (oder Zielfeld „◀ WEST“ / „OST ▶“) antippen = Fahrstraße (gelb).
2. Startsignal erneut antippen = Signal auf Fahrt (grün). Grünes Signal antippen = Halt.
3. Weichen W1–W4 antippen zum Umstellen (Modus „Weichen manuell“ in den Einstellungen).
4. „✖ Auflösen“ + Startsignal = Fahrstraße zurücknehmen.
5. Ein Finger verschieben, zwei Finger zoomen.

## Bahnhöfe
- **Bf Neustadt** (fiktiv): 6 Bahnsteiggleise, zweigleisige Strecke, Nebenbahn, Abstellgleise, Lok umsetzen.
- **Bf Teutschenthal** (vereinfacht nach OpenRailwayMap): Strecke 6343 Halle – Hann. Münden mit Haltepunkt, Strecke 6840, Güterbahnhof, Anschlussgleis.

Auswahl im Startfenster oder im ☰ Menü; direkt per Link: `index.html?bf=teutschenthal`.
