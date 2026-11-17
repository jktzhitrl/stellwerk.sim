# Falkenberg – Neuplanung auf Grundlage des alten Gleisbilds

Stand: 17. November 2026. Status: **Planung**, noch keine neue Gleisgeometrie umgesetzt.

## Ausgangslage

Als Ausgangspunkt gilt der frühere, besser lesbare Falkenberg-Entwurf (App-Version 2026-11-17.10), einschließlich der schematischen zweigleisigen Strecke und Üst Heidekreuz. Der zwischenzeitliche Neubau mit zehn gleichförmigen Weichenleiter-Gleisen wurde verworfen. Der Ausgangsstand ist auf gh-pages und dem Entwicklungsbranch wiederhergestellt (App-Version 2026-11-17.12).

**Wichtig:** Der Ausgangsstand nutzt noch die Neustädter Grundgeometrie. Die sechs alten Bahnsteiggleise sind fahrstraßenfähig; die vier ergänzten Gleise sind lediglich dargestellt. Das ist ausdrücklich kein fertiger Großbahnhof.

## Betriebliches Konzept

- **Strecke:** Zweigleisige Hauptstrecke Neustadt – Falkenberg – Teutschenthal, Regelrichtung je Richtungsgleis; Gegengleisfahrten nur über gesicherte Fahrstraßen.
- **Üst Heidekreuz:** Zwei echte Weichenverbindungen mit separaten Blockabschnitten, Hauptsignalen und Verriegelung. Bedienung aus dem Stellwerk Falkenberg; kein bloßer Anzeige-Schalter.
- **Bahnhof Falkenberg:** Eigenständiger Gleisplan mit zwei plausiblen Bahnhofsköpfen. Die Hauptstrecke bleibt in der Mitte durchgehend; Überhol- und Bahnsteiggleise zweigen seitlich ab. Keine universelle Verbindung jedes Streckengleises zu jedem Bahnhofsgleis.
- **Gleise 1–2:** Güter- und Überholgruppe (je nach Richtung erreichbar).
- **Gleise 3–4:** Personenverkehr und Überholung in Richtung Neustadt.
- **Gleise 5–6:** durchgehende Hauptgleise für beide Richtungen, mit Bahnsteigen soweit sinnvoll.
- **Gleise 7–8:** Personenverkehr und Überholung in Richtung Teutschenthal.
- **Gleise 9–10:** Güter-, Abstell- und Bereitstellungsgleise mit eigenem Rangierbereich.
- **Betriebsstelle:** Heidekreuz als getrennte Betriebsstelle auf der freien Strecke, nicht im Bahnhofskopf eingezeichnet.

## Reihenfolge der Umsetzung

1. **Gleisplan:** Eigenständige Geometrie mit plausiblen Abzweigen, Kreuzungen und Weichenstraßen; eindeutige Gleisnummern und freie Beschriftungsflächen.
2. **Topologie:** Alle Gleise mit den passenden Ein- und Ausfahrten verbinden. Für jeden vorgesehenen Fahrweg den durchgehenden Graphen nachweisen.
3. **Signale / Sicherung:** Einfahr-, Ausfahr-, Block- und ggf. Rangiersignale; Fahrstraßen, Gegen- und Flankenschutz sowie Freimeldeabschnitte.
4. **Üst Heidekreuz:** Zwei Richtungsgleise, Überleitfahrstraßen, Blockbelegung, keine gegenläufigen Zugfahrten auf belegtem Gegengleis.
5. **Fahrplan:** Durchfahrten, Halte, Überholungen, Güterfahrten und Übergaben zwischen den drei Bahnhöfen passend zur Gleisnutzung.
6. **Tests:** Syntax, Graph-Erreichbarkeit, alle relevanten Ein-/Ausfahrten, Weichen-/Signalverriegelung, Zugfahrten und Darstellung auf Desktop und Tablet.
7. **Veröffentlichung:** Erst nach überprüftem Entwicklungsstand auf gh-pages übertragen.

## Abnahmekriterien

- Falkenberg ist sichtbar und betrieblich eigenständig, keine Neustadt-Kopie.
- Zehn sinnvoll genutzte Gleise, jedes mit der vorgesehenen befahrbaren Anbindung.
- Zweigleisige Strecke und Üst Heidekreuz sind betrieblich statt nur schematisch modelliert.
- Keine überlappenden Beschriftungen bei üblichen Bildschirmgrößen.
- Neustadt, Teutschenthal und bestehendes Anschlussmanagement funktionieren unverändert.
