/* Halle Hbf – geometrische OSM-Wegprüfung, KEINE betriebliche Fahrstraßenfreigabe.
 * Topologie ausschließlich über OSM-Knotenkennungen. */
export function buildGraph(tracks){
  const graph=new Map();
  tracks.forEach((t,i)=>{
    const a=String(t.a.nodeId),b=String(t.b.nodeId),len=Math.hypot(t.a.x-t.b.x,t.a.y-t.b.y);
    if(!Number.isFinite(len)||len<0.001||a===b)return;
    for(const [id,p,to] of [[a,t.a,b],[b,t.b,a]]){
      if(!graph.has(id))graph.set(id,{p,adj:[]});
      graph.get(id).adj.push({to,edge:i,len});
    }
  });
  return graph;
}
export function transitionPossible(graph,switches,id,inEdge,outEdge){
  if(inEdge===outEdge)return false;
  const node=graph.get(id);if(!node)return false;
  if(node.adj.length<=2)return true;
  const sw=switches.get(id);
  if(!sw||sw.degree!==node.adj.length)return false;
  // A mapped 3-leg turnout allows paths through its toe only.
  if(node.adj.length===3){
    const p=node.p,v=node.adj.map(e=>{
      const q=graph.get(e.to)?.p;if(!q)return null;
      const len=Math.hypot(q.x-p.x,q.y-p.y)||1;
      return[(q.x-p.x)/len,(q.y-p.y)/len];
    });
    if(v.some(x=>!x))return false;
    let branch=[0,1],maxDot=-Infinity;
    for(let i=0;i<3;i++)for(let j=i+1;j<3;j++){
      const dot=v[i][0]*v[j][0]+v[i][1]*v[j][1];
      if(dot>maxDot){maxDot=dot;branch=[i,j];}
    }
    const trunk=node.adj.find((_,i)=>!branch.includes(i))?.edge;
    return inEdge===trunk||outEdge===trunk;
  }
  // DKW/crossing transitions cannot be inferred safely from OSM geometry.
  // Even seemingly straight moves must be verified against real switch states.
  return false;
}
class MinHeap{
  constructor(){this.a=[];}
  push(x){const a=this.a;let i=a.length;a.push(x);while(i){const j=(i-1)>>1;if(a[j].cost<=x.cost)break;a[i]=a[j];i=j;}a[i]=x;}
  pop(){const a=this.a,top=a[0],last=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let j=i*2+1;if(j+1<a.length&&a[j+1].cost<a[j].cost)j++;if(last.cost<=a[j].cost)break;a[i]=a[j];i=j;}a[i]=last;}return top;}
  get size(){return this.a.length;}
}
export function findGeometricPath(graph,switches,start,goal){
  if(!graph.has(start)||!graph.has(goal)||start===goal)return null;
  const initial=start+'|-1',distance=new Map([[initial,0]]),parent=new Map(),open=new MinHeap();
  open.push({node:start,inEdge:-1,state:initial,cost:0});
  let found=null;
  while(open.size){
    const cur=open.pop();
    if(cur.cost!==distance.get(cur.state))continue;
    if(cur.node===goal){found=cur.state;break;}
    for(const e of graph.get(cur.node).adj){
      if(cur.inEdge!==-1&&!transitionPossible(graph,switches,cur.node,cur.inEdge,e.edge))continue;
      const state=e.to+'|'+e.edge,cost=cur.cost+e.len;
      if(cost>=(distance.get(state)??Infinity))continue;
      distance.set(state,cost);parent.set(state,{previous:cur.state});
      open.push({node:e.to,inEdge:e.edge,state,cost});
    }
  }
  if(!found)return null;
  const ids=[goal];for(let cur=found;cur!==initial;){
    const p=parent.get(cur);if(!p)return null;
    cur=p.previous;ids.push(cur.slice(0,cur.lastIndexOf('|')));
  }
  ids.reverse();
  return {ids,points:ids.map(id=>graph.get(id).p),cost:distance.get(found)};
}
export function trackRefs(tracks){
  const byRef=new Map();
  tracks.forEach((t,index)=>{
    const ref=String(t.railwayTrackRef??'').trim();
    if(!ref)return;
    if(!byRef.has(ref))byRef.set(ref,[]);
    byRef.get(ref).push(index);
  });
  return byRef;
}
export function representativeTrackNode(tracks,indices,focus={x:1400,y:900}){
  // Prefer the mapped segment whose midpoint lies closest to the center
  // of the selected station view, not whichever adjacent way is first.
  if(!indices?.length)return null;
  let best=null,score=Infinity;
  for(const i of indices){
    const t=tracks[i],mid={x:(t.a.x+t.b.x)/2,y:(t.a.y+t.b.y)/2};
    const d=(mid.x-focus.x)**2+(mid.y-focus.y)**2;
    if(d<score){score=d;best=t;}
  }
  if(!best)return null;
  const a=best.a,b=best.b;
  return String((Math.hypot(a.x-focus.x,a.y-focus.y)<=Math.hypot(b.x-focus.x,b.y-focus.y)?a:b).nodeId);
}
