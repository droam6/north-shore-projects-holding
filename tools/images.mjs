// Makes the web sizes for photos, the four service logo marks and video posters.
// (The North Shore Projects logo and the favicons are made by tools/logo.mjs.)
// Usage: node tools/images.mjs <path to north-shore-tiling> <path to north-shore-painting>
// The output in images/work, images/marks and videos is committed, so this only
// needs re-running when photos are added or changed.
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [tilingRepo, paintingRepo] = process.argv.slice(2).map((p) => resolve(p));
if (!tilingRepo || !paintingRepo) {
  console.error('Usage: node tools/images.mjs <north-shore-tiling> <north-shore-painting>');
  process.exit(1);
}

const WIDTHS = [640, 1200, 1800];
const T = join(tilingRepo, 'images/tiling');
const P = join(paintingRepo, 'images/painting');

// id -> source. Painting "project 7" (agency watermark) and the small letterboxed
// painting shots are left out on purpose.
const photos = {
  'croydon-vanity-evening': join(T, 'croydon-park-vanity-evening.webp'),
  'croydon-vanity-mirror': join(T, 'croydon-park-vanity-backlit-mirror.webp'),
  'croydon-basin': join(T, 'croydon-park-basin-gold-tapware.webp'),
  'croydon-walnut-vanity': join(T, 'croydon-park-walnut-vanity.webp'),
  'croydon-bathroom': join(T, 'croydon-park-bathroom-renovation.webp'),
  'croydon-bath': join(T, 'croydon-park-freestanding-bath.webp'),
  'croydon-shower': join(T, 'croydon-park-brushed-gold-shower.webp'),
  'croydon-full-view': join(T, 'croydon-park-bathroom-full-view.webp'),
  'marble-1': join(T, 'marble-bathroom-1.webp'),
  'marble-2': join(T, 'marble-bathroom-2.webp'),
  'marble-3': join(T, 'marble-bathroom-3.webp'),
  'marble-4': join(T, 'marble-bathroom-4.webp'),
  'marble-5': join(T, 'marble-bathroom-5.webp'),
  'ashfield-bathroom': join(T, 'DSC06968.webp'),
  'ashfield-shower': join(T, 'DSC07011.webp'),
  'ashfield-wall': join(T, 'DSC06987.webp'),
  'ashfield-corner': join(T, 'DSC07035.webp'),
  'ashfield-vanity': join(T, 'DSC07021.webp'),
  'ashfield-kitchen': join(T, 'DSC07059.webp'),
  'ashfield-splashback': join(T, 'DSC07052.webp'),
  'ashfield-sink': join(T, 'DSC07060.webp'),
  'ashfield-bedroom': join(T, 'DSC07044.webp'),
  'ashfield-living': join(T, 'DSC07064.webp'),
  'ashfield-living-wide': join(T, 'DSC07069.webp'),
  'paint-open-plan': join(P, 'painting-project-6-open-plan.jpg'),
  'paint-living': join(P, 'painting-project-6-office.jpg'),
  'paint-lounge': join(P, 'painting-project-6-master-bedroom.jpg'),
  'paint-kitchen': join(P, 'painting-project-6-kitchen.jpg'),
  'paint-bedroom': join(P, 'painting-project-6-fireplace.jpg'),
};

// Not used: video 3 (its caption is about a delay) and video 5 (another account's story, reposted).
const videos = {
  'marble-clip-1': join(T, 'marble-bathroom-video-1.mp4'),
  'marble-clip-2': join(T, 'marble-bathroom-video-2.mp4'),
  'marble-clip-4': join(T, 'marble-bathroom-video-4.mp4'),
  'ashfield-clip': join(tilingRepo, 'videos/ashfield-project.mp4'),
};
// Second to take the poster frame from (a clean frame, past any title card).
const posterAt = { 'ashfield-clip': 5, 'marble-clip-1': 5, 'marble-clip-2': 5, 'marble-clip-4': 2 };

const marks = {
  tiling: 'NSTLOGO-HD-FINAL.png',
  painting: 'NSPAINTLOGO-HD-FINAL.png',
  cleaning: 'NSCLOGO-HD-FINAL.png',
  removals: 'NSRLOGO-HD-FINAL.png',
};

const manifest = { photos: {}, videos: {}, marks: {} };
mkdirSync(join(root, 'images/work'), { recursive: true });
mkdirSync(join(root, 'images/marks'), { recursive: true });
mkdirSync(join(root, 'videos'), { recursive: true });

for (const [id, src] of Object.entries(photos)) {
  const meta = await sharp(src).metadata();
  const widths = WIDTHS.filter((w) => w <= meta.width);
  if (!widths.includes(meta.width) && meta.width < WIDTHS[WIDTHS.length - 1]) widths.push(meta.width);
  for (const w of widths) {
    await sharp(src).resize({ width: w }).webp({ quality: 78 }).toFile(join(root, `images/work/${id}-${w}.webp`));
  }
  manifest.photos[id] = { w: meta.width, h: meta.height, widths, ratio: +(meta.width / meta.height).toFixed(4) };
  console.log('photo', id, widths.join('/'));
}

for (const [id, src] of Object.entries(videos)) {
  const out = join(root, `videos/${id}.mp4`);
  // Sound is dropped: the clips always play muted, and the phone audio is not ours to publish.
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-an', '-c:v', 'copy', '-movflags', '+faststart', out]);
  const frame = join(root, `videos/${id}.png`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(posterAt[id] ?? 1), '-i', src, '-frames:v', '1', frame]);
  const meta = await sharp(frame).metadata();
  await sharp(frame).resize({ width: Math.min(720, meta.width) }).webp({ quality: 76 }).toFile(join(root, `videos/${id}.webp`));
  execFileSync('rm', [frame]);
  manifest.videos[id] = { w: meta.width, h: meta.height };
  console.log('video', id);
}

for (const [id, file] of Object.entries(marks)) {
  const src = join(root, 'images/logos', file);
  const trimmed = await sharp(src).trim().toBuffer();
  const meta = await sharp(trimmed).metadata();
  for (const h of [96, 240]) {
    await sharp(trimmed).resize({ height: h }).png({ compressionLevel: 9, palette: false }).toFile(join(root, `images/marks/${id}-${h}.png`));
  }
  manifest.marks[id] = { ratio: +(meta.width / meta.height).toFixed(4) };
  console.log('mark', id);
}

// Keep the logo entry that tools/logo.mjs wrote.
const mediaPath = join(root, 'src/media.json');
if (existsSync(mediaPath)) {
  const old = JSON.parse(readFileSync(mediaPath, 'utf8'));
  if (old.brand) manifest.brand = old.brand;
}

writeFileSync(join(root, 'src/media.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('wrote src/media.json');
