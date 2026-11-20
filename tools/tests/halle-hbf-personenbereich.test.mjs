import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyPassengerWay,scopeHallePersonenbahnhof} from '../../halle-hbf-personenbereich.mjs';

const p=(id,x,y)=>({nodeId:String(id),x,y});
const edge=(id,a,b)=>({osmWayId:String(id),a,b,service:null,railwayTrackRef:null});
const way=(id,tags)=>({type:'way',id,tags:{railway:'rail',...tags}});
test('Pbf includes passenger tracks, Kasseler stabling, additional group and exact OSM links, no freight',()=>{
 const raw={elements:[
  way(1,{'railway:traffic_mode':'passenger','railway:track_ref':'1'}),
  way(2,{name:'Kasseler Gruppe',service:'yard','railway:track_ref':'162'}),
  way(3,{name:'Neue Gruppe',service:'yard'}),
  way(4,{'railway:traffic_mode':'freight',service:'yard'}),
  way(5,{service:'yard',name:'Unbestimmtes Rangiergleis'}),
  way(1104738780,{service:'yard'}),
 ]};
 const imported={bbox:{},tracks:[
  edge(1,p('a',0,0),p('b',10,0)),
  edge(1104738780,p('b',10,0),p('c',20,0)),
  edge(2,p('c',20,0),p('d',30,0)),
  edge(3,p('d',30,0),p('e',40,0)),
  edge(4,p('b',10,0),p('z',10,10)),
  edge(5,p('z',10,10),p('q',20,10)),
 ],osmSwitches:[{osmNodeId:'c'},{osmNodeId:'z'}],
 signals:[{osmNodeId:'b'},{osmNodeId:'z'}]};
 const scoped=scopeHallePersonenbahnhof(raw,imported);
 assert.equal(scoped.tracks.length,4);
 assert.deepEqual(scoped.report.components,[5]);
 assert.deepEqual(scoped.report.kinds,{personenbahn:1,abstellung:1,'weitere-gruppe':1,verbindung:1});
 assert.equal(scoped.report.excludedFreightWays,1);
 assert.equal(scoped.osmSwitches.length,1);
 assert.equal(scoped.signals.length,1);
 assert.equal(scoped.tracks[0].originalTrackRef,'1');
 assert.equal(scoped.scope,'PASSENGER_STATION_AND_STABLING');
});
test('freight/industrial tags always win over misleading passenger or named stabling',()=>{
 assert.equal(classifyPassengerWay(way(1,{'railway:traffic_mode':'freight',name:'Kasseler Gruppe'})),null);
 assert.equal(classifyPassengerWay(way(2,{'railway:traffic_mode':'passenger',usage:'industrial'})),null);
 assert.equal(classifyPassengerWay(way(3,{service:'yard'})),null);
 assert.equal(classifyPassengerWay(way(4,{'railway:traffic_mode':'passenger',disused:'yes'})),null);
 assert.equal(classifyPassengerWay(way(1104738780,{service:'yard'})),'verbindung');
});
test('rejects input without source or named stabling',()=>{
 assert.throws(()=>scopeHallePersonenbahnhof({},{}),/Rohdaten/);
 assert.throws(()=>scopeHallePersonenbahnhof({elements:[way(1,{'railway:traffic_mode':'passenger'})]}, {tracks:[edge(1,p(1,0,0),p(2,1,0))]}),/Passenger or stabling/);
});
