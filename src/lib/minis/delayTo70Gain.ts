import { benefitAtAge, fraRetirement, breakEvenMonths } from '../engine/ss';
import { usd, pct, ageText, yearOptions } from './_kit';
/** Claiming-at-70 guide: the gain from waiting from full retirement age to 70, and when it pays back. */
export default () => ({
  title: 'What waiting until 70 adds',
  cta: 'Compare every start age',
  inputs: [
    { id: 'p', label: 'Your PIA (benefit at full retirement age)', def: 2000, unit: '$', max: 10000 },
    { id: 'y', label: 'Year of birth', def: 1964, options: yearOptions(1955, 2006) },
  ],
  run: ({ p, y }: Record<string, number>) => {
    const f = fraRetirement(y);
    const late = benefitAtAge(p, 840, f.total), n = benefitAtAge(p, f.total, f.total);
    const be = breakEvenMonths({ start: f.total, benefit: n.benefit }, { start: 840, benefit: late.benefit });
    return { head: ['At 70', usd(late.benefit)] as [string, string],
      rows: [['Share of your PIA', pct(late.factor)], [`More each month than at ${ageText(f.total)}`, usd(late.benefit - n.benefit)], ['Total from 70 overtakes the FRA start at about', be ? ageText(Math.round(be)) : 'never']] as [string, string][],
      note: 'Today\'s dollars: COLAs raise both starts alike.' };
  },
});
