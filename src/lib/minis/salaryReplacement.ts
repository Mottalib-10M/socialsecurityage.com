import { computePia, projectCareer, benefitAtAge } from '../engine/ss';
import { usd, pct, mid, claimAgeOptions } from './_kit';
/** Salary + start age -> share of the salary replaced by the monthly benefit. */
export default () => ({
  title: 'How much of your pay Social Security replaces',
  cta: 'Try other careers in the full calculator',
  inputs: [
    { id: 's', label: 'Yearly pay in today\'s dollars', def: 35000, unit: '$', max: 2000000 },
    { id: 'c', label: 'Age you start benefits', def: 804, options: claimAgeOptions() },
  ],
  run: ({ s, c }: Record<string, number>) => {
    const b = mid(1964); const r = computePia(b, projectCareer(b, s, 22, 62));
    const claim = Math.max(c, 745); const x = benefitAtAge(r.pia, claim, 804);
    return { head: ['Replacement rate', s > 0 ? pct(x.benefit * 12 / s) : '0%'] as [string, string],
      rows: [['Monthly benefit', usd(x.benefit)], ['Yearly benefit', usd(x.benefit * 12)], ['Monthly pay it replaces', usd(s / 12)]] as [string, string][],
      note: 'Born 1964, full retirement age 67, career from 22 to 62. Before COLAs.' };
  },
});
