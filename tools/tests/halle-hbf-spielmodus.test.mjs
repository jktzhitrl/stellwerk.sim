import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildGraph,trackRefs,suggestTestRoute,transitionPossible} from '../../halle-hbf-routing.mjs';
import {auditHalleRefs} from '../../halle-hbf-references.mjs';
import {classifySignal} from '../../halle-hbf-objects.mjs';
const d=JSON.parse(readFileSync(new URL('../../data/halle-hbf-personenbereich.json',import.meta.url),'utf8'));
test('all 13 timetable platform candidates have genuine connected, explicitly non-authentic test tracks',()=>{
 const graph=buildGraph(d.tracks),switches=new Map(d.osmSwitches.map(w=>[String(w.osmNodeId),w]));
 const audit=auditHalleRefs(d.tracks,trackRefs(d.tracks));
 for(const {ref,osmCandidate} of audit.platforms){
  assert.ok(osmCandidate,'no platform '+ref);
  const path=suggestTestRoute(graph,switches,osmCandidate.nodeId);
  assert.ok(path,'OSM track '+ref+' has no test path');
  assert.equal(path.ids[0],osmCandidate.nodeId);
  assert.ok(path.points.length>=3);
  assert.equal(path.originalExitVerified,false);
  assert.equal(new Set(path.ids).size,path.ids.length);
  for(let i=1;i<path.ids.length-1;i++){
   const id=path.ids[i],previous=path.ids[i-1],next=path.ids[i+1];
   const entry=graph.get(id).adj.find(e=>e.to===previous);
   const exit=graph.get(id).adj.find(e=>e.to===next);
   assert.ok(entry&&exit);
   assert.ok(transitionPossible(graph,switches,id,entry.edge,exit.edge),'illegal test path at '+id);
  }
 }
});
test('original OSM Ks combined signal tags are preserved but NEVER given operational state',()=>{
 const combined=d.signals.find(s=>s.railwayTags?.['railway:signal:combined']);
 assert.ok(combined,'no mapped Ks signal in passenger scope');
 const classified=classifySignal(combined);
 assert.equal(classified.kind,'main');
 assert.equal(classified.operational,false);
 const dwarf=d.signals.find(s=>s.railwayTags?.['railway:signal:minor']);
 assert.ok(dwarf);
 assert.equal(classifySignal(dwarf).kind,'shunting');
});
