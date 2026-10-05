import { benefitAtAge, fraRetirement, breakEvenMonths } from '../engine/ss';
import { P } from '../engine/params';
import { usd, pct, ageText, yearOptions } from './_kit';
/** Claiming-at-62 guide: what the earliest start costs, month after month, for a PIA and a birth year. */
export default () => ({
  title: 'What starting at 62 costs you',
  cta: 'Compare every start age',
  inputs: [
    { id: 'p', label: 'Your PIA (benefit at full retirement age)', def: 2000, unit: '$', max: 10000 },
    { id: 'y', label: 'Year of birth', def: 1964, options: yearOptions(1955, 2006) },
  ],
  run: ({ p, y }: Record<string, number>) => {
    const f = fraRetirement(y);
    const e = benefitAtAge(p, 62 * 12 + 1, f.total), n = benefitAtAge(p, f.total, f.total);
    const be = breakEvenMonths({ start: 62 * 12 + 1, benefit: e.benefit }, { start: f.total, benefit: n.benefit });
    return { head: ['At 62 and 1 month', usd(e.benefit)] as [string, string],
      rows: [['Share of your PIA kept for life', pct(e.factor)], [`Less each month than at ${ageText(f.total)}`, usd(n.benefit - e.benefit)], ['Waiting catches up at about age', be ? ageText(Math.round(be)) : 'never'], ['2026 earnings limit before withholding', usd(P.earnings_test.lower_annual)]] as [string, string][] };
  },
});
