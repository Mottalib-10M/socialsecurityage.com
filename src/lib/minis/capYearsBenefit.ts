import { computePia, benefitAtAge, fraRetirement } from '../engine/ss';
import { taxableMax } from '../engine/params';
import { usd, mid, claimAgeOptions } from './_kit';
/** Maximum-benefit guide: how many years at the taxable maximum, and the check that follows (born 1964). */
export default () => ({
  title: 'Years at the taxable maximum and your check',
  cta: 'Use your real earnings record',
  inputs: [
    { id: 'n', label: 'Years earning at or above the taxable maximum (1 to 40)', def: 35, max: 40 },
    { id: 'c', label: 'Age you start benefits', def: 840, options: claimAgeOptions(62, 70) },
  ],
  run: ({ n, c }: Record<string, number>) => {
    const b = mid(1964), k = Math.max(1, Math.min(40, Math.round(n)));
    const rec: Record<number, number> = {};
    for (let y = 2025 - k + 1; y <= 2025; y++) rec[y] = taxableMax(y);
    const r = computePia(b, rec), f = fraRetirement(1964);
    const k2 = Math.min(840, Math.max(744, c || 840));
    const out = benefitAtAge(r.pia, k2 === 744 ? 745 : k2, f.total);
    return { head: ['Monthly benefit', usd(out.benefit)] as [string, string],
      rows: [['AIME', usd(r.aime)], ['PIA', usd(r.pia, 2)], ['Zero years in the best 35', String(r.zeroYears)]] as [string, string][],
      note: 'Worker born in 1964, maximum earnings in the most recent years up to 2025, nothing else.' };
  },
});
