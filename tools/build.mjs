// Builds every page from src/data.mjs. No dependencies.
//   node tools/build.mjs            preview build (noindex, robots.txt blocks everything)
//   node tools/build.mjs --live     launch build (indexable, sitemap.xml written)
// The output (*.html at the repo root) is committed: Cloudflare Pages serves the repo as it is.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, services, photos, projects, homeSlides, clips, suburbs, steps, removalsSteps, sharedSteps, homeReviews, reviewsCheckedOn } from '../src/data.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const media = JSON.parse(readFileSync(join(root, 'src/media.json'), 'utf8'));
const LIVE = process.argv.includes('--live');
const V = '4'; // bump to bust the CSS/JS cache after a change

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const svc = (id) => services.find((s) => s.id === id);
const proj = (id) => projects.find((p) => p.id === id);

/* ───────── pieces ───────── */

function img(id, { sizes, cls = '', lazy = true, priority = false, alt } = {}) {
  const m = media.photos[id];
  if (!m) throw new Error(`No photo "${id}" in src/media.json`);
  const srcset = m.widths.map((w) => `/images/work/${id}-${w}.webp ${w}w`).join(', ');
  const mid = m.widths.includes(1200) ? 1200 : m.widths[m.widths.length - 1];
  const text = alt ?? photos[id];
  if (text === undefined) throw new Error(`No alt text for "${id}"`);
  return `<img src="/images/work/${id}-${mid}.webp" srcset="${srcset}" sizes="${sizes}" width="${m.w}" height="${m.h}" alt="${esc(text)}"${cls ? ` class="${cls}"` : ''}${lazy && !priority ? ' loading="lazy"' : ''}${priority ? ' fetchpriority="high"' : ''} decoding="async">`;
}

const mark = (id, h, cls = 'mark') => {
  const w = Math.round(h * media.marks[id].ratio);
  return `<img src="/images/marks/${id}-96.png" srcset="/images/marks/${id}-96.png 1x, /images/marks/${id}-240.png 2.5x" width="${w}" height="${h}" alt="" class="${cls}">`;
};

const chevron = '<svg class="chev" width="11" height="7" viewBox="0 0 11 7" fill="none" aria-hidden="true"><path d="M1 1l4.5 4.5L10 1" stroke="currentColor" stroke-width="1.4"/></svg>';
const arrowL = '<svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true"><path d="M7.5 1L1.5 7l6 6M2 7h17" stroke="currentColor" stroke-width="1.5"/></svg>';
const arrowR = '<svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true"><path d="M12.5 1l6 6-6 6M18 7H1" stroke="currentColor" stroke-width="1.5"/></svg>';
const playIcon = '<svg width="18" height="20" viewBox="0 0 18 20" aria-hidden="true"><path d="M1 1.2v17.6L17 10z" fill="currentColor"/></svg>';
const star = '<svg width="16" height="15" viewBox="0 0 16 15" aria-hidden="true"><path d="M8 0l2.35 4.9 5.4.7-3.95 3.75.98 5.35L8 12.1l-4.78 2.6.98-5.35L.25 5.6l5.4-.7z" fill="currentColor"/></svg>';
// Five stars are only ever drawn for a rating Google itself shows as 5.0.
const stars = (rating) => (rating === '5.0' ? `<span class="stars" aria-hidden="true">${star.repeat(5)}</span>` : '');
const rated = services.filter((s) => s.google && s.google.count > 0);
const allFive = rated.length > 0 && rated.every((s) => s.google.rating === '5.0');
const reviewTotal = rated.reduce((n, s) => n + s.google.count, 0);
const words = (arr) => (arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1]);
const numberWord = ['no', 'one', 'two', 'three', 'four'];
const pauseIcon = '<svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true"><path d="M1 0h4v16H1zM9 0h4v16H9z" fill="currentColor"/></svg>';

