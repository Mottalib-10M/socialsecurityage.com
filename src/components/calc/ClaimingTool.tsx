/** Claiming-age comparison: every start age from 62 to 70, the total received by a chosen age, break-even ages. */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { ResultCard, Rows, ShareBar, usd, pct, ageText } from './kit';
import { benefitAtAge, fraRetirement, breakEvenMonths, cumulative } from '../../lib/engine/ss';
import { encodeState, readParams, num, updateURL } from '../../lib/url-state';

const DEF = { pia: 2400, y: 1964, horizon: 85 };
const years = Array.from({ length: 2006 - 1950 + 1 }, (_, i) => 1950 + i);

export default function ClaimingTool() {
  const [pia, setPia] = useState(DEF.pia);
  const [y, setY] = useState(DEF.y);
  const [horizon, setHorizon] = useState(DEF.horizon);
  useEffect(() => { const u = readParams(window.location.search); setPia(num(u, 'p', DEF.pia)); setY(num(u, 'y', DEF.y)); setHorizon(num(u, 'h', DEF.horizon)); }, []);
  const state = { p: pia, y, h: horizon };
  useEffect(() => { updateURL(state); }, [pia, y, horizon]);
  const res = useMemo(() => {
    const fra = fraRetirement(y);
    const h = Math.min(Math.max(horizon || 0, 62), 110);
    const ages = [62 * 12 + 1, ...Array.from({ length: 8 }, (_, i) => (63 + i) * 12)];
    if (!ages.includes(fra.total)) ages.push(fra.total);
    ages.sort((a, b) => a - b);
    const rows = ages.map((a) => { const r = benefitAtAge(pia, a, fra.total); return { a, r, total: cumulative(r.benefit, a, h) }; });
    const best = rows.reduce((m, x) => (x.total > m.total ? x : m), rows[0]);
    const r62 = rows[0], rF = rows.find((x) => x.a === fra.total)!, r70 = rows[rows.length - 1];
    return { fra, h, rows, best, be62F: breakEvenMonths({ start: r62.a, benefit: r62.r.benefit }, { start: rF.a, benefit: rF.r.benefit }), be62_70: breakEvenMonths({ start: r62.a, benefit: r62.r.benefit }, { start: r70.a, benefit: r70.r.benefit }), beF70: breakEvenMonths({ start: rF.a, benefit: rF.r.benefit }, { start: r70.a, benefit: r70.r.benefit }) };
  }, [pia, y, horizon]);
  return (
    <div className="rechner rounded-2xl border border-navy-200 bg-white p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="grid grid-cols-2 gap-x-4 gap-y-2" onSubmit={(e) => e.preventDefault()}>
          <NumberField id="cl-pia" className="col-span-full" label="Your PIA (benefit at full retirement age)" value={pia} onChange={setPia} unit="$/mo" max={10_000} help="On your SSA statement, or from the calculator on the home page." />
          <SelectField id="cl-y" label="Year of birth" value={String(y)} onChange={(v) => setY(Number(v))} options={years.map((x) => ({ value: String(x), label: String(x) }))} />
          <NumberField id="cl-h" label="Compare totals up to age" value={horizon} onChange={setHorizon} unit="yrs" max={110} />
        </form>
        <ResultCard label={`Most received by age ${res.h}`} value={`Start at ${ageText(res.best.a)}`} sub={`${usd(res.best.total)} in total, ${usd(res.best.r.benefit)} a month (today's dollars)`}>
          <Rows rows={[['62 vs full retirement age: equal totals at', res.be62F ? `age ${ageText(Math.ceil(res.be62F))}` : 'never'], ['62 vs 70: equal totals at', res.be62_70 ? `age ${ageText(Math.ceil(res.be62_70))}` : 'never'], [`Full retirement age (${ageText(res.fra.total)}) vs 70`, res.beF70 ? `age ${ageText(Math.ceil(res.beF70))}` : 'never']]} />
        </ResultCard>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm"><caption className="mb-2 text-left text-sm text-navy-700">Each start age, for a PIA of {usd(pia)} and a birth year of {y}</caption>
          <thead><tr className="border-b border-navy-300 text-left text-xs uppercase tracking-wide text-navy-700"><th scope="col" className="py-2 pr-3">Start at</th><th scope="col" className="py-2 pr-3 text-right">Monthly</th><th scope="col" className="py-2 pr-3 text-right">Share of PIA</th><th scope="col" className="py-2 text-right">Total by {res.h}</th></tr></thead>
          <tbody className="tabular-nums">{res.rows.map((x) => <tr key={x.a} className={`border-b border-navy-100 ${x === res.best ? 'bg-accent-50 font-semibold' : ''}`}><td className="py-1.5 pr-3">{ageText(x.a)}{x.a === res.fra.total ? ' (FRA)' : ''}</td><td className="py-1.5 pr-3 text-right">{usd(x.r.benefit)}</td><td className="py-1.5 pr-3 text-right">{pct(x.r.factor)}</td><td className="py-1.5 text-right">{usd(x.total)}</td></tr>)}</tbody>
        </table>
      </div>
      <ShareBar query={encodeState(state)} />
    </div>
  );
}
