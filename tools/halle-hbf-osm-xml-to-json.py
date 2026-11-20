#!/usr/bin/env python3
"""Convert the OpenStreetMap /api/0.6/map XML response to Overpass-style JSON.

This is an independent fallback when public Overpass servers reject automated
queries. No external Python packages required. The output is review-only.
"""
import json
import sys
import xml.etree.ElementTree as ET


def convert(xml_path, output_path):
    tree = ET.parse(xml_path)
    root = tree.getroot()
    if root.tag != "osm":
        raise ValueError("Not an OpenStreetMap XML document")
    nodes = {}
    for e in root.iter("node"):
        tags = {t.attrib["k"]: t.attrib["v"] for t in e.findall("tag")}
        node_id = int(e.attrib["id"])
        nodes[node_id] = {
            "type": "node", "id": node_id,
            "lat": float(e.attrib["lat"]), "lon": float(e.attrib["lon"]),
            "tags": tags,
        }
    ways = []
    relevant_ids = set()
    for e in root.iter("way"):
        tags = {t.attrib["k"]: t.attrib["v"] for t in e.findall("tag")}
        if tags.get("railway") != "rail":
            continue
        ids = [int(n.attrib["ref"]) for n in e.findall("nd")]
        if len(ids) < 2:
            continue
        relevant_ids.update(ids)
        ways.append({"type": "way", "id": int(e.attrib["id"]),
                     "nodes": ids, "tags": tags})
    for node_id, n in nodes.items():
        tags = n["tags"]
        if tags.get("railway") in ("switch", "signal", "buffer_stop", "railway_crossing"):
            relevant_ids.add(node_id)
        if any(k.startswith("railway:signal:") for k in tags):
            relevant_ids.add(node_id)
    missing = sorted(relevant_ids - set(nodes))
    if missing:
        raise ValueError(f"XML map missing {len(missing)} referenced nodes")
    output = {"version": 0.6, "generator": "OSM API XML fallback",
              "osm3s": {"timestamp_osm_base": None},
              "elements": [nodes[i] for i in sorted(relevant_ids)] + ways}
    with open(output_path, "w", encoding="utf-8") as out:
        json.dump(output, out, ensure_ascii=False)
    print(f"Converted {len(ways)} railway ways and {len(relevant_ids)} nodes")
    return output


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python3 tools/halle-hbf-osm-xml-to-json.py INPUT.osm OUTPUT.json")
    convert(sys.argv[1], sys.argv[2])
