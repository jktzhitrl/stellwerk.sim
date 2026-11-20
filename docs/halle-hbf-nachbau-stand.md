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

## 20.11.2026 – Benutzerwunsch: nur Personenbahnhof mit Abstellung, kein Güterbahnhof

Die zuvor veröffentlichte große OSM-Gleisnetzvorschau zeigte auch den östlichen **Güterbahnhof samt Zugbildungsanlage (ZBA)**. Deshalb wurde der für Spieler sichtbare Plan auf belegte Personengleise und die dazugehörige Abstellung begrenzt.

### Tatsächlich aufgenommene Gleise

- **1.202 OSM-Segmente** mit `railway:traffic_mode=passenger` für die durchgehenden Personengleise und ihre Bahnsteig-/Zufahrtsbereiche.
- **45 Abstellsegmente:** 25 kartierte Gleisabschnitte der **Kasseler Gruppe** (als Personenzug-Abstellung bei der DB bezeichnet) und 20 Abschnitte des in der DB-InfraGO-Serviceeinrichtungsübersicht 2026 als „Halle (Saale) Hbf, Gleis 136, Abstellung 2“ geführten Gleises. Das OSM-Gleis 136 ist über die originale Knotengeometrie mit dem Personenbahnhof verbunden.
- **6 Abschnitte echter OSM-Verbindungs-Ways** (IDs `1104738780`, `110187475`) ergänzen die Kasseler Abstellung, ohne künstliche Gleise oder erfundene Weichen zu zeichnen.
- **Ausgeschlossen:** alle als `railway:traffic_mode=freight` oder `usage=industrial` getaggten Gleise, nicht als Personenbahnhof oder dokumentierte Abstellung identifizierte Rangiergleise sowie die **„Neue Gruppe“**, deren tatsächliche Funktion noch nicht hinreichend belegt ist.

Der reproduzierbare Zuschnitt aus denselben Originaldaten wird in `halle-hbf-personenbereich.mjs` erzeugt und mit `tools/halle-hbf-scope.mjs` geprüft. **Ergebnis am 20.11.2026: 1.253 von 4.825 Gleissegmenten bleiben**, 3.572 entfallen. Die 1.253 Segmente bilden **einen zusammenhängenden OSM-Gleisgraphen mit 1.236 Knoten**; darin sind 90 kartierte Weichen und 200 signalbezogene OSM-Objekte vorhanden. Diese Werte sagen nichts über die Anzahl tatsächlicher Stellwerksfahrstraßen aus. Die Karte enthält weiterhin echte Personenzug-Zufahrten, jedoch keine Darstellung der Güterbahnhofsgleise.

### Umsetzung im Spiel

- `halle-hbf-play.html` und `halle-hbf-review.html` lesen ausschließlich `data/halle-hbf-personenbereich.json`; die vollständige OSM-Rohaufnahme `data/halle-hbf-osm-review.json` verbleibt als separate technische Quelle.
- Grün markiert: Kasseler Abstellgruppe und DB-Abstellgleis 136; direkte Schaltflächen zentrieren diese Anlagen, ohne in den Güterbahnhof zu springen.
- Der normale Spielstart, die PWA-Offline-Liste und das Android-Paket benutzen den gefilterten Gleisdatensatz. Die vorhandenen Stellwerke bleiben unverändert.

### Offene Prüfungen

`railway:traffic_mode=passenger` bezeichnet eine OSM-Klassifikation und ist **kein amtlich festgelegter Stellwerksbezirk**. Einzelne Betriebs- und Abstellgleise können in OSM fehlen oder falsch gekennzeichnet sein. DB-Gleisnummern, der Planstand vom 30.09.2026, die tatsächlichen Weichenstellungen, Signalrichtungen und Fahrstraßen müssen weiter abgeglichen werden. Die Testzüge sind **geometrische Prüffahrten**, keine bestätigten Original-Stellwerksfahrten.

