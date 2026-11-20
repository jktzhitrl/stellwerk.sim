/* DB InfraGO/Bahnhof.de Regeltafel 2498, Abfahrt Halle (Saale) Hbf,
 * gültig ab 14.06.2026. Auszug: Freitag 20.11.2026, 05:00–06:47.
 * Quelle: https://www.bahnhof.de/downloads/schedule/Regeltafel_2498.pdf
 * Nur am Stichtag gültige Fahrten ausgewählt. Gleisabschnitte A-D usw.
 * bleiben als originales Gleisfeld erhalten; dessen OSM-Geometrie ist NICHT
 * bis auf den Bahnsteigabschnitt validiert.
 * Fahrplan enthält Abfahrten, keine erfundenen Ankünfte oder Zuggarnituren.
 */
export const HALLE_TIMETABLE_SOURCE=Object.freeze({
 url:'https://www.bahnhof.de/downloads/schedule/Regeltafel_2498.pdf',
 station:'Halle (Saale) Hbf',stationNumber:2498,
 validFrom:'2026-06-14',serviceDate:'2026-11-20',
 first:'05:00',last:'06:47',kind:'original-departure-extract',
 note:'Originale DB-Abfahrtszeiten und Gleisfelder; simulierte Fahrstraßen und Zugpositionen entsprechen keinem echten Verschluss- oder Umlaufplan.'
});
const raw=[
 ['05:00','S 5','Halle-Trotha','1'],
 ['05:01','S 5','Zwickau (Sachs) Hbf','2'],
 ['05:07','S 3','Geithain','3 A-D'],
 ['05:12','RB 47','Magdeburg Hbf','11 E-G'],
 ['05:20','RB 25','Saalfeld (Saale)','7'],
 ['05:25','RE 4','Goslar','12 D-F'],
 ['05:26','S 3','Halle-Nietleben','3 A-D'],
 ['05:30','S 5','Halle-Trotha','1'],
 ['05:31','S 5X','Zwickau (Sachs) Hbf','2'],
 ['05:37','S 3','Borna (Leipzig)','3 A-D'],
 ['05:38','S 9','Eilenburg','4 D-F'],
 ['05:42','RE 30','Magdeburg Hbf','10 E-G'],
 ['05:46','S 8','Lutherstadt Wittenberg Hbf','5 D-F'],
 ['05:53','ICE 277','Chur','6'],
 ['05:56','S 3','Halle-Nietleben','3 A-D'],
 ['06:00','S 5','Halle-Trotha','1'],
 ['06:01','S 5','Altenburg','2'],
 ['06:04','RE 16','Erfurt Hbf','7'],
 ['06:07','S 3','Geithain','3 A-D'],
 ['06:11','RB 47','Calbe (Saale) Ost','12 D-F'],
 ['06:14','RE 30','Magdeburg Hbf','10 E-G'],
 ['06:19','S 8','Lutherstadt Wittenberg Hbf','4 D-F'],
 ['06:20','RB 25','Saalfeld (Saale)','11 E-G'],
 ['06:26','S 3','Halle-Nietleben','3 A-D'],
 ['06:30','S 5X','Halle-Trotha','1'],
 ['06:31','S 5X','Zwickau (Sachs) Hbf','2'],
 ['06:37','S 3','Borna (Leipzig)','3 A-D'],
 ['06:38','S 9','Eilenburg','5 D-F'],
 ['06:38','RE 24','Halberstadt Hbf','13'],
 ['06:41','RB 77','Wangen (Unstrut)','12 A-C'],
 ['06:44','ICE 698','Berlin Gesundbrunnen','7'],
 ['06:45','ICE 1501','München Hbf','6'],
 ['06:47','IC 2044','Stuttgart Hbf','9']
];
export const HALLE_ORIGINAL_DEPARTURES=Object.freeze(raw.map(([time,train,destination,trackField],i)=>Object.freeze({
 id:'LH-20261120-'+String(i+1).padStart(2,'0'),time,train,destination,trackField,
 trackRef:trackField.match(/^\d+/)?.[0]??null,
 source:'DB InfraGO Regeltafel 2498',date:'2026-11-20',
 arrival:null,entryDirection:null,rollingStock:null,
 originalSignalRouteVerified:false
})));
export function timetableMinutes(time){
 if(!/^\d{2}:\d{2}$/.test(time))throw Error('Invalid HH:MM time');
 const [hour,minute]=time.split(':').map(Number);
 if(hour>23||minute>59)throw Error('Invalid time');
 return hour*60+minute;
}
export function departuresDue(departures,minutes,dispatched=new Set()){
 return departures.filter(x=>timetableMinutes(x.time)<=minutes&&!dispatched.has(x.id));
}
