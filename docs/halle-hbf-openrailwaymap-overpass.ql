/*
 * Halle (Saale) Hauptbahnhof – VORLÄUFIGER OSM-Ausschnitt.
 * BBox south,west,north,east. Nach offizieller Planabgrenzung anpassen.
 * Noch nicht ausgeführt, weder Vollständigkeit noch Bauzustand geprüft.
 * Daten: © OpenStreetMap contributors, ODbL 1.0
 */
[out:json][timeout:180];
(
  way["railway"="rail"](51.467,11.971,51.490,12.014);
  node["railway"~"^(switch|signal|buffer_stop|railway_crossing)$"](51.467,11.971,51.490,12.014);
  node["railway:signal:main"](51.467,11.971,51.490,12.014);
);
out body geom;
