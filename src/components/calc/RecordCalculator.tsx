/**
 * Earnings-record calculator: the visitor pastes the "Taxed Social Security earnings" column of
 * their SSA statement (one year per line), optionally adds future years at today's pay, and gets
 * the AIME, the PIA and the benefit at each age, every step shown.
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { BirthDateFields, ResultCard, Rows, Ledger, ShareBar, usd, ageText } from './kit';
import { computePia, benefitAtAge, fraOf, effectiveBirth } from '../../lib/engine/ss';
import { encodeState, readParams, num, str, updateURL } from '../../lib/url-state';

const SAMPLE = '1990 18,500\n1991 21,000\n1992 23,400\n1993 25,100\n1994 26,800\n1995 28,000\n1996 30,250\n1997 31,900\n1998 33,000\n1999 35,500\n2000 37,800\n2001 39,000\n2002 40,100\n2003 41,700\n2004 43,000\n2005 45,500\n2006 47,000\n2007 49,800\n2008 51,000\n2009 50,200\n2010 52,600\n2011 54,000\n2012 55,900\n2013 57,000\n2014 59,300\n2015 61,000\n2016 62,500\n2017 64,800\n2018 66,000\n2019 68,900\n2020 70,100\n2021 74,500\n2022 78,000\n2023 81,200\n2024 84,000\n2025 86,500';
const DEF = { y: 1968, m: 3, d: 20, fut: 86500, until: 65, claim: -1 };

/** Reads "1998 23,400", "1998: $23,400" or "1998;23400" lines; later lines win for a repeated year. */
export function parseRecord(text: string): Record<number, number> {
  const out: Record<number, number> = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/(19[5-9]\d|20[0-9]\d)\D+?([\d][\d,.\s]*)/);
    if (!m) continue;
    const v = Number(m[2].replace(/[\s,]/g, '').replace(/\.(?=\d{3}\b)/g, ''));
    if (Number.isFinite(v)) out[Number(m[1])] = v;
  }
  return out;
}

export default function RecordCalculator({ methodHref }: { methodHref?: string }) {
  const [b, setB] = useState({ y: DEF.y, m: DEF.m, d: DEF.d });
  const [text, setText] = useState(SAMPLE);
  const [fut, setFut] = useState(DEF.fut);
  const [until, setUntil] = useState(DEF.until);
  const [claim, setClaim] = useState(DEF.claim);
  useEffect(() => {
    const u = readParams(window.location.search);
    setB({ y: num(u, 'y', DEF.y), m: num(u, 'm', DEF.m), d: num(u, 'd', DEF.d) });
    setFut(num(u, 'f', DEF.fut)); setUntil(num(u, 'u', DEF.until)); setClaim(num(u, 'c', DEF.claim));
    const r = str(u, 'r', ''); if (r) setText(r.split('|').map((x) => x.replace(':', ' ')).join('\n'));
  }, []);
  const res = useMemo(() => {
    const rec = parseRecord(text);
    const e = effectiveBirth(b);
    const lastYear = Math.max(2025, ...Object.keys(rec).map(Number));
    const all: Record<number, number> = { ...rec };
    for (let y = lastYear + 1; y < e.y + Math.min(Math.max(until || 0, 0), 75); y++) if (fut > 0) all[y] = fut;
    const pia = computePia(b, all);
    const fra = fraOf(b);
    const claimMonths = claim < 0 ? fra.total : claim;
    return { pia, fra, claimMonths, n: Object.keys(rec).length, at: benefitAtAge(pia.pia, claimMonths, fra.total), a62: benefitAtAge(pia.pia, 62 * 12 + 1, fra.total), a70: benefitAtAge(pia.pia, 840, fra.total), aFra: benefitAtAge(pia.pia, fra.total, fra.total) };
  }, [b, text, fut, until, claim]);
  const compact = Object.entries(parseRecord(text)).map(([y, v]) => `${y}:${v}`).join('|');
  const state = { y: b.y, m: b.m, d: b.d, f: fut, u: until, c: claim, r: compact };
  useEffect(() => { updateURL(state); }, [b, text, fut, until, claim]);
  return (
    <div className="rechner rounded-2xl border border-navy-200 bg-white p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="grid grid-cols-2 gap-x-4 gap-y-2" onSubmit={(e) => e.preventDefault()}>
          <BirthDateFields id="rec-b" y={b.y} m={b.m} d={b.d} onChange={setB} />
          <div className="col-span-full">
            <label htmlFor="rec-text" className="mb-1 block text-sm font-medium text-navy-700">Your earnings record, one year per line</label>
            <textarea id="rec-text" value={text} onChange={(e) => setText(e.target.value)} rows={8} spellCheck={false} className="tabular-nums w-full rounded-lg border border-navy-300 bg-white px-3 py-2 font-mono text-sm text-navy-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20" aria-describedby="rec-text-help" />
            <p id="rec-text-help" className="mt-1 text-xs text-navy-600">Paste the "Taxed Social Security earnings" column from my Social Security (Earnings Record). {res.n} years read.</p>
          </div>
          <NumberField id="rec-fut" label="Pay in each future year" value={fut} onChange={setFut} unit="$" max={5_000_000} />
          <NumberField id="rec-until" label="Working until age" value={until} onChange={setUntil} unit="yrs" max={75} />
          <SelectField id="rec-claim" className="col-span-full" label="When benefits start" value={String(claim)} onChange={(v) => setClaim(Number(v))} options={[{ value: '-1', label: 'At my full retirement age' }, ...Array.from({ length: 9 }, (_, i) => ({ value: String((62 + i) * 12 + (i === 0 ? 1 : 0)), label: i === 0 ? '62 (and 1 month)' : String(62 + i) }))]} />
        </form>
        <div>
          <ResultCard label={`Monthly benefit starting at ${ageText(res.claimMonths)}`} value={usd(res.at.benefit)} sub={`AIME ${usd(res.pia.aime)} · PIA ${usd(res.pia.pia, 2)}`}>
            <Rows rows={[['At 62 and 1 month', usd(res.a62.benefit)], [`At full retirement age (${ageText(res.fra.total)})`, usd(res.aFra.benefit)], ['At 70', usd(res.a70.benefit)], ['Years with earnings', String(res.pia.yearsWithEarnings)], ['Zero years in the best 35', String(res.pia.zeroYears)]]} />
          </ResultCard>
          <p className="mt-3 text-xs text-navy-600">Nothing you paste leaves this page: the record is read and computed in your browser.{methodHref && <> <a className="underline" href={methodHref}>Method and limits</a>.</>}</p>
          <ShareBar query={encodeState(state)} />
        </div>
      </div>
      <Ledger r={res.pia} claim={res.at} claimMonths={res.claimMonths} fraMonths={res.fra.total} />
    </div>
  );
}
