import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHalleAreas,HALLE_AREAS,pickShuntingPath} from '../../halle-hbf-bereiche.mjs';
import {buildGraph,findGeometricPath,suggestTestRoute,transitionPossible} from '../../halle-hbf-routing.mjs';
const data=JSON.parse(readFileSync(new URL('../../data/halle-hbf-personenbereich.json',import.meta.url),'utf8'));
const areas=createHalleAreas(data.tracks),graph=buildGraph(data.tracks),switches=new Map(data.osmSwitches.map(w=>[String(w.osmNodeId),w]));
test('Three operator desks and whole-station view are finite, nonempty, and differ',()=>{
 assert.deepEqual(HALLE_AREAS.map(a=>a.id),['west','ost','ww','gesamt']);
 const count={west:0,ost:0,ww:0};
 for(const edge of data.tracks)count[areas.edgeArea(edge)]++;
 assert.ok(count.west>0&&count.ost>0&&count.ww>0,JSON.stringify(count));
 for(const a of HALLE_AREAS){
  const b=areas.bounds(a.id,1.6);
  assert.ok(Object.values(b).every(Number.isFinite));
  assert.ok(b.w>0&&b.h>0);
 }
 assert.ok(areas.bounds('west').y!==areas.bounds('ost').y);
});
test('Schematic coordinates are a reversible presentation; original OSM nodes are unchanged',()=>{
 const a=data.tracks[0].a,xy={x:a.x,y:a.y},view=areas.toView(a),m=areas.matrix;
 assert.ok(Math.abs(view.x-(m[0]*a.x+m[2]*a.y+m[4]))<.0001);
 assert.ok(Math.abs(view.y-(m[1]*a.x+m[3]*a.y+m[5]))<.0001);
 assert.deepEqual({x:a.x,y:a.y},xy);
 assert.equal(graph.get(String(a.nodeId)).p.x,a.x);
 assert.equal(graph.get(String(a.nodeId)).p.y,a.y);
});
test('Documented stabling groups have playable geometric simulation routes only',()=>{
 assert.equal(areas.stablingEdges('kasseler').length,25);
 assert.equal(areas.stablingEdges('136').length,20);
 for(const name of ['kasseler','136']){
  const r=pickShuntingPath(data.tracks,graph,switches,name,findGeometricPath,suggestTestRoute);
  assert.ok(r,'stabling route missing for '+name);
  assert.equal(r.virtual,true);
  assert.equal(r.originalExitVerified,false);
  assert.ok(r.ids.length>=3);
  assert.equal(new Set(r.ids).size,r.ids.length);
  for(let i=1;i<r.ids.length-1;i++){
   const from=graph.get(r.ids[i]).adj.find(e=>e.to===r.ids[i-1]);
   const to=graph.get(r.ids[i]).adj.find(e=>e.to===r.ids[i+1]);
   assert.ok(from&&to);
   assert.equal(transitionPossible(graph,switches,r.ids[i],from.edge,to.edge),true);
  }
 }
});
