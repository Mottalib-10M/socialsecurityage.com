import { piaFromAime } from '../engine/ss';
import { bendPoints, cola, LAST_COLA_YEAR } from '../engine/params';
import { floorDime } from '../engine/ss';
import { usd, pct, yearOptions } from './_kit';
/** Birth year + AIME -> PIA under the formula of the year you turned 62, then every COLA since. */
export default () => ({
  title: 'Your formula year and the COLAs stacked on it',
  cta: 'Compute your AIME from your record',
  inputs: [
    { id: 'y', label: 'Year of birth', def: 1960, options: yearOptions(1955, 1963) },
    { id: 'a', label: 'Average indexed monthly earnings (AIME)', def: 4000, unit: '$', max: 20000 },
  ],
  run: ({ y, a }: Record<string, number>) => {
    const ey = y + 62; const start = piaFromAime(a, ey);
    let pia = start; for (let k = ey; k <= LAST_COLA_YEAR; k++) pia = floorDime(pia * (1 + cola(k) / 100));
    const [b1, b2] = bendPoints(ey);
    return { head: ['PIA in 2026, all COLAs included', usd(pia, 2)] as [string, string],
      rows: [['Formula year (turned 62)', String(ey)], ['Bend points of that year', `${usd(b1)} and ${usd(b2)}`], ['PIA in the formula year', usd(start, 2)], [`COLAs ${ey} to ${LAST_COLA_YEAR}`, start > 0 ? `+${pct(pia / start - 1)}` : '0%']] as [string, string][],
      note: 'COLAs count from the year you turn 62, even if you have not claimed yet.' };
  },
});
