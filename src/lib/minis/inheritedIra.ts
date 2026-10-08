import { inheritedRmd } from '../engine/accounts';
import { usd, num, yearOptions } from './_kit';
/** 2026 RMD of an inherited IRA under the 2024 final regulations. */
export default () => ({
  title: 'Inherited IRA: what you must take in 2026',
  cta: 'Your own RMD as an account owner',
  inputs: [
    { id: 'b', label: 'Inherited balance on December 31, 2025', def: 400000, unit: '$', max: 100000000 },
    { id: 'k', label: 'You are', def: 0, options: [{ value: '0', label: 'An adult child or other non-spouse' }, { value: '1', label: 'The surviving spouse' }, { value: '2', label: 'Disabled, chronically ill, or within 10 years of age' }, { value: '3', label: 'The owner\'s child under 21' }] },
    { id: 'd', label: 'Year the owner died', def: 2024, options: yearOptions(2020, 2025) },
    { id: 'r', label: 'The owner had started RMDs', def: 1, options: [{ value: '1', label: 'Yes, past the RMD start date' }, { value: '0', label: 'No, or it is a Roth IRA' }] },
    { id: 'a', label: 'Your age in 2026', def: 52, max: 110 },
  ],
  run: ({ b, k, d, r, a }: Record<string, number>) => {
    const kind = (k >= 0 && k <= 3 ? k : 0) as 0 | 1 | 2 | 3;
    const benAgeYearAfterDeath = a - (2026 - (d + 1));
    const res = inheritedRmd({ balancePrevDec31: b, kind, deathYear: d, year: 2026, benAgeYearAfterDeath, ownerAgeAtDeath: 78, afterRbd: r === 1 });
    return {
      head: ['Minimum to withdraw in 2026', usd(res.amount)] as [string, string],
      rows: [
        ['Divisor used', res.divisor ? num(res.divisor, 1) : 'None'],
        ['Account must be empty by', res.emptyBy ? `December 31, ${res.emptyBy}` : 'No end date'],
        ['Rule applied', res.note],
      ] as [string, string][],
      note: 'Owner assumed 78 at death when the RMD had started; an older owner never changes a younger heir\'s divisor.',
    };
  },
});
