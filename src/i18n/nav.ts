import { route, type Locale } from './routes';
import { PAGES, pageById } from '../lib/pages';
import type { Group } from '../lib/page-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<string, string> = { home: 'Home', method: 'Method', about: 'About', widget: 'Embed the calculator', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' };
export const GROUP_LABEL: Record<Group, string> = { tools: 'Calculators', claiming: 'Claiming age', formula: 'How it is calculated', family: 'Spouses and survivors', taxwork: 'Taxes and work', retirement: 'Medicare and IRAs', birthyear: 'By birth year', salary: 'By salary' };
/** Groups shown as header dropdowns; birth-year and salary pages are reached from the home page tables and the footer. */
const HEADER: Group[] = ['tools', 'claiming', 'formula', 'family', 'taxwork', 'retirement'];
const FOOTER: Group[] = ['tools', 'claiming', 'formula', 'family', 'taxwork', 'retirement', 'birthyear', 'salary'];
export const label = (id: string, _lang?: Locale) => CORE[id] ?? pageById(id)?.en.nav ?? id;
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id, lang) });
const inGroup = (g: Group, lang: Locale) => PAGES.filter((p) => p.group === g).map((p) => link(p.id, lang));
function categoriesCompletes(lang: Locale): NavCategory[] {
  return HEADER.map((g) => ({ label: GROUP_LABEL[g], links: inGroup(g, lang) })).filter((c) => c.links.length);
}
// Intitules du menu du haut : courts, jamais sur deux lignes (les intitules complets restent en bas de page).
const COURT: Record<string, string> = {"Claiming age": "Claiming", "How it is calculated": "Formula", "Spouses and survivors": "Spouses", "Taxes and work": "Tax & work", "Medicare and IRAs": "Medicare"};
export const navCategories = (lang: Locale, court = true): NavCategory[] =>
  categoriesCompletes(lang).map((c) => (court ? { ...c, label: COURT[c.label] ?? c.label } : c));
// Methode : liee en bas de page, hors du menu du haut pour qu'il tienne sur une ligne.
export const navDirect = (_lang: Locale): NavLink[] => [];
export const footerColumns = (lang: Locale): NavCategory[] => [
  ...FOOTER.map((g) => ({ label: GROUP_LABEL[g], links: inGroup(g, lang) })).filter((c) => c.links.length),
  { label: 'This site', links: ['home', 'method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) },
];
export const popularLinks = (_lang: Locale): NavLink[] => [];
