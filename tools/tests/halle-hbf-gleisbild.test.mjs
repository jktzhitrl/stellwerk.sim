import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHalleAreas} from '../../halle-hbf-bereiche.mjs';
import {createHalleSchematic,HALLE_SCHEMATIC_LANES,HALLE_SCHEMATIC_TRACKS} from '../../halle-hbf-gleisbild.mjs';
const data=JSON.parse(readFileSync(new URL('../../data/halle-hbf-personenbereich.json',import.meta.url),'utf8'));
const oldAreas=createHalleAreas(data.tracks),scheme=createHalleSchematic(data.tracks,oldAreas);
test('the control board has 13 well-separated straight station tracks and four documented stabling references',()=>{
 assert.deepEqual(HALLE_SCHEMATIC_TRACKS.slice(0,13),Array.from({length:13},(_,i)=>i+1));
 assert.deepEqual(HALLE_SCHEMATIC_TRACKS.slice(13),[136,160,161,162]);
 for(let i=1;i<=13;i++){
  assert.ok(HALLE_SCHEMATIC_LANES[i], 'missing platform '+i);
  if(i>1)assert.ok(HALLE_SCHEMATIC_LANES[i]-HALLE_SCHEMATIC_LANES[i-1]>=55);
  const anchored=[...scheme.anchors].filter(([,ref])=>ref===String(i));
  assert.ok(anchored.length>10,'OSM track '+i+' not anchored');
  for(const [node] of anchored){
   assert.equal(scheme.ofNode(node).y,HALLE_SCHEMATIC_LANES[i],'ref '+i+' should be straight');
  }
 }
 assert.equal(scheme.sectorForRef('1'),'west');
 assert.equal(scheme.sectorForRef('7'),'west');
 assert.equal(scheme.sectorForRef('8'),'ost');
 assert.equal(scheme.sectorForRef('13'),'ost');
 assert.equal(scheme.sectorForRef('136'),'ww');
});
test('all OSM edges preserve their original node connectivity and do not create fabricated connections',()=>{
 assert.equal(scheme.positions.size,1236,'the passenger OSM node set unexpectedly changed');
 assert.equal(data.tracks.length,1253);
 for(const e of data.tracks){
  const p=scheme.ofNode(e.a.nodeId),q=scheme.ofNode(e.b.nodeId);
  assert.ok(p&&q);
  assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
  assert.ok(Number.isFinite(q.x)&&Number.isFinite(q.y));
  assert.deepEqual(scheme.edgeCoords(e),[p,q]);
  assert.equal(scheme.toDiagram(e.a).x,p.x);
  assert.equal(scheme.toDiagram(e.a).y,p.y);
  assert.ok(['west','ost','ww'].includes(scheme.ofEdge(e)));
 }
});
test('all operator panels have different framed views and still share the same graph',()=>{
 const ratio=768/520;
 const west=scheme.frame('west',ratio),east=scheme.frame('ost',ratio),ww=scheme.frame('ww',ratio),all=scheme.frame('gesamt',ratio);
 for(const f of [west,east,ww,all])assert.ok(Object.values(f).every(x=>Number.isFinite(x)&&x>0),'invalid frame '+JSON.stringify(f));
 assert.ok(west.y+west.h/2<east.y+east.h/2,'Fdl Ost not separated');
 assert.ok(east.y+east.h/2<ww.y+ww.h/2,'Ww not separated');
 assert.ok(all.h>west.h,'overview not substantially larger');
});
