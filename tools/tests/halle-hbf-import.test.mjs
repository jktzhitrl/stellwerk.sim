import test from 'node:test';
import assert from 'node:assert/strict';
import { importHalleHbf } from '../halle-hbf-import.mjs';

const node=(id,lat,lon,tags={})=>({type:'node',id,lat,lon,tags});
const way=(id,ids,tags={})=>({type:'way',id,nodes:ids,tags:{railway:'rail',...tags}});
const sample={elements:[
  node(1,51.450,12.630),node(2,51.450,12.632,{railway:'switch',ref:'W99'}),
  node(3,51.450,12.634),node(4,51.451,12.632),
  node(5,51.449,12.633),node(6,51.451,12.633),
  node(7,51.450,12.633,{railway:'signal',ref:'A'}),
  node(8,51.450,12.633),node(9,51.449,12.633),
  way(100,[1,2,3]),way(101,[2,4]),way(102,[5,7,6]),
  way(103,[8,9],{construction:'yes'}),
]};
test('keeps exact OSM node topology, including mapped turnouts',()=>{
  const r=importHalleHbf(sample);
  assert.equal(r.tracks.length,5);
  assert.equal(r.osmSwitches[0].ref,'W99');
  assert.equal(r.osmSwitches[0].degree,3);
  assert.equal(r.signals[0].ref,'A');
  assert.equal(r.report.connectedComponents.length,2);
  assert.equal(r.report.untaggedJunctions.length,0);
  assert.equal(r.report.unusualSwitches.length,0);
  const ids=new Set(r.tracks.flatMap(t=>[t.a.nodeId,t.b.nodeId]));
  assert.equal(ids.has('8'),false);
  assert.equal(ids.has('9'),false);
  assert.equal(r.dataStatus,'UNVERIFIED_OSM_IMPORT');
  assert.match(r.attribution,/OpenStreetMap/);
});
test('same coordinates with DIFFERENT OSM IDs never get joined',()=>{
  const r=importHalleHbf({elements:[
    node(1,51.45,12.63),node(2,51.45,12.631),
    node(3,51.45,12.631),node(4,51.451,12.631),
    way(1,[1,2]),way(2,[3,4]),
  ]});
  assert.equal(r.report.connectedComponents.length,2);
  assert.equal(r.tracks[0].b.x,r.tracks[1].a.x);
  assert.equal(r.tracks[0].b.y,r.tracks[1].a.y);
  assert.notEqual(r.tracks[0].b.nodeId,r.tracks[1].a.nodeId);
  assert.equal(r.report.coincidentDistinctNodes.length,1);
});
test('rejects incomplete Overpass documents and preserves missing-geometry warnings',()=>{
  assert.throws(()=>importHalleHbf({}),/elements/);
  const r=importHalleHbf({elements:[way(1,[101,102])]});
  assert.equal(r.tracks.length,0);
  assert.equal(r.report.warnings.length,1);
});
test('supports out geom without separate node elements and deduplicates overlapping ways',()=>{
  const elements=[
    {type:'way',id:14,nodes:[14,15],geometry:[{lat:51.45,lon:12.64},{lat:51.45,lon:12.641}],tags:{railway:'rail'}},
    {type:'way',id:15,nodes:[15,14],geometry:[{lat:51.45,lon:12.641},{lat:51.45,lon:12.64}],tags:{railway:'rail'}},
  ];
  const r=importHalleHbf({elements});
  assert.equal(r.tracks.length,1);
  assert.equal(r.report.connectedComponents.length,1);
  assert.equal(r.report.nodes,2);
});