function header(current) {
  const cur = (href) => (href === current ? ' aria-current="page"' : '');
  // The removals page shows the removals line; every other page shows the shared one.
  const here = services.find((s) => '/' + s.id === current);
  const phone = here ? here.phone : site.phone;
  const phoneHref = here ? here.phoneHref : site.phoneHref;
  return `<a class="skip" href="#main">Skip to main content</a>
<header class="site-header" data-header>
  <div class="header-in">
    <a class="brand" href="/"${current === '/' ? ' aria-current="page"' : ''}>
      ${mark('projects', 36, 'brand-mark')}
      <span class="brand-name">North Shore Projects</span>
    </a>
    <nav class="nav" aria-label="Main">
      <ul class="nav-list">
        <li class="nav-item has-menu" data-menu>
          <button class="nav-btn" type="button" aria-expanded="false" aria-controls="menu-services">Services ${chevron}</button>
          <div class="menu" id="menu-services">
            <ul class="menu-grid">
${services.map((s) => `              <li><a class="menu-item" href="/${s.id}"${cur('/' + s.id)}>
                ${img(s.photo, { sizes: '(min-width: 64rem) 23vw, 50vw', cls: 'menu-photo', alt: '' })}
                <span class="menu-name">${esc(s.fullName)}</span>
                <span class="menu-sub">${esc(s.summary)}</span>
              </a></li>`).join('\n')}
            </ul>
          </div>
        </li>
        <li class="nav-item has-menu" data-menu>
          <button class="nav-btn" type="button" aria-expanded="false" aria-controls="menu-projects">Projects ${chevron}</button>
          <div class="menu" id="menu-projects">
            <ul class="menu-grid">
${projects.map((p) => `              <li><a class="menu-item" href="/projects#${p.id}">
                ${img(p.photos[0], { sizes: '(min-width: 64rem) 23vw, 50vw', cls: 'menu-photo', alt: '' })}
                <span class="menu-name">${esc(p.title)}</span>
                <span class="menu-sub">${esc(svc(p.service).name)}</span>
              </a></li>`).join('\n')}
            </ul>
            <p class="menu-foot"><a class="link" href="/projects"${cur('/projects')}>All projects and clips</a></p>
          </div>
        </li>
        <li class="nav-item"><a class="nav-link" href="/#areas">Areas</a></li>
        <li class="nav-item"><a class="nav-link" href="/contact"${cur('/contact')}>Contact</a></li>
      </ul>
    </nav>
    <a class="header-phone" href="tel:${phoneHref}">${phone}</a>
    <a class="btn header-cta" href="/contact">Get a quote</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mnav" data-nav-toggle>
      <span class="nav-toggle-bars" aria-hidden="true"></span><span data-nav-toggle-text>Menu</span>
    </button>
  </div>
  <div class="mnav" id="mnav" hidden>
    <nav aria-label="Mobile">
      <p class="mnav-h" id="mnav-services">Services</p>
      <ul class="mnav-list" aria-labelledby="mnav-services">
${services.map((s) => `        <li><a href="/${s.id}"${cur('/' + s.id)}>${esc(s.fullName)}</a></li>`).join('\n')}
      </ul>
      <p class="mnav-h" id="mnav-more">More</p>
      <ul class="mnav-list" aria-labelledby="mnav-more">
        <li><a href="/projects"${cur('/projects')}>Projects</a></li>
        <li><a href="/#areas">Areas</a></li>
        <li><a href="/contact"${cur('/contact')}>Contact</a></li>
      </ul>
      <p class="mnav-contact">
        <a class="btn" href="/contact">Get a quote</a>
        <a class="mnav-phone" href="tel:${phoneHref}">Call ${phone}</a>
      </p>
    </nav>
  </div>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      ${mark('projects', 56, 'footer-mark')}
      <p class="footer-name">North Shore Projects</p>
      <p class="footer-note">Tiling, painting, cleaning and removals on Sydney's North Shore.</p>
    </div>
    <div>
      <h2 class="footer-h">Services</h2>
      <ul class="footer-list">
${services.map((s) => `        <li><a href="/${s.id}">${esc(s.fullName)}</a></li>`).join('\n')}
        <li><a href="/projects">Projects</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-h">Contact</h2>
      <ul class="footer-list">
        <li><a href="tel:${site.phoneHref}">${site.phone}</a><span class="footer-dim">Tiling, painting, cleaning</span></li>
        <li><a href="tel:${svc('removals').phoneHref}">${svc('removals').phone}</a><span class="footer-dim">Removals</span></li>
        <li><a href="mailto:${site.email}">${site.email}</a></li>
        <li><a href="/contact">Get a quote</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-h">Instagram</h2>
      <ul class="footer-list">
${services.map((s) => `        <li><a href="https://www.instagram.com/${s.instagram}/" rel="noopener">@${s.instagram}</a></li>`).join('\n')}
      </ul>
    </div>
    <div>
      <h2 class="footer-h">Each team's own site</h2>
      <ul class="footer-list">
${services.map((s) => `        <li><a href="${s.websiteHref}" rel="noopener">${s.website}</a></li>`).join('\n')}
      </ul>
    </div>
  </div>
  <div class="wrap footer-base">
    <p>&copy; 2026 North Shore Projects</p>
    <ul class="footer-legal">
      <li><a href="/privacy">Privacy policy</a></li>
      <li><a href="/terms">Terms</a></li>
    </ul>
  </div>
</footer>`;
}

