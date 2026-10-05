import { survivorBenefit, fraSurvivor } from '../engine/ss';
import { usd, pct } from './_kit';
/** Surviving divorced spouse: the ex's PIA reduced by up to 28.5% between 60 and survivor full retirement age. */
export default () => ({
  title: 'Survivor benefit as a former spouse',
  cta: 'Model the RIB-LIM and delayed credits in the survivor calculator',
  inputs: [
    { id: 'pia', label: 'Late ex-spouse\'s PIA (benefit at full retirement age)', def: 2400, unit: '$', max: 6000 },
    { id: 'age', label: 'Your age when the survivor benefit starts', def: 720, options: [60, 61, 62, 63, 64, 65, 66, 67].map((a) => ({ value: String(a * 12), label: String(a) })) },
  ],
  run: ({ pia, age }: Record<string, number>) => {
    const sf = fraSurvivor(1962).total;
    const r = survivorBenefit({ deceasedPia: pia, deceasedClaimMonths: null, deceasedFraMonths: 804, survivorClaimMonths: age, survivorFraMonths: sf });
    const at60 = survivorBenefit({ deceasedPia: pia, deceasedClaimMonths: null, deceasedFraMonths: 804, survivorClaimMonths: 720, survivorFraMonths: sf });
    return { head: ['Monthly survivor benefit', usd(r.benefit)] as [string, string],
      rows: [['Share of the ex\'s PIA kept', pct(1 - r.reductionPct)], ['Months before survivor full retirement age', String(r.monthsEarly)], ['Floor at 60 (71.5%)', usd(at60.benefit)], ['At survivor full retirement age', usd(Math.floor(pia))]] as [string, string][],
      note: 'Survivor born 1962 or later (survivor full retirement age 67); the ex had not started benefits.' };
  },
});
