/*
 * OpenRailwayMap / OpenStreetMap data extraction – Eilenburg, approximate
 * BBox (south,west,north,east). Run manually in https://overpass-turbo.eu/
 * ODbL 1.0; keep attribution to OpenStreetMap contributors.
 */
[out:json][timeout:90];
(
  way["railway"="rail"](51.445,12.625,51.462,12.672);
  node["railway"~"^(switch|signal|buffer_stop|railway_crossing)$"](51.445,12.625,51.462,12.672);
  node["railway:signal:main"](51.445,12.625,51.462,12.672);
);
out body geom;
