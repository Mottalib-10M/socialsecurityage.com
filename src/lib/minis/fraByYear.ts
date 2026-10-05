import { fraRetirement, fraSurvivor, benefitAtAge } from '../engine/ss';
import { usd, pct, ageText, yearOptions } from './_kit';
/** Birth year -> full retirement age and what a PIA becomes at 62, FRA and 70. */
export default () => ({
  title: 'Your full retirement age and what it does to your check',
  cta: 'Full retirement age by exact birth date',
  inputs: [
    { id: 'y', label: 'Year of birth', def: 1964, options: yearOptions(1950, 2006) },
    { id: 'p', label: 'Your PIA (benefit at full retirement age)', def: 2000, unit: '$', max: 10000 },
  ],
  run: ({ y, p }: Record<string, number>) => {
    const f = fraRetirement(y);
    const a62 = benefitAtAge(p, 62 * 12 + 1, f.total), a70 = benefitAtAge(p, 840, f.total);
    return { head: ['Full retirement age', ageText(f.total)] as [string, string],
      rows: [['At 62 and 1 month', `${usd(a62.benefit)} (${pct(a62.factor)})`], ['At 70', `${usd(a70.benefit)} (${pct(a70.factor)})`], ['Survivor full retirement age', ageText(fraSurvivor(y).total)]] as [string, string][],
      note: 'Born on January 1? Use the year before.' };
  },
});
