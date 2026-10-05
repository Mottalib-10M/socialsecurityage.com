import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { benefitAtAge, computePia, earningsTest, fraRetirement, fraSurvivor, projectCareer } from '../../lib/engine/ss';

const Y = 1961;
const fra = fraRetirement(Y);
const sfra = fraSurvivor(Y);
const bp = bendPoints(Y + 62);
const bpPrev = bendPoints(Y + 61);
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pc = (x: number) => `${(x * 100).toFixed(1)}%`;
const jump = bp[0] / bpPrev[0] - 1;
const wage = P.series.awi['2021'] / P.series.awi['2020'] - 1;
const pia = (y: number, s: number) => { const b = { y, m: 6, d: 15 }; return computePia(b, projectCareer(b, s, 22, 62)); };
const ex = pia(Y, 60000);
const since = Math.max(...Object.keys(P.series.awi).map(Number).filter((y) => y < 2021 && P.series.awi[String(y - 1)] && P.series.awi[String(y)] / P.series.awi[String(y - 1)] - 1 >= wage));
const medicare = P.extra.medicare_age.first_eligible;

export default definePage({
  id: 'born-1961',
  group: 'birthyear',
  order: 1961,
  mini: 'birthColaLadder',
  miniHref: 'benefits-calculator',
  related: ['born-1960', 'born-1962', 'bend-points', 'average-wage-index', 'medicare-part-b'],
  sources: ['ssaBendPoints', 'ssaAwi', 'ssaColaSeries', 'cfr404_409', 'ssaMedicareSignup', 'cmsPartB'],
  en: {
    slug: 'social-security-born-in-1961',
    nav: 'Born in 1961',
    card: `Indexed to the 2021 wage surge, with bend points up ${pc(jump)} in one year. Medicare at 65 in 2026, full retirement age 67 in 2028.`,
    title: 'Born in 1961: Social Security in 2026, Medicare at 65 First',
    description: `Born in 1961: your PIA uses the 2023 bend points, up ${pc(jump)} after the 2021 wage surge. Medicare at 65 in 2026, full retirement age 67 in 2028, survivor 66+10.`,
    h1: 'Social Security for people born in 1961',
    intro: 'Your formula was written in a year of unusually fast wage growth, and Medicare arrives before Social Security does.',
    resume: `If you were born in 1961 (January 2, 1961 to January 1, 1962), you turned 62 in 2023, so your primary insurance amount uses the 2023 bend points, ${$(bp[0])} and ${$(bp[1])}. Those amounts jumped ${pc(jump)} over 2022 because they follow the national average wage index of 2021, which rose ${pc(wage)} to ${P.series.awi['2021'].toLocaleString('en-US')}; your own earnings were indexed to that same 2021 level. You missed the ${P.series.cola['2022']}% COLA of December 2022, which went only to people eligible by 2022, but received the three increases since: ${P.series.cola['2023']}%, ${P.series.cola['2024']}% and ${P.series.cola['2025']}%. Full retirement age is 67, in 2028; the survivor full age is ${sfra.years} and ${sfra.months} months. In 2026 you turn ${medicare}, the Medicare age, while any Social Security started now is still reduced for age. A career at $60,000 in today's pay gives a PIA of ${$(ex.pia, 2)}.`,
    faqs: [
      { q: 'I turn 65 in 2026. Do I have to start Social Security to get Medicare?', a: `No. Medicare eligibility at ${medicare} does not depend on claiming retirement benefits. The standard Part B premium is ${$(P.medicare.part_b_2026, 2)} a month in 2026; as long as you are not collecting Social Security, it cannot be taken out of a benefit check and has to be paid another way.` },
      { q: 'Were people born in 1961 hurt by missing the 8.7% COLA?', a: `Less than it seems. The cohort born in 1960 received ${P.series.cola['2022']}% on a 2022 PIA; yours was computed a year later with bend points ${pc(jump)} higher and earnings indexed to a much higher 2021 wage level. For steady careers the two routes end within a few dollars of each other in 2026.` },
      { q: 'How much is lost by claiming at 65 instead of 67 if I was born in 1961?', a: `Twenty-four months early means 24 times 5/9 of 1%, a 13.3% cut. On a PIA of ${$(ex.pia, 2)}, that is ${$(benefitAtAge(ex.pia, 780, fra.total).benefit)} a month at 65 against ${$(benefitAtAge(ex.pia, fra.total, fra.total).benefit)} at 67, both before future COLAs. The reduction is permanent, but it can be undone within ${P.claiming.withdraw_within_months} months by withdrawing the claim and repaying everything.` },
      { q: 'What changed in the bend points between 2022 and 2023?', a: `The first went from ${$(bpPrev[0])} to ${$(bp[0])} and the second from ${$(bpPrev[1])} to ${$(bp[1])}. Both follow the wage index two years earlier, and 2021 wages grew ${pc(wage)}, the fastest rise since ${since}. The family maximum bend points moved by the same proportion.` },
    ],
    body: (h) => {
      const rows = [30000, 50000, 75000, 120000].map((s) => { const a = pia(1960, s), c = pia(Y, s); return [h.usd(s), h.usd(a.piaAtEligibility, 2), h.usd(a.pia, 2), h.usd(c.piaAtEligibility, 2), h.usd(c.pia, 2)]; });
      return `
<h2>Indexed to a year of wage surge</h2>
<p>Each cohort's earnings are scaled to the average wage of the year it turns 60. For 1961 births that year was 2021, when the ${h.src('ssaAwi', 'national average wage index')} rose from ${h.num(P.series.awi['2020'], 2)} to ${h.num(P.series.awi['2021'], 2)}. The bend points of 2023, built from the same index, rose in step (${h.src('ssaBendPoints', 'SSA bend point history')}). The effect is that an earnings record of the 1990s and 2000s is worth more in 1961 dollars than in 1960 dollars.</p>
<h2>1960 against 1961: two paths to the same check</h2>
<p>The table runs identical careers, expressed in today's pay, through both formula years. The 1960 cohort starts lower and catches up with the ${P.series.cola['2022']}% COLA; the 1961 cohort starts higher with the 2023 formula and receives only the adjustments from December 2023.</p>
${h.table(['Career pay (today\'s dollars)', 'Born 1960: PIA 2022', 'Born 1960: PIA 2026', 'Born 1961: PIA 2023', 'Born 1961: PIA 2026'], rows, 'PIA rounded down to the dime, COLAs through December 2025', ['l', 'r', 'r', 'r', 'r'])}
<p>The near tie is not an accident. Bend points follow wages and COLAs follow prices; in 2021 and 2022 both rose fast, one feeding the 1961 formula, the other the 1960 benefits. The ${h.a('bend-points', 'bend points guide')} shows the full series.</p>
<h2>Medicare first, full Social Security in 2028</h2>
<p>At ${medicare}, in 2026, you can enroll in Medicare (${h.src('ssaMedicareSignup', 'SSA, when to sign up for Medicare')}). Full retirement age comes two years later, so a retirement benefit started this year is reduced by ${h.pct(1 - benefitAtAge(1, 780, fra.total).factor)} if it starts at exactly 65. The two decisions are separate. The premium question is covered on ${h.a('medicare-part-b', 'Medicare premium deducted from Social Security')}.</p>
<p>A widow or widower born in 1961 reaches the survivor full age at ${sfra.years} and ${sfra.months} months, two months before the retirement one; survivor benefits are available from 60, which this cohort reached in 2021.</p>
<h2>Collecting at 65 while still employed</h2>
<p>Anyone in this cohort who starts benefits in 2026 and keeps a job is under the ${h.a('earnings-test', 'retirement earnings test')} for the full year: ${h.usd(P.earnings_test.lower_annual)} of wages are free, then half of the excess is withheld. On a ${h.usd(40000)} salary, that means ${h.usd(earningsTest(1000, 40000, 'before').withheld)} held back over the year. The withheld months are not lost; at 67 the benefit is recalculated to credit them.</p>`;
    },
  },
});
