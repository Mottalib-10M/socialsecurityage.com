/** Retirement earnings test 2026: what is withheld when you work before full retirement age. */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { ResultCard, Rows, ShareBar, usd, MONTHS } from './kit';
import { earningsTest, type FraYearStatus } from '../../lib/engine/ss';
import { P } from '../../lib/engine/params';
import { encodeState, readParams, num, str, updateURL } from '../../lib/url-state';

const DEF = { b: 1800, e: 40000, s: 'before' as FraYearStatus, f: 9 };
export default function EarningsTool() {
  const [b, setB] = useState(DEF.b); const [e, setE] = useState(DEF.e); const [s, setS] = useState<FraYearStatus>(DEF.s); const [f, setF] = useState(DEF.f);
  useEffect(() => { const u = readParams(window.location.search); setB(num(u, 'b', DEF.b)); setE(num(u, 'e', DEF.e)); const x = str(u, 's', DEF.s); setS((['before', 'fraYear', 'after'].includes(x) ? x : DEF.s) as FraYearStatus); setF(num(u, 'f', DEF.f)); }, []);
  const state = { b, e, s, f };
  useEffect(() => { updateURL(state); }, [b, e, s, f]);
  const r = useMemo(() => earningsTest(b, e, s, f - 1), [b, e, s, f]);
  return (
    <div className="rechner rounded-2xl border border-navy-200 bg-white p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="grid grid-cols-2 gap-x-4 gap-y-2" onSubmit={(ev) => ev.preventDefault()}>
          <NumberField id="et-b" label="Monthly benefit" value={b} onChange={setB} unit="$" max={10_000} />
          <NumberField id="et-e" label={s === 'fraYear' ? '2026 earnings before the FRA month' : 'Earnings in 2026'} value={e} onChange={setE} unit="$" max={5_000_000} help="Wages or net self-employment; pensions, interest and investment income do not count." />
          <SelectField id="et-s" label="Your situation in 2026" value={s} onChange={(v) => setS(v as FraYearStatus)} options={[{ value: 'before', label: 'Under full retirement age all year' }, { value: 'fraYear', label: 'Reaching full retirement age in 2026' }, { value: 'after', label: 'Past full retirement age' }]} />
          <SelectField id="et-f" label="Month you reach full retirement age" value={String(f)} onChange={(v) => setF(Number(v))} options={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))} />
        </form>
        <ResultCard label="Benefits withheld in 2026" value={usd(r.withheld)} sub={r.withheld > 0 ? `about ${r.monthsWithheld} monthly payment${r.monthsWithheld > 1 ? 's' : ''} held back, usually from January` : 'Your earnings stay under the limit'}>
          <Rows rows={[['Annual limit that applies', s === 'after' ? 'no limit' : usd(r.limit)], ['Earnings above the limit', usd(r.excess)], ['Withholding rate', s === 'fraYear' ? '$1 for every $3' : s === 'before' ? '$1 for every $2' : 'none'], ['Benefits you still receive', usd(r.kept)]]} />
        </ResultCard>
      </div>
      <p className="mt-4 text-xs text-navy-600">Withheld months are not lost: at full retirement age the SSA recomputes the benefit to credit them back. In the first year of retirement, a special monthly rule pays any month in which wages stay under {usd(P.earnings_test.lower_monthly)} (or {usd(P.earnings_test.higher_monthly)} in the year of full retirement age) and you perform no substantial self-employment.</p>
      <ShareBar query={encodeState(state)} />
    </div>
  );
}
