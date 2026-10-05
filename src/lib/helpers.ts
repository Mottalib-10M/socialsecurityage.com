/** Builds the writing helpers (`Helpers`) passed to each page body. */
import { route, ROUTES } from '../i18n/routes';
import { P, type SourceKey } from './engine/params';
import type { Helpers } from './page-types';
import { formatMoney, formatNumber, formatPercent, displayDate } from './format';
const esc = (s: string | number) => String(s).replace(/&(?!(?:[a-z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;');
export function helpers(): Helpers {
  return {
    P,
    a: (id, text) => (ROUTES.some((r) => r.id === id) ? `<a href="${route(id, 'en')}">${text}</a>` : text),
    usd: (n, d = 0) => formatMoney(n, d),
    num: (n, d = 0) => formatNumber(n, d),
    pct: (x, d = 1) => formatPercent(x, d),
    date: (iso) => displayDate(iso, 'en-US'),
    src: (key: SourceKey, text?: string) => { const s = P.sources[key]; return `<a href="${s.url}" target="_blank" rel="nofollow noopener noreferrer">${text ?? s.label.en}</a>`; },
    table: (headers, rows, caption, align = []) => {
      const al = (i: number) => (align[i] === 'r' ? 'text-right' : 'text-left');
      return `<div class="not-prose my-6 overflow-x-auto"><table class="w-full text-sm">${caption ? `<caption class="mb-2 text-left text-sm text-navy-600">${caption}</caption>` : ''}<thead><tr>${headers.map((h, i) => `<th scope="col" class="border-b border-navy-300 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-navy-700 ${al(i)}">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td class="tabular-nums border-b border-navy-100 px-3 py-2 text-navy-800 ${al(i)}">${typeof c === 'number' ? esc(formatNumber(c, 0)) : c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    },
  };
}
