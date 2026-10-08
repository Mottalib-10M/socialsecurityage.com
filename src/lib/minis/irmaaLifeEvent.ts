import { irmaa } from '../engine/accounts';
import { usd } from './_kit';
/** What Form SSA-44 can save: 2026 IRMAA on the 2024 income versus on the lower 2026 estimate after a life-changing event. */
export default () => ({
  title: 'What an SSA-44 request could save',
  cta: 'Compare with the standard Medicare deduction',
  inputs: [
    { id: 's', label: 'Filing status', def: 1, options: [{ value: '0', label: 'Single or head of household' }, { value: '1', label: 'Married filing jointly' }] },
    { id: 'a', label: '2024 MAGI used by the SSA', def: 290000, unit: '$', max: 5000000 },
    { id: 'b', label: 'Estimated 2026 MAGI after the event', def: 150000, unit: '$', max: 5000000 },
  ],
  run: ({ s, a, b }: Record<string, number>) => {
    const st = (s === 1 ? 1 : 0) as 0 | 1;
    const ppl = st === 1 ? 2 : 1;
    const before = irmaa(a, st, ppl), after = irmaa(b, st, ppl);
    const saved = Math.max(0, before.yearly - after.yearly);
    return {
      head: ['Possible saving over 2026', usd(saved)] as [string, string],
      rows: [
        ['Tier on the 2024 return', before.tier === 0 ? 'None' : `${before.tier} of 5`],
        ['Tier on the 2026 estimate', after.tier === 0 ? 'None' : `${after.tier} of 5`],
        ['Surcharges a month, household, now', usd(before.monthly, 2)],
        ['Surcharges a month after a new decision', usd(after.monthly, 2)],
      ] as [string, string][],
      note: saved > 0 ? 'Only a qualifying life-changing event, with proof, opens this request.' : 'The lower income does not change the tier: the SSA would not revise it.',
    };
  },
});
