import unittest
import tempfile
import json
from pathlib import Path
from importlib.machinery import SourceFileLoader

converter = SourceFileLoader("converter", str(Path(__file__).resolve().parents[1] / "halle-hbf-osm-xml-to-json.py")).load_module()

class OSMXmlFallbackTest(unittest.TestCase):
    def test_railway_ways_and_tagged_switch_signal_nodes(self):
        xml = """<?xml version="1.0" encoding="UTF-8"?>
        <osm version="0.6" generator="unit-test">
          <node id="1" lat="51.45" lon="12.630"/>
          <node id="2" lat="51.45" lon="12.631"><tag k="railway" v="switch"/><tag k="ref" v="99"/></node>
          <node id="3" lat="51.45" lon="12.632"/>
          <node id="4" lat="51.451" lon="12.631"><tag k="railway:signal:main" v="DE-ESO:hp"/></node>
          <node id="5" lat="51.450" lon="12.633"/>
          <way id="10"><nd ref="1"/><nd ref="2"/><nd ref="3"/><tag k="railway" v="rail"/></way>
          <way id="11"><nd ref="2"/><nd ref="4"/><tag k="railway" v="rail"/></way>
          <way id="12"><nd ref="4"/><nd ref="5"/><tag k="highway" v="service"/></way>
        </osm>"""
        with tempfile.TemporaryDirectory() as temp:
            inp=Path(temp)/"map.osm"; out=Path(temp)/"converted.json"
            inp.write_text(xml)
            data=converter.convert(inp, out)
            self.assertEqual(len(data["elements"]),6)  # 4 relevant nodes + 2 ways
            self.assertEqual(len([e for e in data["elements"] if e["type"]=="way"]),2)
            nodes={n["id"]:n for n in data["elements"] if n["type"]=="node"}
            self.assertEqual(nodes[2]["tags"]["ref"],"99")
            self.assertEqual(nodes[4]["tags"]["railway:signal:main"],"DE-ESO:hp")
            self.assertEqual(json.loads(out.read_text())["elements"],data["elements"])

    def test_invalid_osm_xml(self):
        with tempfile.TemporaryDirectory() as temp:
            inp=Path(temp)/"broken.osm"; out=Path(temp)/"broken.json"
            inp.write_text("<html/>")
            with self.assertRaisesRegex(ValueError, "OpenStreetMap"):
                converter.convert(inp, out)

    def test_missing_way_node_is_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            inp=Path(temp)/"missing.osm"; out=Path(temp)/"missing.json"
            inp.write_text('<osm><node id="1" lat="51.45" lon="12.63"/><way id="2"><nd ref="1"/><nd ref="999"/><tag k="railway" v="rail"/></way></osm>')
            with self.assertRaisesRegex(ValueError, "missing"):
                converter.convert(inp, out)

if __name__=="__main__":
    unittest.main()