Quellen: [DB InfraGO Betriebsstellenplan LH, 30.09.2026](https://trassenfinder.de/apn/LH); [DB InfraGO, Gleise in Serviceeinrichtungen 2026](https://www.dbinfrago.com/resource/blob/10907624/448400d59ac3a7179c79a1cc4067d044/gleise_in_serviceeinrichtungen_2026-data.pdf); [Deutsche Bahn – Neuanschluss Kasseler Gruppe](https://www.deutschebahn.com/resource/blob/5836704/ce4227c0fa89a67e85355496a30/2021_VM_001_Foliensatz_Pressegespraech_Halle-data.pdf); © OpenStreetMap contributors, ODbL 1.0.

## 20.11.2026 – Spielbare Signalbedienung und DB-Originalabfahrtsfahrplan (05:00–06:47)

Der Nutzer wünscht jetzt **Fahrplanbetrieb mit Signalen**. Eine geprüfte Original-Stellwerksanlage ist aus den öffentlich verfügbaren Gleisplänen und OSM-Tags nicht rekonstruierbar. Die Umsetzung trennt deshalb **Originaldaten** von **virtueller Stellwerkssimulation**:

- **Originalfahrplan:** `halle-hbf-originalfahrplan.mjs`, mit **33 belegten Abfahrten** vom Freitag, 20.11.2026, 05:00–06:47 aus dem [DB-InfraGO-Regelfahrplan Halle (Saale) Hbf, Regeltafel 2498, gültig ab 14.06.2026](https://www.bahnhof.de/downloads/schedule/Regeltafel_2498.pdf). Übernommen werden Uhrzeit, Zuglinie/-nummer soweit vorhanden, Fahrtziel und angegebenes Bahnsteiggleis/-abschnitt. Individuelle Verkehrstage und abweichende Zeiträume wurden auf den 20.11.2026 geprüft. **Nicht** als original vorhanden: vollständiger 24-h-Fahrplan, Einfahrtzeiten, Umläufe, reale Standpositionen, Rollmaterial und tatsächliche Original-Ausfahrfahrstraße. Alle diese Felder bleiben unbekannt und werden nicht erfunden.
- **Virtuelles Stellwerk:** `halle-hbf-betrieb.mjs` mit Spieluhr, Zugauswahl, Gleisbelegung für den **einen gerade bedienten Zug**, Fahrwegreservierung, virtuellem Hp0/Ks1-Fahrtbegriff und Fahrstraßenauflösung nach Ende der animierten Fahrt. Frei gegebene Simulation kann erst bei Erreichen der DB-Abfahrtszeit ausgelöst werden. Hinweis im Spiel: Dies sind **keine** echten Signalstellungen oder Signal-/Weichen-/Flankenschutzabhängigkeiten.
- **Vorbildsignale:** Reale in OSM kartierte Ks-Mehrabschnittssignale (`railway:signal:combined`) und Klein-/Rangiersignale (`railway:signal:minor`) werden zur Objektprüfung korrekt kategorisiert und **nicht** mit dem virtuellen Signalschalter verwechselt.
- **Spielbarkeit:** Für jedes der 13 Bahnsteiggleis-OSM-Kandidaten ermittelt die konservative Gleiswegprüfung einen tatsächlich zusammenhängenden, längeren **geometrischen OSM-Prüfweg**. Die vorgeschlagenen Wegenden sind **nicht automatisch reale Streckenausfahrten** zu den Fahrplanzielen; die Zuordnung muss später mit Stellwerksunterlagen geprüft werden. Unbekannte DKW/Weichenübergänge bleiben ausgeschlossen. Das Spiel kann keinen außerhalb des OSM-Graphen liegenden Zugweg erfinden.
- **Abstellung:** Kasseler Gruppe und DB-Abstellgleis 136 bleiben im Personenbahnhofs-Spielplan. Güterbahnhof, ZBA und ungeklärte Neue Gruppe bleiben ausgeschlossen.
- **Bedienung:** Zug aus Originaltafel auswählen, OSM-Prüfweg prüfen oder durch Antippen abändern, virtuelle Fahrstraße stellen, virtuelles Signalsystem auf Fahrt, erst nach planmäßiger Abfahrtszeit abfahren lassen, Punktestand bei Abfahrt erhalten. Uhr manuell anhalten oder beschleunigt laufen lassen, alternativ nächste Abfahrt anspringen.


## 20.11.2026 – Bedienpult und Tablet-Layout (Entwicklungsbranch)

Der **Halle-Hbf-Spielmodus** wurde ergonomisch überarbeitet; die echte Datenherkunft und die Grenzen der Simulation bleiben unverändert.

- Die bisher lang scrollende Seitenleiste rückt Fahrplan, Uhr, Zugauswahl, virtuellen Signalbegriff und die Schritte **Zug wählen → Fahrstraße stellen → Abfahrt freigeben** ins vordere Fahrdienstleiter-Pult.
- Ein Knopf wählt den nächsten noch nicht abgefertigten Fahrplanzug. Ein Statushinweis zeigt den nächsten notwendigen Arbeitsschritt; die bestehende Zeitprüfung verhindert weiterhin eine Abfahrt vor Sollzeit.
- Die Gleiskarte besitzt separate Zoomtasten für Touch-Geräte und rahmt einen vorgeschlagenen geometrischen Prüfweg automatisch ein. Die vorhandene Zwei-Finger-, Maus- und Gleis-Tipp-Bedienung bleibt erhalten.
- Kasseler Gruppe und DB-Abstellgleis 136 bleiben direkt erreichbar. Kartierte Signal-/Weichenobjekte, OSM-Referenzen und Originalquellen stehen in einem aufklappbaren Detailbereich; Daten werden nicht entfernt.
- **Keine reale Stellwerkserweiterung:** virtuelle Signalbegriffe, Fahrstraßen und Fahrziele sind weiterhin ausdrücklich keine verifizierten Originalabhängigkeiten. Für echte Fahrstraßen sind DB-Stellwerksunterlagen, Signalrichtungen, DKW-Stellungen, Flankenschutz und verbindliche Bahnsteigzuordnung notwendig.
- Automatische Browser-Prüfung: `tools/tests/halle-hbf-browser-smoke.mjs` testet die Zugauswahl, Zoom, Zeitprüfung, virtuelle Fahrt, Fortschritt und schmale Touch-Ansicht. Workflow: `.github/workflows/halle-hbf-browser-smoke.yml`. Ein Praxistest auf dem tatsächlichen Android-Tablet steht weiterhin aus.

Die Änderung liegt auf `chatgpt/halle-hbf-control-desk-20261120` und wird über Pull Request nach `gh-pages` übernommen, sobald die Prüfung erfolgreich ist.


## 20.11.2026 – Halle Hbf: virtuelle Stellwerksbereiche West/Ost und Weichenwärter Abstellung

Die Nutzerentscheidung lautet: den Halle-Hbf-Spielmodus wie die anderen Bahnhöfe als klar lesbares, waagerechtes Gleisbild anzeigen und in **Fdl West**, **Fdl Ost**, **Weichenwärter Abstellung** und eine gemeinsame **Gesamtansicht** gliedern.

**Wichtig – keine historischen oder heutigen Original-Stellwerksbezirke:** Die Grenze West/Ost wird rein für die Spielansicht aus der Lage der OSM-Personengleise entlang der Hauptachse abgeleitet, nicht aus DB-Stellwerksunterlagen. Einfache Hauptachsen-Projektion und seitliche Spreizung werden nur als SVG-Darstellung benutzt. Alle originalen Knotenkoordinaten, Gleisverbindungen und konservativen geometrischen Fahrwegprüfungen bleiben unverändert. OSM-Gleisreferenzen 1–13 werden im Pult mit Fragezeichen als ungeprüfte Kandidaten gekennzeichnet.

**Bedienung:**
- Bereichsregister „Fdl West“, „Fdl Ost“, „Ww Abstellung“, „Gesamtpult“; alle arbeiten auf einer gemeinsamen virtuellen Spieluhr, Fahrplanauswahl, Fahrstraßen- und Gleisbelegungssimulation. Eine Bereichsauswahl vergrößert automatisch den jeweiligen Abschnitt. Die originale OSM-Geometrie kann zu Prüfzwecken zugeschaltet werden.
- Die bestehende Ausfahrtssimulation mit den 33 belegten DB-Abfahrten bleibt erhalten: Abfahrt auswählen, zusammenhängenden OSM-Testweg anzeigen, virtuelle Fahrstraße stellen, virtuellen Hp0/Ks1-Zustand auswerten, erst nach Planzeit abfahren und Punkte vergeben.
- Optionaler **manueller Übergabemodus** für Spielabsprachen zwischen West/Ost/Weichenwärter: Übergabe anfordern, betroffenen Bereich auswählen, dort bestätigen, dann Fahrt im zuständigen Ausgangspult freigeben. Im voreingestellten Einzelspielermodus laufen Bereichsübergaben automatisch. Eine Übergabebestätigung ist ausdrücklich keine reale Betriebsfreigabe.
- Der eigene Weichenwärter-Modus kann für die belegte Kasseler Gruppe und für DB-Abstellgleis 136 einen konservativ berechneten OSM-Rangierweg vorbereiten, ihn virtuell freigeben und eine animierte Übungs-Rangierfahrt durchführen. Virtuelle Rangierfahrten haben **keine erfundenen DB-Zugnummern, Ankunftszeiten oder Fahrplanpunkte** und sind von den 33 offiziellen DB-Abfahrten getrennt.
- Die übrigen dokumentierten Personen-, Kasseler- und Gleis-136-Gleise bleiben erhalten. Halle Güterbahnhof, ZBA und die nicht belegte „Neue Gruppe“ bleiben ausgeschlossen.

**Sicherheits- und Vorbildgrenzen:** Weder eine im Spiel angezeigte West-/Ost-Grenze noch die virtuelle Weichenwärterfreigabe, OSM-Weichenmarkierung oder der vorgeschlagene Prüfweg sind Nachweise von Original-Weichenstellungen, Signalrichtungen, echten Fahrstraßen, Verschluss-/Flankenschutz, Rangierbezirken oder betrieblicher Zuständigkeit. Dafür fehlen weitere maßgebliche Stellwerksunterlagen. Fiktive Spieloperationen sind im Pult als Simulation gekennzeichnet.

**Technik und Test:** `halle-hbf-bereiche.mjs` bildet die Bereiche und erzeugt ausschließlich visuelle Koordinaten; `halle-hbf-play.html` hält die gemeinsame Bedienung, Simulation und Pointer-Berechnung. `tools/tests/halle-hbf-bereiche.test.mjs` validiert die Abstellgruppen, unveränderte Geometrie und Weichenübergänge. Der bestehende Chromium-Test wurde um Bedienbereiche, Touch-Anzeige, OSM-/Schemamodus und tatsächliche virtuelle Rangierfahrt erweitert. Service Worker `sw.js` und `android-app/scripts/prepare-web.mjs` enthalten das neue Modul für Offline-Betrieb; die Android-Paketdateiliste wird im CI geprüft. Ein manueller Hardwaretest auf dem konkreten Android-Tablet bleibt offen.
