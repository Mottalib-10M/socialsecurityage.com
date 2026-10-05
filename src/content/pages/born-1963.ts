import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { benefitAtAge, computePia, earningsTest, fraRetirement, projectCareer } from '../../lib/engine/ss';

const Y = 1963;
const fra = fraRetirement(Y);
const bp = bendPoints(Y + 62);
const bpNext = bendPoints(Y + 63);
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const run = (y: number, s: number) => { const b = { y, m: 6, d: 15 }; return computePia(b, projectCareer(b, s, 22, 62)); };
const ex = run(Y, 55000);
const cola = P.cola_2026.pct;

export default definePage({
  id: 'born-1963',
  group: 'birthyear',
  order: 1963,
  mini: 'birthColaLadder',
  miniHref: 'benefits-calculator',
  related: ['born-1962', 'born-1964', 'cola-2026', 'claiming-at-62', 'bend-points'],
  sources: ['frNotice2026', 'ssaBendPoints', 'ssaColaSeries', 'cfr404_212', 'cfr404_409'],
  en: {
    slug: 'social-security-born-in-1963',
    nav: 'Born in 1963',
    card: `Eligible since 2025: your PIA already includes the ${cola}% COLA of December 2025, claimed or not. Full retirement age 67 in 2030.`,
    title: `Born in 1963: Social Security in 2026 With the ${cola}% COLA`,
    description: `Born in 1963, 63 in 2026: you turned 62 in 2025, so the ${cola}% COLA of December 2025 is in your PIA even unclaimed. Bend points ${$(bp[0])} and ${$(bp[1])}; 67 in 2030.`,
    h1: 'Social Security if you were born in 1963',
    intro: 'One year of eligibility already behind you, and with it your first cost-of-living increase.',
    resume: `People born in 1963 (January 2, 1963 to January 1, 1964) became eligible for retirement benefits in 2025, the year they turned 62. That single fact fixes two things. Their primary insurance amount is computed with the 2025 bend points, ${$(bp[0])} and ${$(bp[1])}, on earnings indexed to the 2023 national average wage of ${P.series.awi['2023'].toLocaleString('en-US')}. And their PIA received the ${cola}% cost-of-living adjustment effective December 2025, payable from January 2026, whether or not they have filed: COLAs start with the year of eligibility, not with the first payment. In 2026 this cohort is 63, with a full retirement age of 67 reached in 2030 and delayed credits until 70, in 2033. A career at ${$(55000)} in today's pay produced a PIA of ${$(ex.piaAtEligibility, 2)} in 2025, now ${$(ex.pia, 2)}. Started at 63 that pays ${$(benefitAtAge(ex.pia, 756, fra.total).benefit)} a month; at 67, ${$(benefitAtAge(ex.pia, fra.total, fra.total).benefit)}.`,
    faqs: [
      { q: 'I was born in 1963 and have not filed. Why does my estimate include the 2026 COLA?', a: `Because the law raises the PIA itself, not the payment. Your PIA was first computed for 2025, and the ${cola}% adjustment applied from December 2025 to everyone eligible by then. When you file at 64, 67 or 70, the benefit is computed from that higher PIA, with any later COLAs added on top.` },
      { q: 'Would I be better off born a year later, under the 2026 bend points?', a: `Slightly, for most careers. The 2026 points, ${$(bpNext[0])} and ${$(bpNext[1])}, are higher, but your record is indexed to 2023 wages instead of 2024, and you already have one COLA the 1964 cohort does not. For steady careers the 1964 cohort still ends slightly ahead, as the comparison table shows.` },
      { q: 'At 63, how many months early is a claim for someone born in 1963?', a: `Forty-eight months before 67, so the reduction is 36 months at 5/9 of 1% plus 12 months at 5/12 of 1%, a cut of 25%. The check would be 75% of the PIA for life, with COLAs added each December.` },
      { q: 'Can my 1963 benefit be recomputed if I keep working?', a: 'Yes. Earnings from 2023, the year you turned 60, count at face value. If a future year of pay is higher than one of the 35 in your average, the SSA recomputes the PIA, still with the 2025 formula, and adds every COLA since 2025 to the result.' },
    ],
    body: (h) => {
      const rows = [30000, 55000, 80000, 120000, 180000].map((s) => { const a = run(Y, s), c = run(Y + 1, s); return [h.usd(s), h.usd(a.piaAtEligibility, 2), h.usd(a.pia, 2), h.usd(c.pia, 2), h.usd(a.pia - c.pia, 2)]; });
      return `
<h2>A COLA you received without claiming</h2>
<p>Under the ${h.src('cfr404_212', 'PIA rules')} the formula is applied once, in the year of eligibility, and the result is then raised by each cost-of-living adjustment. The ${h.src('frNotice2026', 'SSA notice for 2026')} set that adjustment at ${cola}%, effective December 2025. Since 1963 births were eligible in 2025, it applies to their PIA. Nobody born in 1964 gets it: they are computed fresh under the 2026 formula. More on the increase on the ${h.a('cola-2026', 'COLA page')}.</p>
<h2>1963 and 1964 side by side</h2>
<p>Same careers in today's pay, two formula years. The 1963 column uses the 2025 bend points and the 2023 index and then adds ${cola}%; the 1964 column uses the 2026 bend points and the 2024 index, with no COLA yet.</p>
${h.table(['Career pay', 'Born 1963: PIA 2025', 'Born 1963: PIA 2026', 'Born 1964: PIA 2026', 'Gap'], rows, 'PIA rounded down to the dime. Negative gap: the 1964 cohort is ahead', ['l', 'r', 'r', 'r', 'r'])}
<p>The wage index grew ${h.pct(P.series.awi['2024'] / P.series.awi['2023'] - 1)} in 2024, faster than the ${cola}% COLA, which is why the younger cohort comes out slightly ahead on these steady careers. A real record with a different shape can tip the other way. The ${h.a('bend-points', 'bend points page')} explains the mechanism.</p>
<h2>Three ages ahead</h2>
<p>At 63 in 2026, the remaining milestones are Medicare eligibility at ${P.extra.medicare_age.first_eligible} in ${Y + P.extra.medicare_age.first_eligible}, full retirement age 67 in 2030 (${h.src('cfr404_409', '20 CFR 404.409')}), and 70 in 2033, when the benefit tops out at ${h.pct(benefitAtAge(1, 840, fra.total).factor)} of the PIA. Survivor benefits for a 1963 birth share the same full age, 67. Anyone weighing an early start can compare the options on ${h.a('claiming-at-62', 'claiming at 62')}: for this cohort, each month waited between 63 and 64 adds 5/12 of 1% back to the check.</p>
<h2>A job and a benefit at 63</h2>
<p>Before full retirement age, the ${h.a('earnings-test', 'earnings test')} applies to every month of the year. With ${h.usd(P.earnings_test.lower_annual)} as the 2026 limit, a person who starts at 63 and earns ${h.usd(45000)} sees ${h.usd(earningsTest(benefitAtAge(ex.pia, 756, fra.total).benefit, 45000, 'before').withheld)} withheld, about ${earningsTest(benefitAtAge(ex.pia, 756, fra.total).benefit, 45000, 'before').monthsWithheld} monthly payments on our example. At 67 the SSA adds those months back by recomputing the reduction, so the check rises from then on.</p>`;
    },
  },
});
