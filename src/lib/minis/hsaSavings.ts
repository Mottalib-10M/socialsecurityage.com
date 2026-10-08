import { hsa, hsaMonthsBeforeMedicare } from '../engine/accounts';
import { usd } from './_kit';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** 2026 HSA limit, prorated for Medicare, and the tax the contribution saves. */
export default () => ({
  title: 'Your 2026 HSA limit and tax saving',
  cta: 'IRMAA and Medicare premiums',
  inputs: [
    { id: 'f', label: 'HDHP coverage', def: 0, options: [{ value: '0', label: 'Self-only' }, { value: '1', label: 'Family' }] },
    { id: 'o', label: 'Age 55 or older by December 31, 2026', def: 0, options: [{ value: '0', label: 'No' }, { value: '1', label: 'Yes' }] },
    { id: 'e', label: 'Medicare Part A starts in 2026', def: 0, options: [{ value: '0', label: 'No, not in 2026' }, ...MONTHS.map((x, i) => ({ value: String(i + 1), label: x }))] },
    { id: 'c', label: 'Planned contribution for 2026', def: 4400, unit: '$', max: 100000 },
    { id: 'r', label: 'Federal marginal rate', def: 22, options: [10, 12, 22, 24, 32, 35, 37].map((x) => ({ value: String(x), label: `${x}%` })) },
    { id: 'p', label: 'Paid through payroll (cafeteria plan)', def: 1, options: [{ value: '1', label: 'Yes, no FICA on it' }, { value: '0', label: 'No, deducted on the return' }] },
  ],
  run: ({ f, o, e, c, r, p }: Record<string, number>) => {
    const months = hsaMonthsBeforeMedicare(e);
    const x = hsa({ family: f === 1, age55: o === 1, months, contribution: c, fedRate: r / 100, stateRate: 0, payroll: p === 1 });
    return {
      head: ['Federal tax saved in 2026', usd(x.totalSaved)] as [string, string],
      rows: [
        ['Your 2026 limit', `${usd(x.limit)} (${months} of 12 months)`],
        ['Income tax saved', usd(x.incomeTaxSaved)],
        ['Social Security and Medicare tax saved', usd(x.ficaSaved)],
        ['Excess to withdraw (6% excise otherwise)', usd(x.excess)],
      ] as [string, string][],
      note: 'State income tax not included: most states also exempt HSA contributions, California and New Jersey do not.',
    };
  },
});
