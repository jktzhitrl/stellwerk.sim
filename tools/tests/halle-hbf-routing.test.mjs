import test from 'node:test';
import assert from 'node:assert/strict';
import {buildGraph,findGeometricPath,transitionPossible,trackRefs,representativeTrackNode} from '../../halle-hbf-routing.mjs';
const p=(id,x,y)=>({nodeId:String(id),x,y});
const seg=(a,b,ref=null)=>({a,b,railwayTrackRef:ref});
test('shortest distance path chooses the shorter track route',()=>{
 const tracks=[seg(p('a',0,0),p('b',10,0)),seg(p('b',10,0),p('c',20,0)),seg(p('a',0,0),p('d',0,30)),seg(p('d',0,30),p('c',20,0))];
 const graph=buildGraph(tracks),sw=new Map([['a',{degree:2}],['b',{degree:2}],['d',{degree:2}],['c',{degree:2}]]);
 const result=findGeometricPath(graph,sw,'a','c');
 assert.deepEqual(result.ids,['a','b','c']);assert.equal(result.cost,20);
});
test('same coordinates do not connect distinct OSM IDs',()=>{
 const tracks=[seg(p('a',0,0),p('b',10,0)),seg(p('c',10,0),p('d',20,0))];
 assert.equal(findGeometricPath(buildGraph(tracks),new Map(),'a','d'),null);
});
test('unknown and untagged junctions cannot be used for crossing',()=>{
 const tracks=[seg(p('a',-10,0),p('j',0,0)),seg(p('j',0,0),p('b',10,0)),seg(p('j',0,0),p('c',10,10))],g=buildGraph(tracks);
 assert.equal(findGeometricPath(g,new Map(),'a','b'),null);
 const switches=new Map([['j',{degree:3}]]);
 assert.ok(findGeometricPath(g,switches,'a','b'));
 assert.equal(findGeometricPath(g,switches,'b','c'),null);
});
test('DKWs/crossings are never assumed traversable merely by geometric alignment',()=>{
 const tracks=[seg(p('a',-10,0),p('j',0,0)),seg(p('j',0,0),p('b',10,0)),seg(p('c',0,-10),p('j',0,0)),seg(p('j',0,0),p('d',0,10))],g=buildGraph(tracks);
 const switches=new Map([['j',{degree:4,type:'double_slip'}]]);
 assert.equal(transitionPossible(g,switches,'j',0,1),false);
 assert.equal(findGeometricPath(g,switches,'a','b'),null);
});
test('track references remain OSM labels, not invented platform assignments',()=>{
 const tracks=[seg(p('a',0,0),p('b',10,0),'1'),seg(p('b',10,0),p('c',20,0),'1'),seg(p('d',500,0),p('e',600,0),'12')];
 const refs=trackRefs(tracks);assert.equal(refs.get('1').length,2);
 assert.equal(representativeTrackNode(tracks,refs.get('12'),{x:510,y:0}),'d');
});
