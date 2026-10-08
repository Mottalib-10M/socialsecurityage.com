import { rothConversion } from '../engine/accounts';
import { usd, pct } from './_kit';
/** Federal tax on a 2026 Roth conversion and the IRMAA tier it would cause in 2028. */
export default () => ({
  title: 'Tax on a Roth conversion in 2026',
  cta: 'IRMAA brackets and the two-year lookback',
  inputs: [
    { id: 's', label: 'Filing status', def: 1, options: [{ value: '1', label: 'Married filing jointly' }, { value: '0', label: 'Single' }, { value: '2', label: 'Head of household' }] },
    { id: 't', label: '2026 taxable income without the conversion', def: 90000, unit: '$', max: 10000000 },
    { id: 'm', label: '2026 MAGI without the conversion', def: 125000, unit: '$', max: 10000000 },
    { id: 'c', label: 'Amount converted', def: 60000, unit: '$', max: 10000000 },
  ],
  run: ({ s, t, m, c }: Record<string, number>) => {
    const st = (s === 1 ? 1 : s === 2 ? 2 : 0) as 0 | 1 | 2;
    const r = rothConversion(t, m, c, st);
    return {
      head: ['Extra federal income tax', usd(r.tax)] as [string, string],
      rows: [
        ['Average rate on the converted dollars', pct(r.effective)],
        ['Bracket reached', pct(r.topRate, 0)],
        ['Room left in your current bracket', Number.isFinite(r.roomInBracket) ? usd(r.roomInBracket) : 'Top bracket'],
        ['IRMAA surcharges in 2028, household', r.irmaaExtraYear > 0 ? `+${usd(r.irmaaExtraYear)} (tier ${r.irmaaBefore} to ${r.irmaaAfter})` : 'No change at 2026 thresholds'],
      ] as [string, string][],
      note: 'Federal tax only, 2026 rate tables. IRMAA uses 2026 thresholds, which will be indexed by 2028.',
    };
  },
});
