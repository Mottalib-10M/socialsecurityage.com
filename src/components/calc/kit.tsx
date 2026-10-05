/** Shared pieces of the calculators: birth-date selects, result card, ledger of the PIA, share bar. */
import { useState } from 'react';
import SelectField from '../ui/SelectField';
import { formatMoney, formatNumber, formatPercent } from '../../lib/format';
import type { PiaResult, ClaimResult } from '../../lib/engine/ss';

export const usd = (x: number, d = 0) => formatMoney(x, d);
export const num = (x: number, d = 0) => formatNumber(x, d);
export const pct = (x: number, d = 1) => formatPercent(x, d);
export const ageText = (months: number) => { const y = Math.floor(months / 12), m = Math.round(months % 12); return m ? `${y} and ${m} month${m > 1 ? 's' : ''}` : `${y}`; };
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

export function BirthDateFields({ id, y, m, d, onChange, fromYear = 1940, toYear = 2006, label = 'Date of birth' }: { id: string; y: number; m: number; d: number; onChange: (v: { y: number; m: number; d: number }) => void; fromYear?: number; toYear?: number; label?: string }) {
  return (
    <fieldset className="col-span-full grid grid-cols-3 gap-3">
      <legend className="mb-1 text-sm font-medium text-navy-700">{label}</legend>
      <SelectField id={`${id}-m`} label="Month" value={String(m)} onChange={(v) => onChange({ y, m: Number(v), d })} options={MONTHS.map((x, i) => ({ value: String(i + 1), label: x }))} />
      <SelectField id={`${id}-d`} label="Day" value={String(d)} onChange={(v) => onChange({ y, m, d: Number(v) })} options={range(1, 31).map((x) => ({ value: String(x), label: String(x) }))} />
      <SelectField id={`${id}-y`} label="Year" value={String(y)} onChange={(v) => onChange({ y: Number(v), m, d })} options={range(fromYear, toYear).map((x) => ({ value: String(x), label: String(x) }))} />
    </fieldset>
  );
}

export function ResultCard({ label, value, sub, children }: { label: string; value: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div aria-live="polite" className="rounded-xl border border-accent-200 bg-accent-50 p-5">
      <p className="text-sm font-medium text-navy-700">{label}</p>
      <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{value}</p>
      {sub && <p className="mt-1 text-sm text-navy-700">{sub}</p>}
      {children}
    </div>
  );
}

export function Rows({ rows }: { rows: Array<[string, string]> }) {
  return (
    <table className="mt-3 w-full text-sm"><tbody className="divide-y divide-navy-200">
      {rows.map(([l, v]) => <tr key={l}><td className="py-1.5 pr-3 text-navy-700">{l}</td><td className="tabular-nums py-1.5 text-right font-medium text-navy-900">{v}</td></tr>)}
    </tbody></table>
  );
}

