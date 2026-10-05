# Adding a page to the US Social Security site

Read in full before writing, with `~/Documents/GitHub/RECETTE-SITE.md` (§0, §6, §7, §9.3, §11, §17.4, §21, §26).
English (American) only. Publisher: Radif Partners, never a person's name.

## Principle

One page = **one file** `src/content/pages/<id>.ts`. It carries the URL, titles, description, H1, lead,
citable block, FAQ, body, sources, mini-calculator and related pages. The core reads it alone: routes
(`src/i18n/routes.ts`), menus and footer (`src/i18n/nav.ts`), sitemap, JSON-LD (`Article`, `WebPage`,
`FAQPage`, `BreadcrumbList`, `WebApplication` for tools), related cards. **Do not edit core files to add a page.**

A mini-calculator that does not exist yet = a second file `src/lib/minis/<kind>.ts` (loaded automatically).
It calls the engine (`src/lib/engine/ss.ts`), never a formula of its own.

Models to copy (structure only, never sentences):
- guide: `bend-points.ts`
- tool page: `benefits-calculator.ts` (`tool:` instead of `mini:`; the React tools live in `src/components/calc/`)
- birth-year page: `born-1964.ts`
- salary page: `salary-50000.ts`

## Steps

1. Check demand: `~/Documents/GitHub/reports/volumes-2026-10-05/topic-us-social-security.txt` and the page list below.
2. Read the official sources only (Federal Register, SSA actuaries' tables, eCFR title 20 part 404, POMS, IRS, CMS, govinfo).
   ssa.gov answers 403 to robots: read its Wayback copy (`https://web.archive.org/web/2026/https://www.ssa.gov/...`).
3. Any new value goes into `src/data/params-2026.json` (value + a `sources` entry with `url`, `label.en`, `read`) and its
   type into `src/lib/engine/params.ts`. Never type a regulated number in the text: compute it from `P`, `bendPoints()`,
   `awi()` or the engine.
4. Write the file. Validate it alone: `PAGE_FILES=<id> npx vitest run tests/pages.test.ts`.
5. Run every control (below), then a local commit in French, last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Fields

| Field | Rule |
|---|---|
| `id` | = file name. Used by `h.a('<id>', 'text')` links and `related`. |
| `group` | `tools`, `claiming`, `formula`, `family`, `taxwork`, `birthyear`, `salary`. Header dropdowns: the first five. |
| `order` | Position in the group (small = first). |
| `mini` | A file of `src/lib/minis/`. Placed after the citable block, before the body (§9.3). `<!--mini:kind-->` in the body adds another. |
| `miniHref` | Optional page id for the mini's button (default: home calculator). |
| `tool` | Tool pages only: `record`, `claiming`, `fra`, `spouse`, `survivor`, `tax`, `earnings`. |
| `related` | 3 to 6 existing ids. |
| `sources` | 2+ keys of `params-2026.json > sources`, shown at the end of the page. |
| `en.slug` | lowercase-hyphens, no year; avoid service words (contact, legal, terms, method, cookie, conditions, sources, updates, about, privacy, editorial). A 3+ digit number makes `check-seo` treat it as a per-amount page (500 words + a table). |
| `en.title` | 50–60 characters, key term first, "2026" inside; never the country, a tool word (Calculator…), a question word or a section word first. No em dash. |
| `en.description` | 150–160 characters, "2026" inside, one sourced fact. Count with the test. |
| `en.h1` | No year needed. |
| `en.intro` | One sentence. |
| `en.resume` | ONE paragraph, 120+ words, the answer with its figures (§21). Avoid "U.S." and "e.g." in the first sentence: the folded lead cuts after the first ". " followed by a capital. |
| `en.faqs` | 4–8 real questions, answers 40–90 words with the figure, the condition and the source. A question exists once on the whole site (test). |
| `en.body` | `(h) => \`...\`` returning HTML: `h2`, `h3`, `p`, `ul`, `ol`, `h.table(...)`. Guides: 1,200+ words with resume and FAQ; tools, birth-year and salary pages: 500+ and a table. |

### Helpers `h`
`h.a(id, text)` internal link (unknown id = failed test) · `h.usd(n, decimals)` · `h.num` · `h.pct(fraction)` · `h.date(iso)` ·
`h.table(headers, rows, caption, align)` · `h.src(key, text)` link to an official source · `h.P` the parameters.

## Truth rules (non-negotiable)
- Every rule cites its text (CFR section, POMS, IRS publication, Federal Register). An uncertain point is not published.
- Results are estimates; the SSA decides from the earnings record. No advice, no advisors, no annuities, no affiliate links.
- WEP and GPO are repealed (Public Law 118-273): never describe them as current rules.
- Facts already verified on 2026-10-05: see params-2026.json (`_readme`, `sources`) and the method page.

## Tone
Human voice, varied sentences, figure first. Forbidden: em dash, "it's important to note", "dive into", "whether you're…
or…", "Additionally/Moreover" in a row, rhythmic triplets, summary conclusions, emojis. American spelling, dollars without
cents except legal amounts with cents (PIA to the dime, $202.90). Unique vocabulary per page: `check-unique` compares all
pages with numbers neutralized (30% max).

## Controls (all at 0)
```bash
cd ~/Documents/GitHub/a-publier/Mottalib-10M/us-social-security
export NODE_PATH=$(npm root -g):$PWD/node_modules
S=~/Documents/GitHub/_trame/_template/scripts
npm run build && npx vitest run
python3 $S/check-seo.py . && python3 $S/check-trame.py . && python3 $S/check-simulateurs.py . && python3 $S/check-unique.py dist
python3 $S/check-regles.py . && python3 $S/check-portefeuille.py . && python3 $S/check-anglais.py . && python3 $S/check-hreflang.py .
node $S/check-sources.mjs . && node scripts/check-legal.mjs && node scripts/typo-nbsp.mjs dist --check
node $S/check-contraste.mjs dist && node $S/check-saisie.mjs dist --max=60 && node $S/check-nombres.mjs dist
python3 scripts/check-liens.py .
node $S/check-layout.mjs dist > /tmp/layout-ss.log 2>&1 &   # long: background
```
`check-sources.mjs` reports ssa.gov and congress.gov as "blocked to robots" (403): read them via Wayback before concluding.
Stop a server by its port (`lsof -ti tcp:4365 | xargs kill`), never `pkill -f` with a short pattern.

## Not done here
No GitHub repository, no push, no DNS. No link to any other site of the portfolio (`_trame/domaines-ovh.txt`).
Ads stay off (`ADS_ENABLED = false`; at most 3 slots per page if ever enabled).
