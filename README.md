# Stellwerk-Simulator (Neustadt, Teutschenthal, Burgstadt Hbf, Eilenburg, Halle (Saale) Hbf)

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
- **Bf Neustadt** (fiktiv): 7 Bahnsteiggleise (Gleis 7 als Stumpfgleis für Wendezüge aus Neuhafen), zweigleisige Strecke, Nebenbahn, **Abstellgruppe 7 · 9 · 10** und Abstellgleis 8, Lok umsetzen; **Dauerbaustelle Gleis 5** (Bahnsteigerneuerung) mit Bauzügen, die dort Material entladen.
- **Bf Teutschenthal** (vereinfacht nach OpenRailwayMap): Strecke 6343 Halle – Hann. Münden mit Haltepunkt, Strecke 6840, Güterbahnhof, Anschlussgleis.
- **Burgstadt Hbf** (fiktiv, groß): 10 Bahnsteiggleise, Güterbahnhof mit 6 Gleisen, Richtungsbetrieb mit vier zweigleisigen Strecken (Altheim, Westerburg, Hafenau, Abzweig Talburg), Güter-Einfahrgleise West und Ost.
- **Bf Eilenburg** (vereinfacht nach OSM-Gleisdaten und DB-InfraGO-Plan): Gleise 1–4, Güterbahnhof Gl 5–9 durchgehend und 10–13 als Stumpfgleise, Strecken 6345 Halle – Torgau (zweigleisig), 6360 Leipzig (eigenes Einfahrgleis), 6831 Eilenburg Ost, 6825 Lüptitz; Abstellgleise 39/40 mit Rangiersignalen L39/L40 für Wendezüge; S 4, RE 10, RB und Güterverkehr; **Lokwechsel** E-Lok → Diesellok für Güterzüge nach Lüptitz; zeitweise **Baustelle Eilenburg – Torgau**, bei der Züge in Eilenburg enden und wenden. `index.html?bf=eilenburg`

- **Halle (Saale) Hbf** (noch gesperrt – in Arbeit; schematisch nach dem realen Knoten, ohne Gleisdaten nachgebaut): 13 Bahnsteiggleise in drei Gruppen, Gütergleise 14/15, je Kopf vier zweigleisige Strecken (Norden: Delitzsch/Eilenburg, Bitterfeld/Berlin, Köthen/Magdeburg, Zugbildungsanlage; Süden: Leipzig über Schkeuditz, Flughafen/Erfurt (NBS), Merseburg, Angersdorf/Kassel); ICE-Halt, S-Bahn Mitteldeutschland und viele **Wendezüge**, die am Bahnsteig die Richtung wechseln. `index.html?bf=halle`

In den Bahnhöfen mit Güterbahnhof (Teutschenthal, Burgstadt, Eilenburg) gibt es **Rangieraufträge** (Köf mit Wagen über Ausziehgleise und Rangiersignale RO/RW). In Neustadt, Burgstadt, Eilenburg und Halle gibt es **Anschlüsse**: Zubringer melden sich verspätet, du entscheidest „Warten“ oder „Freigeben“. Verspätungsmeldungen, Weichen-/Signalstörungen und zeitweise **Langsamfahrstellen** 🐌 (angekündigte Tempobeschränkung auf einem Streckenabschnitt, gelb gepunktet) gibt es in jedem Bahnhof.

**Streckennetz:** Neustadt ↔ Teutschenthal und Teutschenthal ↔ Eilenburg sind je über eine fiktive zweigleisige freie Strecke gekoppelt (Browser-übergreifend über `localStorage`): Ein Zug, der im einen Bahnhof ausfährt, kommt zeitversetzt im anderen an. Es läuft dabei immer nur ein Stellwerk aktiv – zum Spielen beide Bahnhöfe in getrennten Tabs öffnen. Burgstadt und Halle haben noch keine Netzverbindung.

Auswahl im Startfenster oder im ☰ Menü; direkt per Link: `index.html?bf=teutschenthal`.

Im Startfenster wird je Bahnhof dein **Bestwert** (Punkte, Pünktlichkeit) gespeichert und als 🏆 auf der Bahnhofskarte angezeigt – gespeichert im Browser (localStorage), nicht geräteübergreifend.

## Als App installieren
Die Seite ist eine installierbare Web-App (PWA) und läuft danach auch offline:
- **Android / Chrome:** ☰ Menü → „📲 Als App installieren“ (oder Browsermenü ⋮ → „App installieren“).
- **iPad / iPhone (Safari):** Teilen (□↑) → „Zum Home-Bildschirm“.
