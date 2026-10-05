import { computePia, projectCareer } from '../engine/ss';
import { usd, mid } from './_kit';
/** What one more year of work is worth when the record has fewer than 35 years. */
export default () => ({
  title: 'What one more working year adds',
  cta: 'Try your own record year by year',
  inputs: [
    { id: 's', label: 'Yearly pay in today\'s dollars', def: 50000, unit: '$', max: 1000000 },
    { id: 'n', label: 'Years worked so far', def: 25, max: 45 },
  ],
  run: ({ s, n }: Record<string, number>) => {
    const b = mid(1964), k = Math.max(0, Math.min(45, Math.round(n)));
    const now = computePia(b, projectCareer(b, s, 62 - k, 62)), more = computePia(b, projectCareer(b, s, 61 - k, 62));
    return { head: ['PIA gain from one more year', `${usd(more.pia - now.pia, 2)} a month`] as [string, string],
      rows: [['PIA now', usd(now.pia, 2)], ['Zero years in the average', String(now.zeroYears)], ['PIA with one more year', usd(more.pia, 2)]] as [string, string][],
      note: 'Born 1964, years ending at 62, same pay each year relative to the average wage.' };
  },
});