function page({ path, title, description, body, bodyClass = '', ogImage = '/images/og-default.jpg', index = true }) {
  const canonical = site.url + (path === '/' ? '/' : path);
  const robots = LIVE && index ? 'index, follow' : 'noindex, nofollow';
  const ld = path === '/' ? `
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: site.url + '/',
    email: site.email,
    telephone: site.phoneHref,
    areaServed: 'North Shore, Sydney NSW',
  })}</script>` : '';
  return `<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#1A1A2E">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${site.name}">
<meta property="og:locale" content="en_AU">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site.url}${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/images/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/images/favicon-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="/images/apple-touch-icon.png">
<link rel="preload" href="/fonts/dm-serif-display-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/dm-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/styles.css?v=${V}">
<script>document.documentElement.classList.add('js')</script>${ld}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
${header(path)}
<main id="main">
${body}
</main>
${footer()}
<script src="/js/main.js?v=${V}" defer></script>
</body>
</html>
`;
}

/* ───────── shared sections ───────── */

function carousel({ label, slides, sizes = '(min-width: 64rem) 60vw, 86vw', captions = true }) {
  return `<div class="carousel" data-carousel>
  <ul class="carousel-track" data-track tabindex="0" role="group" aria-roledescription="carousel" aria-label="${esc(label)}">
${slides.map(([id, pid], i) => {
    const p = pid ? proj(pid) : null;
    const m = media.photos[id];
    return `    <li class="slide" style="--r:${m.ratio}">
      <figure>
        ${img(id, { sizes: m.ratio < 1 ? '(min-width: 64rem) 28vw, 62vw' : sizes, cls: 'slide-img', lazy: i > 1 })}${captions && p ? `
        <figcaption><a href="/projects#${p.id}">${esc(p.title)}</a><span>${esc(svc(p.service).name)}</span></figcaption>` : ''}
      </figure>
    </li>`;
  }).join('\n')}
  </ul>
  <div class="carousel-ui">
    <button class="round" type="button" data-prev aria-label="Previous photo">${arrowL}</button>
    <button class="round" type="button" data-next aria-label="Next photo">${arrowR}</button>
    <p class="carousel-count" aria-hidden="true"><span data-count>1</span> / ${slides.length}</p>
  </div>
</div>`;
}

function reels(list = clips) {
  return `<ul class="reels" data-reels>
${list.map((c, i) => `  <li class="reel">
    <button class="reel-btn" type="button" data-reel aria-label="Play clip ${i + 1} of ${list.length}: ${esc(c.label)}" aria-pressed="false">
      <video muted loop playsinline preload="none" poster="/videos/${c.id}.webp" width="${media.videos[c.id].w}" height="${media.videos[c.id].h}" tabindex="-1">
        <source src="/videos/${c.id}.mp4" type="video/mp4">
      </video>
      <span class="reel-icon" aria-hidden="true"><span class="reel-play">${playIcon}</span><span class="reel-pause">${pauseIcon}</span></span>
    </button>
  </li>`).join('\n')}
</ul>`;
}

function socials() {
  return `<ul class="socials">
${services.map((s) => `  <li>
    <a class="social" href="https://www.instagram.com/${s.instagram}/" rel="noopener">
      ${mark(s.id, 44, 'social-mark')}
      <span class="social-text"><span class="social-name">${esc(s.name)}</span><span class="social-handle">@${s.instagram}</span></span>
    </a>
  </li>`).join('\n')}
</ul>`;
}

function stepsList(list = steps) {
  return `<ol class="steps">
${list.map(([t, d]) => `  <li class="step"><h3 class="step-t">${esc(t)}</h3><p>${esc(d)}</p></li>`).join('\n')}
</ol>`;
}

function quoteSlides(list) {
  return `<div class="carousel carousel--quotes" data-carousel>
  <ul class="carousel-track" data-track tabindex="0" role="group" aria-roledescription="carousel" aria-label="Google review excerpts">
${list.map(([sid, i], n) => {
    const s = svc(sid);
    return `    <li class="quote">
      <blockquote>
        <p>\u201C${esc(s.reviews[i])}\u201D</p>
        <footer>Google review of <a href="${esc(s.google.url)}" rel="noopener">${esc(s.business)}</a></footer>
      </blockquote>
    </li>`;
  }).join('\n')}
  </ul>
  <div class="carousel-ui">
    <button class="round" type="button" data-prev aria-label="Previous review">${arrowL}</button>
    <button class="round" type="button" data-next aria-label="Next review">${arrowR}</button>
    <p class="carousel-count" aria-hidden="true"><span data-count>1</span> / ${list.length}</p>
  </div>
</div>`;
}

