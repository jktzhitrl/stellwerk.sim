/**
 * Bundles the existing static game without changing its browser deployment.
 * Source files live at repository root (gh-pages).
 * The packaged Android version is fully local; a service worker is unnecessary.
 */
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryDir = resolve(appDir, '..');
const targetDir = join(appDir, 'www');
const files = [
  'index.html',
  'editor.html',
  'custom-play.html',
  'tycoon.html',
  'tycoon-engine.js',
  'eilenburg-plan.js',
  'eilenburg-review.html',
  'halle-hbf-originalfahrplan.mjs',
  'halle-hbf-betrieb.mjs',
  'halle-hbf-objects.mjs',
  'halle-hbf-references.mjs',
  'halle-hbf-routing.mjs',
  'halle-hbf-play.html',
  'halle-hbf-review.html',
  'data/halle-hbf-personenbereich.json',
  'data/eilenburg-osm-review.json',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
];

await rm(targetDir, { recursive: true, force: true });
await mkdir(targetDir, { recursive: true });
for (const file of files) {
  const destination = join(targetDir, file);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(join(repositoryDir, file), destination);
}

// Never install the web PWA's service worker in the embedded native WebView.
// Otherwise an older service-worker cache could mask new bundled app releases.
const indexFile = join(targetDir, 'index.html');
let html = await readFile(indexFile, 'utf8');
const registrationGuard = "if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {";
if (!html.includes(registrationGuard)) {
  throw new Error('Service-worker registration guard changed; re-check the Android packaging script.');
}
html = html.replace(registrationGuard, "if (false) { // Native app bundles local files; do not register a PWA service worker");
await writeFile(indexFile, html, 'utf8');

// The Tycoon mode is bundled locally, so its navigation target must exist.
if (html.includes("'./tycoon.html'") && !files.includes('tycoon.html')) {
  throw new Error('Tycoon navigation present but tycoon.html is not bundled.');
}
console.log('Stellwerk.sim: ' + files.length + ' local files prepared in android-app/www');
