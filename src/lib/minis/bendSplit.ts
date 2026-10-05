import { piaFromAime } from '../engine/ss';
import { bendPoints } from '../engine/params';
import { usd, pct, yearOptions } from './_kit';
/** AIME through the three brackets of a formula year. */
export default () => ({
  title: 'Run an AIME through the bend points',
  cta: 'Compute your AIME from your pay',
  inputs: [
    { id: 'a', label: 'Average indexed monthly earnings (AIME)', def: 5825, unit: '$', max: 20000 },
    { id: 'y', label: 'Year you turn (or turned) 62', def: 2026, options: yearOptions(2016, 2026) },
  ],
  run: ({ a, y }: Record<string, number>) => {
    const [b1, b2] = bendPoints(y);
    const p1 = 0.9 * Math.min(a, b1), p2 = 0.32 * Math.max(0, Math.min(a, b2) - b1), p3 = 0.15 * Math.max(0, a - b2);
    const pia = piaFromAime(a, y);
    return { head: ['PIA before any COLA', usd(pia, 2)] as [string, string],
      rows: [[`90% of the first ${usd(b1)}`, usd(p1, 2)], [`32% from ${usd(b1)} to ${usd(b2)}`, usd(p2, 2)], [`15% above ${usd(b2)}`, usd(p3, 2)], ['PIA as a share of AIME', a > 0 ? pct(pia / a) : '0%']] as [string, string][] };
  },
});
