import { monthAttaining, fraRetirement, earningsTest } from '../engine/ss';
import { P } from '../engine/params';
import { usd } from './_kit';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** Born in 1959: month of full retirement age and the higher earnings-test limit before it. */
export default () => ({
  title: 'Born in 1959: your full-age month and the 2026 earnings limit',
  cta: 'Run the full earnings test',
  inputs: [
    { id: 'm', label: 'Month of birth in 1959', def: 11, options: MONTHS.map((l, i) => ({ value: String(i + 1), label: l })) },
    { id: 'e', label: 'Earnings in 2026 before your full-age month', def: 70000, unit: '$', max: 500000 },
  ],
  run: ({ m, e }: Record<string, number>) => {
    const at = monthAttaining({ y: 1959, m, d: 15 }, fraRetirement(1959).total);
    const in2026 = at.y === 2026;
    const t = earningsTest(1e9, e, in2026 ? 'fraYear' : 'after', at.m - 1);
    return { head: ['Benefits withheld in 2026', in2026 ? usd(t.withheld) : usd(0)] as [string, string],
      rows: [['Full retirement age reached', `${MONTHS[at.m - 1]} ${at.y}`], ['Months of 2026 under the test', in2026 ? String(at.m - 1) : '0'], ['Limit for those months', in2026 ? usd(P.earnings_test.higher_annual) : 'No limit'], ['Withholding rate', in2026 ? '$1 for every $3 above' : 'None']] as [string, string][],
      note: 'Born on the 1st? Use the month before. Withheld amounts are credited back at full retirement age.' };
  },
});
