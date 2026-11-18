'use strict';
const $=id=>document.getElementById(id);
const SAVE_KEY='stw_tycoon_v2',OLD_KEY='stw_tycoon_v1';
const CITIES=[
{id:'neustadt',name:'Neustadt',x:125,y:310,pop:110,industry:40},
{id:'teutschenthal',name:'Teutschenthal',x:390,y:300,pop:85,industry:100},
{id:'burgstadt',name:'Burgstadt Hbf',x:715,y:295,pop:185,industry:80},
{id:'hafenau',name:'Hafenau',x:1040,y:330,pop:160,industry:125},
{id:'waldheim',name:'Waldheim',x:280,y:90,pop:70,industry:30},
{id:'altheim',name:'Altheim',x:595,y:100,pop:100,industry:80},
{id:'talburg',name:'Talburg',x:935,y:90,pop:120,industry:55},
{id:'roeblingen',name:'Röblingen',x:220,y:560,pop:70,industry:125},
{id:'eisleben',name:'Eisleben',x:570,y:565,pop:100,industry:140},
{id:'sangerhausen',name:'Sangerhausen',x:930,y:575,pop:115,industry:90}
];
const TRACKS=[
{id:'nt',a:'neustadt',b:'teutschenthal',km:32},
{id:'tb',a:'teutschenthal',b:'burgstadt',km:41},
{id:'bh',a:'burgstadt',b:'hafenau',km:45},
{id:'nw',a:'neustadt',b:'waldheim',km:24},
{id:'wa',a:'waldheim',b:'altheim',km:33},
{id:'ab',a:'altheim',b:'burgstadt',km:29},
{id:'at',a:'altheim',b:'talburg',km:37},
{id:'th',a:'talburg',b:'hafenau',km:25},
{id:'tr',a:'teutschenthal',b:'roeblingen',km:27},
{id:'re',a:'roeblingen',b:'eisleben',km:43},
{id:'es',a:'eisleben',b:'sangerhausen',km:39},
{id:'sh',a:'sangerhausen',b:'hafenau',km:42},
{id:'eb',a:'eisleben',b:'burgstadt',km:35},
{id:'ta',a:'teutschenthal',b:'altheim',km:30}
];
const TRAINS={
diesel:{name:'BR 642 · Dieseltriebwagen',kind:'P',price:68000,seats:100,speed:110,costKm:5.8,maintenance:190,fuel:'Diesel',icon:'🚃'},
regional:{name:'BR 442 · Regionaltriebzug',kind:'P',price:119000,seats:190,speed:160,costKm:4.8,maintenance:290,fuel:'Elektro',icon:'🚆'},
express:{name:'Fernverkehr · Intercity',kind:'P',price:245000,seats:340,speed:200,costKm:7.5,maintenance:550,fuel:'Elektro',icon:'🚄'},
cargo:{name:'BR 245 · Güterdieselzug',kind:'G',price:132000,seats:230,speed:100,costKm:8.2,maintenance:370,fuel:'Diesel',icon:'🚂'},
electricCargo:{name:'BR 185 · Güterzug',kind:'G',price:199000,seats:360,speed:120,costKm:6.7,maintenance:490,fuel:'Elektro',icon:'🚂'}
};
const city=id=>CITIES.find(c=>c.id===id);
const edge=id=>TRACKS.find(e=>e.id===id);
const money=n=>Math.round(n).toLocaleString('de-DE')+' €';
const num=n=>Math.round(n).toLocaleString('de-DE');
const fmtTime=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(Math.floor(m%60)).padStart(2,'0');
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
function newGame(){return {version:2,day:1,money:365000,reputation:72,
stations:{neustadt:{level:1},teutschenthal:{level:1}},
tracks:{nt:{double:false,electric:true,signals:1,condition:100}},
fleet:[{id:1,model:'diesel',condition:100},{id:2,model:'regional',condition:100}],
lines:[{id:1,name:'RE 1 · Neustadt – Teutschenthal',from:'neustadt',to:'teutschenthal',vehicle:2,trips:3,fare:0.28}],
serial:3,claimed:[],passengers:0,freight:0,kmBuilt:32,finance:[],
log:['Unternehmen gegründet. Eigene Strecke Neustadt–Teutschenthal in Betrieb.']};}
function migrate(old){let s=newGame();if(old&&old.v===1&&Number.isFinite(old.money)){
s.money=old.money;s.day=Math.max(1,old.day||1);s.reputation=old.reputation||72;
if(old.links>1){s.tracks.tb={double:false,electric:false,signals:0,condition:100};s.stations.burgstadt={level:1};s.kmBuilt+=41;}
if(old.signals)s.tracks.nt.signals=Math.min(3,old.signals);
for(let i=2;i<Math.min(15,old.trains||2);i++)s.fleet.push({id:s.serial++,model:'diesel',condition:100});
s.lines[0].trips=Math.max(1,Math.min(6,old.services||3));
s.log.unshift('Bisherigen Tycoon-Spielstand übernommen.');}
return s;}
function loadGame(){try{const a=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(a&&a.version===2&&a.tracks&&a.stations&&Array.isArray(a.fleet)&&Array.isArray(a.lines))return a;const b=JSON.parse(localStorage.getItem(OLD_KEY)||'null');return migrate(b);}catch(e){return newGame();}}
let S=loadGame(),view='world',selected={type:'track',id:'nt'},worldTime=390,playSpeed=1,viewBox={x:0,y:0,w:1180,h:680},lastFrame=0,drag=null,noticeTimer=null;
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));return true;}catch(e){showNotice('Speicherplatz erschöpft – bitte Browserdaten prüfen.');return false;}}
function log(s){S.log.unshift('Tag '+S.day+' · '+s);S.log=S.log.slice(0,45);}
function showNotice(t){const el=$('notice');if(el){el.textContent=t;el.hidden=false;}}
function costEdge(e){return e.km*2450+18000;}
function spend(cost){if(S.money<cost){showNotice('Nicht genügend Kapital. Benötigt: '+money(cost));return false;}S.money-=cost;return true;}
function ownedEdge(id){return !!S.tracks[id];}
function linked(e){return !!(S.stations[e.a]||S.stations[e.b]);}
function networkRoute(from,to){
if(from===to)return {edges:[],cities:[from],km:0};
const d={[from]:0},prev={},q=[from],seen=new Set();
while(q.length){q.sort((a,b)=>d[a]-d[b]);const at=q.shift();if(seen.has(at))continue;seen.add(at);if(at===to)break;
for(const e of TRACKS){if(!ownedEdge(e.id)||e.a!==at&&e.b!==at)continue;const next=e.a===at?e.b:e.a;
const nd=d[at]+e.km;if(nd<(d[next]??Infinity)){d[next]=nd;prev[next]={at,edge:e.id};q.push(next);}}
}
if(d[to]==null)return null;
const edges=[],cities=[to];let cur=to;while(cur!==from){const p=prev[cur];if(!p)return null;edges.unshift(p.edge);cities.unshift(p.at);cur=p.at;}
return {edges,cities,km:d[to]};
}
function availableTrains(){return S.fleet.filter(t=>!S.lines.some(l=>l.vehicle===t.id));}
function lineVehicle(l){return S.fleet.find(x=>x.id===l.vehicle);}
function trainMaxTrips(train,km){const t=TRAINS[train.model];return Math.max(1,Math.min(8,Math.floor(1100/(Math.max(50,km*2/t.speed*60)+50))));}
function edgeCapacity(id){const a=S.tracks[id];if(!a)return 0;return (a.double?14:7)+Math.min(3,a.signals||0)*3;}
function routeIsElectric(route){return route.edges.every(id=>S.tracks[id].electric);}
function validateLine(from,to,vehicleId){const route=networkRoute(from,to),veh=S.fleet.find(v=>v.id===vehicleId);if(!route||!route.edges.length)return 'Es gibt keine befahrbare Verbindung zwischen diesen Bahnhöfen.';if(!veh)return 'Bitte einen vorhandenen Zug auswählen.';if(S.lines.some(l=>l.vehicle===vehicleId))return 'Der Zug ist bereits einer Linie zugeteilt.';if(TRAINS[veh.model].fuel==='Elektro'&&!routeIsElectric(route))return 'Die ganze Strecke muss für diesen Zug elektrifiziert sein.';return null;}
function buildTrack(id){
const e=edge(id);if(!e||ownedEdge(id)||!linked(e))return showNotice('Neue Strecken müssen an dein vorhandenes Netz anschließen.');
const cost=costEdge(e);if(!spend(cost))return;
S.tracks[id]={double:false,electric:false,signals:0,condition:100};S.stations[e.a]??={level:1};S.stations[e.b]??={level:1};S.kmBuilt+=e.km;
log('Neubaustrecke '+city(e.a).name+' – '+city(e.b).name+' ('+e.km+' km) eröffnet.');selected={type:'track',id};persist();render();
}
function upgradeTrack(id,mode){
const e=edge(id),t=S.tracks[id];if(!t)return showNotice('Strecke zuerst bauen.');
const costs={double:e.km*1600,electric:e.km*1150,signals:14000,repair:Math.max(2500,Math.round((100-t.condition)*e.km*90))};
if(mode==='double'&&t.double||mode==='electric'&&t.electric||mode==='signals'&&t.signals>=3||mode==='repair'&&t.condition>=99)return;
if(!spend(costs[mode]))return;
if(mode==='signals')t.signals++;else if(mode==='repair')t.condition=100;else t[mode]=true;
log('Strecke '+city(e.a).name+' – '+city(e.b).name+': '+({double:'zweites Gleis',electric:'Elektrifizierung',signals:'Blocksignale',repair:'Gleisinstandsetzung'}[mode])+'.');persist();render();
}
function upgradeStation(id){const t=S.stations[id];if(!t||t.level>=4)return;const cost=16000*t.level;if(!spend(cost))return;t.level++;log('Bahnhof '+city(id).name+' auf Ausbaustufe '+t.level+' ausgebaut.');persist();render();}
function buyTrain(model){const t=TRAINS[model];if(!t||!spend(t.price))return;S.fleet.push({id:S.serial++,model,condition:100});log(t.name+' beschafft.');persist();render();}
function sellTrain(id){const t=S.fleet.find(v=>v.id===id);if(!t||S.lines.some(l=>l.vehicle===id))return showNotice('Zug ist noch im Linienverkehr eingesetzt.');const refund=Math.round(TRAINS[t.model].price*t.condition/100*.52);S.money+=refund;S.fleet=S.fleet.filter(x=>x.id!==id);log(t.model+' verkauft: '+money(refund));persist();render();}
function repairTrain(id){const t=S.fleet.find(v=>v.id===id);if(!t||t.condition>=100)return;const cost=Math.max(1500,Math.round((100-t.condition)*TRAINS[t.model].price*.0028));if(!spend(cost))return;t.condition=100;log('Zug #'+id+' instandgesetzt.');persist();render();}
function addLine(form){const from=form.from.value,to=form.to.value,veh=Number(form.vehicle.value);const failure=validateLine(from,to,veh);if(failure)return showNotice(failure);
const route=networkRoute(from,to),train=S.fleet.find(t=>t.id===veh),type=TRAINS[train.model];
const trips=Math.max(1,Math.min(8,Number(form.trips.value)||2));
const l={id:S.serial++,name:(type.kind==='G'?'Güter':'Regional')+' '+(S.lines.length+1)+' · '+city(from).name+' – '+city(to).name,from,to,vehicle:veh,trips,fare:type.kind==='G'?.17:.28};
S.lines.push(l);selected={type:'line',id:l.id};log('Neue '+(type.kind==='G'?'Güter':'Personen')+'linie eingerichtet: '+city(from).name+' – '+city(to).name+'.');persist();render();
}
function adjustLine(id,delta){const l=S.lines.find(a=>a.id===id);if(!l)return;l.trips=Math.max(1,Math.min(8,l.trips+delta));persist();render();}
function changeFare(id,delta){const l=S.lines.find(a=>a.id===id);if(!l)return;l.fare=Math.max(.08,Math.min(.55,Math.round((l.fare+delta)*100)/100));persist();render();}
function deleteLine(id){const l=S.lines.find(a=>a.id===id);if(!l)return;if(!confirm('Linie '+l.name+' wirklich einstellen?'))return;S.lines=S.lines.filter(x=>x.id!==id);log('Linie '+l.name+' eingestellt.');persist();render();}
function dayEvent(day){const r=((day*17+7)%101)/101;return r<.11?{name:'Stellwerksstörung',factor:.76,maintenance:6500}:r<.20?{name:'Baustellenverkehr',factor:.85,maintenance:2400}:r<.29?{name:'Großveranstaltung',factor:1.35,maintenance:0}:{name:'Normalbetrieb',factor:1,maintenance:0};}
function performDay(){
const day=S.day,event=dayEvent(day),edgeUsed={},stationUsed={},summary=[];let revenue=0,cost=0,passengers=0,freight=0,cancelled=0;
for(const l of S.lines){const v=lineVehicle(l),route=networkRoute(l.from,l.to);
if(!v||!route||!route.edges.length){summary.push({name:l.name,done:0,missed:l.trips,profit:0});cancelled+=l.trips;continue;}
const def=TRAINS[v.model],max=trainMaxTrips(v,route.km),feasible=Math.min(l.trips,max);
let done=0,inc=0,out=0,loads=0;
for(let i=0;i<feasible;i++){
if(v.condition<12){cancelled++;continue;}
if(route.edges.some(id=>(edgeUsed[id]||0)>=edgeCapacity(id))||
   [l.from,l.to].some(id=>(stationUsed[id]||0)>=6+(S.stations[id]?.level||1)*4)){cancelled++;continue;}
if(def.fuel==='Elektro'&&!routeIsElectric(route)){cancelled++;continue;}
if(event.name==='Stellwerksstörung'&&(i+day+l.id)%4===0){cancelled++;continue;}
route.edges.forEach(id=>edgeUsed[id]=(edgeUsed[id]||0)+1);
stationUsed[l.from]=(stationUsed[l.from]||0)+1;stationUsed[l.to]=(stationUsed[l.to]||0)+1;
const a=city(l.from),b=city(l.to);
const stationBoost=1+((S.stations[l.from]?.level||1)-1)*.12+((S.stations[l.to]?.level||1)-1)*.12;
const demand=def.kind==='P'?Math.round((a.pop+b.pop)*.55*stationBoost*event.factor*(1.18-(l.fare-.22)*1.6)):Math.round((a.industry+b.industry)*1.08*stationBoost*event.factor);
const load=Math.max(10,Math.min(def.seats,demand+((day*31+l.id*13+i*11)%31-15)));loads+=load;
const income=load*route.km*l.fare*1.12;
const operating=route.km*def.costKm+155+(def.kind==='G'?210:95);
inc+=income;out+=operating;done++;v.condition=Math.max(0,v.condition-(def.kind==='G'?1.3:.85));
}
cancelled+=Math.max(0,l.trips-feasible);
const fixed=def.maintenance+40*route.edges.length;out+=fixed;cost+=out;revenue+=inc;
if(def.kind==='P')passengers+=loads;else freight+=loads;
summary.push({name:l.name,done,missed:l.trips-done,profit:inc-out});
}
for(const t of Object.values(S.tracks)){const wear=(edgeUsed[TRACKS.find(e=>S.tracks[e.id]===t)?.id]||0)*.045;t.condition=Math.max(20,Math.round((t.condition-wear)*100)/100);}
const fixed=Object.keys(S.stations).length*210+Object.keys(S.tracks).length*160+event.maintenance;
cost+=fixed;const net=Math.round(revenue-cost);
S.money+=net;S.passengers+=passengers;S.freight+=freight;S.reputation=Math.max(0,Math.min(100,S.reputation+(cancelled?Math.max(-7,-cancelled*2):1)+(event.name==='Großveranstaltung'?1:0)));
S.finance.unshift({day,revenue:Math.round(revenue),cost:Math.round(cost),profit:net,passengers,freight,cancelled,event:event.name});S.finance=S.finance.slice(0,24);
log(event.name+': '+summary.reduce((x,l)=>x+l.done,0)+' Fahrten, '+cancelled+' Ausfälle, Tagesergebnis '+money(net)+'.');
S.day++;worldTime=360;showNotice('Tag '+day+': '+event.name+' · Ergebnis '+money(net)+' · '+cancelled+' ausgefallene Fahrten.');persist();render();
}
const GOALS=[
{id:'line3',name:'Drei Linien betreiben',desc:'3 aktive Linien',reward:48000,check:()=>S.lines.length>=3},
{id:'fleet4',name:'Fuhrpark erweitern',desc:'4 Zugverbände kaufen',reward:38000,check:()=>S.fleet.length>=4},
{id:'station4',name:'Vier Bahnhöfe verbinden',desc:'4 Betriebsstellen erschließen',reward:62000,check:()=>Object.keys(S.stations).length>=4},
{id:'kilometers',name:'Netzbetreiber',desc:'Mindestens 150 Streckenkilometer',reward:95000,check:()=>S.kmBuilt>=150},
{id:'passengers',name:'Reisende überzeugen',desc:'5.000 Reisende befördern',reward:70000,check:()=>S.passengers>=5000},
{id:'freight',name:'Güterkorridor',desc:'2.500 Gütereinheiten befördern',reward:80000,check:()=>S.freight>=2500},
{id:'rep',name:'Zuverlässiger Betrieb',desc:'90 Ansehen erreichen',reward:45000,check:()=>S.reputation>=90},
{id:'empire',name:'Netzwerk-Imperium',desc:'8 Bahnhöfe und 350 km Strecke',reward:180000,check:()=>Object.keys(S.stations).length>=8&&S.kmBuilt>=350}
];
function claimGoal(id){const g=GOALS.find(x=>x.id===id);if(!g||S.claimed.includes(id)||!g.check())return;S.claimed.push(id);S.money+=g.reward;log('Meilenstein '+g.name+': Bonus '+money(g.reward));persist();render();}
function setView(next){view=next;document.querySelectorAll('[data-view]').forEach(el=>{el.classList.toggle('active',el.dataset.view===view);el.setAttribute('aria-pressed',String(el.dataset.view===view));});render();}
function stats(){
const stations=Object.keys(S.stations).length,tracks=Object.keys(S.tracks).length,profit=S.finance[0]?.profit||0;
return [['Kontostand',money(S.money),'wallet'],['Betriebstag',S.day,'calendar'],['Ansehen',S.reputation+' / 100','star'],['Betriebsstellen',stations,'building'],['Streckennetz',S.kmBuilt+' km','route'],['Tagesergebnis',money(profit),'activity']].map(([label,value,icon])=>'<div class="metric"><div class="statlabel">'+label+'</div><strong>'+value+'</strong></div>').join('');
}
const BUTTON=(action,id,label,disabled=false,cls='')=>'<button class="'+cls+'" data-action="'+action+'" data-id="'+id+'" '+(disabled?'disabled':'')+'>'+label+'</button>';
function stationCard(id){
const c=city(id),level=S.stations[id]?.level||0;
return '<div class="block"><div class="blockhead"><div><strong>'+c.name+'</strong><small>'+c.pop*1000+' Einwohner · Industrie '+c.industry+'</small></div><span class="tag '+(level?'green':'')+'">'+(level?'Stufe '+level:'nicht erschlossen')+'</span></div>'+
(level?'<p>'+((level+1)*2)+' nutzbare Bahnsteig-/Betriebsgleise (vereinfacht). Ausbau erhöht die Bahnhofskapazität um 4 Fahrten pro Tag und die Nachfrage.</p><div class="actionbar">'+BUTTON('upgrade-station',id,'Bahnhof ausbauen · '+money(16000*level),level>=4)+'</div>':'<p>Baue eine anschließende Strecke, um den Bahnhof freizuschalten.</p>')+'</div>';
}
function trackCard(id){
const e=edge(id),t=S.tracks[id],accessible=linked(e),cost=costEdge(e);
let h='<div class="block"><div class="blockhead"><div><strong>'+city(e.a).name+' – '+city(e.b).name+'</strong><small>'+e.km+' km · '+(t?(t.double?'zweigleisig':'eingleisig'):'nicht gebaut')+'</small></div><span class="tag '+(t?'green':'')+'">'+(t?'In Betrieb':'Bauprojekt')+'</span></div>';
if(!t)return h+'<p>Neue Strecke einschließlich Anschluss an das bestehende Netz.</p>'+BUTTON('build',id,'Strecke bauen · '+money(cost),!accessible)+'</div>';
h+='<div class="pills"><span>Blocksignale '+t.signals+'/3</span><span>'+(t.electric?'⚡ elektrifiziert':'Dieselbetrieb')+'</span><span>Kapazität '+edgeCapacity(id)+'/Tag</span><span>Zustand '+Math.round(t.condition)+'%</span></div>';
h+='<div class="actionbar">'+BUTTON('up-double',id,'2. Gleis · '+money(e.km*1600),t.double)+BUTTON('up-electric',id,'⚡ Oberleitung · '+money(e.km*1150),t.electric)+BUTTON('up-signals',id,'Blocksignale · 14.000 €',t.signals>=3)+BUTTON('up-repair',id,'Instandsetzen',t.condition>=99)+'</div></div>';
return h;
}
function networkPanel(){
let info=selected.type==='track'?trackCard(selected.id):selected.type==='city'?stationCard(selected.id):selected.type==='line'?lineCard(S.lines.find(l=>l.id===selected.id)):null;
return '<div class="layout"><div class="worldblock"><div class="maphead"><div><h2>Deine Eisenbahnwelt</h2><p class="sub">Strecken bauen, Bahnhöfe erschließen und Zugverkehr verfolgen. Ziehen zum Verschieben, +/− zum Zoomen.</p></div><div class="actionbar">'+BUTTON('zoom-in',0,'+')+BUTTON('zoom-out',0,'−')+BUTTON('zoom-reset',0,'Übersicht')+'</div></div><svg id="world" viewBox="'+[viewBox.x,viewBox.y,viewBox.w,viewBox.h].join(' ')+'" role="img" aria-label="Ausbaubares Eisenbahnnetz"><g id="worldStatic"></g><g id="worldTrains"></g></svg><div class="legend"><span class="dot green"></span> Betrieb <span class="dot amber"></span> Neubau möglich <span class="dot gray"></span> Späterer Ausbau <span class="dot cyan"></span> Zugfahrt</div></div>'+
'<aside class="inspector"><h2>Betriebsdetails</h2>'+(info||'Wähle einen Bahnhof oder eine Strecke auf der Karte.')+'<h3>Aktive Linien</h3><div class="compactlist">'+S.lines.map(l=>'<div class="tinyline" data-pick="line" data-id="'+l.id+'">🚆 '+escapeHtml(l.name)+'</div>').join('')+'</div></aside></div>';
}
function lineCard(l){
if(!l)return '<div class="empty">Linie nicht vorhanden.</div>';const v=lineVehicle(l),r=networkRoute(l.from,l.to);
const times=Array.from({length:l.trips},(_,i)=>fmtTime(360+i*(900/Math.max(1,l.trips)))).join(' · ');
return '<div class="block"><div class="blockhead"><div><strong>'+escapeHtml(l.name)+'</strong><small>'+(r?r.km+' km · '+r.edges.length+' Streckenabschnitte':'Strecke unterbrochen')+'</small></div><span class="tag green">'+l.trips+' Fahrten/Tag</span></div><p>Fahrzeug: '+(v?TRAINS[v.model].name:'nicht vorhanden')+' · Tarif '+l.fare.toFixed(2)+' €/Pkm bzw. tkm</p><p class="sub">Abfahrten: '+times+' Uhr · Max. Fahrzeugfahrten: '+(v&&r?trainMaxTrips(v,r.km):0)+'/Tag</p><div class="actionbar">'+BUTTON('line-minus',l.id,'Weniger Fahrten')+BUTTON('line-plus',l.id,'Mehr Fahrten')+BUTTON('fare-minus',l.id,'Tarif −')+BUTTON('fare-plus',l.id,'Tarif +')+BUTTON('delete-line',l.id,'Linie einstellen',false,'danger')+'</div></div>';
}
function linesPanel(){
const own=CITIES.filter(c=>S.stations[c.id]);
const options=own.map(c=>'<option value="'+c.id+'">'+c.name+'</option>').join('');
const unassigned=availableTrains();
let h='<div class="sectionhead"><h2>Linienplanung & Fahrpläne</h2><p>Definiere eigene Verbindungen und setze Züge ein. Der Fahrplan erzeugt tatsächliche betriebliche Fahrten im Wirtschaftssystem.</p></div><div class="twocol"><div class="pane"><h3>Neue Linie planen</h3><form id="lineForm" class="formgrid"><label>Startbahnhof<select name="from" required>'+options+'</select></label><label>Zielbahnhof<select name="to" required>'+options+'</select></label><label>Fahrzeug<select name="vehicle" required>'+unassigned.map(t=>'<option value="'+t.id+'">#'+t.id+' '+TRAINS[t.model].name+'</option>').join('')+'</select></label><label>Tägliche Fahrten<input name="trips" type="number" min="1" max="8" value="2"></label><button class="primary" type="submit" '+(!unassigned.length?'disabled':'')+'>Linie einrichten</button></form><p class="sub">Jeder Zug kann einer Linie zugeordnet sein. Elektrozüge benötigen Oberleitung auf dem gesamten Laufweg.</p></div><div class="pane"><h3>Liniennetz</h3>'+S.lines.map(lineCard).join('')+'</div></div>';
return h;
}
function fleetPanel(){
return '<div class="sectionhead"><h2>Fuhrpark & Beschaffung</h2><p>Wähle passende Züge für deine Infrastruktur. Elektrische Fahrzeuge brauchen eine vollständig elektrifizierte Strecke; Güterzüge haben andere Erlöse und Betriebskosten.</p></div>'+
'<div class="vehiclegrid">'+Object.entries(TRAINS).map(([id,t])=>'<article class="vehicle"><div class="vehicleicon">'+t.icon+'</div><h3>'+t.name+'</h3><p>'+t.fuel+' · '+t.speed+' km/h · '+(t.kind==='G'?'Ladung':'Plätze')+' '+t.seats+'</p><p class="sub">Betrieb: '+t.costKm+' €/km · Wartung '+money(t.maintenance)+'/Tag</p>'+BUTTON('buy-train',id,'Kaufen · '+money(t.price),S.money<t.price,'primary')+'</article>').join('')+'</div>'+
'<h2>Dein Bestand · '+S.fleet.length+' Fahrzeuge</h2><div class="vehiclegrid">'+S.fleet.map(t=>{const def=TRAINS[t.model],assigned=S.lines.find(l=>l.vehicle===t.id);return '<article class="vehicle"><h3>'+def.icon+' #'+t.id+' · '+def.name+'</h3><p>Technischer Zustand: <b>'+Math.round(t.condition)+' %</b></p><div class="meter"><span style="width:'+Math.round(t.condition)+'%"></span></div><p class="sub">'+(assigned?'Eingesetzt auf '+escapeHtml(assigned.name):'Frei verfügbar')+'</p><div class="actionbar">'+BUTTON('repair-train',t.id,'Wartung',t.condition>=100)+BUTTON('sell-train',t.id,'Verkaufen',!!assigned)+'</div></article>';}).join('')+'</div>';
}
function constructionPanel(){
const candidates=TRACKS.filter(e=>!S.tracks[e.id]&&linked(e));
return '<div class="sectionhead"><h2>Infrastruktur bauen</h2><p>Entwickle dein Netz in neue Regionen. Jedes neue Streckensegment erschließt den Zielbahnhof; bestehende Strecken lassen sich verdoppeln, elektrifizieren und mit Blocksignalen verbessern.</p></div><div class="twocol"><div class="pane"><h3>Erschließbare Strecken</h3>'+candidates.map(e=>trackCard(e.id)).join('')+'</div><div class="pane"><h3>Bestehende Infrastruktur</h3>'+TRACKS.filter(e=>ownedEdge(e.id)).map(e=>trackCard(e.id)).join('')+'<h3>Bahnhofsausbau</h3>'+CITIES.filter(c=>S.stations[c.id]).map(c=>stationCard(c.id)).join('')+'</div></div>';
}
function financePanel(){
const f=S.finance.slice(0,10),max=Math.max(1,...f.map(x=>Math.max(x.revenue,x.cost))),bar=f.slice().reverse().map((v,i)=>{const h1=v.revenue/max*115,h2=v.cost/max*115,x=20+i*61;return '<rect x="'+x+'" y="'+(135-h1)+'" width="20" height="'+h1+'" fill="#56c69d"/><rect x="'+(x+22)+'" y="'+(135-h2)+'" width="20" height="'+h2+'" fill="#d98d65"/><text x="'+(x+20)+'" y="151" font-size="10" text-anchor="middle" fill="#b7cbd5">'+v.day+'</text>';}).join('');
return '<div class="sectionhead"><h2>Finanzen & Unternehmensziele</h2><p>Investitionen, laufende Kosten und Fahrgasterlöse entscheiden darüber, wie schnell dein Unternehmen wachsen kann.</p></div><div class="twocol"><div class="pane"><h3>Letzte Betriebstage</h3><svg class="financeChart" viewBox="0 0 680 170"><path d="M8 135 H670" stroke="#648093"/>'+bar+'</svg><p class="sub"><span class="dot green"></span> Einnahmen <span class="dot amber"></span> Ausgaben</p><div class="tablewrap"><table><tr><th>Tag</th><th>Einnahmen</th><th>Kosten</th><th>Gewinn</th><th>Ausfälle</th></tr>'+f.map(x=>'<tr><td>'+x.day+'</td><td>'+money(x.revenue)+'</td><td>'+money(x.cost)+'</td><td class="'+(x.profit>=0?'positive':'negative')+'">'+money(x.profit)+'</td><td>'+x.cancelled+'</td></tr>').join('')+'</table></div><h3>Betriebsbuch</h3><div class="history">'+S.log.map(t=>'<p>'+escapeHtml(t)+'</p>').join('')+'</div></div><div class="pane"><h3>Aufträge und Meilensteine</h3>'+GOALS.map(g=>'<div class="block"><div class="blockhead"><div><strong>'+g.name+'</strong><small>'+g.desc+'</small></div><span class="tag '+(S.claimed.includes(g.id)?'green':'')+'">'+(S.claimed.includes(g.id)?'Erledigt':money(g.reward))+'</span></div>'+BUTTON('claim',g.id,S.claimed.includes(g.id)?'Eingelöst':g.check()?'Belohnung abholen':'Noch nicht erreicht',S.claimed.includes(g.id)||!g.check())+'</div>').join('')+'</div></div>';
}
function render(){
$('stats').innerHTML=stats();$('day').textContent='Tag '+S.day+' abschließen ▶';
const viewRoot=$('viewRoot');viewRoot.innerHTML=({world:networkPanel,lines:linesPanel,fleet:fleetPanel,build:constructionPanel,finance:financePanel}[view]||networkPanel)();
if(view==='world'){drawWorld();}document.querySelectorAll('[data-view]').forEach(el=>{el.classList.toggle('active',el.dataset.view===view);el.setAttribute('aria-pressed',String(el.dataset.view===view));});
}
function drawWorld(){
const g=$('worldStatic');if(!g)return;let h='';
h+='<defs><pattern id="bggrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 H0 V40" fill="none" stroke="#29414d" stroke-width=".65"/></pattern></defs><rect width="1180" height="680" fill="#13232d"/><rect width="1180" height="680" fill="url(#bggrid)"/>';
for(const e of TRACKS){
const a=city(e.a),b=city(e.b),owned=S.tracks[e.id],accessible=linked(e),dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
const selectedEdge=selected.type==='track'&&selected.id===e.id;
h+='<g data-inspect="track" data-id="'+e.id+'" class="linkgroup">';
if(!owned){h+='<line x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" stroke="'+(accessible?'#9b7b4b':'#3f5360')+'" stroke-width="'+(selectedEdge?5:2.5)+'" stroke-dasharray="9 9"/>';}
else{
for(const offset of owned.double?[-5,5]:[0]){
h+='<line x1="'+(a.x+nx*offset)+'" y1="'+(a.y+ny*offset)+'" x2="'+(b.x+nx*offset)+'" y2="'+(b.y+ny*offset)+'" stroke="'+(selectedEdge?'#f5d18b':owned.electric?'#a0d7e7':'#a9c0ca')+'" stroke-width="'+(selectedEdge?5:3.8)+'" stroke-linecap="round"/>';
}
for(let k=1;k<=3;k++){const t=k/4,x=a.x+dx*t,y=a.y+dy*t;
h+='<path d="M'+(x-nx*11)+' '+(y-ny*11)+' l'+(nx*22)+' '+(ny*22)+'" stroke="#718e9c" stroke-width="1.5" stroke-dasharray="3 3"/>';
if(owned.signals>0&&k<=owned.signals){h+='<circle cx="'+(x+nx*14)+'" cy="'+(y+ny*14)+'" r="5" fill="#17242a" stroke="#d5e4ef" stroke-width="1.5"/><circle cx="'+(x+nx*14)+'" cy="'+(y+ny*14)+'" r="2" fill="#58d8a5"/>';}
}
if(owned.electric){h+='<line x1="'+(a.x+nx*10)+'" y1="'+(a.y+ny*10)+'" x2="'+(b.x+nx*10)+'" y2="'+(b.y+ny*10)+'" stroke="#75a9c4" opacity=".6" stroke-width=".8"/>';}
}
h+='<line x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" stroke="transparent" stroke-width="23"/>';
h+='<text x="'+(a.x+dx*.5+nx*23)+'" y="'+(a.y+dy*.5+ny*23)+'" text-anchor="middle" font-size="11" font-weight="600" fill="'+(owned?'#d9e9f0':accessible?'#e6bc72':'#607888')+'">'+e.km+' km'+(owned?.electric?' ⚡':'')+'</text></g>';
}
for(const c of CITIES){
const owned=!!S.stations[c.id],highlight=selected.type==='city'&&selected.id===c.id;
h+='<g data-inspect="city" data-id="'+c.id+'" class="stationNode"><rect x="'+(c.x-74)+'" y="'+(c.y-37)+'" width="148" height="74" rx="12" fill="'+(owned?'#27485a':'#20313d')+'" stroke="'+(highlight?'#f2cc7e':owned?'#6ac0dc':'#587182')+'" stroke-width="'+(highlight?4:2)+'"/>';
for(let k=0;k<(owned?Math.min(4,1+(S.stations[c.id].level||1)):2);k++){const y=c.y-19+k*11;h+='<path d="M'+(c.x-57)+' '+y+' H'+(c.x+57)+'" stroke="'+(owned?'#b8d1dc':'#607d8c')+'" stroke-width="2.3"/>';if(k>0)h+='<path d="M'+(c.x-45)+' '+(y-11)+' L'+(c.x-22)+' '+y+'" fill="none" stroke="#c6aa75" stroke-width="1.3"/>';}
h+='<rect x="'+(c.x-69)+'" y="'+(c.y-29)+'" width="138" height="55" fill="transparent"/><text x="'+c.x+'" y="'+(c.y+54)+'" text-anchor="middle" font-size="13" font-weight="700" fill="'+(owned?'#edf6fa':'#92a6b4')+'">'+escapeHtml(c.name)+'</text><text x="'+c.x+'" y="'+(c.y+69)+'" text-anchor="middle" font-size="10" fill="'+(owned?'#8ce5b5':'#9caab5')+'">'+(owned?'Bahnhof Stufe '+S.stations[c.id].level:'Ausbauziel')+'</text></g>';
}
g.innerHTML=h;const svg=$('world');svg.setAttribute('viewBox',[viewBox.x,viewBox.y,viewBox.w,viewBox.h].join(' '));drawMovingTrains();
}
function coordsOnRoute(route,pct){
const km=route.km,dist=Math.max(0,Math.min(km,pct*km));let before=0;
for(let i=0;i<route.edges.length;i++){const e=edge(route.edges[i]),next=before+e.km;
if(dist<=next||i===route.edges.length-1){const from=city(route.cities[i]),to=city(route.cities[i+1]),t=(dist-before)/e.km;return {x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t};}before=next;}
return {x:0,y:0};
}
function drawMovingTrains(){
const layer=$('worldTrains');if(!layer)return;let h='',shown=0;
for(const l of S.lines){const route=networkRoute(l.from,l.to),v=lineVehicle(l);
if(!v||!route||!route.edges.length||TRAINS[v.model].fuel==='Elektro'&&!routeIsElectric(route))continue;
const def=TRAINS[v.model],trips=Math.min(l.trips,trainMaxTrips(v,route.km)),interval=900/Math.max(1,trips);
for(let k=0;k<trips;k++){const depart=360+k*interval,travel=route.km/def.speed*60+8;
const phase=worldTime-depart;if(phase<0||phase>travel)continue;
const point=coordsOnRoute(route,phase/travel),color=def.kind==='G'?'#ecc07d':'#65d7eb';
h+='<g class="trainSprite" transform="translate('+point.x.toFixed(1)+' '+point.y.toFixed(1)+')"><rect x="-17" y="-9" width="34" height="18" rx="5" fill="'+color+'" stroke="#0e1d27" stroke-width="2"/><text x="0" y="4" text-anchor="middle" font-size="10" font-weight="800" fill="#142632">'+(def.kind==='G'?'GZ':'RE')+'</text></g>';shown++;if(shown>35)break;}
}
layer.innerHTML=h;
}
function setZoom(f){const nw=Math.max(300,Math.min(1180,viewBox.w*f)),nh=nw*680/1180;
viewBox.x=Math.max(0,Math.min(1180-nw,viewBox.x+(viewBox.w-nw)/2));viewBox.y=Math.max(0,Math.min(680-nh,viewBox.y+(viewBox.h-nh)/2));viewBox.w=nw;viewBox.h=nh;const g=$('world');if(g)g.setAttribute('viewBox',[viewBox.x,viewBox.y,viewBox.w,viewBox.h].join(' '));}
function resetZoom(){viewBox={x:0,y:0,w:1180,h:680};setZoom(1);}
function inspect(type,id){selected={type,id:type==='line'?Number(id):id};render();}
function tick(t){
if(!lastFrame)lastFrame=t;const dt=Math.min(.06,(t-lastFrame)/1000);lastFrame=t;
if(playSpeed){worldTime+=dt*playSpeed*35;if(worldTime>1340)worldTime=360;}
const time=$('clock');if(time)time.textContent=fmtTime(worldTime);
if(view==='world')drawMovingTrains();requestAnimationFrame(tick);
}
function boot(){
render();persist();
document.addEventListener('click',ev=>{
const nav=ev.target.closest('[data-view]');if(nav){setView(nav.dataset.view);return;}
const pick=ev.target.closest('[data-inspect],[data-pick]');if(pick){inspect(pick.dataset.inspect||pick.dataset.pick,pick.dataset.id);return;}
const btn=ev.target.closest('[data-action]');if(!btn)return;
const act=btn.dataset.action,id=btn.dataset.id;
switch(act){
case 'build':buildTrack(id);break;case 'up-double':upgradeTrack(id,'double');break;case 'up-electric':upgradeTrack(id,'electric');break;
case 'up-signals':upgradeTrack(id,'signals');break;case 'up-repair':upgradeTrack(id,'repair');break;
case 'upgrade-station':upgradeStation(id);break;case 'buy-train':buyTrain(id);break;
case 'repair-train':repairTrain(Number(id));break;case 'sell-train':sellTrain(Number(id));break;
case 'line-plus':adjustLine(Number(id),1);break;case 'line-minus':adjustLine(Number(id),-1);break;
case 'fare-plus':changeFare(Number(id),.02);break;case 'fare-minus':changeFare(Number(id),-.02);break;
case 'delete-line':deleteLine(Number(id));break;case 'claim':claimGoal(id);break;
case 'zoom-in':setZoom(.78);break;case 'zoom-out':setZoom(1.3);break;case 'zoom-reset':resetZoom();break;
}});
document.addEventListener('submit',ev=>{if(ev.target.id==='lineForm'){ev.preventDefault();addLine(ev.target);}});
$('day').addEventListener('click',performDay);$('save').addEventListener('click',()=>{persist();showNotice('Tycoon-Spielstand lokal gespeichert.');});
$('reset').addEventListener('click',()=>{if(!confirm('Deinen Tycoon-Spielstand wirklich neu beginnen?'))return;S=newGame();view='world';selected={type:'track',id:'nt'};persist();render();showNotice('Neues Unternehmen gegründet.');});
$('speed').addEventListener('click',()=>{playSpeed=playSpeed===1?4:playSpeed===4?0:1;$('speed').textContent=playSpeed===0?'▶ Zugvorschau':playSpeed===1?'⏩ 4× Vorschau':'⏸ Vorschau';});
const worldRoot=$('viewRoot');worldRoot.addEventListener('pointerdown',e=>{if(e.target.closest('#world'))drag={x:e.clientX,y:e.clientY,bx:viewBox.x,by:viewBox.y,moved:false};});
worldRoot.addEventListener('pointermove',e=>{if(!drag)return;const svg=$('world');if(!svg)return;const rect=svg.getBoundingClientRect(),dx=(e.clientX-drag.x)*viewBox.w/rect.width,dy=(e.clientY-drag.y)*viewBox.h/rect.height;
if(Math.abs(dx)>4||Math.abs(dy)>4)drag.moved=true;if(drag.moved){viewBox.x=Math.max(0,Math.min(1180-viewBox.w,drag.bx-dx));viewBox.y=Math.max(0,Math.min(680-viewBox.h,drag.by-dy));svg.setAttribute('viewBox',[viewBox.x,viewBox.y,viewBox.w,viewBox.h].join(' '));}});
worldRoot.addEventListener('pointerup',()=>{drag=null;});worldRoot.addEventListener('pointercancel',()=>drag=null);
worldRoot.addEventListener('wheel',e=>{if(!e.target.closest('#world'))return;e.preventDefault();setZoom(e.deltaY>0?1.08:.92);},{passive:false});
requestAnimationFrame(tick);
}
window.tycoon={get state(){return S;},route:networkRoute,capacity:edgeCapacity,runDay:performDay};
boot();