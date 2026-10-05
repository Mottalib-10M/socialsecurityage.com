import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { benefitAtAge, computePia, familyMaximum, projectCareer } from '../../lib/engine/ss';

const S = 20000;
const b = { y: 1964, m: 6, d: 15 };
const run = (s: number) => computePia(b, projectCareer(b, s, 22, 62));
const r = run(S);
const bp = bendPoints(2026);
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const a62 = benefitAtAge(r.pia, 745, 804).benefit, a67 = benefitAtAge(r.pia, 804, 804).benefit, a70 = benefitAtAge(r.pia, 840, 804).benefit;
const share90 = r.parts[0] / (r.parts[0] + r.parts[1] + r.parts[2]);
const kink = bp[0] * 12;
const ssi = P.extra.ssi_2026;

export default definePage({
  id: 'salary-20000',
  group: 'salary',
  order: 20,
  mini: 'salaryBrackets',
  related: ['salary-35000', 'salary-50000', 'credits', 'fewer-than-35-years', 'average-benefit'],
  sources: ['frNotice2026', 'ssaBendPoints', 'ssaCredits', 'cfr404_212', 'ssaAwi'],
  en: {
    slug: 'social-security-on-20000-salary',
    nav: '$20,000 salary',
    card: `Low pay, high return: a ${$(S)} career gets back ${Math.round(r.pia * 12 / S * 100)}% of its pay at 67, mostly through the 90% bracket.`,
    title: `Social Security on a $20,000 Salary: ${$(a67)} a Month in 2026`,
    description: `Social Security on a $20,000 salary under 2026 rules: ${Math.round(share90 * 100)}% of the PIA comes from the 90% bracket, so the check at 67, ${$(a67)} a month, replaces ${Math.round(r.pia * 12 / S * 100)}% of pay.`,
    h1: 'Social Security for a career at $20,000 a year',
    intro: 'At this pay level the formula is at its most generous: nine dimes of each early dollar of average earnings come back.',
    resume: `A career at ${$(S)} a year in today's money, from 22 to 62, gives average indexed monthly earnings of ${$(r.aime)}, only ${$(r.aime - bp[0])} above the first bend point of ${$(bp[0])}. The 2026 formula turns the first ${$(bp[0])} into ${$(r.parts[0], 2)} at 90% and the small remainder into ${$(r.parts[1], 2)} at 32%, for a primary insurance amount of ${$(r.pia, 2)}: ${Math.round(share90 * 100)}% of it comes from the top-rate slice. For a worker born in 1964 that pays ${$(a62)} a month from 62 and 1 month, ${$(a67)} at the full retirement age of 67 and ${$(a70)} at 70. At 67 the yearly benefit equals ${Math.round(r.pia * 12 / S * 100)}% of the old salary, a replacement rate far above what middle and high earners get. Qualifying is not the obstacle: ${$(S)} earns the maximum of ${P.credits.max_per_year} credits every year, so the ${P.credits.needed_retirement} credits needed are reached after ten years.`,
    faqs: [
      { q: 'Does a $20,000 job earn a full year of Social Security credits?', a: `Yes. In 2026 one credit is earned for each ${$(P.credits.qc_amount)} of covered pay, with a cap of ${P.credits.max_per_year} a year. Any pay of ${$(P.credits.qc_amount * P.credits.max_per_year)} or more gives the four, so ${$(S)} earns them all, even if it is all paid in a few months.` },
      { q: 'Below what yearly pay does only the 90% rate apply?', a: `About ${$(kink)} in today's dollars for a full 35-year career, the first bend point of ${$(bp[0])} times twelve. Under that, every dollar of AIME is replaced at 90%. Above it, the next dollars are replaced at 32%, which is where a ${$(S)} career starts to be.` },
      { q: 'Is Social Security on $20,000 more or less than SSI?', a: `The 2026 federal SSI maximum is ${$(ssi.individual)} a month for one person and ${$(ssi.couple)} for a couple, against ${$(a67)} of Social Security at 67 for this career. SSI is a separate, needs-based program: whether someone qualifies depends on income and resources, which this calculator does not assess.` },
      { q: 'Would part-time years drag a $20,000 benefit down much?', a: `Less than for higher earners, because the 90% slice is protected. A record with only 25 years at ${$(S)} still gives a PIA of ${$(computePia(b, projectCareer(b, S, 37, 62)).pia, 2)}, against ${$(r.pia, 2)} for 40 years. The missing years mostly cut into the small 32% part.` },
    ],
    body: (h) => {
      const rows = [12000, kink, S, 25000, 30000].map((s) => { const x = run(s); return [h.usd(s), h.usd(x.aime), h.usd(x.pia, 2), h.pct(x.parts[0] / Math.max(1, x.parts[0] + x.parts[1] + x.parts[2]), 0), h.pct(benefitAtAge(x.pia, 804, 804).benefit * 12 / s, 0)]; });
      return `
<h2>The 90% slice does most of the work</h2>
<p>The formula in ${h.src('cfr404_212', '20 CFR 404.212')} replaces the first ${h.usd(bp[0])} of average monthly earnings at 90%. A career at ${h.usd(S)} produces an AIME of ${h.usd(r.aime)}, so ${h.usd(bp[0])} of it is in that slice and only ${h.usd(r.aime - bp[0])} spills into the 32% one. That is why the PIA, ${h.usd(r.pia, 2)}, is ${h.pct(r.pia / r.aime, 0)} of the AIME; for the ${h.a('salary-50000', '$50,000 career')} the same ratio is far lower.</p>
<h2>Replacement rates at the bottom of the scale</h2>
${h.table(['Yearly pay (today\'s dollars)', 'AIME', 'PIA', 'Share from the 90% slice', 'Replaced at 67'], rows, 'Worker born in 1964, career from 22 to 62, 2026 formula', ['l', 'r', 'r', 'r', 'r'])}
<p>The second line marks the pay at which the AIME equals the first bend point. Below it every additional dollar earned over a career is worth 90 cents of AIME at retirement; above it, 32 cents. The replacement rate falls steadily as pay rises, yet even at ${h.usd(30000)} it is still ${h.pct(benefitAtAge(run(30000).pia, 804, 804).benefit * 12 / 30000, 0)} at 67.</p>
<h2>Where the low-wage estimate can mislead</h2>
<p>The model assumes ${h.usd(S)} of today's pay every year, scaled back with the ${h.src('ssaAwi', 'average wage index')}. Real low-wage careers are rarely that steady: years of unemployment, informal work or caregiving leave zeros, and zeros hurt even inside the 90% bracket. Each empty year removes a thirty-fifth of the average. The ${h.a('fewer-than-35-years', 'page on shorter careers')} shows the effect, and the ${h.a('average-benefit', 'average benefit page')} puts these amounts next to what retirees actually receive.</p>
<p>Two other programs sit near this income level. Supplemental Security Income, whose federal maximum for 2026 is ${h.usd(ssi.individual)} a month (${h.usd(ssi.couple)} for a couple, per the ${h.src('frNotice2026', 'SSA notice of November 2025')}), is means-tested and not computed here. Medicare starts at ${P.extra.medicare_age.first_eligible} regardless of pay; when its standard Part B premium of ${h.usd(P.medicare.part_b_2026, 2)} is taken from the benefit, it is a bigger bite of a ${h.usd(a67)} check than of a large one.</p>
<h2>Protection for the family on this record</h2>
<p>The same PIA anchors benefits for others. A spouse with no record of their own can receive up to half of it, ${h.usd(r.pia * P.family.spouse_max, 2)}, at the spouse's full retirement age, and a widow or widower at survivor full age gets the worker's full benefit. The family maximum on this record is ${h.usd(familyMaximum(r.pia), 2)}, ${h.pct(familyMaximum(r.pia) / r.pia, 0)} of the PIA: the worker plus a spouse at half already reach it, so a child added to the claim would not raise the family total.</p>`;
    },
  },
});
