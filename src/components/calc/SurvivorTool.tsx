/** Widow(er) benefit: base, age reduction from 60 to the survivor FRA, and the 82.5% floor/limit when the deceased claimed early. */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { ResultCard, Rows, ShareBar, usd, pct, ageText } from './kit';
import { survivorBenefit, fraRetirement, fraSurvivor } from '../../lib/engine/ss';
import { encodeState, readParams, num, updateURL } from '../../lib/url-state';

const DEF = { pia: 2600, dy: 1958, dc: 62 * 12 + 1, sy: 1962, sc: 60 * 12 };
const years = Array.from({ length: 2006 - 1935 + 1 }, (_, i) => 1935 + i);
export default function SurvivorTool() {
  const [pia, setPia] = useState(DEF.pia); const [dy, setDy] = useState(DEF.dy); const [dc, setDc] = useState(DEF.dc); const [sy, setSy] = useState(DEF.sy); const [sc, setSc] = useState(DEF.sc);
  useEffect(() => { const u = readParams(window.location.search); setPia(num(u, 'p', DEF.pia)); setDy(num(u, 'dy', DEF.dy)); setDc(num(u, 'dc', DEF.dc)); setSy(num(u, 'sy', DEF.sy)); setSc(num(u, 'sc', DEF.sc)); }, []);
  const state = { p: pia, dy, dc, sy, sc };
  useEffect(() => { updateURL(state); }, [pia, dy, dc, sy, sc]);
  const r = useMemo(() => {
    const dF = fraRetirement(dy).total, sF = fraSurvivor(sy).total;
    const claim = sc < 0 ? sF : sc;
    const run = (a: number) => survivorBenefit({ deceasedPia: pia, deceasedClaimMonths: dc < 0 ? null : dc, deceasedFraMonths: dF, survivorClaimMonths: a, survivorFraMonths: sF });
    const ages = [60 * 12, 61 * 12, 62 * 12, 63 * 12, 64 * 12, 65 * 12, 66 * 12, sF].filter((v, i, a) => a.indexOf(v) === i && v <= sF).sort((a, b) => a - b);
    return { sF, claim, now: run(claim), rows: ages.map((a) => ({ a, s: run(a) })) };
  }, [pia, dy, dc, sy, sc]);
  return (
    <div className="rechner rounded-2xl border border-navy-200 bg-white p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="grid grid-cols-2 gap-x-4 gap-y-2" onSubmit={(e) => e.preventDefault()}>
          <NumberField id="sv-pia" className="col-span-full" label="PIA of the spouse who died" value={pia} onChange={setPia} unit="$/mo" max={10_000} />
          <SelectField id="sv-dy" label="Their year of birth" value={String(dy)} onChange={(v) => setDy(Number(v))} options={years.map((x) => ({ value: String(x), label: String(x) }))} />
          <SelectField id="sv-dc" label="They had started benefits at" value={String(dc)} onChange={(v) => setDc(Number(v))} options={[{ value: '-1', label: 'Not started' }, { value: String(62 * 12 + 1), label: '62 (and 1 month)' }, ...[63, 64, 65, 66, 67, 68, 69, 70].map((a) => ({ value: String(a * 12), label: String(a) }))]} />
          <SelectField id="sv-sy" label="Your year of birth" value={String(sy)} onChange={(v) => setSy(Number(v))} options={years.map((x) => ({ value: String(x), label: String(x) }))} />
          <SelectField id="sv-sc" label="You start survivor benefits at" value={String(sc)} onChange={(v) => setSc(Number(v))} options={[...[60, 61, 62, 63, 64, 65, 66].map((a) => ({ value: String(a * 12), label: String(a) })), { value: '-1', label: 'Survivor full retirement age' }]} />
        </form>
        <ResultCard label={`Survivor benefit starting at ${ageText(r.claim)}`} value={usd(r.now.benefit)} sub={`${pct(r.now.benefit / Math.max(pia, 1))} of the deceased's PIA`}>
          <Rows rows={[['Starting point (benefit or PIA)', usd(r.now.base, 2)], [`Age reduction (${r.now.monthsEarly} months before ${ageText(r.sF)})`, pct(r.now.reductionPct, 2)], ['After age reduction', usd(r.now.reduced, 2)], ['Widow(er) limit (RIB-LIM)', r.now.limit === null ? 'does not apply' : `${usd(r.now.limit, 2)}${r.now.limited ? ', applied' : ', not reached'}`]]} />
        </ResultCard>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm"><caption className="mb-2 text-left text-sm text-navy-700">Survivor benefit by the age you start it</caption>
          <thead><tr className="border-b border-navy-300 text-left text-xs uppercase tracking-wide text-navy-700"><th scope="col" className="py-2 pr-3">Start at</th><th scope="col" className="py-2 pr-3 text-right">Monthly</th><th scope="col" className="py-2 text-right">Share of PIA</th></tr></thead>
          <tbody className="tabular-nums">{r.rows.map((x) => <tr key={x.a} className="border-b border-navy-100"><td className="py-1.5 pr-3">{ageText(x.a)}{x.a === r.sF ? ' (survivor FRA)' : ''}</td><td className="py-1.5 pr-3 text-right">{usd(x.s.benefit)}</td><td className="py-1.5 text-right">{pct(x.s.benefit / Math.max(pia, 1))}</td></tr>)}</tbody>
        </table>
      </div>
      <ShareBar query={encodeState(state)} />
    </div>
  );
}
