/*
 * Halle Hbf original OSM object audit – NO physical switch state or signal
 * indication is inferred from tags, map proximity, or appearance.
 */
const has=(tags,prefix)=>Object.keys(tags||{}).some(k=>k===prefix||k.startsWith(prefix+':'));
export function classifySignal(signal){
  const tags=signal?.railwayTags||{};
  if(tags.railway==='buffer_stop')return{kind:'buffer',label:'Prellbock / Abschluss',color:'#9ba7af',operational:false};
  if(has(tags,'railway:signal:main')||has(tags,'railway:signal:combined'))return{kind:'main',label:'Haupt-/Ks-Mehrabschnittssignal-Tag',color:'#58d4ff',operational:false};
  if(has(tags,'railway:signal:shunting')||has(tags,'railway:signal:minor'))return{kind:'shunting',label:'Rangiersignal-Tag',color:'#f7cc79',operational:false};
  if(has(tags,'railway:signal:distant'))return{kind:'distant',label:'Vorsignal-Tag',color:'#a5a2ff',operational:false};
  if(has(tags,'railway:signal:speed_limit')||has(tags,'railway:signal:speed_limit_distant'))
    return{kind:'speed',label:'Geschwindigkeitssignal-Tag',color:'#a5d7a0',operational:false};
  if(has(tags,'railway:signal:stop')||has(tags,'railway:signal:crossing'))
    return{kind:'stop',label:'Halt-/Übergangssignal-Tag',color:'#ff9e9e',operational:false};
  return{kind:'other',label:'Sonstiges signalbezogenes OSM-Objekt',color:'#bfadc5',operational:false};
}
export function auditSwitch(sw,graph){
  const id=String(sw.osmNodeId),degree=graph.get(id)?.adj.length??0;
  const type=String(sw.type||'').toLowerCase();
  const complex=/(double_slip|single_slip|three_way|crossing)/.test(type)||degree>3;
  const kind=complex?'complex':degree===3?'simple':'unresolved';
  return{osmNodeId:id,ref:sw.ref??null,degree,reportedDegree:sw.degree??null,type:sw.type??null,
    kind,reason:complex?'Kreuzungs- oder Mehrfachweiche: genaue Fahrbeziehungen nicht geprüft':
      degree===3?'Dreiweg-Knoten: geometrische Prüfwege, keine bestätigte Weichenstellung':
      'Ungewöhnliche Anschlusszahl: keine freie Durchfahrt annehmen',
    routeAuthorized:false};
}
export function buildObjectAudit(signals,switches,graph){
  const mappedSignals=signals.map(s=>({osmNodeId:String(s.osmNodeId),ref:s.ref??null,x:s.x,y:s.y,
    railwayTags:s.railwayTags||{},...classifySignal(s)}));
  const mappedSwitches=switches.map(s=>({...auditSwitch(s,graph),x:s.x,y:s.y}));
  const signalCounts={},switchCounts={};
  for(const o of mappedSignals)signalCounts[o.kind]=(signalCounts[o.kind]||0)+1;
  for(const o of mappedSwitches)switchCounts[o.kind]=(switchCounts[o.kind]||0)+1;
  return{signals:mappedSignals,switches:mappedSwitches,signalCounts,switchCounts};
}
export function readableObject(o){
  if(!o)return 'Kein Objekt ausgewählt.';
  const kind=o.routeAuthorized===false?'Weiche':'Signalbezogenes Objekt';
  const lines=[kind,'OSM-Knoten: '+o.osmNodeId,'Kennung: '+(o.ref??'(nicht kartiert)'),
    'Typ: '+(o.label||o.type||o.kind)];
  if('degree'in o){lines.push('Verbundene OSM-Gleisäste: '+o.degree,'Prüfstatus: '+o.reason);}
  else{lines.push('OSM-Tags: '+JSON.stringify(o.railwayTags,null,2));}
  lines.push('Keine geprüfte Original-Stellwerksstellung oder Fahrstraßenfreigabe.');
  return lines.join('\n');
}
