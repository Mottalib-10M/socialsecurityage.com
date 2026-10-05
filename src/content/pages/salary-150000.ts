import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { benefitAtAge, computePia, employeePayroll, projectCareer, spousalBenefit } from '../../lib/engine/ss';

const S = 150000;
const b = { y: 1964, m: 6, d: 15 };
const run = (s: number) => computePia(b, projectCareer(b, s, 22, 62));
const r = run(S);
const cap = P.taxable_max_2026;
const capRun = run(cap);
const maxPia = P.max_benefit_2026.pia62;
const bp = bendPoints(2026);
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const at = (pia: number, m: number) => benefitAtAge(pia, m, 804).benefit;
const share = (x: number) => Math.round(x * 1000) / 10;

export default definePage({
  id: 'salary-150000',
  group: 'salary',
  order: 150,
  mini: 'salaryCapGap',
  related: ['salary-100000', 'maximum-benefit', 'taxable-maximum', 'claiming-at-70', 'bend-points'],
  sources: ['ssaCbb', 'ssaMaxExample', 'frNotice2026', 'cfr404_211', 'ssaBendPoints'],
  en: {
    slug: 'social-security-on-150000-salary',
    nav: '$150,000 salary',
    card: `${$(S)} a year gets ${share(r.pia / maxPia)}% of the maximum PIA with ${share(S / cap)}% of the maximum taxed pay. Pay above ${$(cap)} adds nothing.`,
    title: `Social Security on a $150,000 Salary: ${$(at(r.pia, 804))} at 67 in 2026`,
    description: `Social Security on $150,000 a year in 2026: PIA ${$(r.pia)}, ${share(r.pia / maxPia)}% of the ${$(maxPia, 2)} maximum. Pay above the ${$(cap)} taxable maximum is neither taxed nor counted.`,
    h1: 'Social Security on $150,000 a year, measured against the maximum',
    intro: 'Close to the top of the scale, the gap to the maximum benefit is smaller than the gap in pay.',
    resume: `A career at ${$(S)} a year in today's pay, from 22 to 62 for a worker born in 1964, gives an AIME of ${$(r.aime)}, deep in the 15% bracket that starts at ${$(bp[1])}. The 2026 formula yields a primary insurance amount of ${$(r.pia, 2)}: ${$(at(r.pia, 745))} a month at 62 and 1 month, ${$(at(r.pia, 804))} at 67 and ${$(at(r.pia, 840))} at 70. The ceiling is close. Earnings count only up to each year's taxable maximum, ${$(cap)} in 2026, and someone who earned at least that much every year since 22 reaches the maximum PIA for 2026 eligibility, ${$(maxPia, 2)} (AIME ${$(P.max_benefit_2026.aime62)}). With ${share(S / cap)}% of the maximum pay, the ${$(S)} earner gets ${share(r.pia / maxPia)}% of the maximum PIA, because the extra ${$(P.max_benefit_2026.aime62 - r.aime)} of AIME separating the two careers is replaced at only 15%. Above ${$(cap)}, pay is neither taxed for Social Security nor credited.`,
    faqs: [
      { q: 'How much more would I get earning the taxable maximum instead of $150,000?', a: `A career at ${$(cap)} a year produces the maximum PIA of ${$(maxPia, 2)}, against ${$(r.pia, 2)} at ${$(S)}: ${$(maxPia - r.pia, 2)} a month more at full retirement age. The pay gap of ${$(cap - S)} a year sits entirely in the 15% bracket, so it is worth little.` },
      { q: 'Does salary above $184,500 raise my Social Security benefit?', a: `No. The contribution and benefit base for 2026 is ${$(cap)}. Wages above it are not subject to the ${(P.payroll.oasdi_employee * 100).toFixed(1)}% Social Security tax and are not entered on your earnings record for benefit purposes. Medicare tax still applies to all wages.` },
      { q: 'What is the most a $150,000 earner can collect each month?', a: `Starting at 70 instead of 67 raises the PIA of ${$(r.pia, 2)} by 24%, to ${$(at(r.pia, 840))} a month before future COLAs. For comparison, the SSA's published maximum at 70 for someone retiring in January 2026 is ${$(P.max_benefit_2026.age70)}, computed for an older cohort with its own COLAs.` },
      { q: 'How much Social Security tax does $150,000 of salary pay in 2026?', a: `${$(employeePayroll(S).oasdi)} for the employee, ${(P.payroll.oasdi_employee * 100).toFixed(1)}% of all of it since the pay is under the ${$(cap)} cap, plus the same from the employer. At the cap, the employee share stops at ${$(employeePayroll(cap).oasdi)}; anything earned above it pays only the Medicare tax.` },
    ],
    body: (h) => {
      const pays = [S, 165000, cap, 250000, 400000];
      const rows = pays.map((s) => { const x = run(s); return [h.usd(s), h.usd(Math.min(s, cap)), h.usd(employeePayroll(s).oasdi), h.usd(x.pia, 2), h.pct(x.pia / maxPia, 1), h.usd(at(x.pia, 804))]; });
      return `
<h2>The ceiling on what counts</h2>
<p>Social Security tax and Social Security credit share one limit, the ${h.src('ssaCbb', 'contribution and benefit base')}: ${h.usd(cap)} for 2026, up from ${h.usd(P.series.taxable_max['2025'])} in 2025. Each past year had its own base, and the ${h.src('cfr404_211', 'AIME rules')} ignore anything above it before indexing. A worker who always earned at or above the base therefore has the highest possible AIME, ${h.usd(P.max_benefit_2026.aime62)} for those turning 62 in 2026, and the highest PIA, ${h.usd(maxPia, 2)}, as the ${h.src('ssaMaxExample', 'SSA maximum-benefit example')} shows.</p>
${h.table(['Yearly pay', 'Counted in 2026', 'Employee Social Security tax', 'PIA', 'Share of the maximum PIA', 'At 67'], rows, 'Worker born in 1964, career from 22 to 62 at the same level against the average wage, 2026 formula', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The PIA flattens at the cap: the ${h.usd(250000)} and ${h.usd(400000)} careers end exactly where the ${h.usd(cap)} career does, and they pay exactly the same tax.</p>
<h2>Deep in the 15% bracket</h2>
<p>With an AIME of ${h.usd(r.aime)}, the ${h.usd(S)} career puts ${h.usd(r.aime - bp[1])} a month above the second bend point. That slice brings ${h.usd(r.parts[2], 2)}, about ${h.pct(r.parts[2] / r.pia, 0)} of the PIA; the 90% and 32% slices, identical for every career past ${h.usd(bp[1] * 12)}, bring the rest. This is why a career at ${h.usd(100000)} and one at the cap end only ${h.usd(maxPia - run(100000).pia)} a month apart at full retirement age, as the ${h.a('salary-100000', '$100,000 page')} also shows.</p>
<h2>The maximum, and why few reach it</h2>
<p>Reaching ${h.usd(maxPia, 2)} requires 35 years at or above the base, not just high pay at the end. A ${h.usd(S)} career that started late or included a few lean years falls further below, since each missing year removes a thirty-fifth of the average. Delaying is the remaining lever: from 70, the ${h.usd(S)} PIA pays ${h.usd(at(r.pia, 840))}, details on ${h.a('claiming-at-70', 'claiming at 70')}. The ${h.a('taxable-maximum', 'taxable maximum page')} lists the base for every year, and the ${h.a('maximum-benefit', 'maximum benefit page')} the published amounts by age.</p>
<h2>What the PIA means for a spouse</h2>
<p>A spouse who has little or no work record of their own can receive up to half the worker's PIA at the spouse's full retirement age: ${h.usd(spousalBenefit(r.pia, 0, 804, 804).total)} a month on this ${h.usd(S)} career. The spousal amount does not grow with delayed credits, but the worker's own benefit does, and after a death the survivor keeps the larger check, which is why a high earner's start age affects two lives.</p>`;
    },
  },
});
