import test from 'node:test';
import assert from 'node:assert/strict';
import {HALLE_ORIGINAL_DEPARTURES,HALLE_TIMETABLE_SOURCE,timetableMinutes,departuresDue} from '../../halle-hbf-originalfahrplan.mjs';
import {HalleGameSession,clockLabel} from '../../halle-hbf-betrieb.mjs';

test('source-backed 20 November 2026 Friday departure extract has verified fields and sequence',()=>{
 assert.equal(HALLE_TIMETABLE_SOURCE.validFrom,'2026-06-14');
 assert.equal(HALLE_TIMETABLE_SOURCE.serviceDate,'2026-11-20');
 assert.equal(HALLE_TIMETABLE_SOURCE.kind,'original-departure-extract');
 assert.ok(HALLE_ORIGINAL_DEPARTURES.length>=30);
 const times=HALLE_ORIGINAL_DEPARTURES.map(s=>timetableMinutes(s.time));
 assert.deepEqual(times,[...times].sort((a,b)=>a-b));
 for(const s of HALLE_ORIGINAL_DEPARTURES){
  assert.match(s.id,/^LH-20261120-\d+$/);
  assert.match(s.trackRef,/^\d{1,2}$/);
  assert.equal(s.arrival,null);
  assert.equal(s.originalSignalRouteVerified,false);
 }
 assert.equal(HALLE_ORIGINAL_DEPARTURES.find(x=>x.train==='ICE 277').trackRef,'6');
 assert.equal(HALLE_ORIGINAL_DEPARTURES.find(x=>x.train==='ICE 698').time,'06:44');
 assert.equal(HALLE_ORIGINAL_DEPARTURES.find(x=>x.train==='S 9').destination,'Eilenburg');
 assert.equal(departuresDue(HALLE_ORIGINAL_DEPARTURES,timetableMinutes('05:00')).length,1);
 assert.equal(clockLabel(timetableMinutes('06:45')),'06:45');
});
test('virtual signal stays at stop until valid selected train route is cleared',()=>{
 const dep=HALLE_ORIGINAL_DEPARTURES[0],g=new HalleGameSession(HALLE_ORIGINAL_DEPARTURES);
 assert.equal(g.signal,'Hp0 (Simulation)');
 assert.equal(g.clearSignal(),false);
 assert.equal(g.select(dep.id),true);
 assert.equal(g.reserve({serviceId:dep.id,ids:['a','b','c'],points:[1,2,3],startNode:'x'}),false);
 assert.equal(g.reserve({serviceId:dep.id,ids:['a','b','a'],points:[1,2,3],startNode:'a'}),false);
 assert.equal(g.reserve({serviceId:dep.id,ids:['a','b','c'],points:[1,2,3],startNode:'a'}),true);
 assert.equal(g.signal,'Hp0 (Simulation)');
 assert.equal(g.clearSignal(),true);
 assert.equal(g.signal,'Ks1 (Simulation)');
 assert.equal(g.dispatch(),true);
 assert.equal(g.signal,'Hp0 (Simulation)');
 assert.equal(g.clearSignal(),false);
 assert.equal(g.select(HALLE_ORIGINAL_DEPARTURES[1].id),false);
 assert.equal(g.complete(),true);
 assert.equal(g.stateOf(dep.id),'abgefahren');
 assert.equal(g.route,null);
 assert.equal(g.signal,'Hp0 (Simulation)');
 assert.equal(g.score,100);
});
test('no train may leave before original timetable departure',()=>{
 const dep=HALLE_ORIGINAL_DEPARTURES.find(x=>x.time==='06:45'),g=new HalleGameSession(HALLE_ORIGINAL_DEPARTURES);
 assert.ok(g.select(dep.id));
 assert.ok(g.reserve({serviceId:dep.id,ids:['a','b'],points:[1,2],startNode:'a'}));
 assert.ok(g.clearSignal());
 assert.equal(g.dispatch(),false);
 g.advance(105);assert.equal(clockLabel(g.clock),'06:45');
 assert.equal(g.dispatch(),true);
 assert.equal(g.cancel(),false);
});
test('clock advances and next departure skips dispatched train',()=>{
 const g=new HalleGameSession(HALLE_ORIGINAL_DEPARTURES);
 assert.equal(g.nextScheduled(),301);
 g.advance(1);
 assert.equal(g.nextScheduled(),307);
 assert.throws(()=>g.advance(-1));
});
