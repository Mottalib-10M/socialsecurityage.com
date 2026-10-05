import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { benefitAtAge, computePia, employeePayroll, projectCareer } from '../../lib/engine/ss';

const S = 100000;
const b = { y: 1964, m: 6, d: 15 };
const run = (s: number) => computePia(b, projectCareer(b, s, 22, 62));
const r = run(S);
const bp = bendPoints(2026);
const cross = bp[1] * 12;
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const at = (pia: number, m: number) => benefitAtAge(pia, m, 804).benefit;
const late = (() => { const e = projectCareer(b, S, 22, 62); const up = projectCareer(b, 130000, 57, 62); return computePia(b, { ...e, ...up }); })();

export default definePage({
  id: 'salary-100000',
  group: 'salary',
  order: 100,
  mini: 'salaryBrackets',
  related: ['salary-75000', 'salary-150000', 'bend-points', 'pia', 'maximum-benefit'],
  sources: ['ssaBendPoints', 'frNotice2026', 'cfr404_212', 'cfr404_211', 'ssaAwi'],
  en: {
    slug: 'social-security-on-100000-salary',
    nav: '$100,000 salary',
    card: `Six figures puts the average over the ${$(bp[1])} bend point: the 15% bracket starts at about ${$(cross)} of career pay.`,
    title: `Social Security on a $100,000 Salary: ${$(at(r.pia, 804))} at 67 in 2026`,
    description: `Social Security on $100,000 a year in 2026: your AIME of ${$(r.aime)} passes the ${$(bp[1])} bend point, so career pay above about ${$(cross)} is replaced at only 15 percent.`,
    h1: 'Social Security at $100,000 a year: where the 15% bracket begins',
    intro: 'Six-figure careers cross the second bend point, and from there a raise buys very little extra benefit.',
    resume: `A worker born in 1964 who earned the equivalent of ${$(S)} a year in today's pay from 22 to 62 has an AIME of ${$(r.aime)}. That crosses the second 2026 bend point, ${$(bp[1])}, which a steady career reaches at ${$(bp[1])} times 12, about ${$(cross)} a year. The formula therefore runs in three layers: ${$(r.parts[0], 2)} from 90% of the first ${$(bp[0])}, ${$(r.parts[1], 2)} from 32% of the band up to ${$(bp[1])}, and ${$(r.parts[2], 2)} from 15% of the last ${$(r.aime - bp[1])}. The primary insurance amount is ${$(r.pia, 2)}, paying ${$(at(r.pia, 745))} at 62 and 1 month, ${$(at(r.pia, 804))} at 67 and ${$(at(r.pia, 840))} at 70. Everything earned above ${$(cross)} a year, here about ${$(S - cross)}, is converted at 15 cents on the dollar of AIME, which is why the step from ${$(cross)} to ${$(S)} adds only ${$(r.pia - run(cross).pia, 2)} a month.`,
    faqs: [
      { q: 'At what salary does the 15% Social Security bracket kick in?', a: `For a steady career in today's dollars, at about ${$(cross)} a year: the second bend point of ${$(bp[1])} a month times 12. Above that average, each extra dollar of AIME adds 15 cents of PIA instead of 32. The bend point is fixed by the year you turn 62; ${$(bp[1])} is the 2026 figure.` },
      { q: 'Is a raise from $100,000 to $120,000 worth anything for Social Security?', a: `A little. Kept for a whole career, ${$(20000)} more a year adds about ${$(run(120000).pia - r.pia, 2)} a month to the PIA. Late in a career it is less: a raise to ${$(130000)} for the last five years before 62 adds only ${$(late.pia - r.pia, 2)}, because those years replace just five of the 35.` },
      { q: 'Why do high earners get a lower replacement rate?', a: `Because the three rates of the PIA formula fall as average earnings rise: 90%, then 32%, then 15%. At ${$(S)} the monthly benefit at 67 replaces about ${Math.round(at(r.pia, 804) * 12 / S * 100)}% of pay, against well over half for careers under ${$(50000)}. The tax is a flat ${(P.payroll.oasdi_employee * 100).toFixed(1)}% up to the taxable maximum, so the return per tax dollar shrinks.` },
      { q: 'Do my best 35 years at $100,000 all count the same?', a: 'Yes, once indexed. Each year before the one you turn 60 is scaled to the wage level of that year, so a $100,000-equivalent salary in 1995 counts as much as one in 2020. From age 60 on, pay counts at face value, which is why a late raise is not diluted by indexing.' },
    ],
    body: (h) => {
      const pays = [80000, cross, S, 110000, 125000];
      const rows = pays.map((s, i) => { const x = run(s); const prev = i ? run(pays[i - 1]) : null; return [h.usd(s), h.usd(x.aime), h.usd(x.parts[2], 2), h.usd(x.pia, 2), prev ? h.usd((x.pia - prev.pia) / ((s - pays[i - 1]) / 1000), 2) : '', h.usd(at(x.pia, 804))]; });
      return `
<h2>Crossing ${h.usd(bp[1])}: the second kink</h2>
<p>The ${h.src('cfr404_212', 'PIA formula')} has two kinks. The first, at ${h.usd(bp[0])}, is passed by almost every full-time career. The second, ${h.usd(bp[1])} in 2026 (${h.src('ssaBendPoints', 'SSA bend points')}), separates the 32% and 15% brackets, and a six-figure career is where it is crossed. Translated into yearly pay for a steady 35-year record, the crossing sits at ${h.usd(cross)}.</p>
${h.table(['Career pay', 'AIME', 'From the 15% bracket', 'PIA', 'Extra PIA per $1,000 of pay', 'At 67'], rows, 'Worker born in 1964, career from 22 to 62, 2026 formula, before COLAs', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The fifth column shows the slope. Below the crossing, ${h.usd(1000)} more of yearly pay throughout the career adds about ${h.usd(1000 / 12 * P.pia.factors[1], 2)} a month; above it, about ${h.usd(1000 / 12 * P.pia.factors[2], 2)}. Same pay rise, less than half the effect.</p>
<h2>Raises late in a career</h2>
<p>Most raises do not apply to a whole career, only to the years that remain. Each late year replaces one of the 35 in the average (${h.src('cfr404_211', '20 CFR 404.211')}), so its weight is one thirty-fifth. A raise from ${h.usd(S)} to ${h.usd(130000)} for ages 57 to 61 lifts the AIME from ${h.usd(r.aime)} to ${h.usd(late.aime)} and the PIA by ${h.usd(late.pia - r.pia, 2)}. In salary terms that raise is worth ${h.usd(30000 * 5)} over five years; in benefit terms, a few dozen dollars a month.</p>
<h2>How far from the maximum</h2>
<p>The largest PIA for someone turning 62 in 2026 is ${h.usd(P.max_benefit_2026.pia62, 2)}, reached only with pay at the ${h.a('taxable-maximum', 'taxable maximum')} every year. A ${h.usd(S)} career gets ${h.pct(r.pia / P.max_benefit_2026.pia62, 0)} of it with about ${h.pct(S / P.taxable_max_2026, 0)} of the maximum pay. The ${h.a('maximum-benefit', 'maximum benefit page')} has the details, and the ${h.a('pia', 'PIA guide')} walks through each bracket.</p>
<h2>The payroll side at six figures</h2>
<p>Under the cap, the employee pays ${(P.payroll.oasdi_employee * 100).toFixed(1)}% on every dollar: ${h.usd(employeePayroll(S).oasdi)} a year at ${h.usd(S)}, against ${h.usd(employeePayroll(cross).oasdi)} at the crossing salary. The extra ${h.usd(employeePayroll(S).oasdi - employeePayroll(cross).oasdi)} of yearly tax buys the ${h.usd(r.parts[2], 2)} a month that the 15% slice adds. Medicare tax is charged on all wages on top.</p>`;
    },
  },
});
