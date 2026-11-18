'use strict';
/**
 * Railway Empire – tests without external libraries.
 * Run: node --test railway-empire/tests/regression.test.cjs
 * No network calls and no browser dependencies.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const js = html.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/)?.[1];
if(!js)throw new Error('Application script missing');
const segment=(start,end)=>{
  const a=js.indexOf(start),b=js.indexOf(end,a+start.length);
  assert.ok(a>=0&&b>a,'Missing source section '+start);
  return js.slice(a,b);
};
const helpers = new Function(
 segment('const degKm=','function restoreRoutes(')+
 segment('function graphFromWays(','function clearRailRoute(')+
 segment('function lateralKm(','async function stationCandidates(')+
 segment('function distanceArray(','function paintLiveTrains(')+
 'return {degKm,graphFromWays,shortestRailPath,nearestTrackNodes,lateralKm,routeStopPosition,distanceArray,onRailAtDistance,liveTimetable,rideDistanceAt};'
)();
const {graphFromWays,shortestRailPath,liveTimetable,rideDistanceAt,distanceArray,onRailAtDistance} = helpers;
const way=(nodes,xy)=>({type:'way',tags:{railway:'rail'},nodes,geometry:xy.map(([lat,lon])=>({lat,lon}))});
const geometry = [[51,12],[51,12.01],[51,12.02],[51,12.03],[51,12.04]];
const stations = [
 {name:'A',lat:51,lng:12},
 {name:'B',lat:51,lng:12.02},
 {name:'C',lat:51,lng:12.04}
];

test('JavaScript application loads with valid syntax',()=>{
 assert.doesNotThrow(()=>new Function(js));
});

test('Map uses key-free base layer and has the game overlay',()=>{
 assert.match(js,/tile\.openstreetmap\.org/);
 assert.match(js,/tiles\.openfreemap\.org\/styles\/bright/);
 assert.match(js,/railVisible=false/);
 assert.match(html,/id="gameDock"/);
 assert.match(html,/id="mapLinePlanner"/);
});

test('Existing saves are migrated to support lines',()=>{
 assert.match(js,/KEY='railway_empire_germany_v02'/);
 assert.match(js,/S\.lines=Array\.isArray\(S\.lines\)/);
});

test('Lines can only be created after winning the network',()=>{
 assert.match(js,/S\.awards\.find\(a=>a\.id===contractId\)/);
 assert.match(js,/mapLineMode\.stops\.length<2/);
 assert.match(js,/new Set\(mapLineMode\.stops\.map\(x=>x\.id\)\)/);
 assert.match(js,/selectedTrains/);
});

test('Network places remain cached independently from zoom',()=>{
 assert.match(js,/OWN_NETWORK_STOPS_KEY/);
 assert.match(js,/function renderWonNetworkStations/);
 assert.match(js,/function loadWonNetworkStations/);
});

test('Connected track graph produces an OSM-node route',()=>{
 const graph=graphFromWays([
  way([1,2,3],geometry.slice(0,3)),
  way([3,4,5],geometry.slice(2))
 ]);
 const route=shortestRailPath(graph,geometry[0],geometry[4],1,5);
 assert.equal(route.points.length,5);
 assert.ok(route.km>2);
});

test('Disconnected tracks never produce an invented connection',()=>{
 const graph=graphFromWays([
  way([1,2],geometry.slice(0,2)),
  way([3,4],geometry.slice(3))
 ]);
 assert.equal(shortestRailPath(graph,geometry[0],geometry[4],1,4),null);
});

test('Intermediate-stop dwell and reverse trip are continuous',()=>{
 const plan=liveTimetable(geometry,stations);
 assert.ok(plan);
 const ride={plan};
 const middleTime=plan.travelMs*(plan.stopKm[1]-plan.stopKm[0])/plan.total;
 assert.ok(Math.abs(rideDistanceAt(ride,middleTime+600)-plan.stopKm[1])<.002);
 const finalTime=plan.travelMs*(plan.stopKm[2]-plan.stopKm[0])/plan.total+plan.dwellMs;
 assert.ok(Math.abs(rideDistanceAt(ride,finalTime+600)-plan.stopKm[2])<.002);
 assert.ok(rideDistanceAt(ride,finalTime+plan.dwellMs+3000)<plan.stopKm[2]);
 assert.ok(Math.abs(rideDistanceAt(ride,plan.cycleMs)-plan.stopKm[0])<.002);
 const cumulative=distanceArray(geometry);
 const position=onRailAtDistance(geometry,cumulative,plan.stopKm[1]);
 assert.ok(Math.abs(position[1]-12.02)<.0001);
});

test('Invalid stop order does not enable a misleading animation',()=>{
 assert.equal(liveTimetable(geometry,[stations[2],stations[1],stations[0]]),null);
});

test('Live animation has pause and speed controls',()=>{
 assert.match(html,/id="pauseTrains"/);
 assert.match(html,/id="trainSpeed"/);
 assert.match(js,/livePaused/);
 assert.match(js,/liveClock\+=frameMs\*liveSpeed/);
});

test('Overpass provider fallback succeeds after a temporary primary error',async()=>{
 const source=segment('async function fetchOverpass(options){','function note(s){');
 const requested=[];
 const fetchMock=async(url)=>{requested.push(url);return {ok:requested.length===2,status:requested.length===2?200:503};};
 const query=new Function('fetch',source+'return fetchOverpass;')(fetchMock);
 const response=await query({signal:{aborted:false}});
 assert.equal(response.status,200);
 assert.equal(requested.length,2);
});

test('Aborted railway requests do not retry alternate providers',async()=>{
 const source=segment('async function fetchOverpass(options){','function note(s){');
 let calls=0;
 const query=new Function('fetch',source+'return fetchOverpass;')(async()=>{calls++;throw Error('network');});
 await assert.rejects(query({signal:{aborted:true}}));
 assert.equal(calls,0);
});

test('Winning first Leipzig–Halle S-Bahn tender assigns and procures the promised trains',()=>{
 const setup=segment('const ST=[','let S=fresh()');
 const resolution=segment('function resolveBids(){','function nextDay(){');
 const simulate=new Function('winning',setup+
  'let S=fresh();'+
  'const Math={random:()=>winning?0:.999,max:globalThis.Math.max,min:globalThis.Math.min,round:globalThis.Math.round};'+
  'function debit(n){if(S.money<n)return false;S.money-=n;S.totalSpent+=n;return true;}'+
  'function log(s){S.log.unshift(s);}'+resolution+
  "S.bids=[{id:'L01',offer:11500,trips:4,type:'emu',count:2,service:'sb',submitted:1}];"+
  'S.day=2;resolveBids();return S;');
 const win=simulate(true);
 assert.equal(win.awards.length,1);
 assert.equal(win.awards[0].service,'sb');
 assert.equal(win.fleet.filter(t=>t.line==='L01').length,2);
 assert.equal(win.fleet.length,3);
 assert.equal(win.money,442000);
 const lose=simulate(false);
 assert.equal(lose.awards.length,0);
 assert.equal(lose.fleet.length,2);
});

test('Damaged save data cannot replace a healthy new game state',()=>{
 const source=segment('function load(){','function debit(');
 const restore=new Function('saved',
  "let S={v:2,money:500000,day:1,owned:[],bids:[],awards:[],fleet:[],log:[],customStations:[],lines:[],nextLine:1};"+
  "const KEY='save';const dyn=new Map();const localStorage={getItem:()=>JSON.stringify(saved)};"+
  'function note(){};'+source+'load();return {S,dyn};');
 const invalid=restore({v:2,money:'broken',day:2,owned:[],bids:[],awards:[],fleet:[],log:[]});
 assert.equal(invalid.S.money,500000);
 assert.equal(invalid.S.day,1);
 const recovered=restore({v:2,money:200000,day:3,owned:[],bids:[],awards:[],fleet:[],log:[],
  customStations:{not:'an array'},lines:'invalid',nextLine:-5});
 assert.equal(recovered.S.money,200000);
 assert.deepEqual(recovered.S.customStations,[]);
 assert.deepEqual(recovered.S.lines,[]);
 assert.equal(recovered.S.nextLine,1);
 assert.equal(recovered.dyn.size,0);
});

test('Daily finances show a verifiable income and cost breakdown',()=>{
 const source=segment('function nextDay(){','function tab(');
 const result=new Function(
  "const S={day:1,money:1000,owned:['leipzig'],fleet:[{type:'rb'}],awards:[],totalEarned:0,totalSpent:0,totalRiders:0,rep:67,log:[]};"+
  "const TYPES={rb:{upkeep:330}};const JOBS=[];const SERVICES={};"+
  "const euro=n=>Math.round(n).toLocaleString('de-DE')+' €';"+
  "function resolveBids(){};function save(){};function render(){};"+
  "let message='';function note(s){message=s;}function log(s){S.log.push(s);}"+
  source+"nextDay();return {S,message};"
 )();
 assert.equal(result.S.day,2);
 assert.equal(result.S.money,420);
 assert.equal(result.S.totalSpent,580);
 assert.equal(result.S.totalEarned,0);
 assert.match(result.S.log[0],/Einnahmen 0 €/);
 assert.match(result.S.log[0],/Ausgaben 580 €/);
 assert.match(result.message,/580 € Ausgaben/);
});

test('Missed tenders reopen in repeating 14-day rounds instead of locking progression',()=>{
 const source=segment('const serviceForJob=','const euro=');
 const nextDeadline=new Function(source+'return nextTenderDeadline;')();
 const job={id:'L01',deadline:2};
 assert.equal(nextDeadline(job,1),2);
 assert.equal(nextDeadline(job,2),2);
 assert.equal(nextDeadline(job,3),16);
 assert.equal(nextDeadline(job,16),16);
 assert.equal(nextDeadline(job,17),30);
 assert.equal(nextDeadline({id:'L13',deadline:15},31),43);
 assert.match(js,/Frist Tag '\+nextTenderDeadline\(j,S\.day\)/);
 assert.doesNotMatch(js,/b\.disabled=won\|\|pending\|\|S\.day>j\.deadline/);
});