function reviewsSection() {
  if (!rated.length) return '';
  const byCount = [...rated].sort((a, b) => b.google.count - a.google.count);
  return `<section class="section section--navy" id="reviews" aria-labelledby="reviews-h">
  <div class="wrap section-head">
    <h2 class="h2" id="reviews-h">What customers say on Google</h2>
    <p class="section-aside">Ratings and counts are from each team's Google listing, read on ${reviewsCheckedOn}. The quotes are excerpts, word for word.</p>
  </div>
  <div class="wrap">
    <ul class="ratings">
${byCount.map((s) => `      <li class="rating">
        <span class="rating-team">${esc(s.business)}</span>
        <span class="rating-score">${stars(s.google.rating)}<span>${s.google.rating} out of 5</span></span>
        <span class="rating-count">${s.google.count} review${s.google.count === 1 ? '' : 's'}</span>
        <a class="link rating-link" href="${esc(s.google.url)}" rel="noopener">Read them on Google<span class="vh">: ${esc(s.business)}</span></a>
      </li>`).join('\n')}
    </ul>
  </div>
${quoteSlides(homeReviews)}
</section>`;
}

function serviceReviews(s) {
  if (!s.google || !s.google.count || !s.reviews.length) return '';
  return `<section class="section section--cream${s.clips ? '' : ' section--flush'}" aria-labelledby="sreviews-h">
  <div class="wrap section-head">
    <h2 class="h2" id="sreviews-h">${s.google.rating} on Google from ${s.google.count} review${s.google.count === 1 ? '' : 's'}</h2>
    <p class="section-aside">Read on ${reviewsCheckedOn}. These are excerpts, word for word. <a class="link" href="${esc(s.google.url)}" rel="noopener">See them all on Google</a></p>
  </div>
  <div class="wrap">
    <ul class="quote-grid">
${s.reviews.slice(0, 3).map((q) => `      <li><blockquote><p>\u201C${esc(q)}\u201D</p></blockquote></li>`).join('\n')}
    </ul>
  </div>
</section>`;
}

function enquiryForm({ preselect = null, idp = 'q' } = {}) {
  return `<form class="form" action="${svc('tiling').formspree}" method="post" novalidate data-enquiry>
  <input type="hidden" name="source" value="northshoreprojects">
  <fieldset class="field-set" data-field="service">
    <legend class="label">Which service? Pick as many as you need.</legend>
    <div class="checks">
${services.map((s) => `      <label class="check"><input type="checkbox" name="service" value="${s.id}"${preselect === s.id ? ' checked' : ''}><span>${esc(s.name)}</span></label>`).join('\n')}
    </div>
    <p class="error" id="${idp}-service-err" data-error hidden></p>
  </fieldset>
  <div class="field-row">
    <div class="field" data-field="name">
      <label class="label" for="${idp}-name">Your name</label>
      <input class="input" id="${idp}-name" name="name" type="text" autocomplete="name" required>
      <p class="error" id="${idp}-name-err" data-error hidden></p>
    </div>
    <div class="field" data-field="phone">
      <label class="label" for="${idp}-phone">Phone</label>
      <input class="input" id="${idp}-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required>
      <p class="error" id="${idp}-phone-err" data-error hidden></p>
    </div>
  </div>
  <div class="field-row">
    <div class="field" data-field="email">
      <label class="label" for="${idp}-email">Email</label>
      <input class="input" id="${idp}-email" name="email" type="email" autocomplete="email" required>
      <p class="error" id="${idp}-email-err" data-error hidden></p>
    </div>
    <div class="field" data-field="suburb">
      <label class="label" for="${idp}-suburb">Suburb <span class="optional">(optional)</span></label>
      <input class="input" id="${idp}-suburb" name="suburb" type="text" autocomplete="address-level2">
    </div>
  </div>
  <div class="field" data-field="message">
    <label class="label" for="${idp}-message">What is the job?</label>
    <textarea class="input input--area" id="${idp}-message" name="message" rows="4" maxlength="1000" required></textarea>
    <p class="error" id="${idp}-message-err" data-error hidden></p>
  </div>
  <label class="check check--single"><input type="checkbox" name="preferCallback"><span>I would rather a call back than an email</span></label>
  <div class="hp" aria-hidden="true"><label for="${idp}-website">Website</label><input id="${idp}-website" name="website_url" type="text" tabindex="-1" autocomplete="off"></div>
  <div class="form-foot">
    <button class="btn" type="submit" data-submit>Send enquiry</button>
    <p class="form-note">Your enquiry goes to the teams you tick. <a class="link" href="/privacy">Privacy policy</a></p>
  </div>
  <p class="form-status" role="alert" tabindex="-1" data-status hidden></p>
  <noscript><p class="form-note">This form needs JavaScript to reach the right team. You can call ${site.phone} or email ${site.email} instead.</p></noscript>
</form>
<div class="form-done" data-done hidden tabindex="-1">
  <h3 class="form-done-h">Enquiry sent.</h3>
  <p data-done-text></p>
</div>`;
}

