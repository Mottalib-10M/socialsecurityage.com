import { creditsFor } from '../engine/ss';
import { P } from '../engine/params';
import { usd } from './_kit';
/** Credits earned in 2026 from a year's covered earnings. */
export default () => ({
  title: 'Credits your 2026 earnings buy',
  cta: 'Check what your record pays',
  inputs: [
    { id: 'e', label: 'Covered earnings in 2026 (wages plus net self-employment)', def: 5000, unit: '$', max: 1000000 },
    { id: 'h', label: 'Credits already on your record', def: 20, max: 200 },
  ],
  run: ({ e, h }: Record<string, number>) => {
    const c = creditsFor(e);
    const missing = Math.max(0, P.credits.needed_retirement - h - c);
    return { head: ['Credits earned in 2026', `${c} of ${P.credits.max_per_year}`] as [string, string],
      rows: [['Earnings for the next credit', c >= P.credits.max_per_year ? 'none, year is full' : usd((c + 1) * P.credits.qc_amount - e)], ['Total after 2026', String(h + c)], ['Still needed for retirement (40)', String(missing)]] as [string, string][] };
  },
});
