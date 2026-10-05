import { selfEmploymentTax } from '../engine/ss';
import { P } from '../engine/params';
import { usd } from './_kit';
/** Self-employment tax 2026 on a net profit, split between Social Security and Medicare, and credits earned. */
export default () => ({
  title: 'Self-employment tax on your 2026 profit',
  cta: 'See what those earnings add to your benefit',
  inputs: [{ id: 'p', label: 'Net profit from your business in 2026', def: 60000, unit: '$', max: 5000000 }],
  run: ({ p }: Record<string, number>) => {
    const r = selfEmploymentTax(p);
    return { head: ['Self-employment tax', usd(r.total)] as [string, string],
      rows: [['Net earnings counted (92.35%)', usd(r.base)], ['Social Security part (12.4%)', usd(r.oasdi)], ['Medicare part (2.9%)', usd(r.hi)], ['Credits earned in 2026', `${r.credits} of ${P.credits.max_per_year}`]] as [string, string][],
      note: 'Additional Medicare tax above the IRS thresholds is not included.' };
  },
});
