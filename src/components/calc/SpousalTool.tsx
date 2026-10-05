/** Spouse benefit with deemed filing: own benefit plus the reduced spousal top-up, at every start age. */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { ResultCard, Rows, ShareBar, usd, pct, ageText } from './kit';
import { spousalBenefit, fraRetirement } from '../../lib/engine/ss';
import { encodeState, readParams, num, updateURL } from '../../lib/url-state';

const DEF = { w: 2800, o: 900, y: 1965, c: 62 * 12 + 1, k: 0 };
const years = Array.from({ length: 2006 - 1950 + 1 }, (_, i) => 1950 + i);
export default function SpousalTool() {
  const [w, setW] = useState(DEF.w); const [o, setO] = useState(DEF.o); const [y, setY] = useState(DEF.y); const [c, setC] = useState(DEF.c); const [k, setK] = useState(DEF.k);
  useEffect(() => { const u = readParams(window.location.search); setW(num(u, 'w', DEF.w)); setO(num(u, 'o', DEF.o)); setY(num(u, 'y', DEF.y)); setC(num(u, 'c', DEF.c)); setK(num(u, 'k', DEF.k)); }, []);
  const state = { w, o, y, c, k };
  useEffect(() => { updateURL(state); }, [w, o, y, c, k]);
  const r = useMemo(() => {
    const fra = fraRetirement(y);
    const claim = c < 0 ? fra.total : c;
    const ages = [62 * 12 + 1, 63 * 12, 64 * 12, 65 * 12, 66 * 12, fra.total, 67 * 12, 70 * 12].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
    return { fra, claim, now: spousalBenefit(w, o, claim, fra.total, k === 1), rows: ages.map((a) => ({ a, s: spousalBenefit(w, o, a, fra.total, k === 1) })) };
  }, [w, o, y, c, k]);
  return (
    <div className="rechner rounded-2xl border border-navy-200 bg-white p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="grid grid-cols-2 gap-x-4 gap-y-2" onSubmit={(e) => e.preventDefault()}>
          <NumberField id="sp-w" label="Worker's PIA" value={w} onChange={setW} unit="$/mo" max={10_000} />
          <NumberField id="sp-o" label="Spouse's own PIA (0 if none)" value={o} onChange={setO} unit="$/mo" max={10_000} />
          <SelectField id="sp-y" label="Spouse's year of birth" value={String(y)} onChange={(v) => setY(Number(v))} options={years.map((x) => ({ value: String(x), label: String(x) }))} />
          <SelectField id="sp-c" label="Spouse starts at" value={String(c)} onChange={(v) => setC(Number(v))} options={[{ value: String(62 * 12 + 1), label: '62 (and 1 month)' }, ...[63, 64, 65, 66, 67, 68, 69, 70].map((a) => ({ value: String(a * 12), label: String(a) })), { value: '-1', label: 'Full retirement age' }]} />
          <Toggle id="sp-k" className="col-span-full" label="Caring for the worker's child under 16 (or disabled)?" value={String(k)} onChange={(v) => setK(Number(v))} options={[{ value: '0', label: 'No' }, { value: '1', label: 'Yes' }]} />
        </form>
        <ResultCard label={`Spouse's monthly total starting at ${ageText(r.claim)}`} value={usd(r.now.total)} sub={r.now.onlyOwn ? 'The own benefit is already above half the worker PIA: no spousal top-up.' : `${pct(r.now.total / Math.max(w, 1))} of the worker's PIA`}>
          <Rows rows={[['Half of the worker PIA', usd(r.now.fullSpousal, 2)], ['Own benefit at this age', usd(r.now.ownBenefit, 2)], ['Spousal top-up before reduction', usd(r.now.excess, 2)], [`Top-up after ${r.now.monthsEarly} months of reduction`, usd(r.now.reducedExcess, 2)]]} />
        </ResultCard>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm"><caption className="mb-2 text-left text-sm text-navy-700">Spouse's total by start age (worker already receiving benefits)</caption>
          <thead><tr className="border-b border-navy-300 text-left text-xs uppercase tracking-wide text-navy-700"><th scope="col" className="py-2 pr-3">Start at</th><th scope="col" className="py-2 pr-3 text-right">Own benefit</th><th scope="col" className="py-2 pr-3 text-right">Top-up</th><th scope="col" className="py-2 text-right">Total</th></tr></thead>
          <tbody className="tabular-nums">{r.rows.map((x) => <tr key={x.a} className="border-b border-navy-100"><td className="py-1.5 pr-3">{ageText(x.a)}{x.a === r.fra.total ? ' (FRA)' : ''}</td><td className="py-1.5 pr-3 text-right">{usd(x.s.ownBenefit)}</td><td className="py-1.5 pr-3 text-right">{usd(x.s.reducedExcess)}</td><td className="py-1.5 text-right font-medium">{usd(x.s.total)}</td></tr>)}</tbody>
        </table>
      </div>
      <ShareBar query={encodeState(state)} />
    </div>
  );
}
