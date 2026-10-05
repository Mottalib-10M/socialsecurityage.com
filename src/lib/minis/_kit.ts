/** Shared helpers for mini-calculators (ignored by the registry: "_" prefix). */
import { formatMoney, formatPercent, formatNumber } from '../format';
export const usd = (x: number, d = 0) => formatMoney(x, d);
export const pct = (x: number, d = 1) => formatPercent(x, d);
export const num = (x: number, d = 0) => formatNumber(x, d);
/** "66 and 10 months" from a number of months. */
export const ageText = (months: number) => { const y = Math.floor(months / 12), m = months % 12; return m ? `${y} and ${m} month${m > 1 ? 's' : ''}` : `${y}`; };
/** Select options for birth years (a NumberField would print "1,960"). */
export const yearOptions = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => ({ value: String(from + i), label: String(from + i) }));
/** Select options for claiming ages 62 to 70, by whole years. */
export const claimAgeOptions = (from = 62, to = 70) => Array.from({ length: to - from + 1 }, (_, i) => ({ value: String((from + i) * 12), label: `${from + i}` }));
/** A birth date in the middle of the month (avoids the "born on the 1st" rule in quick examples). */
export const mid = (y: number) => ({ y, m: 6, d: 15 });
