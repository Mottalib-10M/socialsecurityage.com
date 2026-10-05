import { computePia, projectCareer, benefitAtAge, employeePayroll } from '../engine/ss';
import { P } from '../engine/params';
import { usd, mid } from './_kit';
/** Salary -> Social Security tax paid in 2026 against the benefit it builds. */
export default () => ({
  title: 'Social Security tax on your pay, and the benefit it builds',
  cta: 'See the self-employed version',
  inputs: [{ id: 's', label: 'Yearly pay in 2026', def: 75000, unit: '$', max: 2000000 }],
  run: ({ s }: Record<string, number>) => {
    const t = employeePayroll(s); const b = mid(1964); const r = computePia(b, projectCareer(b, s, 22, 62));
    const a67 = benefitAtAge(r.pia, 804, 804).benefit;
    return { head: ['Benefit at 67 (born 1964)', `${usd(a67)} a month`] as [string, string],
      rows: [['Your Social Security tax in 2026', usd(t.oasdi)], ['Your employer pays too', usd(Math.min(s, P.taxable_max_2026) * P.payroll.oasdi_employer)], ['Medicare tax on top (yours)', usd(t.hi)], ['One year of benefits at 67', usd(a67 * 12)]] as [string, string][],
      note: 'Benefit for a career from 22 to 62 at this pay in today\'s dollars, before COLAs.' };
  },
});