/** The calculation, step by step: what makes this site different from an opaque estimate. */
export function Ledger({ r, claim, claimMonths, fraMonths }: { r: PiaResult; claim: ClaimResult; claimMonths: number; fraMonths: number }) {
  const used = r.rows.filter((x) => x.used).length;
  return (
    <div className="mt-6 space-y-4 text-sm text-navy-800">
      <h3 className="font-serif text-lg font-semibold text-navy-900">How your benefit is built</h3>
      <ol className="space-y-3">
        <li><strong>1. Earnings indexed to {r.indexYear}.</strong> Each year before {r.indexYear} is multiplied by the national average wage index of {r.indexYear} divided by that year's index; {r.indexYear} and later years count at face value. Earnings above each year's taxable maximum are ignored.
          <details className="mt-2 rounded-lg border border-navy-200 bg-white">
            <summary className="cursor-pointer px-3 py-2 font-medium text-navy-900">Show the {r.rows.length} years ({used} counted)</summary>
            <div className="max-h-96 overflow-auto px-3 pb-3">
              <table className="w-full text-xs"><thead><tr className="text-left text-navy-700"><th scope="col" className="py-1 pr-2">Year</th><th scope="col" className="py-1 pr-2 text-right">Earnings</th><th scope="col" className="py-1 pr-2 text-right">Index factor</th><th scope="col" className="py-1 pr-2 text-right">Indexed</th><th scope="col" className="py-1 text-right">In top 35</th></tr></thead>
                <tbody className="tabular-nums">{r.rows.map((x) => <tr key={x.year} className={x.used ? '' : 'text-navy-500'}><td className="py-0.5 pr-2">{x.year}</td><td className="py-0.5 pr-2 text-right">{usd(x.capped)}{x.capped < x.nominal ? '*' : ''}</td><td className="py-0.5 pr-2 text-right">{x.factor.toFixed(4)}</td><td className="py-0.5 pr-2 text-right">{usd(x.indexed)}</td><td className="py-0.5 text-right">{x.used ? 'yes' : 'no'}</td></tr>)}</tbody></table>
              {r.rows.some((x) => x.capped < x.nominal) && <p className="mt-2 text-xs text-navy-600">* capped at that year's contribution and benefit base.</p>}
            </div>
          </details>
        </li>
        <li><strong>2. AIME {usd(r.aime)}.</strong> The best 35 indexed years add up to {usd(r.top)}; divided by 420 months and rounded down to the dollar.{r.zeroYears > 0 && ` ${r.zeroYears} of the 35 years are zeros, which pulls the average down.`}</li>
        <li><strong>3. PIA formula of {r.eligibilityYear}{r.projected ? ' (2026 formula used for a later year)' : ''}.</strong> 90% of the first {usd(r.bend[0])} = {usd(r.parts[0], 2)}; 32% from {usd(r.bend[0])} to {usd(r.bend[1])} = {usd(r.parts[1], 2)}; 15% above {usd(r.bend[1])} = {usd(r.parts[2], 2)}. Total rounded down to the dime: <strong>{usd(r.piaAtEligibility, 2)}</strong>.</li>
        {r.colas.length > 0 && <li><strong>4. COLAs since you turned 62.</strong> {r.colas.map((c) => `${c.year}: +${c.pct}% → ${usd(c.pia, 2)}`).join('; ')}. PIA today: <strong>{usd(r.pia, 2)}</strong>.</li>}
        <li><strong>{r.colas.length > 0 ? 5 : 4}. Age at the start: {ageText(claimMonths)}.</strong> {claim.monthsEarly > 0 ? `${claim.monthsEarly} months before your full retirement age (${ageText(fraMonths)}): the PIA is cut by ${pct(1 - claim.factor, 2)}.` : claim.monthsLate > 0 ? `${claim.monthsLate} months after your full retirement age (${ageText(fraMonths)}): delayed retirement credits add ${pct(claim.factor - 1, 2)}.` : 'Exactly your full retirement age: 100% of the PIA.'} Monthly benefit, rounded down to the dollar: <strong>{usd(claim.benefit)}</strong>.</li>
      </ol>
      {r.projected && <p className="rounded-lg border-l-4 border-accent-500 bg-white px-3 py-2 text-xs text-navy-700">You turn 62 after 2026, so the wage index of {r.indexYear} and the 2026 bend points stand in for figures not yet published. The result is in today's dollars: the SSA's own Quick Calculator works the same way.</p>}
    </div>
  );
}

export function ShareBar({ query }: { query: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const url = `${window.location.origin}${window.location.pathname}${query ? '?' + query : ''}`;
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard refused */ }
  };
  return (
    <div className="mt-4 flex flex-wrap gap-3 text-sm">
      <button type="button" onClick={copy} className="rounded-lg border border-navy-300 bg-white px-3 py-2 font-medium text-navy-800 hover:bg-navy-50">{copied ? 'Link copied' : 'Copy a link to this result'}</button>
      <button type="button" onClick={() => window.print()} className="rounded-lg border border-navy-300 bg-white px-3 py-2 font-medium text-navy-800 hover:bg-navy-50">Print</button>
    </div>
  );
}
