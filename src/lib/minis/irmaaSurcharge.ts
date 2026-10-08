import { irmaa } from '../engine/accounts';
import { P } from '../engine/params';
import { usd } from './_kit';
/** 2026 IRMAA from the 2024 MAGI and the filing status: Part B and Part D surcharges, per person and per household. */
export default () => ({
  title: 'Your 2026 IRMAA surcharge',
  cta: 'Medicare premiums in more detail',
  inputs: [
    { id: 's', label: 'Filing status on the 2024 return', def: 0, options: [{ value: '0', label: 'Single, head of household, widow(er)' }, { value: '1', label: 'Married filing jointly' }, { value: '2', label: 'Married filing separately, lived together' }] },
    { id: 'm', label: '2024 MAGI (AGI plus tax-exempt interest)', def: 150000, unit: '$', max: 5000000 },
    { id: 'n', label: 'People on Medicare in the household', def: 1, options: [{ value: '1', label: 'One' }, { value: '2', label: 'Two' }] },
  ],
  run: ({ s, m, n }: Record<string, number>) => {
    const st = (s === 1 ? 1 : s === 2 ? 2 : 0) as 0 | 1 | 2;
    const people = st === 1 ? n : 1;
    const r = irmaa(m, st, people);
    return {
      head: ['Extra cost for the household in 2026', usd(r.yearly)] as [string, string],
      rows: [
        ['Part B per person each month', `${usd(r.totalB, 2)} (+${usd(r.partB, 2)})`],
        ['Part D surcharge per person each month', usd(r.partD, 2)],
        ['IRMAA tier', r.tier === 0 ? 'None' : `${r.tier} of 5`],
        ['MAGI room before the next tier', r.roomBelowNext === null ? 'Top tier' : usd(r.roomBelowNext)],
      ] as [string, string][],
      note: `Standard Part B premium ${usd(P.medicare.part_b_2026, 2)}. A separate return counts one person only.`,
    };
  },
});