function enquirySection({ heading = 'Get a quote', text = 'One form for all four teams. Tick what you need and your enquiry goes to each of them.', preselect = null } = {}) {
  return `<section class="section section--navy" id="enquire" aria-labelledby="enquire-h">
  <div class="wrap enquire">
    <div class="enquire-intro">
      <h2 class="h2" id="enquire-h">${esc(heading)}</h2>
      <p class="lead">${esc(text)}</p>
      <dl class="direct">
        <div><dt>Tiling, painting, cleaning</dt><dd><a href="tel:${site.phoneHref}">${site.phone}</a></dd></div>
        <div><dt>Removals</dt><dd><a href="tel:${svc('removals').phoneHref}">${svc('removals').phone}</a></dd></div>
      </dl>
    </div>
    <div class="enquire-form">
${enquiryForm({ preselect })}
    </div>
  </div>
</section>`;
}

/* ───────── pages ───────── */

function home() {
  const body = `<section class="hero" aria-labelledby="hero-h">
  <div class="wrap hero-top">
    <div class="hero-main">
      <h1 class="hero-h" id="hero-h">Tiling, painting, cleaning and removals on Sydney's North Shore.</h1>
${allFive ? `      <p class="hero-rating"><a href="#reviews">${stars('5.0')}<span>5.0 on Google. ${[...rated].sort((a, b) => b.google.count - a.google.count).map((s, i) => `${i ? s.name.toLowerCase() : s.name} ${s.google.count}${i ? '' : ' reviews'}`).join(', ')}.</span></a></p>` : ''}
    </div>
    <div class="hero-side">
      <p class="hero-lead">Four teams, one website. Pick a service, or send one enquiry and it goes to each team you need.</p>
      <p class="actions">
        <a class="btn" href="/contact">Get a quote</a>
        <a class="link" href="/projects">See recent projects</a>
      </p>
    </div>
  </div>
  <div class="panels-wrap">
    <ul class="panels" data-panels>
${services.map((s, i) => `      <li class="panel${i === 0 ? ' is-active' : ''}" data-panel>
        <a class="panel-link" href="/${s.id}">
          ${img(s.photo, { sizes: '(min-width: 48rem) 62vw, 82vw', cls: 'panel-img', priority: i === 0, lazy: false, alt: '' })}
          <span class="panel-label">
            <span class="panel-name">${esc(s.name)}</span>
            <span class="panel-sub">${esc(s.summary)}</span>
          </span>
          <span class="panel-bar" aria-hidden="true"></span>
        </a>
      </li>`).join('\n')}
    </ul>
    <button class="panels-pause" type="button" data-panels-pause aria-pressed="false"><span class="pp-pause">${pauseIcon}</span><span class="pp-play">${playIcon}</span><span data-panels-pause-text>Pause</span></button>
  </div>
</section>

<section class="section section--cream" aria-labelledby="work-h">
  <div class="wrap section-head">
    <h2 class="h2" id="work-h">Recent projects</h2>
    <p class="section-aside">Finished jobs from the tiling and painting teams. <a class="link" href="/projects">All projects</a></p>
  </div>
${carousel({ label: 'Recent projects', slides: homeSlides })}
</section>

${reviewsSection()}

<section class="section section--cream" aria-labelledby="services-h">
  <div class="wrap">
    <h2 class="h2 index-h" id="services-h">What each team does</h2>
    <ul class="index">
${services.map((s) => `      <li class="index-row">
        <div class="index-name">
          <span class="index-mark index-mark--${s.id}" aria-hidden="true"></span>
          <h3 class="h3"><a href="/${s.id}">${esc(s.fullName)}</a></h3>
        </div>
        <ul class="index-offers">
${s.offers.map(([n]) => `          <li>${esc(n)}</li>`).join('\n')}
        </ul>
        <p class="index-go">
          <a class="link" href="/${s.id}">About ${esc(s.name.toLowerCase())}</a>
          <a class="index-phone" href="tel:${s.phoneHref}">${s.phone}</a>
        </p>
      </li>`).join('\n')}
    </ul>
  </div>
</section>

<section class="section section--navy" aria-labelledby="onsite-h">
  <div class="wrap section-head">
    <h2 class="h2" id="onsite-h">On site</h2>
    <p class="section-aside">Phone clips from the tiling team's Instagram. They play without sound.</p>
  </div>
  <div class="wrap">
${reels()}
    <h3 class="h3 socials-h">Follow each team on Instagram</h3>
${socials()}
  </div>
</section>

<section class="section section--cream" id="areas" aria-labelledby="areas-h">
  <div class="wrap areas">
    <div>
      <h2 class="h2" id="areas-h">Where we work</h2>
      <p class="areas-note">Sydney's North Shore and the suburbs around it. Not on the list? <a class="link" href="/contact">Ask us</a>.</p>
    </div>
    <ul class="suburbs">
${suburbs.map((s) => `      <li>${esc(s)}</li>`).join('\n')}
    </ul>
  </div>
</section>

${enquirySection()}`;
  return page({
    path: '/',
    title: 'North Shore Projects | Tiling, painting, cleaning, removals',
    description: 'Tiling and waterproofing, painting, cleaning and removals on Sydney\'s North Shore. Four local teams, one place to ask for a quote.',
    body,
  });
}

