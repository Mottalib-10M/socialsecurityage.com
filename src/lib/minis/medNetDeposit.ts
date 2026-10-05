import { P } from '../engine/params';
import { floorDollar } from '../engine/ss';
import { usd } from './_kit';
/** Social Security deposit after the 2026 Part B premium and, if any, the income-related adjustment. */
export default () => {
  const T = P.extra.medicare.irmaa_partb as Array<{ single_max: number | null; irmaa: number; total: number }>;
  return {
    title: 'Deposit left after the Part B premium',
    cta: 'Check how much of the benefit is taxable',
    inputs: [
      { id: 'b', label: 'Monthly Social Security benefit before deductions', def: 2087, unit: '$', max: 10000 },
      { id: 'k', label: 'Income on your 2024 tax return (single filer)', def: 0, options: T.map((t, i) => ({ value: String(i), label: i === 0 ? `$${(T[0].single_max as number).toLocaleString('en-US')} or less` : t.single_max ? `Up to $${t.single_max.toLocaleString('en-US')}` : '$500,000 or more' })) },
    ],
    run: ({ b, k }: Record<string, number>) => {
      const row = T[Math.max(0, Math.min(T.length - 1, k))];
      const net = Math.max(0, floorDollar(b) - row.total);
      return { head: ['Net monthly deposit', usd(net, 2)] as [string, string],
        rows: [['Standard Part B premium', usd(P.medicare.part_b_2026, 2)], ['Income-related adjustment', usd(row.irmaa, 2)], ['Withheld over 12 months', usd(row.total * 12, 2)]] as [string, string][],
        note: 'Part D plan premiums and voluntary tax withholding are not included.' };
    },
  };
};
