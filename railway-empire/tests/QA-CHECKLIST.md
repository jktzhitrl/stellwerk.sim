# Railway Empire – Qualitätssicherung (v1.4)

## Automatisierte Tests

Ohne externe Pakete:

```bash
node --test railway-empire/tests/regression.test.cjs
```

Der Testlauf prüft die Skript-Syntax, Kartenquellen und UI-Anker, Spielstandskompatibilität, Regeln für gewonnene Netze und Linien, Graphverbindungen und fehlende Gleisverbindungen, Halteaufenthalt und Wende, Position auf dem Gleis, Pausier-/Geschwindigkeitssteuerung, Overpass-Fallback und das erste Leipziger S-Bahn-Gebot mit Fahrzeugbeschaffung.

## Manuelle Abnahme (Tablet + Desktop)

Diese Punkte **müssen vor einer uneingeschränkten Produktionsfreigabe auf echten Geräten geprüft werden**. Sie wurden durch die automatisierten Tests **nicht** nachgewiesen.

1. **Neues Spiel:** In Safari auf iPad neu öffnen, helle Karte und keine API-KEY-Fehler. OpenFreeMap darf auf OSM zurückfallen. Icon-Menü und Tutorial müssen nutzbar bleiben.
2. **Karte:** Mit zwei Fingern zoomen, verschieben, ins eigene Netz zurückkehren. Marker und Kartenkacheln dürfen nicht verschwinden. Technische Gleise nur auf ausdrückliches Einschalten.
3. **Vertragsgewinn:** S-Bahn-Ausschreibung Leipzig–Halle am Tag 1 korrekt anbieten (Kapazität und Fahrzeugbudget), an Tag 2 Vergabe auslösen. Gewinn und Ablehnung funktionieren. Kein garantierter Zuschlag.
4. **Gewonnenes Netz:** Alle erfolgreich geladenen Stationskandidaten auch beim Herauszoomen sehen. Endbahnhöfe sichtbar. Nicht zum Netz gehörige Bahnhofsmarker ausgeblendet. Externe OSM-Daten sind unverbindlich, nicht garantiert vollständig.
5. **Linie mit Touch:** Linien-Symbol > gewonnene Strecke > Karte. Auf Haltestellen tippen, beliebige Halte in sinnvoller Reihenfolge wählen, letzten Halt zurücknehmen. Kartenbereich trotz Editor erreichbar. Zweiter gleicher Halt wird abgewiesen.
6. **Züge:** In der Kartenplanung mindestens einen dem Vertrag zugeteilten Zug wählen. Doppelte Reservierung über zwei Linien verhindern.
7. **Fahrweg:** Bei vollständigen Gleisdaten echte zusammenhängende Route finden; bei fehlender Verbindung klaren Fehler anzeigen, nicht künstlich in gerader Linie fahren.
8. **Live:** Marker entlang der Geometrie beobachten; Zwischenhaltestellen mit kurzer Pause, Wende am Ende, fortlaufende Rückfahrt. Pause/1×/2×/4× prüfen.
9. **Wechseln:** Andere iPad-App öffnen, zurückkommen – keine sprunghafte Aufholanimation. Seite neu laden – Vertragslinien und Züge bleiben gespeichert; vorhandene Live-Routen starten erneut.
10. **Fehlerfälle:** OSM-/Overpass-Verbindung trennen, Browser offline, Karte zurückstellen. Spiel darf nicht abstürzen und muss Fehlermeldungen zeigen.
11. **Responsive:** Quer-/Hochformat, iPad- und Desktopgrößen; keinerlei Überlappung von Linieneditor, Tutorial, Status und Kartenbedienung.

## Noch nicht implementiert

Die Zuganimation nutzt **beschleunigte Spielzeit** auf OSM-basierten Gleiswegen. Haltezeiten sind vereinfachte Spielwerte. Es gibt noch keine echte Signal- und Zugbelegungssimulation, keine Fahrzeugbeschleunigung/Bremskurven, keinen fahrplanbasierten Umlauf und keine Garantie für einen vollständigen deutschlandweiten Gleisgraphen. Die Stationskandidaten können weiter vom tatsächlich befahrenen Gleis entfernt liegen; nicht verifizierbare Fahrten werden nicht als solche dargestellt.

## Betriebsrisiken

Öffentliche Karten-/Overpass-Dienste und CDN-Bibliotheken benötigen Internet und können ausfallen, langsamer werden oder begrenzen. Lokal gespeicherte Routen reduzieren Folgeabfragen. Für ein großes fertiges Spiel wäre ein eigenes, gepflegtes Datenbackend mit offline/cached Graphen und automatisierten echten Browser-/Touchtests erforderlich.
