import { computePia, projectCareer } from '../engine/ss';
import { usd } from './_kit';
/** Born 1959: a career from 22 to 62, then one more year of pay in 2026 after full retirement age. */
export default () => ({
  title: 'What a 2026 paycheck adds to your PIA',
  cta: 'Add your own years to your record',
  inputs: [
    { id: 's', label: 'Career pay in today\'s dollars (22 to 62)', def: 60000, unit: '$', max: 1000000 },
    { id: 'e', label: 'Earnings in 2026', def: 90000, unit: '$', max: 1000000 },
  ],
  run: ({ s, e }: Record<string, number>) => {
    const b = { y: 1959, m: 6, d: 15 }, c = projectCareer(b, s, 22, 62);
    const before = computePia(b, c), after = computePia(b, { ...c, 2026: e });
    return { head: ['PIA increase from 2026 earnings', `${usd(after.pia - before.pia, 2)} a month`] as [string, string],
      rows: [['PIA without 2026', usd(before.pia, 2)], ['PIA with 2026', usd(after.pia, 2)], ['AIME without / with', `${usd(before.aime)} / ${usd(after.aime)}`]] as [string, string][],
      note: 'Worker born in 1959 (eligible 2021, COLAs 2021 to 2025 included). The raise is paid from January 2027.' };
  },
});
