// Makes the web files for the North Shore Projects logo and the favicons.
//   node tools/logo.mjs
// Source: images/logos/north-shore-projects-logo.jpg (white artwork on black, as supplied).
// The black is turned into transparency; the artwork itself is not redrawn or recoloured.
// Output (committed): images/brand/logo-*.png, images/favicon-*.png, images/apple-touch-icon.png,
// and the "brand" entry in src/media.json.
import sharp from 'sharp';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'images/logos/north-shore-projects-logo.jpg');
const NAVY = '#1A1A2E';

const { data, info } = await sharp(src).greyscale().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;

// Brightness becomes opacity. The bottom of the range is cut (JPEG noise around the edges)
// and the top is pushed to solid white.
const LO = 24, HI = 228;
const rgba = Buffer.alloc(W * H * 4, 255);
const colMax = new Uint8Array(W), rowMax = new Uint8Array(H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const v = data[y * W + x];
    const a = Math.max(0, Math.min(255, Math.round(((v - LO) / (HI - LO)) * 255)));
    rgba[(y * W + x) * 4 + 3] = a;
    if (a > colMax[x]) colMax[x] = a;
    if (a > rowMax[y]) rowMax[y] = a;
  }
}
const first = (arr) => arr.findIndex((v) => v > 40);
const last = (arr) => arr.length - 1 - [...arr].reverse().findIndex((v) => v > 40);
const box = { left: first(colMax), top: first(rowMax) };
box.width = last(colMax) - box.left + 1;
box.height = last(rowMax) - box.top + 1;

// The symbol is everything left of the first wide empty gap.
let gapStart = -1, run = 0;
for (let x = box.left; x < box.left + box.width; x++) {
  if (colMax[x] <= 40) { run++; if (run === 40) { gapStart = x - 39; break; } } else run = 0;
}
if (gapStart < 0) throw new Error('Could not find the gap between the symbol and the lettering.');
const markBox = { left: box.left, top: box.top, width: gapStart - box.left, height: box.height };

const base = () => sharp(rgba, { raw: { width: W, height: H, channels: 4 } });
const lockup = await base().extract(box).png().toBuffer();
const symbol = await base().extract(markBox).png().toBuffer();

mkdirSync(join(root, 'images/brand'), { recursive: true });
for (const h of [112, 224]) {
  await sharp(lockup).resize({ height: h }).png({ compressionLevel: 9 }).toFile(join(root, `images/brand/logo-${h}.png`));
}

// Favicons: the symbol alone, white on the site navy.
for (const [name, size, pad] of [['favicon-32.png', 32, 4], ['favicon-192.png', 192, 34], ['apple-touch-icon.png', 180, 34]]) {
  const inner = await sharp(symbol).resize({ width: size - pad * 2, height: size - pad * 2, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: NAVY } })
    .composite([{ input: inner, gravity: 'centre' }]).png().toFile(join(root, 'images', name));
}

const mediaPath = join(root, 'src/media.json');
const media = JSON.parse(readFileSync(mediaPath, 'utf8'));
media.brand = { ratio: +(box.width / box.height).toFixed(4) };
writeFileSync(mediaPath, JSON.stringify(media, null, 2) + '\n');
console.log(`logo ${box.width}x${box.height}, symbol ${markBox.width}x${markBox.height}, ratio ${media.brand.ratio}`);
