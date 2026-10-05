/** How much of the benefits is taxable: provisional income against the $25,000/$32,000 and $34,000/$44,000 bases. */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import StackedBar from '../ui/StackedBar';
import { ResultCard, Rows, ShareBar, usd, pct } from './kit';
import { taxableBenefits, type FilingStatus } from '../../lib/engine/ss';
import { encodeState, readParams, num, str, updateURL } from '../../lib/url-state';

const DEF = { b: 28000, o: 32000, s: 'joint' as FilingStatus };
export default function TaxTool() {
  const [b, setB] = useState(DEF.b); const [o, setO] = useState(DEF.o); const [s, setS] = useState<FilingStatus>(DEF.s);
  useEffect(() => { const u = readParams(window.location.search); setB(num(u, 'b', DEF.b)); setO(num(u, 'o', DEF.o)); const x = str(u, 's', DEF.s); setS((['single', 'joint', 'separate_together'].includes(x) ? x : DEF.s) as FilingStatus); }, []);
  const state = { b, o, s };
  useEffect(() => { updateURL(state); }, [b, o, s]);
  const r = useMemo(() => taxableBenefits(b, o, s), [b, o, s]);
  return (
    <div className="rechner rounded-2xl border border-navy-200 bg-white p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="grid grid-cols-2 gap-x-4 gap-y-2" onSubmit={(e) => e.preventDefault()}>
          <SelectField id="tx-s" className="col-span-full" label="Filing status" value={s} onChange={(v) => setS(v as FilingStatus)} options={[{ value: 'single', label: 'Single, head of household, or married filing separately and lived apart all year' }, { value: 'joint', label: 'Married filing jointly' }, { value: 'separate_together', label: 'Married filing separately, lived together' }]} />
          <NumberField id="tx-b" label="Social Security received in the year (box 5 of SSA-1099)" value={b} onChange={setB} unit="$" max={1_000_000} />
          <NumberField id="tx-o" label="All other income, tax-exempt interest included" value={o} onChange={setO} unit="$" max={10_000_000} help="Pensions, IRA withdrawals, wages, interest, dividends, capital gains." />
        </form>
        <ResultCard label="Taxable part of your benefits" value={usd(r.taxable)} sub={r.taxable > 0 ? `${pct(r.share)} of ${usd(b)} goes on line 6b of Form 1040` : 'None of your benefits is taxable this year'}>
          <Rows rows={[['Provisional income (other income + half of benefits)', usd(r.provisional)], ['First base (50% zone starts)', usd(r.base1)], ['Second base (85% zone starts)', usd(r.base2)], ['Zone you are in', r.tier === 0 ? 'below the first base' : `${r.tier}% zone`]]} />
          <div className="mt-3"><StackedBar ariaPrefix="Benefits" total={Math.max(b, 1)} segments={[{ label: 'Taxable', value: r.taxable, color: '#2a294d' }, { label: 'Tax-free', value: Math.max(0, b - r.taxable), color: '#c4c3df' }]} /></div>
        </ResultCard>
      </div>
      <p className="mt-4 text-xs text-navy-600">The taxable amount is added to your other income and taxed at your own federal rate: this is not the tax itself. Worksheet 1 of IRS Publication 915, without the IRA-deduction and lump-sum special cases.</p>
      <ShareBar query={encodeState(state)} />
    </div>
  );
}
