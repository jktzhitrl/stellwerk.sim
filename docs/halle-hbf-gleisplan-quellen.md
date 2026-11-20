# Halle (Saale) Hbf – Originalgleisplan und Quellenbasis

**Recherche:** 20. November 2026. **Status:** Quellen gesichert; noch kein Gleisimport und kein spielbarer Bahnhof.

## Hauptquelle: DB InfraGO, Betriebsstellenplan LH

- **Original-PDF:** https://trassenfinder.de/apn/LH
- **Plan:** `Halle (Saale)`, Ril100-Kürzel **LH**, Betriebsstelle/Serviceeinrichtungen, **Planstand 30.09.2026**, eine sehr großformatige Seite.
- Auf dem Original sind Bahnhof Halle (Saale), die Bereiche **Halle West / Halle Ost**, Weichenstraßen, Reisezug- und Betriebs-/Abstellgleise sowie zahlreiche Anschluss- und Nebengleisgruppen dargestellt. Die Bezeichnungen der Signale, Weichen und Betriebsgleise sind aus dem PDF nach fachlicher Prüfung zu übernehmen.
- Auf der Planseite aufgeführte Verbindungen umfassen u. a. **Strecke 6343 Richtung Sangerhausen**, **6340 Richtung Merseburg**, **6053 Richtung Gröbers** und **6403 Richtung Leipzig**. Die Zuordnung weiterer Strecken und Gleise muss bei der späteren Digitalisierung geprüft werden.
- **Achtung:** Der PDF-Plan ist eine betriebliche *Serviceeinrichtungs-/Infrastrukturübersicht*, **kein vollständiger Verschlussplan**. Eine grafische Verbindung beweist noch nicht die Zulässigkeit einer bestimmten Fahrstraße.

## Offizielle Bahnsteigdaten

- DB InfraGO: https://www.dbinfrago.com/web/bahnhoefe/leistungen/stationsnutzung/stationshalt/stationsausstattung/Halle-Saale-Hbf-12671632
- **Stand 16.11.2026**, Bahnsteiggleise **1–13**, mit je ausgewiesener Höhe und Nettobaulänge.
- DB warnt ausdrücklich: Nettobaulängen sind **nicht** gleich verfügbare Bahnsteignutzlängen für die Zuglängenplanung.
- DB-Orientierungsplan für **Reisende**, mit Gleisnummern, Bahnsteigen und Ausgängen: https://www.bahnhof.de/downloads/station-plans/2498.pdf . Dies ist **kein** vollwertiger Gleis-/Weichenplan.

## OpenRailwayMap – Gegenprüfung der Gleisgeometrie

- Karte: https://openrailwaymap.org/?lang=de&lat=51.478&lon=11.990&zoom=15&style=standard
- OpenRailwayMap visualisiert OpenStreetMap-Eisenbahndaten; für den Gleisimport sind die **OSM-Wege mit echten gemeinsamen OSM-Knoten-IDs** wichtig. Kreuzungen auf demselben Kartenpixel sind nicht automatisch Weichen.
- Eine vorläufige Overpass-Abfrage für Gleise, Weichen und signalbezogene Objekte liegt unter [halle-hbf-openrailwaymap-overpass.ql](./halle-hbf-openrailwaymap-overpass.ql). **Noch nicht ausgeführt und nicht auf Vollständigkeit geprüft**. Vor Import geografisches Fenster und betriebliche Grenzen verifizieren.
- OSM-Rohdaten benötigen Datenstand und Attribution **© OpenStreetMap contributors, ODbL 1.0**.

## Dokumentierte Streckenanschlüsse und betriebliche Gleisgruppen (Planstand 30.09.2026)

Aus dem **exakten Text des DB-InfraGO-LH-Plans** belegbar:

| Strecke | Angabe am Originalplan | Status |
| --- | --- | --- |
| 6343 | Ri. Halle Abzw Ac (Sangerhausen) | Im Plan beschriftet |
| 6340 | Ri. Halle Abzw At (Merseburg) | Im Plan beschriftet |
| 6053 | Ri. Halle Abzw Al (Gröbers) | Im Plan beschriftet |
| 6403 | Ri. Halle Abzw Al (Leipzig) | Im Plan beschriftet |
| 6050 | Ri. Halle Trotha; daneben Halle Gbf, ZBA Halle Richtungs-/Ausfahrgruppe | Im Plan beschriftet; konkrete betriebliche Abgrenzung noch zu prüfen |

