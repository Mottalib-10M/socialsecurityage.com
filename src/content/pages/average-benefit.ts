import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { piaFromAime, benefitAtAge, fraRetirement, spouseReduction } from '../../lib/engine/ss';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const S = P.stats_aug_2026;
const bp = bendPoints(2026);
const FRA = fraRetirement(1964).total;
const k62 = benefitAtAge(1000, 62 * 12 + 1, FRA).factor, k70 = benefitAtAge(1000, 840, FRA).factor;
/** Smallest AIME whose 2026 PIA reaches a target, found by running the engine's formula. */
const aimeFor = (pia: number) => { let a = 0; while (piaFromAime(a) < pia && a < 30000) a++; return a; };
const aFra = aimeFor(S.retired_worker_avg), a62 = aimeFor(S.retired_worker_avg / k62), a70 = aimeFor(S.retired_worker_avg / k70);
const awi24 = P.series.awi['2024'];
const share = (x: number) => Math.round((x / S.retired_worker_avg) * 100);
const millions = (S.retired_workers_thousands / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 });
const monthlyTotal = (S.retired_worker_avg * S.retired_workers_thousands * 1000) / 1e9;

export default definePage({
  id: 'average-benefit',
  group: 'claiming',
  order: 60,
  mini: 'avgBenefitGap',
  miniHref: 'benefits-calculator',
  related: ['how-much-will-i-get', 'maximum-benefit', 'cola-2026', 'married-couples', 'salary-50000'],
  sources: ['ssaSnapshot', 'cfr404_212', 'ssaAwi', 'frNotice2026', 'cfr404_410', 'ssaRetireExample'],
  en: {
    slug: 'average-social-security-benefit',
    nav: 'Average benefit',
    card: `${$(S.retired_worker_avg, 2)} for retired workers in August 2026, ${$(S.spouse_avg, 2)} for spouses, ${$(S.widow_avg, 2)} for widows and widowers.`,
    title: `Average Social Security Benefit 2026: ${$(S.retired_worker_avg)} a Month`,
    description: `Average Social Security benefit in August 2026: ${$(S.retired_worker_avg, 2)} for retired workers, ${$(S.spouse_avg, 2)} for spouses, ${$(S.widow_avg, 2)} for widows and widowers. Compare your own.`,
    h1: 'The average Social Security benefit, and the career behind it',
    intro: 'The national average is a useful yardstick, as long as you know what it mixes together.',
    resume: `In August 2026 the average monthly benefit of a retired worker was ${$(S.retired_worker_avg, 2)}, paid to ${millions} million people, according to the SSA Monthly Statistical Snapshot released in ${S.released}. Spouses of retired workers averaged ${$(S.spouse_avg, 2)}, about ${share(S.spouse_avg)}% of the worker figure, and non-disabled widows and widowers ${$(S.widow_avg, 2)}, about ${share(S.widow_avg)}%. Under the 2026 benefit formula, a primary insurance amount equal to the retired-worker average corresponds to average indexed monthly earnings of about ${$(aFra)}, or ${$(aFra * 12)} a year in today's wages, roughly ${Math.round((aFra * 12 / awi24) * 100)}% of the 2024 national average wage of ${$(awi24, 2)}. That holds for someone who starts at full retirement age. Starting at 62 and 1 month, the same check would need an AIME of about ${$(a62)}; starting at 70, about ${$(a70)}. The average blends every age at claiming, every formula year and decades of cost-of-living raises.`,
    faqs: [
      { q: 'Is $2,000 a month a good Social Security benefit?', a: `It sits just ${2000 < S.retired_worker_avg ? 'under' : 'over'} the national average. ${$(2000)} is about ${share(2000)}% of the ${$(S.retired_worker_avg, 2)} average paid to retired workers in August 2026 (SSA Monthly Statistical Snapshot). Under the 2026 formula, a PIA of ${$(2000)} needs an AIME of about ${$(aimeFor(2000))}, or a full career near ${$(aimeFor(2000) * 12)} a year in today's pay, if you claim at full retirement age.` },
      { q: 'Why is the average spouse benefit less than half the average worker benefit?', a: `A spouse can receive at most ${Math.round(P.family.spouse_max * 100)}% of the worker's PIA, and only at the spouse's own full retirement age. Many spouses start earlier, with a reduction of up to ${Math.round(spouseReduction(FRA - 62 * 12) * 100)}% when full retirement age is 67. The result: ${$(S.spouse_avg, 2)}, about ${share(S.spouse_avg)}% of the retired-worker average.` },
      { q: 'Why do widows receive almost as much as retired workers on average?', a: `Because a widow or widower can inherit up to 100% of what the deceased was receiving, including delayed retirement credits, and the survivor keeps whichever of the couple's two checks is larger. The August 2026 average for non-disabled widow(er)s, ${$(S.widow_avg, 2)}, is ${share(S.widow_avg)}% of the retired-worker figure.` },
      { q: 'Does the August 2026 average include the cost-of-living raise?', a: `Yes. The ${P.cola_2026.pct}% adjustment took effect for December 2025 and was paid from January 2026, so every August 2026 benefit in the snapshot already includes it, whatever the year the person started. Any increase for 2027 would apply to benefits for December 2026, paid in January 2027.` },
      { q: 'How much does Social Security pay retired workers in total each month?', a: `Multiplying the August 2026 average, ${$(S.retired_worker_avg, 2)}, by the ${millions} million retired workers on the rolls gives about ${$(monthlyTotal, 1)} billion a month for retired workers alone, before spouses, survivors, children and disability beneficiaries. The SSA snapshot publishes these figures every month.` },
    ],
    body: (h) => {
      const pias = [1000, 1500, S.retired_worker_avg, 2500, 3000, 3500, 4000];
      const rows = pias.map((p) => { const a = aimeFor(p); return [p === S.retired_worker_avg ? `${h.usd(p, 2)} (average)` : h.usd(p), h.usd(a), h.usd(a * 12), `${Math.round((a * 12 / awi24) * 100)}%`, `${share(p)}%`]; });
      return `
<h2>The August 2026 figures</h2>
${h.table(['Beneficiary', 'Average monthly benefit', 'Share of retired-worker average'], [['Retired workers', h.usd(S.retired_worker_avg, 2), '100%'], ['Spouses of retired workers', h.usd(S.spouse_avg, 2), `${share(S.spouse_avg)}%`], ['Non-disabled widows and widowers', h.usd(S.widow_avg, 2), `${share(S.widow_avg)}%`]], `SSA Monthly Statistical Snapshot, August 2026 (released ${S.released})`, ['l', 'r', 'r'])}
<p>The ${h.src('ssaSnapshot', 'Monthly Statistical Snapshot')} is the SSA's running count of who is paid and how much. The retired-worker average covers ${millions} million people, from people who started this year to people who claimed decades ago. It is a figure per beneficiary, not per household, and it includes the ${P.cola_2026.pct}% cost-of-living adjustment paid since January 2026 (${h.src('frNotice2026', 'Federal Register notice')}).</p>

<h2>What career produces an average check</h2>
<p>Reading the formula backwards answers a practical question: how much would you have to have earned to receive the average? Under the 2026 formula (${h.src('cfr404_212', '20 CFR 404.212')}), 90% of the first ${h.usd(bp[0])} of AIME gives ${h.usd(piaFromAime(bp[0]), 2)}; the rest of an average-sized PIA comes from the 32% bracket. An AIME of ${h.usd(aFra)} gives a PIA of ${h.usd(piaFromAime(aFra), 2)}, the average for a start at full retirement age.</p>
${h.table(['PIA at full retirement age', 'AIME needed', 'Same as a yearly pay of', 'Against the 2024 average wage', 'Against the average benefit'], rows, '2026 formula, steady career in today\'s wages, start at full retirement age', ['l', 'r', 'r', 'r', 'r'])}
<p>A steady career at about ${h.usd(aFra * 12)} a year in today's money, ${Math.round((aFra * 12 / awi24) * 100)}% of the ${h.src('ssaAwi', 'national average wage index')} for 2024, produces the average check at full retirement age. That is below the average wage because many beneficiaries claimed early, had fewer than 35 years of earnings, or became eligible under older formulas. A career exactly at the average wage would give about ${h.usd(piaFromAime(Math.floor(awi24 / 12)), 2)} at full retirement age, more than the national average benefit. The SSA's own example for 2026 makes the same point: a worker born in 1964 with an AIME of ${h.usd(P.ssa_examples_2026.caseA.aime)} has a PIA of ${h.usd(P.ssa_examples_2026.caseA.pia, 2)}, which pays ${h.usd(P.ssa_examples_2026.caseA.benefit62)} at exactly 62, ${P.ssa_examples_2026.caseA.benefit62 < S.retired_worker_avg ? 'below' : 'above'} the average, and ${h.usd(Math.floor(P.ssa_examples_2026.caseA.pia))} at 67, ${P.ssa_examples_2026.caseA.pia < S.retired_worker_avg ? 'below' : 'above'} it.</p>

<h2>The average check at each start age</h2>
${h.table(['Start at', 'Share of PIA', 'PIA needed for the average check', 'AIME needed', 'Steady yearly pay'], [62 * 12 + 1, 64 * 12, FRA, 68 * 12, 840].map((m) => { const f = benefitAtAge(1000, m, FRA).factor, p = S.retired_worker_avg / f, a = aimeFor(p); return [m === 62 * 12 + 1 ? '62 and 1 month' : String(m / 12), h.pct(f), h.usd(p, 2), h.usd(a), h.usd(a * 12)]; }), 'Full retirement age 67, 2026 formula, today\'s wages', ['l', 'r', 'r', 'r', 'r'])}
<p>The same ${h.usd(S.retired_worker_avg, 2)} check can come from very different careers. Someone who starts at 62 and 1 month needs a PIA of ${h.usd(S.retired_worker_avg / k62, 2)} to receive it, which takes an AIME of ${h.usd(a62)}, well above the average wage. Someone who waits to 70 gets there with a PIA of ${h.usd(S.retired_worker_avg / k70, 2)} and an AIME of ${h.usd(a70)}. This is why comparing your Statement with the national average only makes sense once you fix the start age: the average itself is a blend of all of them.</p>

<h2>Why the average is lower than you might expect</h2>
<p>Three effects pull it down. Early claims: a start at 62 and 1 month keeps ${h.pct(k62)} of the PIA when full retirement age is 67 (${h.src('cfr404_410', '20 CFR 404.410')}), and that reduction stays for life. Short careers: years without earnings count as zeros among the 35 best, a frequent case for people who spent years caring for family or worked abroad. Old formulas: someone who turned 62 in 2005 had their PIA set with the bend points of that year and has since received only cost-of-living raises, which track prices rather than wages. On the other side, people who waited until 70 pull the average up with checks at ${h.pct(k70, 0)} of their PIA.</p>

<h2>Comparing your own estimate</h2>
<p>The mini-calculator above sets your benefit against the average of your category and gives the AIME that would produce it under the 2026 formula. Your own PIA, from your SSA Statement or the ${h.a('benefits-calculator', 'earnings-record calculator')}, is the right figure to compare with a start at full retirement age. If you plan to claim earlier or later, apply the reduction or the delayed credits first. A worker who will receive the average at 62 has a PIA well above the average, and the ${h.a('how-much-will-i-get', 'guide to your own amount')} shows how each of the four inputs moves it.</p>
<p>For couples, the household view matters more than two separate averages: a retired worker and a spouse at the national averages receive together about ${h.usd(S.retired_worker_avg + S.spouse_avg)} a month, and the survivor keeps the larger of the two checks. The ${h.a('married-couples', 'married couples page')} works through the combinations, and the ${h.a('maximum-benefit', 'maximum benefit page')} shows the other end of the range.</p>`;
    },
  },
});
