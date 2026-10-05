import { computePia, projectCareer, benefitAtAge, fraRetirement } from '../engine/ss';
import { usd, yearOptions, mid } from './_kit';
/** One salary, a full career from 22 to 62: AIME, PIA and the check at 62, FRA and 70. */
export default () => ({
  title: 'What this salary pays in Social Security',
  cta: 'Change the career in the full calculator',
  inputs: [
    { id: 's', label: 'Yearly pay in today\'s dollars', def: 50000, unit: '$', max: 2000000 },
    { id: 'y', label: 'Year of birth', def: 1964, options: yearOptions(1955, 2006) },
  ],
  run: ({ s, y }: Record<string, number>) => {
    const b = mid(y); const r = computePia(b, projectCareer(b, s, 22, 62)); const f = fraRetirement(y);
    return { head: ['PIA (benefit at full retirement age)', usd(r.pia)] as [string, string],
      rows: [['AIME', usd(r.aime)], ['At 62 and 1 month', usd(benefitAtAge(r.pia, 745, f.total).benefit)], ['At 70', usd(benefitAtAge(r.pia, 840, f.total).benefit)]] as [string, string][],
      note: 'Career from 22 to 62 at the same rank against the national average wage.' };
  },
});
