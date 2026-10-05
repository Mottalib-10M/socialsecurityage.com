import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { benefitAtAge, computePia, fraRetirement, fraSurvivor, projectCareer, spousalBenefit, survivorBenefit } from '../../lib/engine/ss';

const Y = 1962;
const fra = fraRetirement(Y);
const sfra = fraSurvivor(Y);
const sPrev = fraSurvivor(Y - 1);
const bp = bendPoints(Y + 62);
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const run = (s: number) => { const b = { y: Y, m: 6, d: 15 }; return computePia(b, projectCareer(b, s, 22, 62)); };
const ex = run(70000);
const w60 = survivorBenefit({ deceasedPia: ex.pia, deceasedClaimMonths: null, deceasedFraMonths: fra.total, survivorClaimMonths: 720, survivorFraMonths: sfra.total });

export default definePage({
  id: 'born-1962',
  group: 'birthyear',
  order: 1962,
  mini: 'fraByYear',
  miniHref: 'full-retirement-age',
  related: ['born-1961', 'born-1963', 'survivor-calculator', 'full-retirement-age', 'pia'],
  sources: ['cfr404_409', 'cfr404_410', 'ssaBendPoints', 'ssaColaSeries', 'ssaSurvivor'],
  en: {
    slug: 'social-security-born-in-1962',
    nav: 'Born in 1962',
    card: 'One full retirement age at last: 67 for your own benefit and 67 as a survivor. Formula of 2024, two COLAs already added.',
    title: 'Born in 1962: Social Security at 64 in 2026, One Full Age 67',
    description: `Born in 1962, 64 in 2026: 67 is both your retirement and survivor full age. Your PIA uses the 2024 bend points (${$(bp[0])}, ${$(bp[1])}) plus the COLAs of 2024 and 2025.`,
    h1: 'Social Security for the 1962 cohort, at 64 in 2026',
    intro: 'For the first time, the widow table and the worker table give the same answer: 67.',
    resume: `If you were born in 1962 (January 2, 1962 to January 1, 1963), 67 is your full retirement age for every kind of benefit. The worker table in 20 CFR 404.409 reached 67 with 1960 births, but the survivor table, which runs two years behind, only reaches it with yours: people born in 1961 still have a survivor full age of ${sPrev.years} and ${sPrev.months} months. You turned 62 in 2024, so your PIA is computed with the 2024 bend points, ${$(bp[0])} and ${$(bp[1])}, on earnings indexed to the 2022 average wage of ${P.series.awi['2022'].toLocaleString('en-US')}, then raised by ${P.series.cola['2024']}% for December 2024 and ${P.series.cola['2025']}% for December 2025. In 2026 you are 64; full retirement age arrives in 2029 and the last delayed credit in 2032. A career at $70,000 in today's pay gives a PIA of ${$(ex.pia, 2)}, paid ${$(benefitAtAge(ex.pia, 768, fra.total).benefit)} a month if started at 64.`,
    faqs: [
      { q: 'Born in 1962 and widowed, at what age is the survivor benefit unreduced?', a: `At 67, the same as your own full retirement age. You can start earlier, from 60, with a reduction of up to ${Math.round(P.reduction.widow_max * 1000) / 10}% spread over the 84 months between 60 and 67. Each month closer to 67 shrinks the cut by about a third of a percentage point.` },
      { q: 'Is 64 too early to start retirement benefits for a 1962 birth?', a: `It is allowed; the cost is a permanent cut of 36 months times 5/9 of 1%, exactly 20%. On a PIA of ${$(ex.pia, 2)}, that means ${$(benefitAtAge(ex.pia, 768, fra.total).benefit)} instead of ${$(benefitAtAge(ex.pia, fra.total, fra.total).benefit)} at 67. Earnings above the annual limit would also cause withholding until 2029.` },
      { q: 'Which two COLAs are already in my PIA if I was born in 1962?', a: `The ${P.series.cola['2024']}% increase effective December 2024 and the ${P.series.cola['2025']}% increase effective December 2025. Both count because COLAs start in the year you turn 62, 2024 for you, even if no benefit is being paid yet. Earlier increases, including ${P.series.cola['2022']}% for 2022, belong to older cohorts.` },
      { q: 'Does an earnings record indexed to 2022 favor people born in 1962?', a: `It helps those with strong pay before 2022, because each earlier year is multiplied by the ratio of the 2022 average wage, ${$(P.series.awi['2022'], 2)}, to that year's figure. Years from 2022 on enter at face value. The formula year and the indexing year move together, so the index alone does not make one cohort richer than the next.` },
    ],
    body: (h) => {
      const rows = [25000, 45000, 70000, 100000, 140000].map((s) => { const x = run(s); return [h.usd(s), h.usd(x.aime), h.usd(x.piaAtEligibility, 2), h.usd(x.pia, 2), h.usd(benefitAtAge(x.pia, 768, fra.total).benefit), h.usd(benefitAtAge(x.pia, fra.total, fra.total).benefit)]; });
      return `
<h2>The survivor schedule catches up</h2>
<p>The two full-age tables of ${h.src('cfr404_409', '20 CFR 404.409')} were built two years apart, so for every cohort from 1955 to 1961 the survivor age was lower than the retirement age. With 1962 births they converge. A widow or widower born in 1962 who starts a survivor benefit at 60 receives ${h.pct(1 - P.reduction.widow_max)} of the deceased's amount, the reduction being spread over 84 months instead of 82 for 1961 (${h.src('cfr404_410', '20 CFR 404.410')}). On our ${h.usd(70000)} example, that is ${h.usd(w60.benefit)} at 60 against ${h.usd(ex.pia, 0)} at 67.</p>
<h2>Five careers on the 2024 formula</h2>
<p>The table runs careers from 22 to 62, each kept at the same level against the national average wage, through the 2024 bend points of ${h.usd(bp[0])} and ${h.usd(bp[1])} (${h.src('ssaBendPoints', 'SSA')}), then adds the two COLAs since. The last two columns show the monthly benefit at 64, your age now, and at 67.</p>
${h.table(['Career pay', 'AIME', 'PIA 2024', 'PIA 2026', 'Start at 64', 'Start at 67'], rows, 'Born in 1962. Amounts rounded down to the dollar, before COLAs after December 2025', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Two features stand out. The lowest career keeps the highest share of its pay, because its whole AIME sits near the 90% slice. And the gap between 64 and 67 is the same 20% at every pay level: the reduction is a percentage of the PIA, not a fixed amount. The ${h.a('pia', 'PIA guide')} breaks down each slice.</p>
<h2>Calendar for a 1962 birth</h2>
<ul>
<li>2024: age 62, formula year, first COLA (${P.series.cola['2024']}%) credited at year end.</li>
<li>2026: age 64; earnings test limit ${h.usd(P.earnings_test.lower_annual)} if collecting while working.</li>
<li>${Y + P.extra.medicare_age.first_eligible}: age ${P.extra.medicare_age.first_eligible}, Medicare eligibility.</li>
<li>2029: age 67, full retirement age for retirement, spouse and survivor benefits.</li>
<li>2032: age 70, last month of delayed credits, ${h.pct(benefitAtAge(1, 840, fra.total).factor)} of the PIA.</li>
</ul>
<p>Exact months depend on your birthday; the ${h.a('full-retirement-age', 'full retirement age calculator')} gives them to the day.</p>
<h2>A spouse born in 1962</h2>
<p>Spouse benefits use the retirement full age, 67, but a steeper reduction: 25/36 of 1% for each of the first 36 months early. A spouse with no record of their own who starts at 64 receives ${h.pct(spousalBenefit(ex.pia, 0, 768, fra.total).reducedExcess / ex.pia, 1)} of the worker's PIA instead of 50%, or ${h.usd(spousalBenefit(ex.pia, 0, 768, fra.total).total)} a month on our ${h.usd(70000)} example. Spouse benefits earn no delayed credits after 67.</p>`;
    },
  },
});
