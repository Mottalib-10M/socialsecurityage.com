/**
 * One page = ONE data file in `src/content/pages/<id>.ts`. It carries the URL, titles, the
 * citable answer, the FAQ, the body, the sources, the mini-calculator and the related pages.
 * The core (routes, menus, footer, sitemap, schemas, internal links) reads it alone.
 * Guide for contributors: CONTRIBUTING-PAGES.md at the repository root.
 */
import type { SourceKey, Params } from './engine/params';

export type Group = 'tools' | 'claiming' | 'formula' | 'family' | 'taxwork' | 'birthyear' | 'salary';
export type ToolKind = 'record' | 'claiming' | 'fra' | 'spouse' | 'survivor' | 'tax' | 'earnings';
export interface FAQ { q: string; a: string }

/** Writing helpers passed to `body(h)`. */
export interface Helpers {
  /** Internal link by page id (unknown id = failed test). */
  a: (id: string, text: string) => string;
  /** Dollars, no cents by default: "$1,826". */
  usd: (n: number, decimals?: number) => string;
  num: (n: number, decimals?: number) => string;
  /** Percent from a fraction: 0.285 -> "28.5 %" (narrow no-break space added by the formatter). */
  pct: (x: number, decimals?: number) => string;
  /** ISO date in words: "October 5, 2026". */
  date: (iso: string) => string;
  /** Newspaper-style table. Numbers are formatted; strings are inserted as HTML. */
  table: (headers: string[], rows: Array<Array<string | number>>, caption?: string, align?: Array<'l' | 'r'>) => string;
  /** Link to an official source of params-2026.json. */
  src: (key: SourceKey, text?: string) => string;
  /** 2026 parameters: every legal value is read here, never typed in the text. */
  P: Params;
}

export interface PageText {
  /** URL segment without slashes. No year. Avoid service words (contact, legal, terms, method, cookie, conditions, sources, updates). */
  slug: string;
  nav: string;
  card: string;
  /** 50-60 characters, key term first, year included (RECETTE §11). */
  title: string;
  /** 150-160 characters, year included, one sourced fact. */
  description: string;
  h1: string;
  intro: string;
  /** Citable block: ONE paragraph of 120+ words with the figures (RECETTE §21). */
  resume: string;
  /** 4-8 real questions, answers of 40-90 words, unique on the whole site (RECETTE §7). */
  faqs: FAQ[];
  /** HTML body: h2, h3, p, ul, ol, h.table(...). `<!--mini:kind-->` inserts another mini-calculator. */
  body: (h: Helpers) => string;
}

export interface PageDef {
  id: string;
  group: Group;
  order: number;
  /** Mini-calculator after the citable block (`src/lib/minis/<kind>.ts`). Ignored when `tool` is set. */
  mini?: string;
  /** Page the mini-calculator button points to (default: home calculator). */
  miniHref?: string;
  tool?: ToolKind;
  related: string[];
  sources: SourceKey[];
  en: PageText;
}
export const definePage = (p: PageDef): PageDef => p;
