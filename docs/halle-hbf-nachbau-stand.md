# Halle (Saale) Hbf – Originalgleis-Nachbau, erste spielbare Vorschau

**Stand:** 20.11.2026. **Originaldaten: OSM/OpenRailwayMap**, ergänzt um den offiziellen [DB-InfraGO-Betriebsstellenplan LH vom 30.09.2026](https://trassenfinder.de/apn/LH).

## Was tatsächlich übernommen wurde

Automatischer OpenStreetMap-Import mit [OpenRailwayMap-Datenabfrage](halle-hbf-openrailwaymap-overpass.ql) und alternativem Abruf über die OpenStreetMap-API. Datensatz `data/halle-hbf-osm-review.json`, © OpenStreetMap contributors, ODbL 1.0.

Beim ersten erfolgreichen Abruf wurden **609 Eisenbahn-Ways, 4.825 Segmentkanten, 4.799 Gleisknoten, 414 kartierte Weichen und 452 signalbezogene Objekte** im gewählten Kartenausschnitt geladen. **Nicht alle Objekte gehören betrieblich zum Hbf**: Das vorläufige Aufnahmefenster umfasst auch Nachbaranlagen. Die Komponentenliste enthält mehrere nicht verbundene Gleisgruppen; getrennte OSM-Knoten werden nicht aufgrund gleicher Bildposition verbunden. Die Rohdaten sind gekennzeichnet mit `UNVERIFIED_OSM_IMPORT`, nicht als betrieblicher Verschlussplan bestätigt.

## Spiel- und Prüfoberfläche

- `halle-hbf-play.html` bietet eine **experimentelle Gleis-Fahrwegvorschau** auf echten OSM-Knoten mit animiertem Testzug. Spieler wählen Start- und Zielgleis durch Antippen der Gleise. Es wird eine geometrische Wegsuche mit Knotenidentität und konservativen Weichenübergängen verwendet.
- Im Testbetrieb werden unbekannte oder inkonsistente OSM-Weichen nicht zu erlaubten Übergängen erklärt. Bei Dreiweg-Weichen ist die direkte Fahrt zwischen beiden abzweigenden Schenkeln gesperrt; bei viergliedrigen Kreuzungen nur die räumlich eindeutig geradlinige Durchfahrt als Vorschau zugelassen. **Dies ist keine echte Stellwerksfreigabe.**
- `halle-hbf-review.html` stellt den gesamten erfassten OSM-Gleisbestand inklusive einzeln anklickbarer Weichen und Signal-Tags dar.
- Der Bahnhof erscheint in der Startauswahl als **Originalgleise (Vorschau)**. Bestehende Stellwerke werden nicht überschrieben. Web/PWA und Android-Offline-Bundle haben die dafür nötigen Dateien.

## Noch nicht originalgetreu betriebsfähig

1. Die Abgrenzung des tatsächlichen Bahnhofs Halle (Saale) Hbf gegen **Halle Gbf, Halle Ost/West, Abzweigstellen und benachbarte Betriebsanlagen** anhand des DB-InfraGO-Plans und aktueller OSM-Daten.
2. Die tatsächlichen **Weichennummern und Weichenlagen**, Kreuzungsweichen-/DKW-Fahrmöglichkeiten, Sperrgleise, Schutzweichen und Flankenschutz.
3. Die Lage, Richtung und Aufgabe **jedes Haupt-, Vorsignal- und Rangiersignals**. Die 452 OSM-Objekte sind **nicht** automatisch 452 Hauptsignale.
4. **Fahrstraßen, Durchrutschwege, Gleisfreimeldeabschnitte, Blockgrenzen und Verschlussabhängigkeiten** – dafür reichen OSM und Serviceeinrichtungsplan nicht allein.
5. Abgleich jedes Bahnsteiggleises 1–13 sowie weiterer Abstell-, Betriebs- und Werkstattgleise mit dem offiziellen Plan. Das Ziel ist die fortlaufende Ergänzung, nicht die Behauptung, diese Prüfung sei abgeschlossen.

Quellen: [DB InfraGO LH](https://trassenfinder.de/apn/LH), [Halle Hbf Bahnsteigdaten](https://www.dbinfrago.com/web/bahnhoefe/leistungen/stationsnutzung/stationshalt/stationsausstattung/Halle-Saale-Hbf-12671632), [OpenRailwayMap](https://openrailwaymap.org/?lang=de&lat=51.478&lon=11.990&zoom=15&style=standard), [vorherige Quelleninventur](halle-hbf-gleisplan-quellen.md).

## Technische Prüfungen

Vier Node.js- und drei Python-Regressionstests aus dem Eilenburg-Verfahren für den Halle-Importer übernommen. [GitHub-Testlauf #44697217699](https://github.com/jktzhitrl/stellwerk.sim/actions/runs/44697217699) erfolgreich: OSM-Datenabruf, Konvertierung, Graph-Diagnose, Offline-Prüfkarte und Datensnapshot. Die dynamische fahrwegfähige Oberfläche ist als Entwicklungsstand zu betrachten; vor Behauptung voller Originaltreue sind Tablet- und Betriebsregressionstests notwendig.

## Ausbau 20.11.2026: Gleisreferenzen und sichere Fahrwegsuche

- Separates Modul `halle-hbf-routing.mjs`: Dijkstra-Fahrwegfindung mit Min-Heap; für große OSM-Graphen günstiger als wiederholtes Sortieren sämtlicher Kandidaten.
- Keine Fahrten über nicht als Weiche kartierte Verzweigungen; bei Dreiweg-Weichen nur über den geometrisch plausiblen Weichenfuß. **Unbestätigte DKW- und Mehrfachkreuzungsübergänge werden jetzt vollständig gesperrt**, statt vermeintlich geradlinige Fahrten durch ungesicherte Kreuzungen zu erlauben.
- In der Bahnhofsvorschau ist eine Auswahl für numerische Gleis-Referenzen der OSM-Wege ergänzt. Sie zeigt ausdrücklich **OSM-Weg-Referenzen**, nicht bereits geprüfte DB-Bahnsteigbezeichnungen. Start und Ziel lassen sich so ohne millimetergenaues Tippen auf das Tablet-Gleisbild setzen.
- Bedienung verbessert: Ziehen der Karte soll nicht als Fahrwegauswahl interpretiert werden.
- Neue automatisierte Routentests dokumentieren die Grenzen.
- Weiterhin nicht vollständig originalgetreu: Fahrstraßen, Signale, Flankenschutz und Weichenstellungen erfordern einen gesonderten Abgleich mit DB-Unterlagen.

## Tatsächliche OSM-Risiken des ersten Imports

Die GitHub-Actions-Rohdatenprüfung für den vollständigen vorläufigen Kartenausschnitt hat **140 als ungewöhnlich eingestufte Weichen-Knotengrade** und **10 Gleisverzweigungen ohne `railway=switch`-Tag** gefunden. Diese Daten sind ein Arbeitsvorrat für die fachliche Prüfung, keine realen Defekte des Bahnhofs. Sie dürfen nicht mit ursprünglich korrekt stellbaren Weichen gleichgesetzt werden. Die derzeitige Fahrwegvorschau verweigert Übergänge an ungetaggten Verzweigungen und an Mehrfachkreuzungen/DKW; auch mit den OSM-Geometriedaten lässt sich die reale DKW-Stellung allein nicht bestimmen.

Die OSM-Wegreferenzen **1 bis 13** treten im Datensatz auf, sind aber noch **nicht** gegen den amtlichen LH-Plan zu den einzelnen Bahnsteiggleisen abgeglichen. Die Oberfläche bezeichnet sie deshalb ausdrücklich als OSM-Gleisreferenzen. Die ausgewählte Referenz zoomt auf einen dazugehörigen erfassten Gleisabschnitt; ein möglicherweise gleichnamiges Gleis außerhalb des Hauptbahnhofs muss später abgegrenzt werden.

**Automatischer Test:** [Halle Routing #44698657191](https://github.com/jktzhitrl/stellwerk.sim/actions/runs/44698657191) erfolgreich; fünf Routentests einschließlich Sperrung ungesicherter DKWs und Trennung gleicher Koordinaten mit verschiedenen OSM-Knoten.

## Originalreferenzen und Streckenrichtungen – weiterer Ausbau am 20.11.2026

Der öffentliche OSM-Snapshot für Halle enthält numerische Referenzen **1–13**. Diese werden nun in der Halle-Vorschau als schnelle Auswahlfelder mit dem nächstgelegenen OSM-Kandidaten im Bereich des Hbf gezeigt. **Alle 13 Kandidaten sind vorhanden, aber ihre genaue Übereinstimmung mit den offiziellen DB-Bahnsteiggleisen ist noch ungeprüft.** Deshalb tragen die sichtbaren Markierungen ein Fragezeichen, und die Fahrt verwendet lediglich den damit verbundenen OSM-Knoten.

Der DB-Gleisplan LH (30.09.2026) nennt die Strecken **6343 Richtung Sangerhausen**, **6340 Richtung Merseburg**, **6053 Richtung Gröbers**, **6403 Richtung Leipzig** und **6050 Richtung Halle-Trotha/Halle Gbf**. Von diesen sind **6340, 6053, 6403, 6050** als OSM-Gleisreferenzen im importierten Ausschnitt vorhanden. **6343 fehlt im Ausschnitt als OSM-Referenz** und wird deshalb ausdrücklich als nicht automatisch zugeordnet angezeigt. Auch bei vorhandener Referenz gelten keine einzelnen Verbindungen zum Bahnsteig als betriebsseitig bewiesen.

Neue Dateien: `halle-hbf-references.mjs` (belegte Richtungen, Quellendaten, unverifizierte OSM-Kandidaten) und `tools/tests/halle-hbf-references.test.mjs` (echte Datensatzprüfung). Die UI in `halle-hbf-play.html` kann nummerierte Kandidaten direkt anzeigen und auf die Karte zentrieren. Ein Button für eine Streckenrichtung zeigt ausschließlich die nächste kartierte Wegreferenz; **keine Fahrstraße wird dadurch freigegeben**.

## Halle Hbf: Weichen- und Signalobjekte sichtbar prüfen (20.11.2026)

Die OSM-Weichen und signalbezogenen Objekte können in `halle-hbf-play.html` jetzt über ihre Original-OSM-Knoten-IDs und gegebenenfalls kartierte Bezeichnungen ausgewählt und im Gleisbild zentriert werden. Das Modul `halle-hbf-objects.mjs` klassifiziert Hauptsignal-, Vorsignal-, Rangiersignal-, Geschwindigkeits-, Halt- und weitere Tags, einschließlich Prellböcken. Jede Anzeige erhält die Quelle und **keinen betrieblichen Freigabestatus**. Auch bei als Hauptsignal markierten Punkten wird keinerlei reale Signalstellung simuliert oder behauptet.

Weichen werden in einfache Dreiweg-Knoten, komplexe Kreuzungsweichen und unklare Anschlussgrade unterschieden. Der Originaldaten-Snapshot enthält kartierte Weichen mit ungewöhnlichen Anschlusszahlen; solche Punkte bleiben als prüfbedürftig gekennzeichnet. Die tatsächliche 1:1-Weichenstellung, Signalsicht/-richtung, Blockbereiche und Fahrstraßen/Verschlussabhängigkeiten fehlen weiterhin und werden nicht geschätzt.

Funktionalität: OSM-Objektliste mit Typfiltern, Kennungen und Details; angetippte Marker zentrieren die Stelle. Die bisherige reine Testfahrt nutzt weiterhin konservative Weichenübergangsregeln und bleibt ausdrücklich eine **geometrische Gleisvorschau**. Tablet-/Hardware-E2E-Test noch offen. 
