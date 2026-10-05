import { fraRetirement, benefitAtAge } from '../engine/ss';
import { usd, pct, ageText, yearOptions } from './_kit';
/** Birth year + PIA -> delayed credits earned by 70 and the month they stop. */
export default () => ({
  title: 'Delayed credits until the month you turn 70',
  cta: 'Compare every start age',
  inputs: [
    { id: 'y', label: 'Year of birth', def: 1956, options: yearOptions(1955, 1962) },
    { id: 'p', label: 'Your PIA (benefit at full retirement age)', def: 2200, unit: '$', max: 10000 },
  ],
  run: ({ y, p }: Record<string, number>) => {
    const f = fraRetirement(y); const at70 = benefitAtAge(p, 840, f.total); const at69 = benefitAtAge(p, 828, f.total);
    return { head: ['Monthly benefit starting at 70', usd(at70.benefit)] as [string, string],
      rows: [['Full retirement age', ageText(f.total)], ['Months of credits by 70', `${at70.monthsLate} (${pct(at70.factor - 1)})`], ['Starting at 69 instead', usd(at69.benefit)], ['Year you turn 70', String(y + 70)]] as [string, string][],
      note: 'No credit is earned after the month you reach 70. Before COLAs.' };
  },
});
