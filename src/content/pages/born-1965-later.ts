import { definePage } from '../../lib/page-types';
import { P, bendPoints, LAST_AWI_YEAR, LAST_BP_YEAR } from '../../lib/engine/params';
import { benefitAtAge, computePia, fraRetirement, fraSurvivor, projectCareer } from '../../lib/engine/ss';

const fra = fraRetirement(1965);
const sfra = fraSurvivor(1965);
const bp = bendPoints(LAST_BP_YEAR);
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const b = { y: 1975, m: 6, d: 15 };
const S = 65000;
const r = computePia(b, projectCareer(b, S, 22, 62));
const at62 = benefitAtAge(r.pia, 745, fra.total), at67 = benefitAtAge(r.pia, fra.total, fra.total), at70 = benefitAtAge(r.pia, 840, fra.total);

export default definePage({
  id: 'born-1965-later',
  group: 'birthyear',
  order: 1965,
  mini: 'fraByYear',
  miniHref: 'benefits-calculator',
  related: ['born-1964', 'how-much-will-i-get', 'average-wage-index', 'credits', 'benefits-calculator'],
  sources: ['cfr404_409', 'ssaAwi', 'frNotice2026', 'ssaBenefitFormula', 'ssaCredits'],
  en: {
    slug: 'social-security-born-in-1965-or-later',
    nav: 'Born 1965 or later',
    card: 'Full retirement age 67 for every cohort. Your formula year has not been published yet, so estimates are in today\'s dollars.',
    title: 'Born in 1965 or Later: Social Security Estimates for 2026',
    description: `Born in 1965 or later: full retirement age is 67 for all. Your bend points are not yet set, so 2026 estimates use the ${LAST_AWI_YEAR} wage index and ${$(bp[0])}/${$(bp[1])} points.`,
    h1: 'Social Security for anyone born in 1965 or later',
    intro: 'The rules on age are settled for you; the dollar amounts of your formula are not, and any estimate has to say so.',
    resume: `For everyone born in 1965 or later (and anyone born on January 1, 1966 counts as 1965), the full retirement age is 67, for retirement, spouse and survivor benefits alike; benefits can start at 62 at 70% of the PIA and grow to 124% at 70. What is not known yet is the formula year: you turn 62 in 2027 or later, and the SSA publishes each year's bend points only in the autumn before they apply, from the wage index of two years earlier. Your earnings will be indexed to the average wage of the year you turn 60, which for most of you has not happened or has not been measured. The only honest estimate is therefore in today's dollars: earnings indexed to the ${LAST_AWI_YEAR} average wage, ${P.series.awi[String(LAST_AWI_YEAR)].toLocaleString('en-US')}, and run through the ${LAST_BP_YEAR} bend points, ${$(bp[0])} and ${$(bp[1])}, the method of the SSA Quick Calculator. On that basis a career at ${$(S)} in today's pay gives a PIA of ${$(r.pia, 2)}: ${$(at62.benefit)} at 62, ${$(at67.benefit)} at 67 and ${$(at70.benefit)} at 70.`,
    faqs: [
      { q: 'Will the full retirement age go above 67 for people born after 1965?', a: `Not under the current rules. The table in 20 CFR 404.409 ends at 67 for anyone born in 1960 or later, with no further step written in. Any change would require new legislation; until then, 67 applies to a person born in 1965 exactly as to one born in 1990.` },
      { q: 'Why does a calculator say my benefit is in today\'s dollars?', a: `Because the future wage indexes and bend points do not exist yet. Expressing everything at ${LAST_AWI_YEAR} wage levels gives a figure you can compare with today's prices. When your formula year comes, both your indexed earnings and the bend points will have grown with wages, so the real check will be larger in nominal dollars.` },
      { q: 'Do I already have enough credits for a retirement benefit?', a: `You need ${P.credits.needed_retirement} credits. In 2026 one credit takes ${$(P.credits.qc_amount)} of covered earnings, and no more than ${P.credits.max_per_year} can be earned a year, so a worker who reaches ${$(P.credits.qc_amount * P.credits.max_per_year)} each year for ten years is fully insured. The credits only qualify you; they do not set the amount.` },
      { q: 'Is my survivor full retirement age also 67 if I was born in 1970?', a: `Yes. The survivor table runs two years behind the worker table and reaches 67 for people born in 1962. Every later cohort, 1970 included, has ${sfra.years} for survivor benefits too, with a reduction of up to ${Math.round(P.reduction.widow_max * 1000) / 10}% for a start at 60.` },
    ],
    body: (h) => {
      const years = [1965, 1966, 1968, 1970, 1975, 1980, 1985, 1990, 2000];
      const rows = years.map((y) => [String(y), String(y + 60), String(y + 62), String(y + 67), String(y + 70)]);
      return `
<h2>What is settled and what is not</h2>
<p>The age rules are fixed in the ${h.src('cfr404_409', 'regulations')}: full retirement age 67, the same reduction of 5/9 of 1% for the first 36 months early and 5/12 beyond, the same 8% a year of delayed credit up to 70. The money rules depend on figures that will only exist later. Your earnings will be indexed to the national average wage of the year you turn 60, and your PIA will use the bend points of the year you turn 62. The SSA publishes each pair in the ${h.src('frNotice2026', 'Federal Register')} at the end of the year before it applies.</p>
${h.table(['Born in', 'Indexing year (60)', 'Formula year (62)', 'Full retirement age (67)', 'Last delayed credit (70)'], rows, `Calendar years for selected cohorts. Only formula years up to ${LAST_BP_YEAR} are published`, ['l', 'r', 'r', 'r', 'r'])}
<h2>Why we do not project future bend points</h2>
<p>Some SSA estimates, such as the online statement for people under 60, project your current pay forward. Whatever projections of future wage indexes and bend points the SSA may apply are not known to us, so this site does not guess them. Every estimate for people born in 1965 or later is computed with the latest published values, the ${h.src('ssaAwi', `${LAST_AWI_YEAR} average wage index`)} and the ${LAST_BP_YEAR} bend points. The result is what your career would be worth if you became eligible now, the same approach as the SSA's own Quick Calculator in today's dollars (${h.src('ssaBenefitFormula', 'SSA benefit formula')}).</p>
<p>That choice has one practical consequence. If wages grow faster than prices between now and your formula year, your real benefit will be higher in purchasing power than a today's-dollar estimate, and the reverse if they lag. Nobody can tell which in advance.</p>
<h2>What you can still change</h2>
<p>For these cohorts the record is open. Every year of earnings before the one you turn 60 will be indexed, so early years are not worth less than recent ones in the final average. Missing years count as zeros among the 35, so ${h.a('fewer-than-35-years', 'filling a gap')} often matters more than a raise. And a year of earnings from 60 onward enters at face value. Run your actual record through the ${h.a('benefits-calculator', 'earnings-record calculator')} or check what a salary is worth on ${h.a('how-much-will-i-get', 'how much Social Security will I get')}. Credits, ${P.credits.needed_retirement} of them, decide only whether you qualify (${h.src('ssaCredits', 'SSA credits page')}); see ${h.a('credits', 'Social Security credits')}.</p>`;
    },
  },
});
