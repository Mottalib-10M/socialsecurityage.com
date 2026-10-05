import { P } from '../engine/params';
import { floorDollar } from '../engine/ss';
import { usd, pct } from './_kit';
/** Tax the SSA withholds from a nonresident alien's benefit: 30% of 85%, 15% for Switzerland, none for treaty-exempt residents. */
export default () => ({
  title: 'Tax withheld from a nonresident\'s benefit',
  cta: 'Tax on benefits for US residents',
  inputs: [
    { id: 'b', label: 'Monthly benefit', def: 1800, unit: '$', max: 10000 },
    { id: 'c', label: 'Country of residence', def: 0, options: [{ value: '0', label: 'No treaty relief (standard rule)' }, { value: '1', label: 'Switzerland' }, { value: '2', label: 'Canada, Germany, Japan, UK and other exempt' }] },
  ],
  run: ({ b, c }: Record<string, number>) => {
    const T = P.taxation, A = P.extra.abroad;
    const rate = c === 2 ? 0 : c === 1 ? A.switzerland_treaty_rate : T.nonresident_share * T.nonresident_rate;
    const tax = floorDollar(b) * rate;
    return { head: ['Tax withheld each month', usd(tax, 2)] as [string, string],
      rows: [['Effective rate on the whole benefit', pct(rate)], ['Deposit after withholding', usd(floorDollar(b) - tax, 2)], ['Withheld over a year', usd(tax * 12, 2)]] as [string, string][],
      note: 'Noncitizens only. US citizens and green card holders file a US return instead.' };
  },
});
