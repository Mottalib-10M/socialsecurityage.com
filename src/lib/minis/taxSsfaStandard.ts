import { piaFromAime, floorDime, floorDollar } from '../engine/ss';
import { cola, LAST_COLA_YEAR } from '../engine/params';
import { usd, yearOptions } from './_kit';
/** The standard PIA formula on an AIME, raised by every COLA since the year you turned 62. */
export default () => ({
  title: 'Your benefit under the standard formula',
  cta: 'Rebuild your AIME from your earnings record',
  inputs: [
    { id: 'a', label: 'Average indexed monthly earnings (AIME, from covered work only)', def: 2200, unit: '$', max: 20000 },
    { id: 'y', label: 'Year you turned (or turn) 62', def: 2020, options: yearOptions(2000, 2026) },
  ],
  run: ({ a, y }: Record<string, number>) => {
    const base = piaFromAime(a, y);
    let pia = base;
    for (let k = y; k <= LAST_COLA_YEAR; k++) pia = floorDime(pia * (1 + cola(k) / 100));
    return { head: ['PIA in 2026, standard formula', usd(pia, 2)] as [string, string],
      rows: [[`PIA in the formula year ${y}`, usd(base, 2)], ['COLAs added since', usd(pia - base, 2)], ['Monthly benefit if started at full retirement age', usd(floorDollar(pia))]] as [string, string][],
      note: 'No reduction for a pension from non-covered work applies to benefits payable from January 2024.' };
  },
});
