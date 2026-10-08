import { cobraCost } from '../engine/accounts';
import { usd } from './_kit';
/** COBRA until Medicare: 102% of the plan cost, 150% in a disability extension, against a Marketplace plan. */
export default () => ({
  title: 'COBRA cost until Medicare',
  cta: 'Medicare Part B premium after 65',
  inputs: [
    { id: 'q', label: 'Full monthly plan cost (your share plus the employer\'s)', def: 1800, unit: '$', max: 20000 },
    { id: 'n', label: 'Months of COBRA you need', def: 18, max: 29 },
    { id: 'd', label: 'Disability extension (SSA disability)', def: 0, options: [{ value: '0', label: 'No, 18 months at most' }, { value: '1', label: 'Yes, up to 29 months' }] },
    { id: 'k', label: 'Marketplace premium after any tax credit', def: 1100, unit: '$', max: 20000 },
  ],
  run: ({ q, n, d, k }: Record<string, number>) => {
    const r = cobraCost({ planMonthly: q, months: n, disability: d === 1, marketplaceMonthly: k });
    return {
      head: [`COBRA premiums over ${r.months} months`, usd(r.total)] as [string, string],
      rows: [
        ['COBRA each month (102%)', usd(r.monthly)],
        ['Marketplace over the same months', usd(r.marketplaceTotal)],
        [r.difference >= 0 ? 'COBRA costs more by' : 'COBRA costs less by', usd(Math.abs(r.difference))],
        ['Longest COBRA period here', `${r.maxMonths} months`],
      ] as [string, string][],
      note: 'Premiums only: compare deductibles and networks too. Months 19 to 29 cost 150% for the disabled person.',
    };
  },
});
