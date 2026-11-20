import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {HALLE_PLATFORM_NUMBERS,HALLE_LINE_DIRECTIONS,candidateForRef,auditHalleRefs} from '../../halle-hbf-references.mjs';
import {trackRefs} from '../../halle-hbf-routing.mjs';

const seg=(ref,a,b)=>({railwayTrackRef:ref,a,b,osmWayId:'example'});
const node=(id,x,y)=>({nodeId:String(id),x,y});
test('DB plan lists 13 platform numbers, five explicitly named line directions',()=>{
 assert.deepEqual(HALLE_PLATFORM_NUMBERS,Array.from({length:13},(_,i)=>String(i+1)));
 assert.deepEqual(HALLE_LINE_DIRECTIONS.map(x=>x.ref),['6343','6340','6053','6403','6050']);
});
test('OSM candidate selection is explicit and always remains unverified',()=>{
 const tracks=[seg('1',node(1,0,0),node(2,10,0)),seg('1',node(3,100,100),node(4,120,100)),seg('6403',node(5,200,100),node(6,220,100))];
 const refs=trackRefs(tracks);
 const near=candidateForRef(tracks,refs,'1',{x:110,y:90});
 assert.equal(near.nodeId,'3');assert.equal(near.segmentCount,2);
 const audited=auditHalleRefs(tracks,refs);
 assert.equal(audited.platforms[0].dbPlatformVerified,false);
 assert.equal(audited.platforms[1].osmCandidate,null);
 assert.equal(audited.lines.find(x=>x.ref==='6403').toPlatformRoutesVerified,false);
 assert.equal(audited.lines.find(x=>x.ref==='6343').osmCandidate,null);
});
test('real OSM snapshot has 13 numbered ref candidates but missing line 6343 is never invented',()=>{
 const d=JSON.parse(readFileSync(new URL('../../data/halle-hbf-osm-review.json',import.meta.url),'utf8'));
 assert.equal(d.dataStatus,'UNVERIFIED_OSM_IMPORT');
 const refs=trackRefs(d.tracks),result=auditHalleRefs(d.tracks,refs);
 for(const x of result.platforms){assert.ok(x.osmCandidate,'OSM ref '+x.ref+' missing');assert.equal(x.dbPlatformVerified,false);}
 assert.equal(result.lines.find(x=>x.ref==='6343').osmCandidate,null);
 for(const ref of ['6340','6053','6403','6050'])assert.ok(result.lines.find(x=>x.ref===ref).osmCandidate);
 assert.ok(d.report.untaggedJunctions.length>0);
});
