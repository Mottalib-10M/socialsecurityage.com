import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { benefitAtAge, computePia, employeePayroll, projectCareer } from '../../lib/engine/ss';

const S = 75000;
const b = { y: 1964, m: 6, d: 15 };
const run = (s: number) => computePia(b, projectCareer(b, s, 22, 62));
const r = run(S);
const bp = bendPoints(2026);
const awi24 = P.series.awi['2024'];
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const at = (pia: number, m: number) => benefitAtAge(pia, m, 804).benefit;
const tax = employeePayroll(S);
const careerTax = tax.oasdi * 40;
const yearsToMatch = careerTax / (at(r.pia, 804) * 12);
const room = bp[1] - r.aime;

export default definePage({
  id: 'salary-75000',
  group: 'salary',
  order: 75,
  mini: 'salaryTaxBenefit',
  related: ['salary-50000', 'salary-100000', 'average-wage-index', 'tax-calculator', 'self-employed'],
  sources: ['ssaAwi', 'ssaCbb', 'frNotice2026', 'cfr404_212', 'ssaBendPoints'],
  en: {
    slug: 'social-security-on-75000-salary',
    nav: '$75,000 salary',
    card: `Above the national average wage, still in the 32% bracket: ${$(at(r.pia, 804))} a month at 67 for ${$(tax.oasdi)} of payroll tax a year.`,
    title: `Social Security on a $75,000 Salary: ${$(at(r.pia, 804))} at 67 in 2026`,
    description: `Social Security on $75,000 a year, 2026: ${$(tax.oasdi)} of employee tax a year buys a PIA of ${$(r.pia)}. Pay is above the average wage, yet the AIME stays under ${$(bp[1])}.`,
    h1: 'What $75,000 a year pays into Social Security, and what it gets back',
    intro: 'A salary a little above the national average: the tax is proportional, the benefit is not.',
    resume: `At ${$(S)} a year you earn about ${Math.round(S / awi24 * 100)}% of the 2024 national average wage index, ${awi24.toLocaleString('en-US')}. A full career at that level, from 22 to 62 for a worker born in 1964, gives average indexed monthly earnings of ${$(r.aime)}, which is still ${$(room)} below the second bend point of ${$(bp[1])}. So the 2026 formula pays 90% on the first ${$(bp[0])} and 32% on the rest, for a primary insurance amount of ${$(r.pia, 2)}: ${$(at(r.pia, 745))} a month at 62 and 1 month, ${$(at(r.pia, 804))} at 67 and ${$(at(r.pia, 840))} at 70. On the tax side, the employee pays ${(P.payroll.oasdi_employee * 100).toFixed(1)}% of wages for Social Security, ${$(tax.oasdi)} in 2026, and the employer pays the same. Forty years of the employee share, in today's dollars, come to about ${$(careerTax)}, roughly ${yearsToMatch.toFixed(1)} years of benefits at 67, not counting the employer half or the disability and survivor cover that the same tax pays for.`,
    faqs: [
      { q: 'Does $75,000 count as an above-average salary for Social Security?', a: `Yes. The SSA indexes careers with the national average wage index, ${$(awi24, 2)} for 2024. A ${$(S)} salary is ${Math.round((S / awi24 - 1) * 100)}% above it. For comparison, the SSA's own 2026 example of a steady career has an AIME of ${$(P.ssa_examples_2026.caseA.aime)}; this one reaches ${$(r.aime)}.` },
      { q: 'At $75,000, how close am I to the 15% bracket?', a: `Not very. Your AIME of ${$(r.aime)} would need to grow by ${$(room)} a month to reach ${$(bp[1])}, the point where the replacement rate drops to 15%. That corresponds to a career at about ${$(bp[1] * 12)} in today's pay. Until then, each extra dollar of average earnings still turns into 32 cents of PIA.` },
      { q: 'Is the Social Security tax on $75,000 a good deal?', a: `It depends on how long benefits are paid. Your share of tax over 40 years at this level is about ${$(careerTax)} in today's dollars, roughly ${yearsToMatch.toFixed(1)} years of the benefit at 67. Counting the employer half doubles the cost side; the insurance against disability and early death sits on the other side and has no price tag here.` },
      { q: 'How much Medicare tax comes out of a $75,000 paycheck?', a: `${(P.payroll.hi_employee * 100).toFixed(2)}% of all wages, ${$(tax.hi)} a year, with no cap, matched by the employer. Together with the Social Security share, the employee pays ${$(tax.total)} a year. None of the Medicare part affects your retirement benefit; it goes to Medicare, a separate trust fund with its own rules.` },
    ],
    body: (h) => {
      const pays = [60000, Math.round(awi24), S, 85000, bp[1] * 12];
      const rows = pays.map((s) => { const x = run(s); const t = employeePayroll(s).oasdi; const yb = at(x.pia, 804) * 12; return [h.usd(s), h.usd(t), h.usd(x.aime), h.usd(x.pia, 2), h.usd(yb), h.num(yb / t, 1)]; });
      return `
<h2>Above the average wage, below the second bend point</h2>
<p>Two different reference points are at play. The ${h.src('ssaAwi', 'national average wage index')}, ${h.num(awi24, 2)}, is what your earnings are compared with when they are indexed. The second ${h.a('bend-points', 'bend point')}, ${h.usd(bp[1])} of AIME a month, is where the formula switches from 32% to 15%. A ${h.usd(S)} career is past the first marker and short of the second, so the PIA still rises at the middle rate.</p>
<h2>Tax paid each year against benefit received each year</h2>
${h.table(['Pay', 'Employee Social Security tax (2026)', 'AIME', 'PIA', 'Yearly benefit at 67', 'Benefit / yearly tax'], rows, 'Worker born in 1964, career from 22 to 62 at the same level against the average wage. Employee share only', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The tax column grows in a straight line with pay until the ${h.src('ssaCbb', 'taxable maximum')} of ${h.usd(P.taxable_max_2026)}; the benefit column grows more slowly, because each dollar of AIME above ${h.usd(bp[0])} only brings 32 cents. The last column, a full year of benefits divided by one year of tax, slips from line to line. This is the progressivity of the ${h.src('cfr404_212', 'formula')} seen from the payroll side.</p>
<h2>What the ratio leaves out</h2>
<p>The comparison is deliberately simple. It counts only your half of the tax; the employer's ${(P.payroll.oasdi_employer * 100).toFixed(1)}% is part of the cost of employing you. It ignores COLAs, which raise the benefit with prices every year, and the fact that the same tax buys disability benefits and benefits for a surviving spouse or children. It also assumes a full career: a decade of zeros changes the result, as the ${h.a('salary-50000', '$50,000 page')} shows. For a self-employed person, who pays both halves, see ${h.a('self-employed', 'Social Security for the self-employed')}; for the tax due on benefits once received, the ${h.a('tax-calculator', 'benefit tax calculator')}.</p>`;
    },
  },
});
