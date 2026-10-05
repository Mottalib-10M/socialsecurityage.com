import { familyMaximum } from '../engine/ss';
import { P } from '../engine/params';
import { usd } from './_kit';
/** Family maximum for a PIA, and what each dependent gets when several claim on one record. */
export default () => ({
  title: 'Family maximum on one worker\'s record',
  cta: 'Estimate the worker\'s PIA first',
  inputs: [
    { id: 'pia', label: 'Worker\'s PIA', def: 2400, unit: '$', max: 6000 },
    { id: 'n', label: 'Spouse and children claiming on the record', def: 3, options: [1, 2, 3, 4, 5].map((k) => ({ value: String(k), label: String(k) })) },
  ],
  run: ({ pia, n }: Record<string, number>) => {
    const fm = familyMaximum(pia);
    const pool = Math.max(0, fm - pia);
    const full = pia * P.family.child_of_retired, each = Math.min(full, pool / n);
    const surv = Math.min(pia * P.family.child_survivor, fm / n);
    return { head: ['Family maximum (eligible in 2026)', usd(fm, 2)] as [string, string],
      rows: [['Left for dependents while the worker is alive', usd(pool, 2)], [`Each of ${n} dependents (50% rate, capped)`, usd(each, 2)], [`Each of ${n} survivors (75% rate, capped)`, usd(surv, 2)], ['Family maximum as a share of PIA', `${Math.round((fm / pia) * 100)}%`]] as [string, string][],
      note: 'Before any reduction for age. A divorced spouse is paid outside this cap.' };
  },
});
