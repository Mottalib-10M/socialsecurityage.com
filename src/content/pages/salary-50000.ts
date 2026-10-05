import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { computePia, projectCareer, benefitAtAge } from '../../lib/engine/ss';

const S = 50000;
const b = { y: 1964, m: 6, d: 15 };
const r = computePia(b, projectCareer(b, S, 22, 62));
const bp = bendPoints(2026);
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const a62 = benefitAtAge(r.pia, 745, 804).benefit, a67 = benefitAtAge(r.pia, 804, 804).benefit, a70 = benefitAtAge(r.pia, 840, 804).benefit;

export default definePage({
  id: 'salary-50000',
  group: 'salary',
  order: 50,
  mini: 'salaryPia',
  related: ['salary-35000', 'salary-75000', 'bend-points', 'how-much-will-i-get', 'benefits-calculator'],
  sources: ['ssaAwi', 'ssaBendPoints', 'frNotice2026', 'cfr404_212'],
  en: {
    slug: 'social-security-on-50000-salary',
    nav: '$50,000 salary',
    card: `A career at ${$(S)} in today's pay: about ${$(a67)} a month at 67, inside the 32% bracket.`,
    title: `Social Security on a $50,000 Salary: ${$(a67)} at 67 in 2026`,
    description: `Social Security on a $50,000 salary, 2026 rules: AIME ${$(r.aime)}, PIA ${$(r.pia)}, so ${$(a62)} a month at 62, ${$(a67)} at 67, ${$(a70)} at 70. Computed step by step.`,
    h1: 'How much Social Security a $50,000 salary earns you',
    intro: `A full career at ${$(S)} a year in today's money puts your average in the middle bracket of the formula.`,
    resume: `A worker born in 1964 who earned the equivalent of ${$(S)} in today's pay every year from 22 to 62 has an average indexed monthly earnings of ${$(r.aime)}, which is ${$(S)} divided by 12 because a steady career indexed to the 2024 wage level is worth the same each year. Under the 2026 formula the first ${$(bp[0])} is replaced at 90% and the rest, all below the second bend point of ${$(bp[1])}, at 32%, for a primary insurance amount of ${$(r.pia, 2)}. That pays ${$(a62)} a month when starting at 62 and 1 month, ${$(a67)} at the full retirement age of 67 and ${$(a70)} at 70, before the cost-of-living adjustments from December 2026 on. The PIA replaces ${Math.round((r.pia * 12 / S) * 100)}% of the salary, a rate that falls as pay rises.`,
    faqs: [
      { q: 'Is $50,000 a year an average salary for Social Security?', a: `Close to it but below. The national average wage index for 2024, the figure the SSA uses to index careers, is ${$(P.series.awi['2024'], 2)}. A career at ${$(S)} in today's money is therefore about ${Math.round((S / P.series.awi['2024']) * 100)}% of the average wage, slightly below the SSA's "medium" worker.` },
      { q: 'How much would ten more years of zero earnings cost on $50,000?', a: `Ten zeros in the best 35 years cut the AIME by 10/35, to about ${$(Math.floor(r.aime * 25 / 35))}. Because that lowers only the 32% bracket first, the PIA falls by less than a third: roughly ${$(r.pia - computePia(b, projectCareer(b, S, 32, 62)).pia)} a month at full retirement age.` },
      { q: 'What does a raise from $50,000 to $60,000 add to my benefit?', a: `Each extra dollar of AIME in the middle bracket adds 32 cents of PIA. Ten thousand dollars more a year for a whole career raises the AIME by about ${$(10000 / 12)} and the PIA by about ${$(Math.round(10000 / 12 * 0.32))} a month. Late in a career the effect is smaller, because only one of 35 years changes each year.` },
      { q: 'How much Social Security tax does a $50,000 salary pay?', a: `As an employee you pay ${(P.payroll.oasdi_employee * 100).toFixed(1)}% for Social Security, ${$(S * P.payroll.oasdi_employee)} a year, plus ${(P.payroll.hi_employee * 100).toFixed(2)}% for Medicare; your employer pays the same amounts. Self-employed at the same net profit, you pay both halves through self-employment tax on 92.35% of the profit.` },
    ],
    body: (h) => {
      const zeros = [35, 30, 25, 20].map((yrs) => { const x = computePia(b, projectCareer(b, S, 62 - yrs, 62)); return [String(yrs), h.usd(x.aime), h.usd(x.pia, 2), h.usd(benefitAtAge(x.pia, 804, 804).benefit)]; });
      return `
<h2>Why ${h.usd(S)} lands in the 32% bracket</h2>
<p>A monthly average of ${h.usd(r.aime)} is above the first ${h.a('bend-points', 'bend point')} of ${h.usd(bp[0])} and far below the second, ${h.usd(bp[1])}. The first ${h.usd(bp[0])} brings ${h.usd(r.parts[0], 2)}; the remaining ${h.usd(r.aime - bp[0])} brings ${h.usd(r.parts[1], 2)} at 32%. Nothing reaches the 15% bracket, which only starts at an annual pay of about ${h.usd(bp[1] * 12)}. This position matters for decisions: every additional dollar of average earnings still converts at 32 cents, twice the rate of a high earner.</p>
<h2>How many years you worked changes more than the salary</h2>
${h.table(['Years worked', 'AIME', 'PIA', 'At 67'], zeros, `${h.usd(S)} a year in today's pay, careers ending at 62, worker born in 1964`, ['l', 'r', 'r', 'r'])}
<p>Missing years are averaged in as zeros. Twenty years at ${h.usd(S)} produce an AIME well under the full-career figure, but the PIA drops less than proportionally because the 90% bracket is protected: the formula is designed so that shorter or lower careers keep a larger share. See ${h.a('fewer-than-35-years', 'fewer than 35 years of work')} for the details.</p>
<h2>What the estimate assumes</h2>
<p>The career is rebuilt as ${h.usd(S)} of today's pay every year: earlier years are scaled down with the ${h.src('ssaAwi', 'national average wage index')}, so 1990 counts as ${h.usd(Math.round(S * P.series.awi['1990'] / P.series.awi['2024']))}, the share of the average wage you would have earned then. If your pay rose faster than average over your career, your early years were relatively lower and your real AIME is lower than shown; paste your actual record in the ${h.a('benefits-calculator', 'earnings-record calculator')} to see it.</p>`;
    },
  },
});
