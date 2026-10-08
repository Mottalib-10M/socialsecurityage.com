import { ownerRmd, rmdExcise } from '../engine/accounts';
import { usd, num, yearOptions } from './_kit';
/** Owner's 2026 required minimum distribution from the Uniform Lifetime Table. */
export default () => ({
  title: 'Your 2026 required minimum distribution',
  cta: 'RMD rules for an inherited IRA',
  inputs: [
    { id: 'b', label: 'Account balance on December 31, 2025', def: 500000, unit: '$', max: 100000000 },
    { id: 'y', label: 'Year of birth', def: 1953, options: yearOptions(1920, 1966) },
  ],
  run: ({ b, y }: Record<string, number>) => {
    const age = 2026 - y;
    const r = ownerRmd(b, age, y);
    if (!r.required) return {
      head: ['RMD due for 2026', usd(0)] as [string, string],
      rows: [['Age reached in 2026', String(age)], ['Your RMD age', String(r.startAge)], ['First RMD year', String(r.firstYear)], ['Deadline for that first RMD', `April 1, ${r.firstYear + 1}`]] as [string, string][],
      note: 'Withdrawals before that year are allowed but not required.',
    };
    return {
      head: ['RMD due for 2026', usd(r.amount)] as [string, string],
      rows: [
        ['Age reached in 2026', String(age)],
        ['Uniform Lifetime Table divisor', num(r.divisor as number, 1)],
        ['Deadline', r.deadlineNote === 'april1' ? 'April 1, 2027 (first RMD)' : 'December 31, 2026'],
        ['Excise tax if missed (25%, or 10% if corrected)', `${usd(rmdExcise(r.amount, false))} / ${usd(rmdExcise(r.amount, true))}`],
      ] as [string, string][],
      note: 'Spouse more than 10 years younger and sole beneficiary: the Joint Life Table gives a smaller RMD.',
    };
  },
});
