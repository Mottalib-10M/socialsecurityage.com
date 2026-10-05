import { computePia, projectCareer } from '../engine/ss';
import { bendPoints } from '../engine/params';
import { usd, pct, mid } from './_kit';
/** A whole-career salary split across the 90%, 32% and 15% brackets, and what $1,000 more a year adds. */
export default () => ({
  title: 'Where your pay falls in the 90/32/15 formula',
  cta: 'Use your real earnings record',
  inputs: [{ id: 's', label: 'Yearly pay in today\'s dollars, whole career', def: 100000, unit: '$', max: 2000000 }],
  run: ({ s }: Record<string, number>) => {
    const b = mid(1964); const r = computePia(b, projectCareer(b, s, 22, 62)); const up = computePia(b, projectCareer(b, s + 1000, 22, 62));
    const [b1, b2] = bendPoints(2026);
    return { head: ['PIA at 67 (born 1964)', usd(r.pia, 2)] as [string, string],
      rows: [[`From the 90% slice (to ${usd(b1)})`, usd(r.parts[0], 2)], [`From the 32% slice (to ${usd(b2)})`, usd(r.parts[1], 2)], ['From the 15% slice', usd(r.parts[2], 2)], ['$1,000 more a year adds', `${usd(up.pia - r.pia, 2)} a month (${pct((up.pia - r.pia) * 12 / 1000)} of it)`]] as [string, string][],
      note: 'Career from 22 to 62, 2026 formula, before COLAs.' };
  },
});
