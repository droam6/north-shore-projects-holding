// Checks every internal link, image, video and anchor in the built pages.
//   node tools/check-links.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pages = readdirSync(root).filter((f) => f.endsWith('.html'));
const html = Object.fromEntries(pages.map((f) => [f, readFileSync(join(root, f), 'utf8')]));
const ids = Object.fromEntries(pages.map((f) => [f, new Set([...html[f].matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));
const fileFor = (path) => (path === '/' ? 'index.html' : path.replace(/^\//, '') + '.html');
let bad = 0; let checked = 0;

for (const f of pages) {
  const refs = new Set();
  for (const m of html[f].matchAll(/\s(?:href|src|poster)="([^"]+)"/g)) refs.add(m[1]);
  for (const m of html[f].matchAll(/\ssrcset="([^"]+)"/g)) m[1].split(',').forEach((p) => refs.add(p.trim().split(/\s+/)[0]));
  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:)/.test(ref)) continue;
    checked++;
    const [pathQ, hash] = ref.split('#');
    const path = pathQ.split('?')[0];
    if (path === '' && hash) { if (!ids[f].has(hash)) { bad++; console.log(`${f}: no #${hash} on this page`); } continue; }
    if (/\.[a-z0-9]+$/i.test(path)) { if (!existsSync(join(root, path))) { bad++; console.log(`${f}: missing file ${path}`); } continue; }
    const target = fileFor(path);
    if (!html[target]) { bad++; console.log(`${f}: no page for ${path}`); continue; }
    if (hash && !ids[target].has(hash)) { bad++; console.log(`${f}: no #${hash} on ${path}`); }
  }
}
console.log(bad ? `${bad} broken of ${checked}` : `All ${checked} internal links and files are fine.`);
process.exit(bad ? 1 : 0);
