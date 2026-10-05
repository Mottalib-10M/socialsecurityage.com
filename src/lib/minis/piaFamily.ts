import { spousalBenefit, survivorBenefit, familyMaximum, benefitAtAge, fraRetirement } from '../engine/ss';
import { usd, yearOptions } from './_kit';
/** One PIA, every benefit that is built on it. */
export default () => ({
  title: 'Everything your PIA pays for',
  cta: 'Find your PIA from your earnings record',
  inputs: [
    { id: 'p', label: 'Primary insurance amount (PIA)', def: 2609.8, unit: '$', max: 6000, decimals: 2 },
    { id: 'y', label: 'Year the worker turned (or turns) 62', def: 2026, options: yearOptions(2016, 2026) },
  ],
  run: ({ p, y }: Record<string, number>) => {
    const fra = fraRetirement(y - 62).total;
    const sp = spousalBenefit(p, 0, fra, fra);
    const sv = survivorBenefit({ deceasedPia: p, deceasedClaimMonths: null, deceasedFraMonths: fra, survivorClaimMonths: fra, survivorFraMonths: fra });
    return { head: ['Worker at full retirement age', usd(benefitAtAge(p, fra, fra).benefit)] as [string, string],
      rows: [['Spouse at full retirement age (50%)', usd(Math.floor(sp.fullSpousal))], ['Widow(er) at full retirement age (100%)', usd(sv.benefit)], ['Family maximum on this record', usd(familyMaximum(p, y), 2)]] as [string, string][],
      note: 'Spouse with no PIA of their own; survivor when the worker had not started benefits.' };
  },
});
