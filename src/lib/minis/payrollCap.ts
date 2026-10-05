import { employeePayroll } from '../engine/ss';
import { P } from '../engine/params';
import { usd, pct } from './_kit';
/** 2026 employee payroll tax and the taxable maximum. */
export default () => ({
  title: 'Social Security tax on your 2026 wages',
  cta: 'See what those wages are worth in benefits',
  inputs: [{ id: 'w', label: 'Wages in 2026', def: 200000, unit: '$', max: 5000000 }],
  run: ({ w }: Record<string, number>) => {
    const r = employeePayroll(w);
    return { head: [`Your Social Security tax (${pct(P.payroll.oasdi_employee)})`, usd(r.oasdi, 2)] as [string, string],
      rows: [['Wages counted for benefits', usd(Math.min(w, P.taxable_max_2026))], ['Pay above the maximum, untaxed for Social Security', usd(Math.max(0, w - P.taxable_max_2026))], [`Medicare tax (${pct(P.payroll.hi_employee, 2)}, no cap)`, usd(r.hi, 2)], ['Same amount paid by the employer', usd(r.oasdi, 2)]] as [string, string][],
      note: 'Additional Medicare tax not included.' };
  },
});
