/*
 * Halle (Saale) Hbf, DB InfraGO plan LH 30.09.2026, with OSM map references.
 * The presence of an OSM way ref does NOT confirm a DB platform or a route.
 * Station anchor is a map-view reference point, NOT a measured platform location.
 */
export const HALLE_STATION_FOCUS = Object.freeze({x:1050,y:950});
export const HALLE_PLATFORM_NUMBERS = Object.freeze(Array.from({length:13},(_,i)=>String(i+1)));
export const HALLE_LINE_DIRECTIONS = Object.freeze([
  {ref:'6343',label:'Sangerhausen',via:'Halle Abzw Ac'},
  {ref:'6340',label:'Merseburg',via:'Halle Abzw At'},
  {ref:'6053',label:'Gröbers',via:'Halle Abzw Al'},
  {ref:'6403',label:'Leipzig',via:'Halle Abzw Al'},
  {ref:'6050',label:'Halle-Trotha / Halle Gbf',via:'Betriebsstellenabgrenzung prüfen'}
]);
export function candidateForRef(tracks,refs,ref,focus=HALLE_STATION_FOCUS){
 const matches=refs.get(String(ref))||[];
 if(!matches.length)return null;
 let nearest=null,best=Infinity;
 for(const index of matches){
  const edge=tracks[index];if(!edge?.a||!edge?.b)continue;
  const center={x:(edge.a.x+edge.b.x)/2,y:(edge.a.y+edge.b.y)/2};
  const dist=Math.hypot(center.x-focus.x,center.y-focus.y);
  if(dist<best){best=dist;nearest={ref:String(ref),index,nodeId:String(Math.hypot(edge.a.x-focus.x,edge.a.y-focus.y)<=Math.hypot(edge.b.x-focus.x,edge.b.y-focus.y)?edge.a.nodeId:edge.b.nodeId),x:center.x,y:center.y,distanceFromFocus:dist,wayId:edge.osmWayId??null,segmentCount:matches.length};}
 }
 return nearest;
}
export function auditHalleRefs(tracks,refs){
 const platforms=HALLE_PLATFORM_NUMBERS.map(ref=>({
  ref,osmCandidate:candidateForRef(tracks,refs,ref),dbPlatformVerified:false
 }));
 const lines=HALLE_LINE_DIRECTIONS.map(({ref,label,via})=>({
  ref,label,via,osmCandidate:candidateForRef(tracks,refs,ref),toPlatformRoutesVerified:false
 }));
 return {platforms,lines,warning:'OSM-Referenz ist kein Nachweis der Zuordnung zum Bahnsteig oder einer erlaubten Fahrstraße.'};
}