function servicePage(s) {
  const others = services.filter((o) => o.id !== s.id);
  const gallery = s.gallery.length
    ? `<section class="section section--cream section--flush" aria-labelledby="gallery-h">
  <div class="wrap section-head">
    <h2 class="h2" id="gallery-h">Recent ${esc(s.name.toLowerCase())} work</h2>
    <p class="section-aside"><a class="link" href="/projects">All projects</a></p>
  </div>
${carousel({ label: `Recent ${s.name.toLowerCase()} work`, slides: s.gallery.map((id) => [id, null]), captions: false })}
</section>`
    : '';
  const clipSection = s.clips
    ? `<section class="section section--navy" aria-labelledby="clips-h">
  <div class="wrap section-head">
    <h2 class="h2" id="clips-h">On site</h2>
    <p class="section-aside">Phone clips from the tiling team's Instagram. They play without sound. <a class="link" href="https://www.instagram.com/${s.instagram}/" rel="noopener">@${s.instagram}</a></p>
  </div>
  <div class="wrap">
${reels()}
  </div>
</section>`
    : '';
  const body = `<section class="page-head" aria-labelledby="page-h">
  <div class="wrap page-head-grid">
    <div class="page-head-text">
      ${mark(s.id, 52, 'kicker-mark')}
      <h1 class="h1" id="page-h">${esc(s.fullName)}</h1>
      <p class="lead">${esc(s.lead)}</p>
      <p class="actions">
        <a class="btn" href="/contact?service=${s.id}">Get a ${esc(s.name.toLowerCase())} quote</a>
        <a class="link" href="tel:${s.phoneHref}">Call ${s.phone}</a>
      </p>
    </div>
    <div class="page-head-photo">
      ${img(s.photo, { sizes: '(min-width: 64rem) 50vw, 100vw', priority: true, lazy: false })}
    </div>
  </div>
</section>

<section class="section section--cream" aria-labelledby="offers-h">
  <div class="wrap offers">
    <h2 class="h2" id="offers-h">What we do</h2>
    <dl class="offer-list">
${s.offers.map(([n, d]) => `      <div class="offer"><dt>${esc(n)}</dt><dd>${esc(d)}</dd></div>`).join('\n')}
    </dl>
  </div>
</section>

${gallery}

${clipSection}

${serviceReviews(s)}

<section class="section section--cream${(s.gallery.length && !s.clips) || serviceReviews(s) ? ' section--flush' : ''}" aria-labelledby="steps-h">
  <div class="wrap offers">
    <h2 class="h2" id="steps-h">${s.id === 'removals' ? 'How a move runs' : 'How a job runs'}</h2>
${stepsList(s.id === 'removals' ? removalsSteps : steps)}
  </div>
</section>

<section class="section section--navy" aria-labelledby="cta-h">
  <div class="wrap cta">
    <div>
      <h2 class="h2" id="cta-h">Ask ${esc(s.business)} for a quote</h2>
      <p class="actions">
        <a class="btn" href="/contact?service=${s.id}">Get a ${esc(s.name.toLowerCase())} quote</a>
      </p>
    </div>
    <dl class="direct direct--stack">
      <div><dt>Phone</dt><dd><a href="tel:${s.phoneHref}">${s.phone}</a></dd></div>
      <div><dt>Email</dt><dd><a href="mailto:${s.email}">${s.email}</a></dd></div>
      <div><dt>Instagram</dt><dd><a href="https://www.instagram.com/${s.instagram}/" rel="noopener">@${s.instagram}</a></dd></div>
      <div><dt>The team's own site</dt><dd><a href="${s.websiteHref}" rel="noopener">${s.website}</a></dd></div>
    </dl>
  </div>
  <div class="wrap">
    <h2 class="h3 others-h">The other three teams</h2>
    <ul class="others">
${others.map((o) => `      <li><a class="other" href="/${o.id}">
        ${img(o.photo, { sizes: '(min-width: 48rem) 30vw, 92vw', cls: 'other-img', alt: '' })}
        <span class="other-name">${esc(o.fullName)}</span>
        <span class="other-sub">${esc(o.summary)}</span>
      </a></li>`).join('\n')}
    </ul>
  </div>
</section>`;
  return page({ path: '/' + s.id, title: s.title, description: s.description, body });
}

