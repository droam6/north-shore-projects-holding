# North Shore Projects — merged site

One website for four sister businesses: North Shore Tiling, North Shore Painting, North Shore Cleaning, North Shore Removals. Each keeps its own domain and site; this one sits on northshoreprojects.com.au. Static HTML, no framework. Host: Cloudflare Pages, publish directory is the repo root, no build command.

## How it is put together
- `src/data.mjs` — every word, phone number, photo list, review and link. Edit content here.
- `tools/build.mjs` — templates. `node tools/build.mjs` writes the ten `*.html` pages at the repo root. The output is committed. Never edit the `.html` files by hand.
- `tools/images.mjs` — photo sizes, video copies (sound stripped), posters, logo marks, favicons. Needs `npm install` inside `tools/` (sharp) and ffmpeg. Run: `node tools/images.mjs <path to north-shore-tiling> <path to north-shore-painting>`. Output is committed (`images/work`, `images/marks`, `videos`, `src/media.json`).
- `tools/check-links.mjs` — internal links, files and anchors.
- `css/styles.css`, `js/main.js` — hand written, no libraries. Bump `V` in `build.mjs` after changing either.
- Preview: `npx serve . -l 4200` (clean URLs on).
- PowerShell on Windows: no `&&`.

## Live since 9 Oct 2026
The site is live on northshoreprojects.com.au. Jack published it himself by fast-forwarding `main` to `merge`.
`node tools/build.mjs` = the public build (indexable, writes `sitemap.xml`). This is the default.
`node tools/build.mjs --preview` = `noindex` on every page and `robots.txt` blocks all. Never let a preview build reach `main`: it would take the live site out of search.

## Content rules (hard)
- Nothing goes on the site that the businesses have not said themselves or that has not been checked. No invented numbers, reviews, credentials or time promises.
- Google ratings, counts and review excerpts come from each business's own Google listing (matched by phone and address). Excerpts are word for word. `reviewsCheckedOn` in `data.mjs` is shown on the page; update it whenever the numbers are re-read. Five stars are only drawn for a rating Google shows as 5.0.
- Do not add any of these until Jack supplies them in writing: years in business, job counts, licence or insurance wording, guarantees, paint brands, prices, opening hours, ABN.
- Removals is charged by the hour with a time estimate (their own FAQ), so it has its own steps. Do not promise removals customers a fixed or written quote.
- Photos: real jobs only. The cleaning and removals pages borrow two photos from the Ashfield tiling job until those teams send their own. Never caption a borrowed photo as cleaning or removals work.
- Not used on purpose: painting "project 7" photos (real estate agency watermark), tiling video 3 (caption about a delay), tiling video 5 (another account's story), the removals team photo (faces).
- Copy: plain, sentence case, short (the menu, buttons and footer headings are set in capitals by CSS; write them in sentence case). No eyebrow labels above headings, no stat counters, no icon card grids, no emoji, no arrows on links.

## Logo
- The North Shore Projects logo is the white buildings symbol with the "NORTH SHORE PROJECTS" lettering, supplied by Jack on 9 Oct 2026 (`images/logos/north-shore-projects-logo.jpg`, white on black). `node tools/logo.mjs` turns the black into transparency and writes `images/brand/logo-*.png` and the favicons.
- Use it as supplied: white, symbol and lettering together, on navy only. Do not recolour it, redraw it or set the name in a site font beside it. Jack's instruction with it: do not change the site's colours or fonts to match it.
- It is in the header, footer, favicons and share image. The four gold house marks (`images/marks`) are the service teams' own logos and stay.
- The supplied file is a JPG. Ask for the vector or a transparent PNG before launch.

## Design
- Navy `#1A1A2E`, gold `#C19A6B` (from the service logos), cream `#FAFAF8` for light sections (the service sites' cream). Tokens at the top of `styles.css`.
- Type is the same family as the four service sites, so the group reads as one brand: DM Serif Display for headings, DM Sans for text (both self-hosted, OFL), and small spaced capitals for the menu, buttons and footer headings only (`--caps-size`, `--caps-track`). Text stays small and quiet: body 1rem, quotes and lists about 1.06rem. The first build used one light sans (Archivo) at large sizes; Jack found it cheaper-looking than northshoretiles. Do not go back to it.
- Square corners and a 6px gap between photos (`--grout`), like tiles.
- One entrance animation on the site: the home hero. Nothing else animates on scroll.
- Home hero: four service panels. On screens 1024px and wider the panels sit directly under the header and fill most of the first screen, with the headline, rating and buttons in a band beneath them (Jack found headline-first "blank"). The active panel is open and they advance every 6 seconds (Pause button, stops on hover and focus, off for reduced motion). Narrower screens get the headline first, then a row you swipe.
- Wide screens: the content column is 84rem, the root font size scales up a little past about 1500px (18px at 2560px), and full-width rows (header, menus, photo rows) use `--edge` so they line up with the content column.

## Enquiry form
One form, tick boxes for the four teams. `js/main.js` posts once per ticked team to that team's existing Formspree endpoint, and once per team to the n8n lead log (`service` field routes it). If one send fails the others still go, the failed team stays ticked and the message gives that team's phone number.

## What gets published
Cloudflare publishes the repo root, so anything committed is reachable by URL. `_redirects` sends `/CLAUDE.md`, `/src/*`, `/tools/*` and the config files back to the home page. Keep client notes, to-do lists and anything unflattering out of the repo.

## Open questions for the client
Licence numbers for tiling and painting · which ABN this site carries · the four Instagram handles · photos for cleaning and removals · opening hours.

## Workflow
Branch `merge` is the review branch. `main` is the live site: Cloudflare publishes every push to it. Work on `merge`, show Jack, and he publishes (PowerShell, in his clone): `git fetch origin`, `git checkout main`, `git merge --ff-only origin/merge`, `git push origin main`, `git checkout merge`. Before any push: `node tools/build.mjs`, `node tools/check-links.mjs`, `npx html-validate "*.html"`, and look at phone-width screenshots.
