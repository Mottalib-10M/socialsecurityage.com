import { spousalBenefit, fraRetirement } from '../engine/ss';
import { usd } from './_kit';
/** Divorced spouse: half of the ex's PIA minus your own PIA, at full retirement age and at 62 and 1 month. */
export default () => ({
  title: 'Benefit on an ex-spouse\'s record',
  cta: 'Compare every claiming age in the spousal calculator',
  inputs: [
    { id: 'ex', label: 'Your ex-spouse\'s PIA (benefit at full retirement age)', def: 2800, unit: '$', max: 6000 },
    { id: 'own', label: 'Your own PIA (0 if you never worked)', def: 900, unit: '$', max: 6000 },
  ],
  run: ({ ex, own }: Record<string, number>) => {
    const fra = fraRetirement(1960).total;
    const atFra = spousalBenefit(ex, own, fra, fra), at62 = spousalBenefit(ex, own, 62 * 12 + 1, fra);
    return { head: ['Monthly total at your full retirement age', usd(atFra.total)] as [string, string],
      rows: [['Half of the ex\'s PIA', usd(atFra.fullSpousal)], ['Top-up paid on the ex\'s record', atFra.onlyOwn ? 'none, your own PIA is higher' : usd(atFra.excess, 2)], ['Total if you start at 62 and 1 month', usd(at62.total)]] as [string, string][],
      note: 'Born in 1960 or later (full retirement age 67). The ex\'s benefit does not change.' };
  },
});
