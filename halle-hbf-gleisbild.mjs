/* Halle Hbf – genuine schematic representation of the existing OSM graph.
 * Same operating-board vocabulary as the other stations: horizontally
 * aligned track references, turnout heads, routes, signals and occupied paths.
 *
 * CAUTION: rail positions / desk borders are display choices, NOT a DB plan.
 * Every rendered track edge still corresponds to an ORIGINAL OSM edge.
 * A line crossing on the diagram is only connected if the OSM node ID agrees.
 * No fictitious edges or switch/signal interlockings are introduced.
 */
const TRACKS=[...Array.from({length:13},(_,i)=>i+1),136,160,161,162];
const Y=Object.freeze(Object.fromEntries(TRACKS.map(n=>[String(n),
  n<=7?192+(n-1)*59:n<=13?700+(n-8)*59:n===136?1160:n===160?1235:n===161?1310:1380])));
const AREA=Object.freeze(Object.fromEntries(TRACKS.map(n=>[String(n),n<=7?'west':n<=13?'ost':'ww'])));
export const HALLE_SCHEMATIC_LANES=Y;
export const HALLE_SCHEMATIC_TRACKS=TRACKS;

class Heap{
 constructor(){this.items=[];}
 add(v){let a=this.items,i=a.length;a.push(v);while(i){const parent=(i-1)>>1;if(a[parent].dist<=v.dist)break;a[i]=a[parent];i=parent;}a[i]=v;}
 get(){const a=this.items,result=a[0],last=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let j=i*2+1;if(j+1<a.length&&a[j+1].dist<a[j].dist)j++;if(last.dist<=a[j].dist)break;a[i]=a[j];i=j;}a[i]=last;}return result;}
 get size(){return this.items.length;}
}
export function createHalleSchematic(tracks,areas){
 if(!tracks?.length)throw Error('Halle schematic requires original OSM tracks');
 const nodes=new Map(),candidate=new Map(),adj=new Map();
 const add=(p)=>{const id=String(p.nodeId);if(!nodes.has(id)){nodes.set(id,p);adj.set(id,[]);}return id;};
 for(const edge of tracks){
  const a=add(edge.a),b=add(edge.b),ref=String(edge.railwayTrackRef??'');
  const len=Math.hypot(edge.a.x-edge.b.x,edge.a.y-edge.b.y);
  if(a!==b&&len>0){
   adj.get(a).push({to:b,len});adj.get(b).push({to:a,len});
  }
  if(Y[ref]==null||edge.kind==='verbindung')continue;
  // Each anchored OSM node normally has one track reference; in a shared
  // turnout node multiple references are resolved deterministically.
  for(const id of [a,b]){let votes=candidate.get(id);if(!votes){votes=new Map();candidate.set(id,votes);}votes.set(ref,(votes.get(ref)||0)+1);}
 }
 const anchors=new Map();
 for(const [id,votes] of candidate){
  const ref=[...votes].sort((a,b)=>b[1]-a[1]||Number(a[0])-Number(b[0]))[0][0];
  anchors.set(id,ref);
 }
 const distances=new Map(),sources=new Map(),queue=new Heap();
 for(const [id,ref] of anchors){
  distances.set(id,0);sources.set(id,ref);queue.add({id,dist:0,ref});
 }
 while(queue.size){
  const current=queue.get();
  if(current.dist!==distances.get(current.id)||sources.get(current.id)!==current.ref)continue;
  for(const {to,len} of adj.get(current.id)){
   const d=current.dist+len;
   if(d>=(distances.get(to)??Infinity))continue;
   distances.set(to,d);sources.set(to,current.ref);queue.add({id:to,dist:d,ref:current.ref});
  }
 }
 // This preserves topological continuity: each original OSM node ID has
 // one and only one screen position, shared by all incident edges.
 const perRef=new Map();
 for(const [id,ref] of anchors){
  let group=perRef.get(ref);if(!group)perRef.set(ref,group=[]);
  group.push(areas.toView(nodes.get(id)).y);
 }
 const mean=new Map([...perRef].map(([ref,samples])=>[ref,samples.reduce((a,b)=>a+b,0)/samples.length]));
 const positioned=new Map();
 for(const [id,p] of nodes){
  const projected=areas.toView(p),ref=sources.get(id);
  // Use the main longitudinal OSM axis, but give each track an independent
  // horizontal control-board lane and expand turnout branches only slightly.
  const x=1035+projected.x*1.55;
  const rawShift=(projected.y-(mean.get(ref)??projected.y))*0.12;
  const y=Y[ref]+(anchors.has(id)?0:Math.max(-18,Math.min(18,rawShift)));
  positioned.set(id,{x,y,ref,area:AREA[ref]});
 }
 const toDiagram=p=>{
  const node=positioned.get(String(p.nodeId));
  if(node)return{x:node.x,y:node.y};
  const projected=areas.toView(p);
  // Some OSM detail points are intentionally not graph nodes.
  let nearest=null,best=Infinity;
  for(const [id,point] of nodes){
   const d=Math.hypot(p.x-point.x,p.y-point.y);
   if(d<best){best=d;nearest=positioned.get(id);}
  }
  return nearest?{x:1035+projected.x*1.55,y:nearest.y}:
    {x:1035+projected.x*1.55,y:690};
 };
 const ofNode=id=>positioned.get(String(id))||null;
 const ofEdge=edge=>{
  const refs=[sources.get(String(edge.a.nodeId)),sources.get(String(edge.b.nodeId))];
  if(edge.kind==='abstellung'||edge.kind==='verbindung')return'ww';
  if(refs[0]&&refs[0]===refs[1])return AREA[refs[0]];
  const ref=String(edge.railwayTrackRef??'');
  if(AREA[ref])return AREA[ref];
  return AREA[refs.find(Boolean)]||'west';
 };
 function frame(area,aspect=1.6){
  let base;
  if(area==='west')base={x:590,y:100,w:900,h:590};
  else if(area==='ost')base={x:590,y:635,w:900,h:475};
  else if(area==='ww')base={x:590,y:1075,w:900,h:380};
  else base={x:300,y:63,w:1500,h:1380};
  let {x,y,w,h}=base;
  const ratio=Math.max(.5,Math.min(3,aspect)),cx=x+w/2,cy=y+h/2;
  if(w/h<ratio)w=h*ratio;else h=w/ratio;
  return{x:cx-w/2,y:cy-h/2,w,h};
 }
 return {nodes,positions:positioned,anchors,sources,areas:Y,toDiagram,ofNode,ofEdge,frame,
  pointForRef:ref=>[...anchors].find(([,r])=>r===String(ref))?.[0]??null,
  edgeCoords:edge=>[ofNode(edge.a.nodeId),ofNode(edge.b.nodeId)],
  sectorForNode:id=>AREA[sources.get(String(id))]||'west',
  sectorForRef:ref=>AREA[String(ref)]||'west'};
}
