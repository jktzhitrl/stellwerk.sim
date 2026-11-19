# Bf Eilenburg – Vorbildnachbau (Arbeitsstand 19.11.2026)

**Status: Entwurf, ausdrücklich NICHT 1:1 originalgetreu. Kein abgeschlossener Strecken- oder Stellwerksnachbau.**

## Verifizierte Quellen

1. [DB InfraGO / Trassenfinder: Aktueller schematischer Gleisplan Bf Eilenburg (LEG)](https://trassenfinder.de/apn/LEG), Zeichnungsdatum **05.05.2026**. Enthält die Personenbahnhofsgleise 1–4, unter anderem die Gütergleise 5–13, 19, 22, 32–34, 39 und 40, Anschlussstellen sowie die benachbarten Strecken 6345, 6360, 6825, 6831.
2. [DB InfraGO Bahnhofsausstattung Eilenburg](https://www.dbinfrago.com/web/bahnhoefe/leistungen/stationsnutzung/stationshalt/stationsausstattung/Eilenburg-12668588), Stand September 2026: vier Personengleise 1, 2, 3, 4.
3. [OpenRailwayMap](https://openrailwaymap.org/?lang=de&lat=51.45191&lon=12.636751&style=standard&zoom=15), OSM-basiert; bei dieser Bearbeitung konnten die zugrunde liegenden OSM-Gleiswege, Weichen- und Signalobjekte **nicht zuverlässig maschinell exportiert** werden.
4. [Stellwerksdatenbank Eilenburg](https://stellwerke.info/stw/stw.php?id=35100): Streckennummern, DS100-Kürzel LEG und (geplantes) ESTW – das geplante ESTW ist **kein** Beleg für eine bereits erfolgte Inbetriebnahme.

## Daten-/Implementierungsstand

- `eilenburg-plan.js`: **manuell schematisch** aus dem offiziellen Plan übertragener Prototyp mit 145 Gleisabschnitten, 29 Verzweigungsknoten und fünf Strecken-Endpunkten. Alle eingezeichneten Strecken-Endpunkte sind im synthetischen Graphen miteinander verbunden.
- `custom-play.html?bf=eilenburg`: separate Spielansicht über den vorhandenen *vereinfachten* Spielkern für selbst gebaute Bahnhöfe; Ausgangssignale und Weichen werden **nicht** mit den tatsächlich existierenden Stellwerksabhängigkeiten gleichgesetzt.
- `index.html`: zusätzliche Eilenburg-Karte mit deutlicher Kennzeichnung *Plannachbau in Arbeit*.
- Das Web-/Android-Paket kann die Daten lokal mitführen.


## Datenabgleich und Planänderungen (Stand 19.11.2026)

Die Vorlage ist ausdrücklich **zeitbezogen**: Ein öffentlicher Vergabe-/Ausschreibungstext von 2026 beschreibt für den Eilenburger Ostkopf die Erneuerung der Weichen **99, 101 und 105** sowie den vorgesehenen Rückbau der Weichen **70–73, 51, 54, 106 und 109**, außerdem DKW 48, EKW 56 und zugehörige Gleisreste. **Eine Ausschreibung beweist nicht, dass die Arbeiten bereits ausgeführt sind.** Deshalb darf die Spielgeometrie nicht stillschweigend als Bauzustand nach der Maßnahme gelten. Quelle: [EU-Vergabeplattform, Spurplananpassung Eilenburg Ostkopf 2026](https://op.europa.eu/de/web/public-procurement/procurement-details/-/procurement/47b97c2c-f5c5-4442-8f6e-2b041e31316b).

Die reproduzierbare OSM-Abfrage liegt in [eilenburg-openrailwaymap-overpass.ql](./eilenburg-openrailwaymap-overpass.ql); der Importer [tools/eilenburg-import.mjs](../tools/eilenburg-import.mjs) liest die Overpass-JSON-Antwort und erstellt einen **ungeprüften** Gleis-/Weichen-/Signal-Datensatz. Der automatische GitHub-Prüflauf [.github/workflows/eilenburg-osm-check.yml](../.github/workflows/eilenburg-osm-check.yml) versucht den Rohdatenabruf und lädt bei Erfolg JSON-Daten und Prüfbericht als Workflow-Artefakt hoch; er ändert **nicht** den spielbaren Gleisplan. Vier Node.js-Regressionstests prüfen Topologie, Kreuzungen ohne gemeinsame Knoten, Geometrie und Duplikate. Der erste GitHub-Lauf bestand alle vier Tests, aber der erste Overpass-Server antwortete HTTP 406. Eine zweite Abfrage über alternative Server wurde angestoßen. Vor Übernahme sind ODbL-Quellenangabe, Datenzeitpunkt, tatsächliche Knotenidentität, Weichenlage, Signalarten und Richtung zu prüfen. Geografische Kreuzungen dürfen nie automatisch zu Weichen werden.

### Technische Verbesserungen im Entwurfsbranch

- Kürzeste Fahrwege werden nach Segmentlängen und nicht mehr nach Segmentanzahl gesucht.
- Bei einfachen Dreiweg-Knoten wird die verbotene direkte Fahrt von einem abzweigenden Schenkel zum anderen ausgeschlossen. Diese Entscheidung beruht auf **schematischer Geometrie** und ersetzt keine verifizierte Weichenlage.
- An **komplexen Knoten mit mehr als drei Kanten** sind die möglichen Übergänge weiterhin unbestätigt; sie müssen vor dem realitätsgetreuen Release manuell anhand der echten Weichenlage modelliert werden.
- Die statischen Gleise werden im Spiel nicht mehr bei jedem Animationsbild neu aufgebaut.
- Die fünf Außenanschlüsse werden im Zugfahrplan mit Herkunfts- und Zielnamen statt nur E1–E5 angezeigt.


## Echte OpenStreetMap-Rohdaten erfasst (19.11.2026)

Der alternative Abfrageweg über die OpenStreetMap-Haupt-API hat funktioniert (erfolgreicher GitHub-Actions-Lauf [#44507027158](https://github.com/jktzhitrl/stellwerk.sim/actions/runs/44507027158)). Das Review-Artefakt enthält **499 Gleissegmente, 486 Gleisknoten, 45 kartierte Weichen, 53 signalbezogene Objekte und 22 Endpunkte** aus dem gewählten Kartenausschnitt. **18** der signalbezogenen Objekte tragen ein Tag für Hauptsignale; andere sind beispielsweise Vorsignale, Rangiersignale oder Schilder/Prellböcke. Vier Weichen sind als Doppelkreuzungsweichen erfasst. Die 499 Abschnitte sind im OSM-Knotengraphen zusammenhängend, aber ein zusammenhängender Gleisgraph garantiert **keine** zulässigen Zugfahrten durch Weichen und Kreuzungen.

Die importierten Track-Referenzen umfassen unter anderem 6345, 6360, 6825 und 6831 sowie die Gleisbezeichnungen 1–13, 22, 39 und 40. Die in den OSM-Daten enthaltene Gleis- und Signallage muss erst gegen den [DB-InfraGO-Plan vom 05.05.2026](https://trassenfinder.de/apn/LEG) und gegen den tatsächlichen Bauzustand 2026 geprüft werden. Die OSM-Rohdaten enthalten auch Teile benachbarter Ways außerhalb des angefragten Kartenrechtecks. Zum Kartenreview dient die neue [eilenburg-review-template.html](../tools/eilenburg-review-template.html); der GitHub-Workflow erzeugt daraus eine eigenständige Offline-Prüfkarte mit echten OSM-Tags.

**Der bisher spielbare Entwurf mit 145 Segmenten bleibt schematisch.** Die 499 echten OSM-Segmente sind **nicht** automatisch auf den Spielbetrieb mit zugelassenen Fahrstraßen umgestellt worden, weil die echten Verschluss- und Signalabhängigkeiten fehlen. Keine Nummern anhand von Koordinaten raten.

## Voraussetzungen für einen exakten Nachbau

- Vollständige **OSM-XML-/PBF-/GeoJSON-Geometrie** aus dem OpenRailwayMap-Einzugsgebiet mit track nodes, Abzweigpunkten, railway=switch, railway=signal, ggf. railway:signal:* und railway:track_ref.
- Abgleich des OSM-Datenstands mit dem **DB-Gleisplan**; OSM-Wege sind nicht zwangsläufig an allen Weichen korrekt segmentiert. Wege, die sich nur kreuzen, dürfen nicht als Weichen interpretiert werden.
- Tatsächliche **Weichenkennungen und Weichenlagen**, Schutzbereiche, Flankenschutzeinrichtungen, Abhängigkeiten und Rangierfahrstraßen. Der aktuelle DB-Serviceeinrichtungsplan ist kein vollständig auswertbarer Verschlussplan.
- Für einen realen Betriebszustand den Zeitpunkt festlegen: bestehende Stellwerke Ew/Aw/Eo vs. geplantes ESTW. Nicht beide Epochen unbemerkt vermischen.
- Fahrstraßen, Gleisfreimeldeabschnitte, Blockgrenzen und Signalbezeichnungen aus belastbarer Signal-/Stellwerksdokumentation prüfen und testen.
- Anschließend Regressionstests: real mögliche und unzulässige Fahrstraßen, Zugbelegung, Weichenlage, Signalisierung, Tablet-Zoom/Rendern, Verhalten ohne Netzwerk.

**Konsequenz:** Der Prototyp darf nicht als „exakt“ oder „vollständig nach OpenRailwayMap“ veröffentlicht werden. Die Quellen sind als Links angegeben; Bild-/Kartenmaterial wurde nicht in das Repository kopiert.

## Vorschau im öffentlichen Spiel

Auf ausdrücklichen Wunsch des Nutzers ist Eilenburg als **spielbare, deutlich als schematisch gekennzeichnete Vorschau** im Startmenü freigegeben. Der Spielmodus bleibt auf dem manuell übertragenen 145-Segment-Plan und verwendet vereinfachte Weichen-/Signalregeln. Zusätzlich ist die echte 499-Segment-OSM-Gleisprüfung über `eilenburg-review.html` verfügbar. Keine reale Fahrstraße, Signalabhängigkeit oder Weichenbezeichnung wird dadurch als bestätigt dargestellt. Der öffentliche Release ist ausdrücklich **nicht** die Freigabe eines 1:1-Stellwerks.

## Eilenburg im Hauptspiel (19.11.2026)

Eilenburg ist jetzt als eigener Bahnhof im Hauptspiel (`index.html?bf=eilenburg`) mit dem normalen Stellwerkskern (Weichen, Fahrstraßen, Signale, Fahrplan) eingebaut. Die Gleistopologie wurde aus den gedrehten OSM-Gleisdaten (`data/eilenburg-osm-review.json`) abgelesen und vereinfacht:

- Personengleise 1–4. Gleis 1 hängt im Westen am Streckengleis Richtung Halle und führt im Osten auf die Strecke 6831. Gleis 2/3 sind die Hauptgleise der Strecke 6345. Gleis 4 führt im Westen geradeaus auf die Strecke 6360.
- Güterbahnhof mit Weichenleitern an beiden Seiten: Gleise 5–9 durchgehend, 10–13 Stumpfgleise mit Zugang nur von Westen. Die Strecke 6825 nach Lüptitz zweigt aus der östlichen Weichenleiter ab.
- Doppelkreuzungsweichen sind als Paare einfacher Weichen dargestellt. Signalnamen (A, B, F, E, L, N/P) und Abhängigkeiten sind spielerisch und entsprechen nicht dem echten Stellwerk.

Die schematische Vorschau `custom-play.html?bf=eilenburg` bleibt als Datei erhalten, ist aber nicht mehr im Startmenü verlinkt.
