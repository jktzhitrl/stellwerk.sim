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

## Voraussetzungen für einen exakten Nachbau

- Vollständige **OSM-XML-/PBF-/GeoJSON-Geometrie** aus dem OpenRailwayMap-Einzugsgebiet mit track nodes, Abzweigpunkten, railway=switch, railway=signal, ggf. railway:signal:* und railway:track_ref.
- Abgleich des OSM-Datenstands mit dem **DB-Gleisplan**; OSM-Wege sind nicht zwangsläufig an allen Weichen korrekt segmentiert. Wege, die sich nur kreuzen, dürfen nicht als Weichen interpretiert werden.
- Tatsächliche **Weichenkennungen und Weichenlagen**, Schutzbereiche, Flankenschutzeinrichtungen, Abhängigkeiten und Rangierfahrstraßen. Der aktuelle DB-Serviceeinrichtungsplan ist kein vollständig auswertbarer Verschlussplan.
- Für einen realen Betriebszustand den Zeitpunkt festlegen: bestehende Stellwerke Ew/Aw/Eo vs. geplantes ESTW. Nicht beide Epochen unbemerkt vermischen.
- Fahrstraßen, Gleisfreimeldeabschnitte, Blockgrenzen und Signalbezeichnungen aus belastbarer Signal-/Stellwerksdokumentation prüfen und testen.
- Anschließend Regressionstests: real mögliche und unzulässige Fahrstraßen, Zugbelegung, Weichenlage, Signalisierung, Tablet-Zoom/Rendern, Verhalten ohne Netzwerk.

**Konsequenz:** Der Prototyp darf nicht als „exakt“ oder „vollständig nach OpenRailwayMap“ veröffentlicht werden. Die Quellen sind als Links angegeben; Bild-/Kartenmaterial wurde nicht in das Repository kopiert.
