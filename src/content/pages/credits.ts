import { definePage } from '../../lib/page-types';
import { P, awi } from '../../lib/engine/params';
import { creditsFor, selfEmploymentTax, computePia, projectCareer } from '../../lib/engine/ss';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const Q = P.credits.qc_amount, MAX = P.credits.max_per_year, NEED = P.credits.needed_retirement;
const X = P.extra.qc;
const raw = X.amount_1978 * awi(2024) / awi(1976);
const b = { y: 1964, m: 6, d: 15 };
const tenYears = computePia(b, projectCareer(b, 30000, 52, 62));

export default definePage({
  id: 'credits',
  group: 'formula',
  order: 70,
  mini: 'creditsCount',
  related: ['aime', 'fewer-than-35-years', 'self-employed', 'average-wage-index', 'how-much-will-i-get'],
  sources: ['ssaCredits', 'frNotice2026', 'cfr404_110', 'irsTc554', 'cfr404_211'],
  en: {
    slug: 'social-security-credits',
    nav: 'Credits',
    card: `${$(Q)} of earnings buys one credit in 2026, four at most a year. Forty credits open the right to retirement benefits; they do not set the amount.`,
    title: `Social Security Credits 2026: ${$(Q)} Each, 40 to Qualify`,
    description: `Social Security credits in 2026: one per ${$(Q)} of covered earnings, four a year at most (${$(Q * MAX)}), 40 needed for retirement. Up from ${$(X.amount_2025)} in 2025. Formula.`,
    h1: 'Social Security credits: how you earn them and what they do not do',
    intro: 'Credits are a door, not a meter. They decide whether you qualify; your earnings decide how much.',
    resume: `In 2026 you earn one Social Security credit, officially a quarter of coverage, for each ${$(Q)} of wages and net self-employment income, up to four credits a year, so ${$(Q * MAX)} of covered earnings fills the year. The amount was ${$(X.amount_2025)} in 2025. It is set each year by multiplying the 1978 amount of ${$(X.amount_1978)} by the ratio of the 2024 national average wage index to the 1976 index, which gives ${$(raw, 2)}, rounded to the nearest $${X.rounding}. Credits are counted on your total earnings for the year, not by calendar quarter: you can earn all four in January. You need ${NEED} credits, about ten years of work, to qualify for retirement benefits, and nobody needs more. Extra credits do not raise the benefit: the amount comes from your highest 35 years of indexed earnings, so a 40-credit record with low pay and a 160-credit record get very different checks.`,
    faqs: [
      { q: 'Can I earn all four credits in one month of 2026?', a: `Yes. Since 1978 credits are based on total covered earnings for the year, not on when you earned them. ${$(Q * MAX)} earned in January 2026, with nothing for the rest of the year, gives the same four credits as steady pay all year.` },
      { q: 'Do credits from years ago expire?', a: `No. Fully insured status counts quarters of coverage "whenever acquired" (20 CFR 404.110). Someone who earned 30 credits in their twenties and then stopped working can add the 10 missing ones decades later; at the 2026 rate that takes ${$(Q * 10)} of covered earnings spread over at least three years, since four is the yearly maximum.` },
      { q: 'Does self-employment income earn credits the same way?', a: `Yes, with one threshold. Self-employment tax applies only when net earnings reach ${$(P.payroll.se_min_net)}, and credits come from net earnings, which are 92.35% of net profit. A net profit of ${$(10000)} gives net earnings of ${$(10000 * P.payroll.se_net_factor)} and ${selfEmploymentTax(10000).credits} credits in 2026.` },
      { q: 'If I have 40 credits, what is my benefit?', a: `It depends on your earnings, not on the credits. Forty credits at minimum pay can produce a small benefit, because the 35-year average includes zeros for every year without earnings. Ten years at ${$(30000)} in today's pay, for a worker born in 1964, gives a PIA of about ${$(tenYears.pia)}.` },
      { q: 'Can my children get survivor benefits if I have fewer than 40 credits?', a: `Possibly. The SSA's credits page sets out a special rule: benefits can be paid to your children, and to your spouse caring for them, if you earned six credits in the three years before your death, even when the record is short of the usual number.` },
    ],
    body: (h) => {
      const amounts = [0, 1000, Q, 3000, 5000, Q * MAX, 20000].map((e) => [h.usd(e), String(creditsFor(e))]);
      const history = [['Before 1978', `one credit per calendar quarter with ${h.usd(X.pre1978_wage_per_quarter)} of wages; four for ${h.usd(X.pre1978_se_per_year)} of self-employment income in a year`], ['1978', `${h.usd(X.amount_1978)} of annual earnings per credit`], ['2025', h.usd(X.amount_2025)], ['2026', h.usd(Q)]];
      return `
<h2>From earnings to credits in 2026</h2>
<p>Divide your covered earnings for the year by ${h.usd(Q)}, drop the fraction, and stop at four. That is all the ${h.src('ssaCredits', 'SSA rule')} does:</p>
${h.table(['Covered earnings in 2026', 'Credits'], amounts, `${h.usd(Q)} per credit, ${MAX} at most per year`, ['r', 'r'])}
<p>Covered earnings means wages on which Social Security tax was withheld and net earnings from self-employment. Investment income, pensions and pay from jobs outside the system, such as some state and local positions with their own retirement plan, do not count. Earnings above ${h.usd(Q * MAX)} add no credits, but they still raise your record up to the ${h.a('taxable-maximum', 'taxable maximum')} and therefore your benefit.</p>

<h2>Where ${h.usd(Q)} comes from</h2>
<p>The ${h.src('frNotice2026', 'Federal Register notice of November 3, 2025')} gives the computation. Section 213(d) of the Social Security Act takes the 1978 amount, ${h.usd(X.amount_1978)}, and scales it by wage growth:</p>
<ol>
<li>${h.usd(X.amount_1978)} × ${h.usd(awi(2024), 2)} (wage index 2024) ÷ ${h.usd(awi(1976), 2)} (wage index 1976) = ${h.usd(raw, 2)}.</li>
<li>Rounded to the nearest multiple of $${X.rounding}: ${h.usd(Q)}.</li>
<li>${h.usd(Q)} is larger than the current amount, ${h.usd(X.amount_2025)}, so it applies for 2026.</li>
</ol>
<p>Like the taxable maximum, the credit amount cannot fall: the law takes the larger of the formula result and the current figure. It follows the ${h.a('average-wage-index', 'average wage index')}, which is why it rose ${h.pct(Q / X.amount_2025 - 1)} for 2026.</p>

<h2>The amounts we can confirm</h2>
${h.table(['Year', 'Earnings for one credit'], history, 'Values stated in the SSA notice for 2026', ['l', 'l'])}
<p>We list only figures stated in that official notice. The amounts for the years in between are published in the SSA's annual notices; your own credits for those years are already on your earnings record, which you can read in your my Social Security account.</p>

<h2>Forty credits: the door to retirement benefits</h2>
<p>With ${NEED} credits you are fully insured for retirement: you, your spouse and in some cases your former spouse can draw on your record. Four credits a year means ten years of work at a minimum, but the years do not need to be consecutive. The ${h.src('ssaCredits', 'SSA')} states it plainly: "Nobody needs more than 40 credits." For disability and survivor benefits the number needed depends on age at the time of the event and can be lower.</p>

<h2>Where the number 40 comes from</h2>
<p>The figure is not arbitrary. Under ${h.src('cfr404_110', '20 CFR 404.110')}, you are fully insured if you have one credit for each calendar year after the year you turn 21 and before the year you reach 62, with a floor of 6 and a ceiling of 40. For someone born in 1964, that span runs from 1986 through 2025: forty years, so forty credits, the ceiling. Everyone born after 1929 hits the same ceiling, which is why the rule is usually quoted as a flat 40.</p>
<p>The same count works differently when a worker dies young. The years then stop at the year of death, so a worker who dies at 29 needs one credit for each year after 21, which the floor puts at 6 at least. That is how a short career can still protect a family. The credits counted are those acquired at any time, early or late, as long as the total reaches the number required.</p>

<h2>What credits do not change</h2>
<p>A worker with 40 credits and one with 140 can have the same benefit, or the first can have more. The benefit is a function of your ${h.a('aime', 'average indexed monthly earnings')}, the 35 best years divided by 420 months. Two consequences:</p>
<ul>
<li>A short career gets credits quickly but a low average, since every missing year counts as zero. Ten years at ${h.usd(30000)} in today's pay gives an AIME of only ${h.usd(tenYears.aime)} for someone born in 1964, and a PIA of ${h.usd(tenYears.pia, 2)}. See ${h.a('fewer-than-35-years', 'fewer than 35 years of work')}.</li>
<li>Working past 40 credits still pays when the new year beats one of your 35 best, or replaces a zero.</li>
</ul>

<h2>Common situations</h2>
<h3>Part-time work in retirement</h3>
<p>A retiree earning ${h.usd(8000)} in 2026 gets ${creditsFor(8000)} credits, which add nothing if the record already has 40. The earnings themselves matter only through the 35-year average.</p>
<h3>Household and election work</h3>
<p>Some small jobs are covered only above a yearly threshold set in the same notice, so pay below it earns no credits at all. Ask the employer whether Social Security tax was withheld; if it was, the pay counts.</p>
<h3>Missing credits near 62</h3>
<p>Someone at 61 with 36 credits needs one more year with at least ${h.usd(Q * MAX)} of covered earnings to reach 40 in 2026. Until 40 is reached, no retirement benefit can be paid on the record, whatever the age.</p>`;
    },
  },
});