function projectsPage() {
  const body = `<section class="page-head page-head--plain" aria-labelledby="page-h">
  <div class="wrap">
    <h1 class="h1" id="page-h">Projects</h1>
    <p class="lead">Finished jobs from the tiling and painting teams. Swipe or use the arrows to move through each one.</p>
  </div>
</section>

${projects.map((p, i) => `<section class="section section--cream project${i ? ' section--flush' : ''}" id="${p.id}" aria-labelledby="${p.id}-h">
  <div class="wrap section-head">
    <h2 class="h2" id="${p.id}-h">${esc(p.title)}</h2>
    <p class="section-aside">${esc(p.text)} <a class="link" href="/${p.service}">${esc(svc(p.service).business)}</a></p>
  </div>
${carousel({ label: p.title, slides: p.photos.map((id) => [id, null]), captions: false })}
</section>`).join('\n\n')}

<section class="section section--navy" id="clips" aria-labelledby="clips-h">
  <div class="wrap section-head">
    <h2 class="h2" id="clips-h">On site</h2>
    <p class="section-aside">Phone clips from the tiling team's Instagram. They play without sound.</p>
  </div>
  <div class="wrap">
${reels()}
    <h3 class="h3 socials-h">Follow each team on Instagram</h3>
${socials()}
  </div>
</section>

${enquirySection({ heading: 'Have a job like these?', text: 'Tick the teams you need and your enquiry goes to each of them.' })}`;
  return page({
    path: '/projects',
    title: 'Projects | North Shore Projects',
    description: 'Recent bathrooms, kitchens, floors and repaints from the North Shore Tiling and North Shore Painting teams, with photos and clips.',
    body,
  });
}

function contactPage() {
  const body = `<section class="page-head page-head--plain page-head--contact" aria-labelledby="page-h">
  <div class="wrap enquire">
    <div class="enquire-intro">
      <h1 class="h1" id="page-h">Get a quote</h1>
      <p class="lead">One form for all four teams. Tick what you need and your enquiry goes to each of them.</p>
      <h2 class="h3 contact-h">Or go direct</h2>
      <ul class="contact-list">
${services.map((s) => `        <li>
          <span class="contact-name">${esc(s.business)}</span>
          <a href="tel:${s.phoneHref}">${s.phone}</a>
          <a href="mailto:${s.email}">${s.email}</a>
        </li>`).join('\n')}
      </ul>
    </div>
    <div class="enquire-form">
${enquiryForm({ idp: 'c' })}
    </div>
  </div>
</section>

<section class="section section--cream" aria-labelledby="steps-h">
  <div class="wrap offers">
    <h2 class="h2" id="steps-h">What happens next</h2>
${stepsList(sharedSteps)}
  </div>
</section>`;
  return page({
    path: '/contact',
    title: 'Get a quote | North Shore Projects',
    description: 'Ask for a free quote for tiling, painting, cleaning or removals on Sydney\'s North Shore. One form reaches the teams you pick.',
    body,
  });
}

function legalPage({ path, title, h1, description, html }) {
  const body = `<section class="page-head page-head--plain" aria-labelledby="page-h">
  <div class="wrap">
    <h1 class="h1" id="page-h">${esc(h1)}</h1>
  </div>
</section>
<section class="section section--cream">
  <div class="wrap legal">
${html}
  </div>
</section>`;
  return page({ path, title, description, body });
}

const teamList = services.map((s) => `<li>${esc(s.business)}: <a href="tel:${s.phoneHref}">${s.phone}</a>, <a href="mailto:${s.email}">${s.email}</a></li>`).join('\n      ');

function privacyPage() {
  return legalPage({
    path: '/privacy',
    title: 'Privacy policy | North Shore Projects',
    h1: 'Privacy policy',
    description: 'How North Shore Projects and its four teams collect, use and store the details you send through this website.',
    html: `    <p class="legal-date">Last updated: 9 October 2026</p>
    <p>North Shore Projects is the shared website of North Shore Tiling, North Shore Painting, North Shore Cleaning and North Shore Removals ("we", "us", "our"). This policy explains how we collect, use, store and disclose your personal information in line with the Privacy Act 1988 (Cth) and the Australian Privacy Principles.</p>
    <h2>Information we collect</h2>
    <p>When you send an enquiry through this website, or contact us by phone or email, we may collect:</p>
    <ul>
      <li>Your name, email address and phone number</li>
      <li>Your suburb and details of the work you are asking about</li>
      <li>Which services you picked, whether you prefer a call back, and the page you enquired from</li>
    </ul>
    <h2>Who receives your enquiry</h2>
    <p>Your enquiry is sent only to the businesses whose services you tick on the form. If you tick more than one, each of those businesses receives your details and is told which other services you asked about.</p>
    <h2>How we use your information</h2>
    <ul>
      <li>To respond to your enquiry and provide quotes</li>
      <li>To arrange and carry out the work you ask for</li>
      <li>To keep records of enquiries and jobs</li>
    </ul>
    <p>We do not sell your personal information, and we do not use it for marketing unrelated to your enquiry.</p>
    <h2>How your enquiry is processed</h2>
    <p>Enquiry forms are delivered to us by a third-party form provider, and a copy of each enquiry is recorded in a lead log run for us by our website provider. Both process the details you submit on our behalf so the enquiry reaches the right business and is not lost. These providers may store data on servers overseas. We only share what is needed to handle your enquiry.</p>
    <h2>Storage and security</h2>
    <p>We take reasonable steps to protect the personal information we hold from misuse, interference, loss, and unauthorised access, modification or disclosure. Enquiry records are kept only as long as needed for the purposes above or as required by law.</p>
    <h2>Other websites</h2>
    <p>This website links to each business's own website and to social media platforms. Those websites have their own privacy policies.</p>
    <h2>Access, correction and complaints</h2>
    <p>You can ask to see or correct the personal information we hold about you by contacting the business you dealt with, or by emailing <a href="mailto:${site.email}">${site.email}</a>. If you believe we have breached your privacy, please contact us first so we can fix it. You can also complain to the Office of the Australian Information Commissioner at <a href="https://www.oaic.gov.au" rel="noopener">oaic.gov.au</a>.</p>
    <h2>Contact</h2>
    <ul>
      ${teamList}
    </ul>
    <p>We may update this policy from time to time. The latest version will always be on this page.</p>`,
  });
}

