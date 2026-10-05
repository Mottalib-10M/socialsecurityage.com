import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { benefitAtAge, computePia, projectCareer, taxableBenefits } from '../../lib/engine/ss';

const S = 35000;
const b = { y: 1964, m: 6, d: 15 };
const full = projectCareer(b, S, 22, 62);
const r = computePia(b, full);
const bp = bendPoints(2026);
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const at = (pia: number, m: number) => benefitAtAge(pia, m, 804).benefit;
const rate = (m: number) => Math.round(at(r.pia, m) * 12 / S * 100);
/** Career at S with a stretch of ages at a share of S (0 = no earnings). */
const mix = (from: number, to: number, share: number) => { const e = { ...full }; const part = projectCareer(b, S * share, from, to); for (const y of Object.keys(part)) { if (share > 0) e[Number(y)] = part[Number(y)]; else delete e[Number(y)]; } return computePia(b, e); };
const half10 = mix(30, 40, 0.5);

export default definePage({
  id: 'salary-35000',
  group: 'salary',
  order: 35,
  mini: 'salaryReplacement',
  related: ['salary-20000', 'salary-50000', 'fewer-than-35-years', 'aime', 'how-much-will-i-get'],
  sources: ['cfr404_211', 'cfr404_212', 'ssaBendPoints', 'ssaAwi', 'frNotice2026'],
  en: {
    slug: 'social-security-on-35000-salary',
    nav: '$35,000 salary',
    card: `${$(at(r.pia, 804))} a month at 67 for a ${$(S)} career, and what ten part-time years would take off it.`,
    title: `Social Security on a $35,000 Salary: ${$(at(r.pia, 804))} at 67 in 2026`,
    description: `Social Security on $35,000 a year in 2026: PIA ${$(r.pia)}, or ${rate(804)}% of pay replaced at 67. Ten part-time years at half pay in midcareer cost only ${$(r.pia - half10.pia)} a month.`,
    h1: 'Social Security on a $35,000 salary, with or without part-time years',
    intro: 'A lower-middle career keeps a high replacement rate, and the formula forgives a decade of reduced hours better than most people expect.',
    resume: `Someone born in 1964 who earned the equivalent of ${$(S)} a year in today's pay from age 22 to 62 has an AIME of ${$(r.aime)}. The 2026 formula gives 90% of the first ${$(bp[0])} and 32% of the remaining ${$(r.aime - bp[0])}, a primary insurance amount of ${$(r.pia, 2)}. That pays ${$(at(r.pia, 745))} a month from 62 and 1 month, ${$(at(r.pia, 804))} at the full retirement age of 67 and ${$(at(r.pia, 840))} from 70. Measured against the salary, the benefit replaces ${rate(745)}% at 62, ${rate(804)}% at 67 and ${rate(840)}% at 70. Part-time years weigh less than their lost pay: ten years at half pay between 30 and 39 lower the AIME to ${$(half10.aime)} and the PIA to ${$(half10.pia, 2)}, a loss of ${$(r.pia - half10.pia)} a month, because only the 32% slice is touched and the formula averages the best 35 of 40 years.`,
    faqs: [
      { q: 'Is a $35,000 career enough to get a decent replacement rate from Social Security?', a: `By the formula's own measure, yes: at 67 the benefit equals ${rate(804)}% of the salary, against ${Math.round(at(computePia(b, projectCareer(b, 100000, 22, 62)).pia, 804) * 12 / 100000 * 100)}% for a ${$(100000)} career. The rate is progressive by design. Whether the dollar amount covers a budget is another question, which depends on housing, savings and health costs.` },
      { q: 'I worked part-time for ten years. How much lower is my benefit?', a: `With half pay from 30 to 39 on a ${$(S)} career, about ${$(r.pia - half10.pia)} a month at full retirement age, or ${Math.round((1 - half10.pia / r.pia) * 100)}% of the PIA, although pay over those years was cut in half. The 35-year average dilutes the dip, and the dip comes out of the 32% bracket only.` },
      { q: 'Do five extra years of work replace my weakest years?', a: `Yes. The SSA keeps your highest 35 indexed years (20 CFR 404.211). A 40-year career from 22 to 62 has five spare years, so up to five low or part-time years simply drop out of the computation. Part-time work late in a career is often absorbed this way.` },
      { q: 'How much tax does a $35,000 earner pay for this benefit?', a: `The employee share is ${(P.payroll.oasdi_employee * 100).toFixed(1)}% of wages, ${$(S * P.payroll.oasdi_employee)} a year, matched by the employer. Medicare tax is separate, ${(P.payroll.hi_employee * 100).toFixed(2)}% each. Over 40 years at this level, your share alone adds up to about ${$(S * P.payroll.oasdi_employee * 40)} in today's dollars. The Social Security tax also finances disability and survivor protection on the same earnings record, not just the retirement check.` },
    ],
    body: (h) => {
      const cases: Array<[string, ReturnType<typeof computePia>]> = [
        ['Full time, 22 to 61', r],
        ['Half pay from 30 to 39', half10],
        ['Half pay from 30 to 44', mix(30, 45, 0.5)],
        ['No pay from 30 to 39', mix(30, 40, 0)],
        ['Half pay from 55 to 61', mix(55, 62, 0.5)],
      ];
      const rows = cases.map(([label, x]) => [label, h.usd(x.aime), h.usd(x.pia, 2), h.usd(at(x.pia, 804)), h.usd(at(x.pia, 804) - at(r.pia, 804))]);
      return `
<h2>From ${h.usd(S)} to a monthly check</h2>
<p>Each year of the career is scaled to 2024 wage levels with the ${h.src('ssaAwi', 'national average wage index')}, so a ${h.usd(S)} job today corresponds to about ${h.usd(Math.round(S * P.series.awi['1995'] / P.series.awi['2024']))} in 1995. The best 35 of those indexed years are averaged over 420 months to give the AIME of ${h.usd(r.aime)}. Under the ${h.src('cfr404_212', '2026 formula')}, ${h.usd(r.parts[0], 2)} comes from the 90% slice and ${h.usd(r.parts[1], 2)} from the 32% slice. Nothing reaches the 15% slice, which would take an average of more than ${h.usd(bp[1])} a month.</p>
<h2>Part-time stretches and what they cost</h2>
${h.table(['Career shape', 'AIME', 'PIA', 'At 67', 'Change at 67'], rows, `${h.usd(S)} a year in today's pay, worker born in 1964, 2026 formula`, ['l', 'r', 'r', 'r', 'r'])}
<p>The pattern is consistent. Reduced hours in mid-career cost a fraction of the pay given up, and stopping completely costs more because the zeros cannot be dropped once the five spare years are used. Late part-time work, between 55 and 61, barely moves the result: five of those seven half-pay years fall out of the best 35. The ${h.a('fewer-than-35-years', 'fewer than 35 years page')} looks at shorter careers in general.</p>
<h2>Replacement rate by start age</h2>
<p>The same PIA is paid at 70% from 62, 100% at 67 and 124% from 70. For a ${h.usd(S)} career that spans ${rate(745)}% to ${rate(840)}% of the salary. The mini calculator above lets you test another salary and start age; for an exact figure based on your own record, use ${h.a('how-much-will-i-get', 'how much Social Security will I get')} or the ${h.a('aime', 'AIME guide')} to rebuild the average step by step.</p>
<h2>Will income tax take part of it?</h2>
<p>At ${h.usd(at(r.pia, 804) * 12)} of benefits a year, half counts toward provisional income. A single retiree with ${h.usd(10000)} of other income stays at ${h.usd(taxableBenefits(at(r.pia, 804) * 12, 10000, 'single').provisional)}, under the ${h.usd(P.taxation.base1.single)} threshold, so no part of the benefit is taxable. With ${h.usd(25000)} of other income, ${h.usd(taxableBenefits(at(r.pia, 804) * 12, 25000, 'single').taxable)} of it would be. The ${h.a('tax-calculator', 'tax calculator')} handles couples and other cases.</p>`;
    },
  },
});
