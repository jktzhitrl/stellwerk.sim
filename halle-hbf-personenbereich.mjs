/*
 * Halle (Saale) Hbf – strictly scoped passenger station with stabling,
 * preserving actual OSM node topology. No fake switches or connections.
 *
 * DB InfraGO LH 30.09.2026 + OpenStreetMap © contributors, ODbL 1.0.
 * Source tags are evidence; the operational border and use of "Neue Gruppe"
 * still need manual validation against original station documentation.
 */
export const HALLE_STABLING_NAMES=Object.freeze(['Kasseler Gruppe','Neue Gruppe']);
// Exact OSM way IDs, located by shortest non-freight connection to tagged
// passenger lines from each of the two named groups. They are original ways,
// not manually added physical edges. Check when source OSM data changes.
export const HALLE_STABLING_CONNECTORS=Object.freeze([
  '1104738780','1104738781','1104738782','110187475'
]);
export function classifyPassengerWay(way){
  if(way?.type!=='way'||way.tags?.railway!=='rail')return null;
  const tags=way.tags||{},id=String(way.id);
  if(tags['railway:traffic_mode']==='freight'||tags.usage==='industrial'||
     tags.disused==='yes'||tags.abandoned==='yes'||tags.construction==='yes'||
     tags.proposed==='yes')return null;
  if(tags['railway:traffic_mode']==='passenger')return 'personenbahn';
  if(tags.name==='Kasseler Gruppe')return 'abstellung';
  if(tags.name==='Neue Gruppe')return 'weitere-gruppe';
  if(HALLE_STABLING_CONNECTORS.includes(id))return 'verbindung';
  return null;
}
export function scopeHallePersonenbahnhof(raw,imported){
  if(!Array.isArray(raw?.elements)||!Array.isArray(imported?.tracks))throw Error('OSM-Rohdaten und importierter Gleisgraph benötigt.');
  const ways=new Map(raw.elements.filter(w=>w.type==='way').map(w=>[String(w.id),w]));
  const selected=new Map();
  for(const w of ways.values()){const kind=classifyPassengerWay(w);if(kind)selected.set(String(w.id),kind);}
  const tracks=imported.tracks.filter(t=>selected.has(String(t.osmWayId))).map(t=>{
    const rawTags=ways.get(String(t.osmWayId)).tags;
    return {...t,kind:selected.get(String(t.osmWayId)),
      originalTrackRef:rawTags['railway:track_ref']||null,
      lineRef:rawTags.ref||null,
      originalWayName:rawTags.name||null};
  });
  const nodes=new Set(tracks.flatMap(t=>[String(t.a.nodeId),String(t.b.nodeId)]));
  const switches=(imported.osmSwitches||[]).filter(w=>nodes.has(String(w.osmNodeId)));
  const signals=(imported.signals||[]).filter(s=>nodes.has(String(s.osmNodeId)));
  const graph=new Map();
  for(const t of tracks){
    const a=String(t.a.nodeId),b=String(t.b.nodeId);
    if(!graph.has(a))graph.set(a,new Set());
    if(!graph.has(b))graph.set(b,new Set());
    graph.get(a).add(b);graph.get(b).add(a);
  }
  const seen=new Set(),components=[];
  for(const id of graph.keys()){
    if(seen.has(id))continue;
    const queue=[id];seen.add(id);let size=0;
    for(let i=0;i<queue.length;i++){const u=queue[i];size++;
      for(const v of graph.get(u))if(!seen.has(v)){seen.add(v);queue.push(v);}
    }
    components.push(size);
  }
  components.sort((a,b)=>b-a);
  const byKind=Object.fromEntries(['personenbahn','abstellung','weitere-gruppe','verbindung'].map(k=>[k,tracks.filter(t=>t.kind===k).length]));
  const freightWayIds=new Set(raw.elements.filter(w=>w.type==='way'&&(w.tags?.['railway:traffic_mode']==='freight'||w.tags?.usage==='industrial')).map(w=>String(w.id)));
  if(tracks.some(t=>freightWayIds.has(String(t.osmWayId))))throw Error('Freight segment leaked into passenger station.');
  if(!byKind.personenbahn||!byKind.abstellung)throw Error('Passenger or stabling ways missing from OSM source.');
  const report={source:'DB InfraGO LH (30.09.2026), OpenStreetMap/OpenRailwayMap',
    originalSegments:imported.tracks.length,retainedSegments:tracks.length,removedSegments:imported.tracks.length-tracks.length,
    kinds:byKind,railNodes:graph.size,components,signals:signals.length,switches:switches.length,
    excludedFreightWays:[...freightWayIds].length,
    warnings:['Halle Gbf/ZBA und nicht zugeordnete Rangiergleise aus der SPIELANSICHT ausgeschlossen',
      'Kasseler Gruppe als Personen-Zugabstellung belegt; einzelne Gleise und betriebliche Nutzung noch überprüfen',
      'Neue Gruppe nur als weitere Gleisgruppe, nicht als bestätigte Personenabstellung gekennzeichnet',
      'Streckenanschlüsse, Signalrichtungen und Originalfahrstraßen weiterhin fachlich prüfen']};
  return {version:2,name:'Halle (Saale) Hbf – Personenbahnhof und Abstellung (OSM-Vorschau)',
    dataStatus:'UNVERIFIED_OSM_IMPORT',scope:'PASSENGER_STATION_AND_STABLING',
    attribution:'© OpenStreetMap contributors',licence:'ODbL 1.0',
    source:report.source,bbox:imported.bbox,tracks,signals,osmSwitches:switches,
    report};
}
