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

Der offene, reproduzierbare Abfrageentwurf für die echten OSM-Eisenbahndaten liegt jetzt unter [eilenburg-openrailwaymap-overpass.ql](./eilenburg-openrailwaymap-overpass.ql). Er kann in [Overpass Turbo](https://overpass-turbo.eu/) ausgeführt werden. **Die Abfrage wurde hier nicht live ausgeführt**, da OpenStreetMap/Overpass-Rohdaten aus dieser Umgebung nicht zuverlässig abrufbar waren. Vor Import sind ODbL-Quellenangabe, Datenzeitpunkt, Railway-Kennzeichnungen, tatsächliche Knotenidentität, Weichen- und Signalschlüssel zu prüfen. Geografische Kreuzungen dürfen nie automatisch zu Weichen werden.

### Technische Verbesserungen im Entwurfsbranch

- Kürzeste Fahrwege werden nach Segmentlängen und nicht mehr nach Segmentanzahl gesucht.
- Bei einfachen Dreiweg-Knoten wird die verbotene direkte Fahrt von einem abzweigenden Schenkel zum anderen ausgeschlossen. Diese Entscheidung beruht auf **schematischer Geometrie** und ersetzt keine verifizierte Weichenlage.
- An **komplexen Knoten mit mehr als drei Kanten** sind die möglichen Übergänge weiterhin unbestätigt; sie müssen vor dem realitätsgetreuen Release manuell anhand der echten Weichenlage modelliert werden.
- Die statischen Gleise werden im Spiel nicht mehr bei jedem Animationsbild neu aufgebaut.
- Die fünf Außenanschlüsse werden im Zugfahrplan mit Herkunfts- und Zielnamen statt nur E1–E5 angezeigt.

## Voraussetzungen für einen exakten Nachbau

- Vollständige **OSM-XML-/PBF-/GeoJSON-Geometrie** aus dem OpenRailwayMap-Einzugsgebiet mit track nodes, Abzweigpunkten, railway=switch, railway=signal, ggf. railway:signal:* und railway:track_ref.
- Abgleich des OSM-Datenstands mit dem **DB-Gleisplan**; OSM-Wege sind nicht zwangsläufig an allen Weichen korrekt segmentiert. Wege, die sich nur kreuzen, dürfen nicht als Weichen interpretiert werden.
- Tatsächliche **Weichenkennungen und Weichenlagen**, Schutzbereiche, Flankenschutzeinrichtungen, Abhängigkeiten und Rangierfahrstraßen. Der aktuelle DB-Serviceeinrichtungsplan ist kein vollständig auswertbarer Verschlussplan.
- Für einen realen Betriebszustand den Zeitpunkt festlegen: bestehende Stellwerke Ew/Aw/Eo vs. geplantes ESTW. Nicht beide Epochen unbemerkt vermischen.
- Fahrstraßen, Gleisfreimeldeabschnitte, Blockgrenzen und Signalbezeichnungen aus belastbarer Signal-/Stellwerksdokumentation prüfen und testen.
- Anschließend Regressionstests: real mögliche und unzulässige Fahrstraßen, Zugbelegung, Weichenlage, Signalisierung, Tablet-Zoom/Rendern, Verhalten ohne Netzwerk.

**Konsequenz:** Der Prototyp darf nicht als „exakt“ oder „vollständig nach OpenRailwayMap“ veröffentlicht werden. Die Quellen sind als Links angegeben; Bild-/Kartenmaterial wurde nicht in das Repository kopiert.
