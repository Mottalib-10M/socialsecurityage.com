/** Full retirement age from a birth date: the month it is reached, the survivor FRA, and the share of the PIA at each age. */
import { useEffect, useMemo, useState } from 'react';
import { BirthDateFields, ResultCard, Rows, ShareBar, MONTHS, pct, ageText } from './kit';
import { fraOf, fraSurvivor, effectiveBirth, monthAttaining, benefitAtAge, spouseReduction } from '../../lib/engine/ss';
import { encodeState, readParams, num, updateURL } from '../../lib/url-state';

const DEF = { y: 1962, m: 9, d: 14 };
export default function FraTool() {
  const [b, setB] = useState(DEF);
  useEffect(() => { const u = readParams(window.location.search); setB({ y: num(u, 'y', DEF.y), m: num(u, 'm', DEF.m), d: num(u, 'd', DEF.d) }); }, []);
  const state = { y: b.y, m: b.m, d: b.d };
  useEffect(() => { updateURL(state); }, [b]);
  const r = useMemo(() => {
    const fra = fraOf(b), e = effectiveBirth(b), sv = fraSurvivor(e.y);
    const at = monthAttaining(b, fra.total), at62 = monthAttaining(b, 62 * 12), at70 = monthAttaining(b, 70 * 12), atS = monthAttaining(b, sv.total);
    const ages = Array.from({ length: 9 }, (_, i) => (62 + i) * 12);
    return { fra, sv, at, at62, at70, atS, e, rows: ages.map((a) => ({ a, f: benefitAtAge(1000, a, fra.total).factor, s: a <= fra.total ? 0.5 * (1 - spouseReduction(fra.total - a)) : 0.5 })) };
  }, [b]);
  const mon = (x: { y: number; m: number }) => `${MONTHS[x.m - 1]} ${x.y}`;
  return (
    <div className="rechner rounded-2xl border border-navy-200 bg-white p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="grid grid-cols-2 gap-x-4 gap-y-2" onSubmit={(e) => e.preventDefault()}><BirthDateFields id="fra-b" y={b.y} m={b.m} d={b.d} onChange={setB} /></form>
        <ResultCard label="Your full retirement age" value={ageText(r.fra.total)} sub={`Reached in ${mon(r.at)}`}>
          <Rows rows={[['Earliest retirement benefit (62 for the whole month)', mon(b.d === 2 ? r.at62 : { y: r.at62.m === 12 ? r.at62.y + 1 : r.at62.y, m: r.at62.m === 12 ? 1 : r.at62.m + 1 })], ['Delayed credits stop', mon(r.at70)], ['Full retirement age as a widow(er)', `${ageText(r.sv.total)} (${mon(r.atS)})`], ['Birth year SSA uses', String(r.e.y)]]} />
        </ResultCard>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm"><caption className="mb-2 text-left text-sm text-navy-700">Share of the PIA paid when benefits start at each birthday</caption>
          <thead><tr className="border-b border-navy-300 text-left text-xs uppercase tracking-wide text-navy-700"><th scope="col" className="py-2 pr-3">Start at</th><th scope="col" className="py-2 pr-3 text-right">Your own benefit</th><th scope="col" className="py-2 text-right">Spouse benefit (share of worker PIA)</th></tr></thead>
          <tbody className="tabular-nums">{r.rows.map((x) => <tr key={x.a} className="border-b border-navy-100"><td className="py-1.5 pr-3">{x.a / 12}</td><td className="py-1.5 pr-3 text-right">{pct(x.f)}</td><td className="py-1.5 text-right">{pct(x.s)}</td></tr>)}</tbody>
        </table>
      </div>
      <ShareBar query={encodeState(state)} />
    </div>
  );
}
