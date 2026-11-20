import test from 'node:test';
import assert from 'node:assert/strict';
import {classifySignal,auditSwitch,buildObjectAudit,readableObject} from '../../halle-hbf-objects.mjs';
import {buildGraph} from '../../halle-hbf-routing.mjs';
const n=(id,x,y)=>({nodeId:id,x,y});
const tracks=[{a:n('a',0,0),b:n('j',10,0)},{a:n('j',10,0),b:n('b',20,0)},{a:n('j',10,0),b:n('c',10,10)}];
const g=buildGraph(tracks);
test('main, distant, shunting, speed, buffer are not all counted as main signals',()=>{
 const x=[
 {osmNodeId:'1',railwayTags:{'railway:signal:main':'DE-ESO:hp'}},
 {osmNodeId:'2',railwayTags:{'railway:signal:distant':'DE-ESO:vr'}},
 {osmNodeId:'3',railwayTags:{'railway:signal:shunting':'DE-ESO:sh'}},
 {osmNodeId:'4',railwayTags:{'railway:signal:speed_limit':'DE-ESO:lf'}},
 {osmNodeId:'5',railwayTags:{railway:'buffer_stop','railway:signal:shunting':'DE-ESO:sh2'}}
 ];
 const kinds=x.map(classifySignal).map(s=>s.kind);
 assert.deepEqual(kinds,['main','distant','shunting','speed','buffer']);
 assert.ok(x.every(s=>classifySignal(s).operational===false));
});
test('switch with 3 legs is only a geometric candidate and 4-leg junction stays unverified',()=>{
 const simple=auditSwitch({osmNodeId:'j',ref:'W1',degree:3},g);
 assert.equal(simple.degree,3);assert.equal(simple.kind,'simple');assert.equal(simple.routeAuthorized,false);
 const complex=auditSwitch({osmNodeId:'j',ref:'W2',type:'double_slip',degree:4},g);
 assert.equal(complex.kind,'complex');
 const anomalous=auditSwitch({osmNodeId:'missing',degree:3},g);
 assert.equal(anomalous.kind,'unresolved');
});
test('review preserves OSM node IDs, original signal tags and explicit non-authorized state',()=>{
 const a=buildObjectAudit([{osmNodeId:'s',x:1,y:2,ref:'A','railwayTags':{'railway:signal:main':'DE-ESO:hp'}}],[{osmNodeId:'j',ref:'1',degree:3,x:10,y:0}],g);
 assert.equal(a.signalCounts.main,1);assert.equal(a.switchCounts.simple,1);
 assert.match(readableObject(a.signals[0]),/A/);assert.match(readableObject(a.signals[0]),/DE-ESO:hp/);
 assert.match(readableObject(a.switches[0]),/Keine geprüfte Original-Stellwerksstellung/);
});
