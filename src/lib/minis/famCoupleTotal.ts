import { benefitAtAge, spousalBenefit, survivorBenefit } from '../engine/ss';
import { usd } from './_kit';
/** A married couple both at full retirement age: household check while both live, survivor's check after. */
export default () => ({
  title: 'Couple total, then the survivor\'s check',
  cta: 'Test other claiming ages in the main calculator',
  inputs: [
    { id: 'a', label: 'Higher earner\'s PIA', def: 3000, unit: '$', max: 6000 },
    { id: 'b', label: 'Other spouse\'s PIA', def: 1000, unit: '$', max: 6000 },
  ],
  run: ({ a, b }: Record<string, number>) => {
    const fra = 804, hi = Math.max(a, b), lo = Math.min(a, b);
    const one = benefitAtAge(hi, fra, fra).benefit;
    const two = spousalBenefit(hi, lo, fra, fra).total;
    const widow = survivorBenefit({ deceasedPia: hi, deceasedClaimMonths: fra, deceasedFraMonths: fra, survivorClaimMonths: fra, survivorFraMonths: fra }).benefit;
    const after = Math.max(widow, benefitAtAge(lo, fra, fra).benefit);
    return { head: ['Household per month, both at 67', usd(one + two)] as [string, string],
      rows: [['Higher earner', usd(one)], ['Other spouse, own plus top-up', usd(two)], ['Left to the survivor after the first death', usd(after)]] as [string, string][],
      note: 'Both born in 1960 or later and starting at 67. The survivor keeps the larger of the two checks.' };
  },
});
