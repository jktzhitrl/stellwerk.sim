#!/usr/bin/env node
import {readFile,writeFile} from 'node:fs/promises';
import {scopeHallePersonenbahnhof} from '../halle-hbf-personenbereich.mjs';
if(process.argv.length!==5)throw Error('Usage: node tools/halle-hbf-scope.mjs RAW-overpass.json IMPORTED-review.json OUT.json');
const [raw,imported,out]=process.argv.slice(2);
const scoped=scopeHallePersonenbahnhof(JSON.parse(await readFile(raw,'utf8')),JSON.parse(await readFile(imported,'utf8')));
if(scoped.tracks.length>2500)throw Error('Scoping unexpectedly kept too many railway segments.');
if(scoped.report.components.length!==1)throw Error('Scoped passenger and stabling rail graph is not connected: '+scoped.report.components);
await writeFile(out,JSON.stringify(scoped,null,2)+'\n','utf8');
console.log(JSON.stringify(scoped.report,null,2));
