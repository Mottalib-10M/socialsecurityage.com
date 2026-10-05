import { benefitAtAge } from '../engine/ss';
import { usd } from './_kit';
/** Started at 62, withdraws within 12 months, restarts at 70 (FRA 67). */
export default () => ({
  title: 'Withdraw and restart later: the trade',
  cta: 'Compare every starting age',
  inputs: [
    { id: 'p', label: 'Your PIA', def: 2000, unit: '$', max: 6000 },
    { id: 'm', label: 'Months of benefits already received (1 to 12)', def: 8, max: 12 },
  ],
  run: ({ p, m }: Record<string, number>) => {
    const k = Math.max(1, Math.min(12, Math.round(m)));
    const b62 = benefitAtAge(p, 62 * 12 + 1, 67 * 12).benefit, b70 = benefitAtAge(p, 70 * 12, 67 * 12).benefit;
    const repay = b62 * k;
    return { head: ['Amount to repay', usd(repay)] as [string, string],
      rows: [['Check you give up (started at 62 and 1 month)', usd(b62)], ['Check if restarted at 70', usd(b70)], ['Months at 70 to earn back the repayment', String(Math.ceil(repay / Math.max(1, b70 - b62)))]] as [string, string][],
      note: 'Full retirement age 67, amounts before COLAs. Family benefits on the record are repaid too.' };
  },
});
