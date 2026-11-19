# Eilenburg: Technischer Prüfbericht – 19.11.2026

**Prüfgegenstand:** Originaldaten-Snapshot `data/eilenburg-osm-review.json` und eigenständige OSM-Prüfkarte. Quelle: © OpenStreetMap contributors, ODbL 1.0. **Keine Überprüfung der originalen Stellwerksabhängigkeiten oder exakten Bauausführung.**

## Prüfergebnisse

| Test | Ergebnis |
| --- | --- |
| Datensatz gültiges JSON, 81 `railway=rail`-Ways | OK |
| 499 Gleissegmente, 486 unterschiedliche OSM-Knoten | OK |
| Fehlende Geometrie / Importwarnungen | Keine |
| OSM-Knotengraph zusammenhängend | 1 Komponente; **keine Aussage über zulässige Zugfahrten** |
| 45 Weichen mit `railway=switch`-Tags | Erfasst |
| 53 signalbezogene Objekte | Erfasst, **nicht** 53 Hauptsignale |
| Davon Hauptsignal-Tags (`railway:signal:main`) | 18 |
| Vier als Doppelkreuzungsweichen kartiert | Manuelle Weichenlogik notwendig |
| Eine Weiche mit nur einem verbundenen Gleis | Auffällig: OSM-Knoten **2585317874**, `ref=1`, Knotengrad 1; möglicherweise Kartenausschnitt, fehlender Weg oder fehlerhaftes Tag |
| Nicht als Weiche getaggte Verzweigungen | Keine in diesem Graphen |
| Zwei unterschiedliche OSM-Knoten am selben GPS-Punkt | Keine nach 7 Dezimalstellen |
| Browserdarstellung mit Chromium, Desktop 1280×800 | OK; 499 Gleise, 45 Weichen, 53 Signalobjekte; keine JS-Laufzeitfehler |
| Browserdarstellung in Tablet-Größe 768×1024 | OK; keine JS-Laufzeitfehler |
| Ein-/Ausblenden und Objektauswahl | OK, OSM-Objektdetails sichtbar |
| Automatische Import-Tests | 4 Node.js- und 3 Python-Tests erfolgreich |
| End-to-End-OSM-Import, Prüfkarte und Snapshot auf GitHub | Erfolgreicher Workflow #44507890009 |

**Kartenfehler korrigiert:** Zunächst war die Karte so weit herausgezoomt, dass der Bahnhof kaum erkennbar war, weil OpenStreetMap vollständige Ways über den gewählten geografischen Ausschnitt hinaus liefert. Jetzt startet die Karte mit dem eigentlichen Bahnhofsbereich (`x=0..2800, y=0..1800`); die Gesamtansicht aller importierten Ways ist über eine separate Taste abrufbar. **Außerhalb liegende Ways nicht als Teil des Bahnhofskopfes zählen.**

### Fünf auffällige Weichen

- Vier Doppelkreuzungsweichen (OSM-Nodes `1035867748`, `1035868548`, `1035868661`, `2585317868`) mit je **vier** Gleisanschlüssen. Knotengrad 4 ist bei DKW möglich; der Graph allein sagt nicht, welche Fahrbeziehungen in welcher Weichenlage möglich sind. **Nicht einfach jede Verbindung erlauben.**
- OSM-Node `2585317874`, `ref=1`: als Weiche markiert, aber im importierten Datensatz nur **ein** Gleisende. Ursachen offen; keine Weichenstellung daraus ableiten.

### Signalprüfung

`53` ist die Zahl aller signalbezogenen OSM-Objekte, inklusive Signaltafeln, Geschwindigkeits-, Schutz- und Vorsignal-Tags sowie **drei Prellböcke mit Sh2-Angaben**. **Nur 18 Objekte besitzen Hauptsignal-Tags.** Haupt-, Vorsignal- und Rangierfunktion und reale Richtung sind vor Stellwerksbetrieb im Einzelnen zu verifizieren. `railway:signal:main` ist keine vollständige Fahrstraßen- oder Verschlussunterlage.


### Zusätzliche Bedienungsprüfung

Die korrigierte Prüfkarte wurde im Chromium-Browser auch mit Viewports **1280×800, 768×1024 und 412×915** geprüft. Gleise werden gezeichnet, es traten keine JS-Laufzeitfehler auf. Auf Tablet-/Handy-Breite ist die Kartenansicht nun über der Objektliste angeordnet statt in einer zu engen Seitenspalte. Die Berührungsauswahl nimmt auch Klicks bis 25 Bildschirm-Pixel neben der Weichen- oder Signalmarkierung an; die Objektkennungen erschienen in den Tests. Die Tasten **„Bahnhof zentrieren“** und **„Alle OSM-Gleise“** wechseln zwischen nutzbarer Bahnhofssicht und vollständigem (größerem) OSM-Wege-Ausschnitt. Diese Browseremulation ersetzt keinen Hardwaretest auf einem Android-Tablet.

## Ergebnis und Freigabegrenze

Der Datensatz ist **technisch plausibel und reproduzierbar importiert**. Das Gleisbild eignet sich zur manuellen Vorbildprüfung, **noch nicht zur originalgetreuen Betriebs-/Fahrstraßensimulation**.

Offen sind insbesondere der DB-Gleisplan-Abgleich (05.05.2026), das reale Umbau-Stadium am Ostkopf 2026, die vier DKW-Übergänge, die unklare Weiche 1 sowie Signalbezeichnungen, Fahrstraßen, Verschlussabhängigkeiten, Flankenschutz und Gleisfreimeldung. **Keine Originaltreue behaupten, bevor diese Punkte belegt und getestet sind.**
