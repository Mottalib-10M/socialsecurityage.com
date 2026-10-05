/**
 * Home calculator: from a birth date and today's salary to the PIA, shown step by step, and the
 * benefit at 62, at full retirement age, at 70 and at the age chosen. First render = build defaults
 * (RECETTE §17.5); the share link is read in useEffect.
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { BirthDateFields, ResultCard, Rows, Ledger, ShareBar, usd, pct, ageText } from './kit';
import { quickEstimate, breakEvenMonths } from '../../lib/engine/ss';
import { P } from '../../lib/engine/params';
import { encodeState, readParams, num, updateURL } from '../../lib/url-state';

const DEF = { y: 1966, m: 6, d: 15, sal: 65000, start: 22, stop: 65, claim: -1 };
const claimOptions = [{ value: '-1', label: 'At my full retirement age' }, ...Array.from({ length: 9 }, (_, i) => ({ value: String((62 + i) * 12 + (i === 0 ? 1 : 0)), label: i === 0 ? '62 (and 1 month)' : String(62 + i) }))];

export default function Estimator({ methodHref, compact = false }: { methodHref?: string; compact?: boolean }) {
  const [b, setB] = useState({ y: DEF.y, m: DEF.m, d: DEF.d });
  const [sal, setSal] = useState(DEF.sal);
  const [start, setStart] = useState(DEF.start);
  const [stop, setStop] = useState(DEF.stop);
  const [claim, setClaim] = useState(DEF.claim);
  useEffect(() => {
    const u = readParams(window.location.search);
    setB({ y: num(u, 'y', DEF.y), m: num(u, 'm', DEF.m), d: num(u, 'd', DEF.d) });
    setSal(num(u, 's', DEF.sal)); setStart(num(u, 'a', DEF.start)); setStop(num(u, 'z', DEF.stop)); setClaim(num(u, 'c', DEF.claim));
  }, []);
  const q = useMemo(() => {
    const st = Math.min(Math.max(14, start || 0), 70), sp = Math.min(Math.max(st + 1, stop || 0), 75);
    const fraTot = quickEstimate(b, 0, st, sp, 0).fra.total;
    return quickEstimate(b, sal, st, sp, claim < 0 ? fraTot : claim);
  }, [b, sal, start, stop, claim]);
  const state = { y: b.y, m: b.m, d: b.d, s: sal, a: start, z: stop, c: claim };
  useEffect(() => { updateURL(state); }, [b, sal, start, stop, claim]);
  const be1 = breakEvenMonths({ start: 62 * 12 + 1, benefit: q.at62.benefit }, { start: q.fra.total, benefit: q.atFra.benefit });
  const be2 = breakEvenMonths({ start: q.fra.total, benefit: q.atFra.benefit }, { start: 70 * 12, benefit: q.at70.benefit });
  const pctOfPia = q.pia.pia > 0 ? q.atClaim.benefitExact / q.pia.pia : 0;
  return (
    <div className="rechner rounded-2xl border border-navy-200 bg-white p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="grid grid-cols-2 gap-x-4 gap-y-2" onSubmit={(e) => e.preventDefault()}>
          <BirthDateFields id="est-b" y={b.y} m={b.m} d={b.d} onChange={setB} />
          <NumberField id="est-sal" className="col-span-full" label="Your yearly pay today (W-2 wages or net self-employment)" value={sal} onChange={setSal} unit="$" max={5_000_000} help={`Earnings above the 2026 taxable maximum (${usd(P.taxable_max_2026)}) do not raise the benefit.`} />
          <NumberField id="est-start" label="Age you started working" value={start} onChange={setStart} unit="yrs" max={70} />
          <NumberField id="est-stop" label="Age you stop working" value={stop} onChange={setStop} unit="yrs" max={75} />
          <SelectField id="est-claim" className="col-span-full" label="When benefits start" value={String(claim)} onChange={(v) => setClaim(Number(v))} options={claimOptions} />
        </form>
        <div>
          <ResultCard label={`Monthly benefit starting at ${ageText(q.claimMonths)}`} value={usd(q.atClaim.benefit)} sub={`${pct(pctOfPia)} of your primary insurance amount (${usd(q.pia.pia, 2)}), in today's dollars`}>
            <Rows rows={[
              [`At 62 and 1 month`, usd(q.at62.benefit)],
              [`At your full retirement age (${ageText(q.fra.total)})`, usd(q.atFra.benefit)],
              ['At 70', usd(q.at70.benefit)],
              ['Waiting from 62 to FRA pays off at', be1 ? `age ${ageText(Math.ceil(be1))}` : 'never'],
              ['Waiting from FRA to 70 pays off at', be2 ? `age ${ageText(Math.ceil(be2))}` : 'never'],
            ]} />
          </ResultCard>
          <p className="mt-3 text-xs text-navy-600">Assumes your pay kept the same rank against the national average wage throughout your career. For your real record, use the <a className="underline" href="/en/social-security-benefits-calculator/">earnings-record calculator</a>.{methodHref && <> <a className="underline" href={methodHref}>Method and limits</a>.</>}</p>
          {!compact && <ShareBar query={encodeState(state)} />}
        </div>
      </div>
      <Ledger r={q.pia} claim={q.atClaim} claimMonths={q.claimMonths} fraMonths={q.fra.total} />
    </div>
  );
}
