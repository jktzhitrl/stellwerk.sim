#!/usr/bin/env node
/* Generate a self-contained, offline inspection map from OSM review JSON.
 * The preview is not an operationally verified interlocking diagram.
 */
import {readFile,writeFile} from 'node:fs/promises';
if(process.argv.length!==4)throw Error('Usage: node tools/halle-hbf-build-preview.mjs REVIEW.json OUTPUT.html');
const [src,out]=process.argv.slice(2);
const data=JSON.parse(await readFile(src,'utf8'));
if(data.dataStatus!=='UNVERIFIED_OSM_IMPORT'||!Array.isArray(data.tracks)||!Array.isArray(data.osmSwitches)||!Array.isArray(data.signals))throw Error('Not an Halle (Saale) Hbf OSM review dataset');
const template=await readFile(new URL('./halle-hbf-review-template.html',import.meta.url),'utf8');
const marker='__EMBED_DATA__';
if(!template.includes(marker))throw Error('Missing data marker in HTML template');
const payload=JSON.stringify(data).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
await writeFile(out,template.replace(marker,payload),'utf8');
console.log('Generated standalone OSM review map: '+out+' ('+data.tracks.length+' segments)');
