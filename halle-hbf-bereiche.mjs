/* Virtual operating areas of Halle Hbf.
 * This is a VISUAL/PLAY partition, not original DB interlocking territory.
 * OSM nodes and edges are never altered; routing uses original coordinates.
 */
export const HALLE_AREAS=Object.freeze([
 {id:'west',label:'Fdl West',description:'Westliche Personengleise und Fahrstraßen (Spielbereich)'},
 {id:'ost',label:'Fdl Ost',description:'Östliche Personengleise und Fahrstraßen (Spielbereich)'},
 {id:'ww',label:'Ww Abstellung',description:'Kasseler Gruppe und DB-Gleis 136 (virtueller Rangierdienst)'},
 {id:'gesamt',label:'Gesamtpult',description:'Zusammenhängender Personenbahnhof und Abstellung'}
]);
export function createHalleAreas(tracks){
 const passenger=tracks.filter(e=>e.kind==='personenbahn');
 if(passenger.length<2)throw Error('No passenger tracks for schematic layout');
 const samples=passenger.map(e=>({x:(e.a.x+e.b.x)/2,y:(e.a.y+e.b.y)/2}));
 const center={x:samples.reduce((s,p)=>s+p.x,0)/samples.length,
   y:samples.reduce((s,p)=>s+p.y,0)/samples.length};
 const xx=samples.reduce((s,p)=>s+(p.x-center.x)**2,0),yy=samples.reduce((s,p)=>s+(p.y-center.y)**2,0),
   xy=samples.reduce((s,p)=>s+(p.x-center.x)*(p.y-center.y),0);
 const theta=.5*Math.atan2(2*xy,xx-yy),c=Math.cos(theta),s=Math.sin(theta);
 const verticalScale=1.45;
 const matrix=[c,-s*verticalScale,s,c*verticalScale,
   -c*center.x-s*center.y,verticalScale*(s*center.x-c*center.y)];
 function toView(p){
  return{x:c*(p.x-center.x)+s*(p.y-center.y),
    y:verticalScale*(-s*(p.x-center.x)+c*(p.y-center.y))};
 }
 function sectorForPoint(p){
  // In the long station corridor, a positive lateral offset points west.
  return toView(p).y>=0?'west':'ost';
 }
 const wwNodeIds=new Set();
 for(const e of tracks)if(e.kind==='abstellung'){
  wwNodeIds.add(String(e.a.nodeId));wwNodeIds.add(String(e.b.nodeId));
 }
 function edgeArea(e){
  if(e.kind==='abstellung'||e.kind==='verbindung')return'ww';
  return sectorForPoint({x:(e.a.x+e.b.x)/2,y:(e.a.y+e.b.y)/2});
 }
 function areaForNode(id,p){return wwNodeIds.has(String(id))?'ww':sectorForPoint(p);}
 function routeAreas(ids,graph){
  const found=new Set();
  for(const id of ids||[]){
   const node=graph.get(String(id));
   if(node)found.add(areaForNode(id,node.p));
  }
  return[...found];
 }
 const assigned=tracks.map(edgeArea);
 function bounds(area,aspect=1.6){
  let points=[];
  for(let i=0;i<tracks.length;i++){
   const edge=tracks[i],kind=assigned[i];
   if(area!=='gesamt'&&area!==kind)continue;
   const m=toView({x:(edge.a.x+edge.b.x)/2,y:(edge.a.y+edge.b.y)/2});
   // Remove long approach/outlier spurs when fitting the player-facing board,
   // never when building the graph or drawing the real edges.
   if(area!=='ww'&&(Math.abs(m.x)>990||Math.abs(m.y)>520))continue;
   points.push(toView(edge.a),toView(edge.b));
  }
  if(!points.length)return{x:-750,y:-450,w:1500,h:900};
  const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
  const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  let w=Math.max(area==='ww'?450:800,x1-x0+160),h=Math.max(area==='ww'?280:380,y1-y0+140);
  const ratio=Math.max(.5,Math.min(3,aspect));
  if(w/h<ratio)w=h*ratio;else h=w/ratio;
  return{x:(x0+x1-w)/2,y:(y0+y1-h)/2,w,h};
 }
 function stablingEdges(group){
  return tracks.filter(e=>e.kind==='abstellung'&&
   (group==='kasseler'?e.originalWayName==='Kasseler Gruppe':e.originalTrackRef==='136'));
 }
 return {center,theta,matrix,toView,sectorForPoint,edgeArea,areaForNode,routeAreas,bounds,stablingEdges,assigned};
}
export function pickShuntingPath(edges,graph,switches,name,findPath,suggestRoute){
 const matching=edges.filter(e=>e.kind==='abstellung'&&
   (name==='kasseler'?e.originalWayName==='Kasseler Gruppe':e.originalTrackRef==='136'));
 if(!matching.length)return null;
 const endpoints=[...new Set(matching.flatMap(e=>[String(e.a.nodeId),String(e.b.nodeId)]))];
 // Prefer a movement inside the documented stabling group. Never bridge
 // disconnected nodes or ambiguous DKW transitions for the sake of gameplay.
 let best=null;
 const origins=[endpoints[0],endpoints[Math.floor(endpoints.length/2)],endpoints.at(-1)];
 for(const from of origins){
  if(!graph.has(from))continue;
  for(const to of endpoints){
   if(from===to)continue;
   const route=findPath(graph,switches,from,to);
   if(route&&route.ids.length>=3&&route.cost>25&&route.cost<=600&&
      (!best||route.cost>best.cost))best=route;
  }
 }
 if(!best){
  const suggested=suggestRoute(graph,switches,origins.find(id=>graph.has(id)));
  if(suggested&&suggested.ids.length>=3)best=suggested;
 }
 return best?{...best,name,virtual:true,originalExitVerified:false}:null;
}