Weitere im LH-Plan erkennbare Gleisgruppen/Anlagen: **Halle West, Halle Ost, Neue Gruppe, Magdeburger Prellbock, Thüringer Prellbock, Kasseler Gruppe, Anschluss Nahverkehrswerkstatt DB Regio AG**, außerdem Vorstell-/Bereitstellungs- und betriebliche Nebengleise.

**Diese Liste ist noch keine vollständige Gleis- und Weicheninventur.** Der offizielle PDF-Plan zeigt viele einzelne Bezeichnungen, darunter Weichen und Signale (z. B. IDs mit Präfixen 92W und 96W). Eine genaue Zuordnung von OSM-Way/Node, Gleisbezeichnung, Weichentyp, Weichenlage, Signal, zulässiger Richtung und Fahrstraße wurde bislang **nicht** durchgeführt. Die genannten Richtungen sind **Strecken-Zielangaben**, keine bewiesenen einzelnen Fahrstraßen zu jedem Gleis. Die OSM-/OpenRailwayMap-Rohdaten wurden für Halle noch nicht importiert.

Für den Originalnachbau ist je Gleisabschnitt die folgende Datenerfassung vorgesehen: OSM-Gleisweg und echte Knoten-ID; Ril-100-Streckennummer und Gleisnummer (falls zugeordnet); durchgehender Anschluss zu anderen Gleisen; Weichennummer und mögliche Stellungen; Signalstandort/-bezeichnung/-richtung; Bahnsteig- oder Betriebsfunktion; Quellennachweis und Unsicherheitsstatus. Danach Gegenprüfung jeder erlaubten Fahrstraße gegen zuverlässige Stellwerksunterlagen.

**Quelle:** [DB InfraGO Betriebsstellenplan LH, 30.09.2026](https://trassenfinder.de/apn/LH), insbesondere die am unteren Rand beschrifteten Streckenrichtungen, die Werkstatt und Gleisgruppen.

## Betriebliche Abgrenzung und offene Fragen

- **Halle (Saale) Hbf** nicht mit **Halle-Ammendorf**, **Halle (Saale) Güterbahnhof**, Neben-/S-Bahnanlagen oder benachbarten Abzweigstellen vermischen.
- Halle Hbf hat getrennte, mehrfach umgebaute Bereiche. **Planstand 30.09.2026** und OSM-Snapshot-Datum müssen zusammen betrachtet werden.
- Alle Weichenlagen (einschließlich Kreuzungsweichen), Signalbezeichnungen und Fahrtrichtungen, Gleisfreimeldung, Verschluss-/Flankenschutz- und Fahrstraßenabhängigkeiten anhand betrieblicher Unterlagen prüfen. Ein öffentliches DB-PDF ersetzt keinen aktuellen Stellwerksplan.
- Für den Spielmodus zuerst reale Gleisachsen und dokumentierte Ausfahrtsrichtungen rekonstruieren, danach die betrieblichen Fahrstraßen; ohne Quellen nicht fiktive Abhängigkeiten als original ausgeben.
- Für Tablet-Nutzung große Betriebsstelle sinnvoll in zoombare Bahnhofsausschnitte mit Übersicht gliedern, aber **nicht** fälschlich entkoppeln.

## Stand der Implementierung

**Nur Quellen- und Datenbeschaffungsphase.** Dieser Eintrag ändert weder Bahnhofsauswahl noch Fahrstraßen des Live-Spiels.

Quellen:
- [DB InfraGO Original-Betriebsstellenplan LH](https://trassenfinder.de/apn/LH)
- [DB InfraGO Bahnsteigdaten Halle Hbf](https://www.dbinfrago.com/web/bahnhoefe/leistungen/stationsnutzung/stationshalt/stationsausstattung/Halle-Saale-Hbf-12671632)
- [DB Orientierungskarte Halle Hbf](https://www.bahnhof.de/downloads/station-plans/2498.pdf)
- [OpenRailwayMap Halle (Saale) Hbf](https://openrailwaymap.org/?lang=de&lat=51.478&lon=11.990&zoom=15&style=standard)
