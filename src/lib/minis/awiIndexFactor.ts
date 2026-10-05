import { computePia } from '../engine/ss';
import { usd, num, yearOptions } from './_kit';
/** Indexing factor of one year for a worker who turned 60 in 2024, applied to an amount. */
export default () => ({
  title: 'Index one year of pay to 2024 wage levels',
  cta: 'Index your whole record in the calculator',
  inputs: [
    { id: 'y', label: 'Year the pay was earned', def: 1990, options: yearOptions(1951, 2024) },
    { id: 'a', label: 'Pay that year', def: 25000, unit: '$', max: 1000000 },
  ],
  run: ({ y, a }: Record<string, number>) => {
    const row = computePia({ y: 1964, m: 6, d: 15 }, { [y]: a }).rows[0];
    if (!row) return { head: ['Indexing factor', '0'] as [string, string], rows: [] as [string, string][] };
    return { head: ['Indexing factor', num(row.factor, 4)] as [string, string],
      rows: [['Pay counted (capped at that year\'s maximum)', usd(row.capped)], ['Value in 2024 wage terms', usd(row.indexed)], ['Adds to the AIME if among the 35 best (÷ 420)', usd(row.indexed / 420, 2)]] as [string, string][],
      note: 'For someone who turned 60 in 2024 (born 1964). A year of 2024 or later is not indexed.' };
  },
});
