import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { piaFromAime } from '../../lib/engine/ss';

const bp26 = bendPoints(2026);
const $ = (n: number) => `$${n.toLocaleString('en-US')}`;

export default definePage({
  id: 'bend-points',
  group: 'formula',
  order: 20,
  mini: 'bendSplit',
  related: ['aime', 'pia', 'average-wage-index', 'benefits-calculator', 'born-1964'],
  sources: ['frNotice2026', 'ssaBendPoints', 'cfr404_212', 'ssaRetireExample'],
  en: {
    slug: 'social-security-bend-points',
    nav: 'Bend points 2026',
    card: `The two dollar amounts, ${$(bp26[0])} and ${$(bp26[1])}, that split your AIME into the 90%, 32% and 15% brackets.`,
    title: `Bend Points 2026: ${$(bp26[0])} and ${$(bp26[1])} in the PIA Formula`,
    description: `Social Security bend points for 2026 are ${$(bp26[0])} and ${$(bp26[1])}: how they split your AIME at 90%, 32% and 15%, which year's points apply to you, and the full table.`,
    h1: 'Social Security bend points in 2026, and which year applies to you',
    intro: 'Two numbers decide how much of your average pay the PIA formula gives back. They change every year, but yours are frozen the year you turn 62.',
    resume: `The 2026 bend points are ${$(bp26[0])} and ${$(bp26[1])}. They apply to workers who turn 62 in 2026, become disabled in 2026 or die before 62 in 2026: the primary insurance amount is 90% of the first ${$(bp26[0])} of average indexed monthly earnings, plus 32% of the AIME between ${$(bp26[0])} and ${$(bp26[1])}, plus 15% of the AIME above ${$(bp26[1])}, rounded down to the dime. The SSA obtains them by multiplying the 1979 amounts, ${$(bendPoints(1979)[0])} and ${$(bendPoints(1979)[1])}, by the ratio of the 2024 national average wage index (${P.series.awi['2024'].toLocaleString('en-US')}) to the 1977 index (${P.series.awi['1977'].toLocaleString('en-US')}), as published in the Federal Register on November 3, 2025. Someone who turned 62 in 2025 keeps the 2025 points, ${$(bendPoints(2025)[0])} and ${$(bendPoints(2025)[1])}, for life; only cost-of-living adjustments move their PIA afterwards.`,
    faqs: [
      { q: 'Why are they called bend points?', a: `Plot the PIA against the AIME and you get three straight segments: steep at 90%, flatter at 32%, nearly flat at 15%. The line bends at ${$(bp26[0])} and ${$(bp26[1])}, hence the name. The shape is what makes Social Security progressive: the first dollars of average pay are replaced at a much higher rate than the last ones.` },
      { q: 'I turned 62 in 2023. Do the 2026 bend points raise my benefit?', a: `No. Your formula was fixed with the 2023 bend points, ${$(bendPoints(2023)[0])} and ${$(bendPoints(2023)[1])}. Since then your PIA has risen only through the cost-of-living adjustments for 2023, 2024 and 2025. New bend points only matter to people who become eligible in a later year.` },
      { q: 'Do bend points follow inflation or wages?', a: `Wages. Each year's points equal the 1979 points multiplied by the growth of the national average wage index between 1977 and the year two years before eligibility. After eligibility, the PIA follows prices through COLAs, which is why the formula year and the COLA years are two different things.` },
      { q: 'How much does an extra $100 of AIME add to my PIA?', a: `It depends on your bracket. Below ${$(bp26[0])}, $100 more AIME adds $90 a month; between the two bend points it adds $32; above ${$(bp26[1])} it adds $15. That is why raising a low AIME, for example by replacing a zero year, pays off much more than adding to an already high one.` },
      { q: 'Are there bend points for the family maximum too?', a: `Yes, three of them for 2026: ${$(bp26[2])}, ${$(bp26[3])} and ${$(bp26[4])}. They apply to the worker's PIA, not to the AIME, and cap the total paid to a family on one record at 150%, 272%, 134% and 175% of the successive PIA brackets.` },
    ],
    body: (h) => {
      const years = [2016, 2018, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
      const rows = years.map((y) => { const b = bendPoints(y); return [String(y), h.usd(b[0]), h.usd(b[1]), h.usd(piaFromAime(4000, y), 2), h.usd(piaFromAime(9000, y), 2)]; });
      const lo = piaFromAime(bp26[0]), mid = piaFromAime(bp26[1]);
      return `
<h2>How the 2026 bend points were set</h2>
<p>The Social Security Act fixes the 1979 formula at ${h.usd(bendPoints(1979)[0])} and ${h.usd(bendPoints(1979)[1])} and tells the SSA to move both amounts each year with average wages. For 2026 the multiplier is the 2024 national average wage index divided by the 1977 index, ${h.num(P.series.awi['2024'] / P.series.awi['1977'], 4)}. Applied to ${h.usd(bendPoints(1979)[0])} it gives ${h.usd(bendPoints(1979)[0] * P.series.awi['2024'] / P.series.awi['1977'], 2)} and to ${h.usd(bendPoints(1979)[1])} it gives ${h.usd(bendPoints(1979)[1] * P.series.awi['2024'] / P.series.awi['1977'], 2)}, which round to ${h.usd(bp26[0])} and ${h.usd(bp26[1])}. The ${h.src('frNotice2026', 'SSA notice of November 3, 2025')} shows the arithmetic, and the ${h.src('ssaBendPoints', 'actuaries\' table')} lists every year back to 1979.</p>
<p>Because the multiplier is a wage index, bend points rise faster in years of strong pay growth. Between 2022 and 2023 the first bend point jumped from ${h.usd(bendPoints(2022)[0])} to ${h.usd(bendPoints(2023)[0])}, reflecting the wage surge of 2021; between 2025 and 2026 it moved from ${h.usd(bendPoints(2025)[0])} to ${h.usd(bp26[0])}.</p>

<h2>Your bend points are those of the year you turn 62</h2>
<p>The formula year is the year of first eligibility: 62 for retirement, earlier if you become disabled or die. The ${h.src('cfr404_212', 'regulation (20 CFR 404.212)')} is explicit that the formula of that year is used even if you only start benefits at 70. Starting later raises your check through delayed credits and COLAs, never through newer bend points. The table shows how the same AIME converts into a PIA under each formula year, before any COLA.</p>
${h.table(['Turns 62 in', 'First bend point', 'Second bend point', 'PIA for $4,000 AIME', 'PIA for $9,000 AIME'], rows, 'PIA at eligibility, before cost-of-living adjustments', ['l', 'r', 'r', 'r', 'r'])}
<p>A worker with ${h.usd(4000)} of AIME is in the 32% bracket under every formula above, while ${h.usd(9000)} reaches the 15% bracket. The 2026 version is not automatically more generous: what matters is the wage index used both to raise the bend points and to index your own earnings, which move together.</p>

<h2>Three brackets, three replacement rates</h2>
<h3>The 90% bracket</h3>
<p>The first ${h.usd(bp26[0])} of AIME is replaced at 90%, so an AIME exactly at the first bend point gives a PIA of ${h.usd(lo, 2)}. That level corresponds roughly to a career of full-time work at a low wage, or a shorter career at a middle wage. For people in this bracket, every additional year of earnings that replaces a zero is worth a lot.</p>
<h3>The 32% bracket</h3>
<p>Between the two points the rate falls to 32%. Most career workers have an AIME here: the SSA's own case A for 2026, a worker born in 1964 with steady middle earnings, has an AIME of ${h.usd(P.ssa_examples_2026.caseA.aime)} and a PIA of ${h.usd(P.ssa_examples_2026.caseA.pia, 2)}. At the second bend point the PIA reaches ${h.usd(mid, 2)}.</p>
<h3>The 15% bracket</h3>
<p>Above ${h.usd(bp26[1])} only 15 cents of each extra dollar of AIME reach the PIA. Combined with the taxable maximum, which stops counting pay above ${h.usd(P.taxable_max_2026)} in 2026, this is why the largest PIA for someone turning 62 in 2026 is ${h.usd(P.max_benefit_2026.pia62, 2)} even with maximum earnings every year since 22.</p>

<h2>Reading the formula backwards</h2>
<p>If you know your PIA from your SSA statement, the bend points let you find your AIME. With a 2026 formula, a PIA under ${h.usd(lo, 2)} means an AIME under ${h.usd(bp26[0])}: divide the PIA by 0.9. Between ${h.usd(lo, 2)} and ${h.usd(mid, 2)}, subtract ${h.usd(lo, 2)}, divide by 0.32 and add ${h.usd(bp26[0])}. This tells you which bracket an extra year of work would feed, and therefore whether working longer is worth much. The ${h.a('aime', 'AIME page')} explains how the average itself is built, and the ${h.a('average-wage-index', 'wage index page')} shows the factor applied to each year.</p>

<h2>Three mistakes people make with bend points</h2>
<p>The first is applying this year's points to a benefit already being paid. A retiree who started in 2022 sometimes reads that the 2026 points are higher and expects a raise; the 2022 formula stays, and only the COLAs move the check. The second is applying bend points to annual pay. They are monthly amounts, so the first one corresponds to about ${h.usd(bp26[0] * 12)} of average indexed pay over a year, not ${h.usd(bp26[0])}. The third is reading the 90% rate as a replacement rate for the whole career: it applies only to the first slice of the average, and a worker whose AIME sits in the 15% bracket gets back far less than half of past pay overall.</p>
<p>A fourth confusion concerns disability. A worker who becomes disabled at 50 in 2026 gets the 2026 formula too, because eligibility is the year of disability onset, not the year of the 62nd birthday. When that person reaches full retirement age, the disability benefit converts to a retirement benefit of the same amount, and the formula year does not change.</p>

<h2>Bend points and the family maximum</h2>
<p>A second formula, with its own three bend points (${h.usd(bp26[2])}, ${h.usd(bp26[3])} and ${h.usd(bp26[4])} for 2026), caps the total that can be paid on one worker's record to a spouse and children. It applies to the PIA rather than the AIME. Divorced spouses are paid outside that cap. The ${h.a('family-maximum', 'family maximum page')} runs the numbers.</p>`;
    },
  },
});
