import { definePage } from '../../lib/page-types';
import { P, awi, bendPoints } from '../../lib/engine/params';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const W = P.extra.awi_calc;
const a24 = awi(2024), a23 = awi(2023);
const years = Object.keys(P.series.awi).map(Number).sort((x, y) => x - y);
const falls = years.slice(1).filter((y) => awi(y) < awi(y - 1));
const growth = (y: number) => awi(y) / awi(y - 1) - 1;
const best = years.slice(1).reduce((m, y) => (growth(y) > growth(m) ? y : m), years[1]);
const f = (y: number) => a24 / awi(y);

export default definePage({
  id: 'average-wage-index',
  group: 'formula',
  order: 30,
  mini: 'awiIndexFactor',
  miniHref: 'benefits-calculator',
  related: ['aime', 'bend-points', 'taxable-maximum', 'credits', 'pia'],
  sources: ['ssaAwi', 'frNotice2026', 'cfr404_211', 'ssaRetireExample'],
  en: {
    slug: 'average-wage-index',
    nav: 'Average wage index',
    card: `The national average wage index, ${$(a24, 2)} for 2024: the yardstick that lifts old pay to today's level and moves every wage-linked limit.`,
    title: `Average Wage Index 2026: ${$(a24, 2)} for 2024, Full Table`,
    description: `National average wage index: ${$(a24, 2)} for 2024, up ${W.pct_vs_2023}% on 2023. Table 1951 to 2024, indexing factors for people born in 1964, and the 2026 limits it sets.`,
    h1: 'The national average wage index, 1951 to 2024',
    intro: 'One series of numbers drives half of the Social Security rulebook. This page gives the series and shows what it does.',
    resume: `The national average wage index (AWI) for 2024 is ${$(a24, 2)}, published by the SSA in the Federal Register on November 3, 2025. It was obtained by multiplying the 2023 index, ${$(a23, 2)}, by the growth of average W-2 wages between the two years, ${$(W.avg_wage_2024, 2)} against ${$(W.avg_wage_2023, 2)}, an increase of about ${W.pct_vs_2023}%. The index serves two purposes. It indexes past earnings when the SSA computes a benefit: for someone who turned 60 in 2024, pay earned in 1990 is multiplied by ${f(1990).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}, pay from 2000 by ${f(2000).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}. And it sets the limits for 2026: the taxable maximum of ${$(P.taxable_max_2026)}, the bend points of ${$(bendPoints(2026)[0])} and ${$(bendPoints(2026)[1])}, the ${$(P.credits.qc_amount)} needed for one credit and the earnings test thresholds. Since 1951 the series has fallen only once, in ${falls.join(' and ')}.`,
    faqs: [
      { q: 'Is the average wage index the same as inflation?', a: `No. It follows average pay, not prices. Wages and consumer prices grow at different speeds, so indexing your early pay by wages keeps it in step with how pay levels changed, not with what money could buy. Prices only enter the benefit later, through the cost-of-living adjustments applied to the PIA from the year you turn 62.` },
      { q: 'Which year of the index applies to my earnings?', a: `The index of the year you turn 60. Someone born in 1964 turned 60 in 2024, so every year of pay before 2024 is multiplied by ${$(a24, 2)} divided by the index of the year earned. Pay from 2024 on is taken at face value, without any factor.` },
      { q: 'Why did the average wage fall in 2009?', a: `The index for 2009, ${$(awi(2009), 2)}, came in below 2008 (${$(awi(2008), 2)}), the only decline since the series began in 1951. It reflects the pay data of the 2008 and 2009 recession. For workers who turned 60 later, the lower 2009 index raises the factor applied to 2009 earnings.` },
      { q: 'When will the 2025 wage index be known?', a: `The regulation has the SSA publish each year's average wage on or before November 1 of the following year, so the 2025 index is due by November 1, 2026. It will set the 2027 taxable maximum, bend points and credit amount, and it becomes the indexing base for people born in 1965.` },
      { q: 'Does a higher wage index mean a higher benefit for me?', a: `Only if your indexing year has not passed. A faster-growing index raises both your indexed earnings and the bend points of your eligibility year, so the two effects largely offset in relative terms but raise the dollar amount. Once you have turned 60, later indexes no longer touch your record.` },
    ],
    body: (h) => {
      const pick = [1951, 1955, 1960, 1965, 1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005, 2008, 2009, 2010, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
      const rows = pick.map((y) => [String(y), h.usd(awi(y), 2), y > 1951 ? h.pct(growth(y)) : 'first year', h.num(f(y), 4)]);
      const pay = 30000;
      return `
<h2>The table, with the factor for a 2024 indexing year</h2>
<p>The SSA's ${h.src('ssaAwi', 'Office of the Chief Actuary')} keeps the full series. Below are the index every five years until 2005, then every year from 2008. The last column is the multiplier a worker born in 1964 (indexing year 2024) gets on that year's pay; a worker born in another year divides by a different index, so the factors shift but the table of indexes stays the same.</p>
${h.table(['Year', 'Average wage index', 'Change vs prior year', 'Factor to 2024'], rows, 'National average wage index (SSA) and indexing factor for a worker turning 60 in 2024', ['l', 'r', 'r', 'r'])}
<p>A ${h.usd(pay)} salary in 1985 is worth ${h.usd(pay * f(1985))} in 2024 wage terms; the same ${h.usd(pay)} earned in 2015 is worth ${h.usd(pay * f(2015))}. The older the pay, the stronger the lift. The SSA's own case A uses exactly these factors: our ${h.num(f(1986), 4)} for 1986 matches the figure in the ${h.src('ssaRetireExample', 'published example')}.</p>

<h2>How the 2024 figure was computed</h2>
<p>The index is not a raw average. The SSA tabulates all W-2 wages, including contributions to deferred compensation plans, and divides by the number of wage earners. For 2023 that gave ${h.usd(W.avg_wage_2023, 2)} and for 2024 ${h.usd(W.avg_wage_2024, 2)}. To stay consistent with the series begun in 1951, it does not publish that average directly. It chains: ${h.usd(a23, 2)} × ${h.usd(W.avg_wage_2024, 2)} ÷ ${h.usd(W.avg_wage_2023, 2)} = ${h.usd(a23 * W.avg_wage_2024 / W.avg_wage_2023, 2)}, rounded to the cent. The arithmetic and the definition of the wage data are in the ${h.src('frNotice2026', 'Federal Register notice of November 3, 2025')} and in ${h.src('cfr404_211', '20 CFR 404.211(c)')}.</p>
<p>The notice explains the purpose of the chaining: keeping the index at a level consistent with the series published for 1951 to 1977. Only the year-to-year growth of the tabulated wages passes into it. That is why the published index for 2024, ${h.usd(a24, 2)}, is higher than the plain average of the same year, ${h.usd(W.avg_wage_2024, 2)}.</p>

<h2>The one decline: ${falls.join(', ')}</h2>
<p>Out of more than seventy annual changes, only ${falls.join(' and ')} shows a fall: from ${h.usd(awi(2008), 2)} to ${h.usd(awi(2009), 2)}, ${h.pct(growth(2009))}. The strongest annual rise of the whole series came in ${best}, ${h.pct(growth(best))}. Two consequences of the 2009 dip are still visible in benefits today. Workers whose indexing year was 2009, the people born in 1949, saw their bend points for 2011 come out below those of 2010. And for everyone indexed to a later year, 2009 earnings get a slightly higher factor than 2008 earnings, so a flat salary over those years counts for more in 2009.</p>

<h2>Eight amounts that move with the index</h2>
<p>The same notice lists the program amounts tied to the AWI. For 2026, all computed from the 2024 index:</p>
<ul>
<li>the contribution and benefit base, ${h.usd(P.taxable_max_2026)}, see the ${h.a('taxable-maximum', 'taxable maximum page')};</li>
<li>the earnings test exempt amounts, ${h.usd(P.earnings_test.lower_annual)} and ${h.usd(P.earnings_test.higher_annual)} a year;</li>
<li>the PIA bend points, ${h.usd(bendPoints(2026)[0])} and ${h.usd(bendPoints(2026)[1])}, see ${h.a('bend-points', 'bend points')};</li>
<li>the family maximum bend points, ${h.usd(bendPoints(2026)[2])}, ${h.usd(bendPoints(2026)[3])} and ${h.usd(bendPoints(2026)[4])};</li>
<li>the earnings for one credit, ${h.usd(P.credits.qc_amount)}, see ${h.a('credits', 'Social Security credits')};</li>
<li>the old-law base used by railroad retirement and pension guarantees;</li>
<li>the disability earnings limit for blind people;</li>
<li>the coverage threshold for election workers.</li>
</ul>
<p>Each one follows the same pattern: a base amount fixed in law for an earlier year, multiplied by the ratio of the latest index to the index of that base year, then rounded. The cost-of-living adjustment is the exception: it comes from consumer prices, not wages.</p>

<h2>Same year of pay, different birth years</h2>
<p>The index of the year worked never changes, but the numerator does: it is the index of the year you turned 60. Pay earned in 1990 is multiplied by ${h.num(awi(2022) / awi(1990), 4)} for someone born in 1962 (indexing year 2022), by ${h.num(awi(2023) / awi(1990), 4)} for someone born in 1963 and by ${h.num(f(1990), 4)} for someone born in 1964. A younger worker therefore sees bigger factors on the same old year, and also higher bend points two years later. Neither is a bonus: both only restate the old pay in the wage level of a later year.</p>

<h2>Reading your own record against the index</h2>
<p>A quick check of your career: divide each year's earnings on your SSA record by that year's index. A ratio near 1 means you earned the national average that year; 0.5 means half; 2 means twice. A steady ratio over the decades means the indexed career is flat, as in the SSA's case A. A rising ratio means your early years weigh less after indexing than your late ones, and a few more years at the end of the career may replace them. The ${h.a('aime', 'AIME page')} carries that through to the average.</p>`;
    },
  },
});
