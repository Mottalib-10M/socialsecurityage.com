import { quickEstimate, benefitAtAge } from '../engine/ss';
import { usd, pct, mid, claimAgeOptions } from './_kit';
/** How-much guide: one salary in today's pay and one start age give the monthly check (born 1964, career 22 to 62). */
export default () => ({
  title: 'Your check from a salary and a start age',
  cta: 'Use your real earnings record instead',
  inputs: [
    { id: 's', label: 'Typical yearly pay in today\'s dollars', def: 60000, unit: '$', max: 2000000 },
    { id: 'c', label: 'Age you start benefits', def: 804, options: claimAgeOptions(62, 70) },
  ],
  run: ({ s, c }: Record<string, number>) => {
    const k = Math.min(840, Math.max(744, c || 804)), start = k === 744 ? 745 : k;
    const q = quickEstimate(mid(1964), s, 22, 62, start);
    const r = benefitAtAge(q.pia.pia, start, q.fra.total);
    return { head: ['Monthly benefit, today\'s dollars', usd(r.benefit)] as [string, string],
      rows: [['AIME (best 35 years)', usd(q.pia.aime)], ['PIA at full retirement age 67', usd(q.pia.pia, 2)], ['Share of the PIA at that age', pct(r.factor)]] as [string, string][],
      note: 'Worker born in 1964, pay from 22 to 62 at the same rank against the national average wage; 62 means 62 and 1 month.' };
  },
});
