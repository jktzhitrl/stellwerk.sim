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
