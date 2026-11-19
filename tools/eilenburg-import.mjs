#!/usr/bin/env node
/**
 * Reproducible Eilenburg import from Overpass JSON (OpenRailwayMap / OSM).
 * Usage: node tools/eilenburg-import.mjs INPUT.json OUTPUT.json
 * The output is a REVIEW DATASET, never a verified interlocking diagram.
 *
 * Geometry connectivity uses OSM node IDs, NOT rounded coordinates:
 * railway ways crossing at different OSM nodes never connect.
 * Copyright © OpenStreetMap contributors (ODbL 1.0).
 */
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const BOUNDS={s:51.445,w:12.625,n:51.462,e:12.672};
const W=2800,H=1800,PAD=80;
const near=(a,b)=>Math.abs(a-b)<1e-9;
const idOf=n=>String(n);
function project(lon,lat){
  const x=PAD+(lon-BOUNDS.w)/(BOUNDS.e-BOUNDS.w)*(W-2*PAD);
  const y=PAD+(BOUNDS.n-lat)/(BOUNDS.n-BOUNDS.s)*(H-2*PAD);
  return{x:+x.toFixed(3),y:+y.toFixed(3)};
}
export function importEilenburg(osm){
  if(!osm||!Array.isArray(osm.elements))throw Error('Expected Overpass JSON with elements array.');
  const nodes=new Map(),ways=[],switchNodes=new Map(),signalNodes=new Map();
  for(const e of osm.elements){
    if(e.type==='node'&&Number.isFinite(e.lat)&&Number.isFinite(e.lon)){
      nodes.set(idOf(e.id),{id:idOf(e.id),lat:e.lat,lon:e.lon,tags:e.tags||{}});
      if(e.tags?.railway==='switch')switchNodes.set(idOf(e.id),e.tags);
      if(e.tags?.railway==='signal'||Object.keys(e.tags||{}).some(k=>k.startsWith('railway:signal:')))signalNodes.set(idOf(e.id),e.tags);
    }
  }
  for(const e of osm.elements){
    if(e.type!=='way'||e.tags?.railway!=='rail'||!Array.isArray(e.nodes)||e.nodes.length<2)continue;
    if(e.tags?.disused==='yes'||e.tags?.abandoned==='yes'||e.tags?.construction==='yes'||e.tags?.proposed==='yes')continue;
    ways.push(e);
    (e.nodes||[]).forEach((nodeId,i)=>{
      const id=idOf(nodeId),g=e.geometry?.[i];
      if(!nodes.has(id)&&g&&Number.isFinite(g.lat)&&Number.isFinite(g.lon)){
        nodes.set(id,{id,lat:g.lat,lon:g.lon,tags:{}});
      }
    });
  }
  const incidences=new Map();
  for(const way of ways){
    // Count how many rail ways use each exact OSM node ID.
    for(const id of new Set(way.nodes.map(idOf)))incidences.set(id,(incidences.get(id)||0)+1);
  }
  const segments=[],warnings=[],used=new Set();
  for(const way of ways){
    for(let i=1;i<way.nodes.length;i++){
      const a=nodes.get(idOf(way.nodes[i-1])),b=nodes.get(idOf(way.nodes[i]));
      if(!a||!b){warnings.push('Way '+way.id+' missing geometry at '+i);continue;}
      if(a.id===b.id||near(a.lat,b.lat)&&near(a.lon,b.lon))continue;
      const ref=[a.id,b.id].sort().join(':');
      // Several ways occasionally overlap: keep one physical segment.
      if(used.has(ref))continue; used.add(ref);
      const p=project(a.lon,a.lat),q=project(b.lon,b.lat);
      segments.push({a:{...p,nodeId:a.id},b:{...q,nodeId:b.id},osmWayId:String(way.id),
        railwayTrackRef:way.tags?.['railway:track_ref']||way.tags?.ref||null,
        service:way.tags?.service||null});
    }
  }
  const adj=new Map();
  for(const t of segments)for(const [a,b]of [[t.a,t.b],[t.b,t.a]]){
    if(!adj.has(a.nodeId))adj.set(a.nodeId,new Set());
    adj.get(a.nodeId).add(b.nodeId);
  }
  const components=[],unseen=new Set(adj.keys());
  while(unseen.size){const first=unseen.values().next().value,stack=[first];unseen.delete(first);let count=0;
    while(stack.length){const id=stack.pop();count++;for(const n of adj.get(id)||[])if(unseen.delete(n))stack.push(n);}
    components.push(count);
  }
  const switches=[...switchNodes].map(([id,tags])=>{
    const p=nodes.get(id);return{osmNodeId:id,...project(p.lon,p.lat),ref:tags.ref||null,type:tags['railway:switch']||null,degree:adj.get(id)?.size||0};
  });
  const signals=[...signalNodes].map(([id,tags])=>{
    const p=nodes.get(id);return{osmNodeId:id,...project(p.lon,p.lat),
      ref:tags.ref||null,type:tags['railway:signal:main']||tags['railway:signal:shunting']||null,
      railwayTags:tags};
  });
  const endpoints=[...adj.entries()].filter(([,n])=>n.size===1).map(([id])=>{
    const p=nodes.get(id);return{osmNodeId:id,...project(p.lon,p.lat),label:'Ungeprüfter Gleisendpunkt'};
  });
  const report={importedAt:null,source:'OpenStreetMap / OpenRailwayMap (Overpass JSON)',licence:'ODbL 1.0',attribution:'© OpenStreetMap contributors',bbox:BOUNDS,
    ways:ways.length,segments:segments.length,nodes:adj.size,switches:switches.length,signals:signals.length,
    connectedComponents:components.sort((a,b)=>b-a),endpoints:endpoints.length,
    warnings,reviewRequired:['Signaltyp und Fahrtrichtung prüfen','Weichennummern und tatsächliche Weichenlage prüfen',
      'Bauzustand 2026 (Ostkopf) prüfen','Schnittstellen zum Streckennetz manuell festlegen',
      'Keine echten Fahrstraßen ohne Stellwerks-/Verschlussunterlagen ableiten']};
  return{version:2,name:'Eilenburg – OSM-Daten zur fachlichen Prüfung',dataStatus:'UNVERIFIED_OSM_IMPORT',
    source:report.source,attribution:report.attribution,licence:report.licence,bbox:BOUNDS,
    tracks:segments,signals,osmSwitches:switches,osmEndpoints:endpoints,report};
}
export async function main(args){
  if(args.length!==2)throw Error('Usage: node tools/eilenburg-import.mjs INPUT-overpass.json OUTPUT-plan.json');
  const data=JSON.parse(await readFile(args[0],'utf8')),result=importEilenburg(data);
  await writeFile(args[1],JSON.stringify(result,null,2)+'\n');
  console.log('Eilenburg OSM import report:',JSON.stringify(result.report,null,2));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  main(process.argv.slice(2)).catch(e=>{console.error(e);process.exitCode=1;});
}
