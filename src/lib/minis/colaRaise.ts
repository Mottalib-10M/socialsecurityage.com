import { floorDime, floorDollar } from '../engine/ss';
import { P } from '../engine/params';
import { usd } from './_kit';
/** A PIA before and after the 2026 cost-of-living adjustment. */
export default () => ({
  title: 'Your check before and after the 2026 COLA',
  cta: 'Recompute your PIA with every COLA',
  inputs: [
    { id: 'p', label: 'PIA in December 2025, before the increase', def: 2000, unit: '$', max: 6000, decimals: 2 },
  ],
  run: ({ p }: Record<string, number>) => {
    const after = floorDime(p * (1 + P.cola_2026.pct / 100));
    const partB = P.medicare.part_b_2026 - P.medicare.part_b_2025;
    return { head: ['PIA from January 2026', usd(after, 2)] as [string, string],
      rows: [['Monthly raise (rounded down to the dime)', usd(after - p, 2)], ['Raise over 12 months', usd((after - p) * 12, 2)], ['Check at full retirement age, dollars', usd(floorDollar(after))], ['Part B premium rise the same month', usd(partB, 2)]] as [string, string][],
      note: `${P.cola_2026.pct}% applies to people eligible before 2026.` };
  },
});
