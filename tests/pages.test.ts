/**
 * Every page file is checked before the build: snippet lengths (RECETTE §11), citable block (§21),
 * FAQ size and uniqueness (§7), internal links, sources and mini-calculators.
 * One file only: PAGE_FILES=<id> npx vitest run tests/pages.test.ts
 */
import { describe, it, expect } from 'vitest';
import { PAGES } from '../src/lib/pages';
import { HOME } from '../src/content/home';
import { ROUTES } from '../src/i18n/routes';
import { MINIS } from '../src/lib/mini-specs';
import { P } from '../src/lib/engine/params';
import { helpers } from '../src/lib/helpers';
import type { Helpers } from '../src/lib/page-types';

const only = process.env.PAGE_FILES?.split(',').map((s) => s.trim());
const pages = only ? PAGES.filter((p) => only.includes(p.id)) : PAGES;
const words = (s: string) => s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const strict = (): Helpers => { const h = helpers(); return { ...h, a: (id, text) => { if (!ROUTES.some((r) => r.id === id)) throw new Error(`unknown link target "${id}"`); return h.a(id, text); } }; };
const SERVICE = /(contact|legal|terms|method|cookie|conditions|sources|updates|about|privacy|editorial|widget|embed)/;

describe('home', () => {
  it('title and description lengths', () => { expect(HOME.title.length).toBeGreaterThanOrEqual(50); expect(HOME.title.length).toBeLessThanOrEqual(60); expect(HOME.description.length).toBeGreaterThanOrEqual(150); expect(HOME.description.length).toBeLessThanOrEqual(160); });
  it('citable block of 120+ words', () => expect(words(HOME.resume)).toBeGreaterThanOrEqual(120));
  it('6 to 8 FAQ of 40-90 words', () => { expect(HOME.faqs.length).toBeGreaterThanOrEqual(6); for (const f of HOME.faqs) { expect(words(f.a), f.q).toBeGreaterThanOrEqual(40); expect(words(f.a), f.q).toBeLessThanOrEqual(90); } });
  it('body renders with valid links', () => expect(() => HOME.body(strict())).not.toThrow());
});

describe.each(pages.map((p) => [p.id, p] as const))('%s', (_id, p) => {
  const x = p.en;
  it('title 50-60 characters, no em dash, year included', () => { expect(x.title.length, x.title).toBeGreaterThanOrEqual(50); expect(x.title.length, x.title).toBeLessThanOrEqual(60); expect(x.title).not.toMatch(/—/); expect(x.title).toMatch(/2026/); });
  it('title does not open with a tool word, a question or the country', () => expect(x.title).not.toMatch(/^(Calculator|Calculate|How|What|When|Why|Is|Are|Can|Do|Does|US |U\.S\.|United States|American|FAQ)\b/));
  it('description 150-160 characters with the year', () => { expect(x.description.length, x.description).toBeGreaterThanOrEqual(150); expect(x.description.length, x.description).toBeLessThanOrEqual(160); expect(x.description).toMatch(/2026/); });
  it('slug: lowercase, no year, no service word', () => { expect(x.slug).toMatch(/^[a-z0-9-]+$/); expect(x.slug).not.toMatch(/20[2-3]\d/); expect(x.slug).not.toMatch(SERVICE); });
  it('citable block: one paragraph of 120+ words', () => { expect(words(x.resume)).toBeGreaterThanOrEqual(120); expect(x.resume).not.toMatch(/\n\s*\n/); });
  it('4 to 8 questions, answers of 40 to 90 words', () => { expect(x.faqs.length).toBeGreaterThanOrEqual(4); expect(x.faqs.length).toBeLessThanOrEqual(8); for (const f of x.faqs) { expect(words(f.a), f.q).toBeGreaterThanOrEqual(40); expect(words(f.a), f.q).toBeLessThanOrEqual(90); } });
  it('no em dash anywhere in the text', () => { const all = [x.h1, x.intro, x.resume, x.card, ...x.faqs.flatMap((f) => [f.q, f.a]), x.body(helpers())].join(' '); expect(all).not.toMatch(/—|&mdash;/); });
  it('body renders, internal links exist', () => expect(() => x.body(strict())).not.toThrow());
  it('a mini-calculator or a tool', () => { if (p.tool) return; expect(p.mini, 'mini missing').toBeTruthy(); expect(MINIS[p.mini!], `src/lib/minis/${p.mini}.ts`).toBeTruthy(); for (const m of x.body(helpers()).matchAll(/<!--mini:([A-Za-z0-9_]+)-->/g)) expect(MINIS[m[1]], m[1]).toBeTruthy(); });
  it('mini-calculator runs on its defaults', () => { if (!p.mini) return; const s = MINIS[p.mini](); const out = s.run(Object.fromEntries(s.inputs.map((i) => [i.id, i.def]))); expect(out.head[1]).toBeTruthy(); });
  it('2 or more official sources that exist', () => { expect(p.sources.length).toBeGreaterThanOrEqual(2); for (const k of p.sources) expect(P.sources[k], k).toBeTruthy(); });
  it('3 to 6 related pages that exist', () => { expect(p.related.length).toBeGreaterThanOrEqual(3); expect(p.related.length).toBeLessThanOrEqual(6); for (const id of p.related) expect(ROUTES.some((r) => r.id === id), id).toBe(true); });
  it('long enough: guides 1,200+ words, tools and per-amount pages 500+', () => {
    const total = words([x.resume, ...x.faqs.flatMap((f) => [f.q, f.a]), x.body(helpers())].join(' '));
    const min = p.tool || p.group === 'birthyear' || p.group === 'salary' || /-\d{1,2}-years?/.test(x.slug) ? 500 : 1200;
    expect(total).toBeGreaterThanOrEqual(min);
  });
});

describe('site-wide uniqueness', () => {
  if (only) return;
  it('every FAQ question appears once on the site', () => {
    const qs = [...HOME.faqs.map((f) => f.q), ...PAGES.flatMap((p) => p.en.faqs.map((f) => f.q))].map((q) => q.toLowerCase().trim());
    const dup = qs.filter((q, i) => qs.indexOf(q) !== i);
    expect(dup).toEqual([]);
  });
  it('titles, descriptions and slugs are unique', () => {
    for (const k of ['title', 'description', 'slug'] as const) { const v = PAGES.map((p) => p.en[k]); expect(v.filter((x, i) => v.indexOf(x) !== i), k).toEqual([]); }
    expect(PAGES.map((p) => p.en.title)).not.toContain(HOME.title);
  });
});