function termsPage() {
  return legalPage({
    path: '/terms',
    title: 'Terms | North Shore Projects',
    h1: 'Terms',
    description: 'Terms for using the North Shore Projects website and asking its four teams for a quote.',
    html: `    <p class="legal-date">Last updated: 9 October 2026</p>
    <p>These terms apply to your use of the North Shore Projects website. North Shore Projects is the shared website of North Shore Tiling, North Shore Painting, North Shore Cleaning and North Shore Removals ("we", "us", "our").</p>
    <h2>Who you deal with</h2>
    <p>Each service is provided by the team named on its page, under the terms on that team's quote. When you accept a quote, your agreement is with the business that gave it to you.</p>
    <h2>Quotes and enquiries</h2>
    <ul>
      <li>Quotes are free and you are under no obligation to accept them.</li>
      <li>A quote is based on the information you give us and may change after a site visit if the scope, site conditions or materials are different from what was described.</li>
      <li>Scheduling, pricing, payment terms and any changes are agreed with you in writing by the business doing the work.</li>
    </ul>
    <h2>Consumer guarantees</h2>
    <p>Our services come with guarantees that cannot be excluded under the Australian Consumer Law. Nothing in these terms limits your rights under that law.</p>
    <h2>Website content</h2>
    <p>This website gives general information. It is not a quote or advice about your project. Photos and text on this website belong to us and may not be reused without permission. Links to other websites are provided for convenience and we are not responsible for their content.</p>
    <h2>Liability</h2>
    <p>To the extent permitted by law, and except for liability that cannot be excluded (including under the Australian Consumer Law), we are not liable for indirect or consequential loss arising from use of this website.</p>
    <h2>Privacy</h2>
    <p>Details you send through this website are handled under our <a href="/privacy">privacy policy</a>.</p>
    <h2>Governing law</h2>
    <p>These terms are governed by the laws of New South Wales, Australia.</p>
    <h2>Contact</h2>
    <ul>
      ${teamList}
    </ul>`,
  });
}

function notFound() {
  const body = `<section class="page-head page-head--plain page-head--tall" aria-labelledby="page-h">
  <div class="wrap">
    <h1 class="h1" id="page-h">That page is not here.</h1>
    <p class="lead">The link may be old. These will get you where you were going.</p>
    <ul class="nf-links">
${services.map((s) => `      <li><a class="link" href="/${s.id}">${esc(s.fullName)}</a></li>`).join('\n')}
      <li><a class="link" href="/projects">Projects</a></li>
      <li><a class="link" href="/contact">Get a quote</a></li>
    </ul>
  </div>
</section>`;
  return page({ path: '/404', title: 'Page not found | North Shore Projects', description: 'This page could not be found.', body, index: false });
}

/* ───────── write ───────── */

const out = {
  'index.html': home(),
  'projects.html': projectsPage(),
  'contact.html': contactPage(),
  'privacy.html': privacyPage(),
  'terms.html': termsPage(),
  '404.html': notFound(),
};
for (const s of services) out[`${s.id}.html`] = servicePage(s);

for (const [file, html] of Object.entries(out)) writeFileSync(join(root, file), html);

const indexable = ['/', ...services.map((s) => '/' + s.id), '/projects', '/contact', '/privacy', '/terms'];
if (LIVE) {
  writeFileSync(join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
  writeFileSync(join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map((p) => `  <url><loc>${site.url}${p === '/' ? '/' : p}</loc></url>`).join('\n')}\n</urlset>\n`);
} else {
  writeFileSync(join(root, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  writeFileSync(join(root, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n');
}

console.log(`${LIVE ? 'LIVE' : 'preview'} build: ${Object.keys(out).length} pages`);
