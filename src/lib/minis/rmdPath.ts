import { rmdSchedule } from '../engine/accounts';
import { usd } from './_kit';
/** RMDs from 73 or 75 to 95 on one balance and one growth rate. */
export default () => ({
  title: 'How the RMD grows with age',
  cta: 'Rules for the heirs of the account',
  inputs: [
    { id: 'b', label: 'Balance at the first RMD year', def: 800000, unit: '$', max: 100000000 },
    { id: 'a', label: 'First RMD age', def: 73, options: [{ value: '73', label: '73 (born 1951 to 1959)' }, { value: '75', label: '75 (born 1960 or later)' }] },
    { id: 'g', label: 'Yearly growth of the account', def: 5, unit: '%', max: 15, decimals: 1 },
  ],
  run: ({ b, a, g }: Record<string, number>) => {
    const rows = rmdSchedule(b, a, 96 - a, g / 100);
    const at = (age: number) => rows.find((r) => r.age === age)!;
    const total = rows.reduce((s, r) => s + r.rmd, 0);
    return {
      head: [`Withdrawn by law from ${a} to 95`, usd(total)] as [string, string],
      rows: [[`RMD at ${a}`, usd(at(a).rmd)], ['RMD at 80', usd(at(80).rmd)], ['RMD at 85', usd(at(85).rmd)], ['RMD at 90', usd(at(90).rmd)]] as [string, string][],
      note: 'Constant growth assumed; real returns vary each year.',
    };
  },
});
