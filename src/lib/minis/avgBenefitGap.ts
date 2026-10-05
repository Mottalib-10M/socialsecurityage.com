import { piaFromAime } from '../engine/ss';
import { P } from '../engine/params';
import { usd, pct } from './_kit';
/** Average-benefit guide: your monthly check against the SSA average of your category (August 2026). */
export default () => ({
  title: 'Your check against the national average',
  cta: 'Estimate your own benefit',
  inputs: [
    { id: 'b', label: 'Your monthly benefit (or estimate)', def: 1800, unit: '$', max: 10000 },
    { id: 'k', label: 'Category', def: 0, options: [{ value: '0', label: 'Retired worker' }, { value: '1', label: 'Spouse of a retired worker' }, { value: '2', label: 'Widow or widower' }] },
  ],
  run: ({ b, k }: Record<string, number>) => {
    const S = P.stats_aug_2026;
    const avg = k === 1 ? S.spouse_avg : k === 2 ? S.widow_avg : S.retired_worker_avg;
    const top = P.max_benefit_2026.aime62;
    let aime = 0; while (piaFromAime(aime) < b && aime <= top) aime++;
    const gap = b - avg;
    return { head: [gap >= 0 ? 'Above the average by' : 'Below the average by', usd(Math.abs(gap))] as [string, string],
      rows: [['Average for this category, August 2026', usd(avg, 2)], ['Your benefit as a share of it', pct(avg > 0 ? b / avg : 0)], ['AIME giving this amount at full retirement age (2026 formula)', aime > top ? 'none: above the 2026 maximum PIA' : usd(aime)]] as [string, string][] };
  },
});
