import { computePia, projectCareer, employeePayroll } from '../engine/ss';
import { P } from '../engine/params';
import { usd, pct, mid } from './_kit';
/** High salary -> PIA against the maximum PIA, and the pay that is not counted above the cap. */
export default () => ({
  title: 'Your PIA against the 2026 maximum',
  cta: 'Use your real earnings record',
  inputs: [{ id: 's', label: 'Yearly pay in today\'s dollars, whole career', def: 150000, unit: '$', max: 5000000 }],
  run: ({ s }: Record<string, number>) => {
    const b = mid(1964); const r = computePia(b, projectCareer(b, s, 22, 62)); const max = P.max_benefit_2026.pia62;
    return { head: ['Share of the maximum PIA', pct(r.pia / max)] as [string, string],
      rows: [['Your PIA', usd(r.pia, 2)], ['Maximum PIA (turning 62 in 2026)', usd(max, 2)], ['2026 pay above the taxable maximum', usd(Math.max(0, s - P.taxable_max_2026))], ['Your Social Security tax in 2026', usd(employeePayroll(s).oasdi)]] as [string, string][],
      note: 'Pay above the taxable maximum is neither taxed for Social Security nor counted in the benefit.' };
  },
});
