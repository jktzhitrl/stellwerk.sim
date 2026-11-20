/* Halle (Saale) Hbf – simplified playable simulator operations.
 * These virtual signal states and route locks do NOT describe the real
 * interlocking, signal clearance, platform occupancy, or train approach.
 */
import {timetableMinutes} from './halle-hbf-originalfahrplan.mjs';
export class HalleGameSession{
 constructor(departures){
  this.departures=departures;
  this.clock=timetableMinutes('05:00');
  this.selected=null;this.route=null;this.running=false;
  this.dispatched=new Set();this.completed=new Set();this.score=0;
 }
 select(id){
  if(this.running||this.route?.cleared)return false;
  const entry=this.departures.find(d=>d.id===id);
  if(!entry||this.dispatched.has(id))return false;
  this.selected=entry;
  this.route=null;
  return true;
 }
 reserve({serviceId,ids,points,startNode}){
  if(this.running||this.route?.cleared||!this.selected||this.selected.id!==serviceId)return false;
  if(!Array.isArray(ids)||ids.length<2||ids[0]!==startNode||
     !Array.isArray(points)||points.length!==ids.length)return false;
  if(new Set(ids).size!==ids.length)return false; // no loops, backtracking, U-turn
  this.route={serviceId,ids:[...ids],points:[...points],startNode,cleared:false,occupied:false};
  return true;
 }
 clearSignal(){
  if(this.running||!this.route||this.route.serviceId!==this.selected?.id||this.route.cleared)return false;
  this.route.cleared=true;return true;
 }
 get signal(){return this.route?.cleared&&!this.route.occupied?'Ks1 (Simulation)':'Hp0 (Simulation)';}
 dispatch(){
  if(this.running||!this.route?.cleared||this.route.occupied||this.dispatched.has(this.route.serviceId))return false;
  if(this.clock<timetableMinutes(this.selected.time))return false;
  this.route.occupied=true;this.running=true;
  this.dispatched.add(this.selected.id);
  return true;
 }
 complete(){
  if(!this.running||!this.route?.occupied)return false;
  const entry=this.selected;const late=Math.max(0,this.clock-timetableMinutes(entry.time));
  this.score+=Math.max(0,100-5*late);
  this.completed.add(entry.id);
  this.running=false;this.selected=null;this.route=null;
  return true;
 }
 cancel(){
  if(this.running)return false;
  this.route=null;return true;
 }
 advance(delta){
  if(!Number.isFinite(delta)||delta<0)throw Error('Time must be nonnegative');
  this.clock=Math.min(24*60-1,this.clock+delta);
  return this.clock;
 }
 nextScheduled(){
  return this.departures.filter(e=>!this.dispatched.has(e.id)&&timetableMinutes(e.time)>this.clock)
    .map(e=>timetableMinutes(e.time)).sort((a,b)=>a-b)[0]??null;
 }
 stateOf(id){
  if(this.completed.has(id))return 'abgefahren';
  if(this.dispatched.has(id))return 'unterwegs';
  if(this.selected?.id===id)return this.route?.cleared?'Fahrt gestellt':this.route?'Route gewählt':'ausgewählt';
  const entry=this.departures.find(e=>e.id===id);
  if(!entry)return 'unbekannt';
  return this.clock>=timetableMinutes(entry.time)?'bereit':'geplant';
 }
}
export function clockLabel(minutes){
 const m=Math.floor(minutes);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
}
