import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildGraph,trackRefs,suggestTestRoute,findGeometricPath,transitionPossible} from '../../halle-hbf-routing.mjs';
import {auditHalleRefs} from '../../halle-hbf-references.mjs';
import {classifySignal} from '../../halle-hbf-objects.mjs';
import {HalleGameSession} from '../../halle-hbf-betrieb.mjs';
import {HALLE_ORIGINAL_DEPARTURES,timetableMinutes} from '../../halle-hbf-originalfahrplan.mjs';
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

test('real OSM node route can run a source-backed scheduled train through virtual Hp0, Ks1 and departure',()=>{
 const graph=buildGraph(d.tracks),switches=new Map(d.osmSwitches.map(w=>[String(w.osmNodeId),w]));
 const audit=auditHalleRefs(d.tracks,trackRefs(d.tracks));
 const service=HALLE_ORIGINAL_DEPARTURES.find(x=>x.time==='05:00');
 assert.ok(service,'first original departure missing');
 const start=audit.platforms.find(x=>x.ref===service.trackRef)?.osmCandidate?.nodeId;
 assert.ok(start,'first departure lacks OSM platform candidate');
 const suggestion=suggestTestRoute(graph,switches,start);
 assert.ok(suggestion,'real start cannot reach test destination');
 const calculated=findGeometricPath(graph,switches,start,suggestion.ids.at(-1));
 assert.ok(calculated&&calculated.ids.length>=3,'no geometrically legal route');
 const game=new HalleGameSession(HALLE_ORIGINAL_DEPARTURES);
 assert.equal(game.select(service.id),true);
 assert.equal(game.reserve({serviceId:service.id,ids:calculated.ids,points:calculated.points,startNode:start}),true);
 assert.equal(game.signal,'Hp0 (Simulation)');
 assert.equal(game.dispatch(),false);
 assert.equal(game.clearSignal(),true);
 assert.equal(game.signal,'Ks1 (Simulation)');
 assert.equal(game.dispatch(),true);
 assert.equal(game.signal,'Hp0 (Simulation)');
 assert.equal(game.complete(),true);
 assert.equal(game.completed.has(service.id),true);
 assert.equal(game.score,100);
 assert.equal(game.route,null);
 assert.equal(game.select(HALLE_ORIGINAL_DEPARTURES[1].id),true);
});
test('train scheduled after simulation clock stays blocked until its published departure time',()=>{
 const g=new HalleGameSession(HALLE_ORIGINAL_DEPARTURES);
 const next=HALLE_ORIGINAL_DEPARTURES.find(x=>x.time==='05:53');
 assert.ok(next);
 assert.equal(g.select(next.id),true);
 const graph=buildGraph(d.tracks),switches=new Map(d.osmSwitches.map(w=>[String(w.osmNodeId),w]));
 const candidate=auditHalleRefs(d.tracks,trackRefs(d.tracks)).platforms.find(p=>p.ref===next.trackRef).osmCandidate;
 const route=suggestTestRoute(graph,switches,candidate.nodeId);
 assert.ok(route);
 assert.equal(g.reserve({serviceId:next.id,ids:route.ids,points:route.points,startNode:candidate.nodeId}),true);
 assert.ok(g.clearSignal());
 assert.equal(g.dispatch(),false,'early departure must remain locked');
 g.advance(timetableMinutes(next.time)-g.clock);
 assert.equal(g.dispatch(),true);
 assert.equal(g.complete(),true);
});
