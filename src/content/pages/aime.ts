import { definePage } from '../../lib/page-types';
import { P, awi, bendPoints, taxableMax } from '../../lib/engine/params';
import { computePia, projectCareer } from '../../lib/engine/ss';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const A = P.ssa_examples_2026.caseA;
const rec: Record<number, number> = Object.fromEntries(Object.entries(P.extra.aime_case_a.earnings).map(([y, v]) => [Number(y), Number(v)]));
const bA = { y: A.born, m: 6, d: 15 };
const ra = computePia(bA, rec);
const dropped = ra.rows.filter((r) => !r.used);
const first = ra.rows[0], last = ra.rows[ra.rows.length - 1];
const exact = ra.top / 420;
const maxRec = Object.fromEntries(Array.from({ length: 40 }, (_, i) => [1986 + i, 1e7]));
const rb = computePia({ y: P.ssa_examples_2026.caseB.born, m: 6, d: 15 }, maxRec);
const bp = bendPoints(2026);

export default definePage({
  id: 'aime',
  group: 'formula',
  order: 10,
  mini: 'aimeBuild',
  miniHref: 'benefits-calculator',
  related: ['bend-points', 'average-wage-index', 'pia', 'fewer-than-35-years', 'taxable-maximum', 'benefits-calculator'],
  sources: ['ssaRetireExample', 'cfr404_211', 'ssaAwi', 'ssaCbb', 'frNotice2026'],
  en: {
    slug: 'average-indexed-monthly-earnings',
    nav: 'AIME',
    card: `Average indexed monthly earnings: 35 best years in today's wages, divided by 420. The SSA's 2026 example lands on ${$(A.aime)}.`,
    title: 'AIME 2026: Average Indexed Monthly Earnings, Step by Step',
    description: `AIME in 2026: each year indexed to the wage level of the year you turned 60, capped, best 35 kept, divided by 420. SSA case A gives ${$(A.aime)} and a ${$(A.pia, 2)} PIA.`,
    h1: 'Average indexed monthly earnings (AIME), built one year at a time',
    intro: 'Before any formula, the SSA turns your whole working life into a single monthly number. Here is how that number is made.',
    resume: `Your average indexed monthly earnings, or AIME, is the sum of your 35 highest years of indexed earnings divided by 420, the number of months in 35 years, rounded down to the whole dollar. Each year counts only up to that year's taxable maximum (${$(taxableMax(1986))} in 1986, ${$(P.taxable_max_2026)} in 2026). Years before the one in which you turn 60 are multiplied by the national average wage index of that year of age 60 divided by the index of the year worked; from age 60 on, pay counts at face value. In the SSA's own 2026 example, a worker born in ${A.born} earned ${$(A.earnings_1986)} in 1986; multiplied by ${A.factor_1986}, that becomes ${$(A.indexed_1986)} in 2024 wages. After indexing ${ra.rows.length} years and dropping the ${dropped.length} lowest, the 35 best total ${$(P.extra.aime_case_a.top35_total)}, which gives an AIME of ${$(A.aime)} and, through the 2026 bend points, a primary insurance amount of ${$(A.pia, 2)}.`,
    faqs: [
      { q: 'Is my AIME on my Social Security statement?', a: `No. The statement shows estimated monthly benefits at several ages and your year-by-year earnings, not the AIME itself. You can rebuild it from the earnings column: index each year before age 60 with the wage index, keep the 35 best, divide by 420 and round down. The SSA's case A for 2026 gives ${$(A.aime)} that way.` },
      { q: 'Does working past 62 change my AIME after I have started benefits?', a: `It can. Every new year of covered earnings is compared with the 35 years already used. If it is higher than the lowest of them, the SSA recomputes the AIME and the PIA automatically each year (20 CFR 404.285). Pay earned at 60 or later is never indexed, so it counts at its nominal value.` },
      { q: 'Why does the SSA divide by 420 even if I worked 40 years?', a: `Because 20 CFR 404.211(e) counts the elapsed years from age 22 through 61, which is 40 for anyone born after 1928, then subtracts 5 for retirement. That leaves 35 computation years. With 40 years of earnings, the ${dropped.length} lowest indexed years are dropped and the remaining 35 are divided by 420 months. In case A for 2026 the dropped years are ${dropped.map((r) => r.year).join(', ')}, the five oldest and lowest after indexing.` },
      { q: 'Why do my small salaries from the 1980s count for so much?', a: `Because indexing lifts old pay to the wage level of the year you turned 60, so ${$(A.earnings_1986)} earned in 1986 counts as ${$(A.indexed_1986)}. A worker whose pay followed the national average every year ends with an AIME close to today's average wage divided by 12, even if the old salaries looked small.` },
      { q: 'Is the AIME rounded up or down?', a: `Down, to the next lower whole dollar (20 CFR 404.211). In case A the exact average is ${$(exact, 2)}, and the SSA keeps ${$(ra.aime)}. The PIA computed from it is then rounded down to the dime, and the monthly check down to the dollar, so every step of the chain loses a few cents at most.` },
    ],
    body: (h) => {
      const rows = ra.rows.map((r) => [String(r.year), h.usd(r.nominal), h.num(r.factor, 4), h.usd(Math.round(r.indexed)), r.used ? 'yes' : 'dropped']);
      const s = 55000, b70 = { y: 1970, m: 6, d: 15 };
      const proj = computePia(b70, projectCareer(b70, s, 22, 62));
      return `
<h2>From W-2 to AIME in five moves</h2>
<ol>
<li><strong>List every year of covered earnings</strong>, wages and net self-employment income, as they appear on your SSA earnings record.</li>
<li><strong>Cap each year</strong> at the contribution and benefit base of that year: ${h.usd(taxableMax(1986))} in 1986, ${h.usd(taxableMax(2000))} in 2000, ${h.usd(P.taxable_max_2026)} in 2026. Pay above it was not taxed for Social Security and does not count.</li>
<li><strong>Index the years before the year you turn 60.</strong> The factor is the average wage index of your age-60 year divided by the index of the year worked. The year you turn 60 and every later year have a factor of exactly 1.</li>
<li><strong>Keep the 35 highest indexed amounts.</strong> If you have fewer than 35 years, the empty slots are zeros.</li>
<li><strong>Divide the total by 420</strong> and drop the cents. The result is the AIME that the ${h.a('bend-points', 'bend points')} turn into a PIA.</li>
</ol>
<p>The rule is written in ${h.src('cfr404_211', '20 CFR 404.211')}: the "computation base years" start in 1951, the indexing year is the second year before the year of eligibility, and the average is rounded down to the dollar. Eligibility for retirement is the year you reach 62, so the indexing year is the year you reach 60.</p>

<h2>Case A of the SSA, every line</h2>
<p>The Office of the Chief Actuary publishes a ${h.src('ssaRetireExample', 'worked example for 2026')}: a worker born in ${A.born} who earned from ${first.year} through ${last.year} and starts benefits at 62 in 2026. The indexing year is ${ra.indexYear}, so each factor is the ${ra.indexYear} wage index, ${h.usd(awi(ra.indexYear), 2)}, divided by the index of the year shown. Our engine recomputes every line below from those two published series and lands on the SSA's figures.</p>
${h.table(['Year', 'Nominal earnings', 'Factor', 'Indexed', 'In the 35'], rows, `Case A, born ${A.born}: indexed to ${ra.indexYear} wages (factors to 4 decimals, indexed amounts to the dollar)`, ['l', 'r', 'r', 'r', 'l'])}
<p>Two things stand out. First, indexing almost flattens the career: ${h.usd(first.nominal)} in ${first.year} and ${h.usd(rec[2023])} in 2023 become ${h.usd(Math.round(first.indexed))} and ${h.usd(Math.round(ra.rows.find((r) => r.year === 2023)!.indexed))}, because this worker's pay rose roughly with national wages. Second, the years dropped are the oldest, ${dropped.map((r) => r.year).join(', ')}, not because they are old but because their indexed values are the five smallest. The sum of the other 35 is ${h.usd(ra.top, 2)} before rounding each line (the SSA's table, rounded line by line, prints ${h.usd(P.extra.aime_case_a.top35_total)}); divided by 420 it gives ${h.usd(exact, 2)}, cut to ${h.usd(ra.aime)}.</p>
<p>Look also at 2009. Case A earned less that year than in 2008, yet its indexed value is higher, ${h.usd(Math.round(ra.rows.find((r) => r.year === 2009)!.indexed))} against ${h.usd(Math.round(ra.rows.find((r) => r.year === 2008)!.indexed))}. The reason is that the national wage index fell in 2009, so the factor for that year is larger. The ${h.a('average-wage-index', 'wage index page')} lists the whole series.</p>

<h2>Why the clock stops at 60, not 62</h2>
<p>The regulation has the SSA publish each year's average wage in the Federal Register on or before November 1 of the following year. The 2024 index, ${h.usd(awi(2024), 2)}, appeared in the ${h.src('frNotice2026', 'notice of November 3, 2025')}, just in time for people turning 62 in 2026. Indexing to the year of age 60 lets the SSA compute a PIA for anyone reaching 62 with an index that already exists. Earnings at 60, 61 and later simply enter at face value: a raise at 61 counts dollar for dollar, without any multiplier.</p>
<p>The year of age 60 also fixes your bend points two years later. Someone born in ${A.born} has ${ra.indexYear} as indexing year and ${ra.eligibilityYear} as formula year, with bend points of ${h.usd(bp[0])} and ${h.usd(bp[1])}. Both move with the same wage index, so the AIME and the brackets stay in step.</p>

<h2>The cap of each year, seen on the maximum earner</h2>
<p>The SSA's case B, born in ${P.ssa_examples_2026.caseB.born}, earned at least the taxable maximum every year from 1986 to 2025. The record therefore shows the base itself: ${h.usd(taxableMax(1986))} in 1986, ${h.usd(taxableMax(2010))} in 2010, ${h.usd(taxableMax(2025))} in 2025. This worker turned 60 in ${rb.indexYear}, so indexing stops there, and the AIME is ${h.usd(rb.aime)}. Whatever the real salary was, no higher AIME was possible for a career of that length. The ${h.a('taxable-maximum', 'taxable maximum page')} shows how the base is set each year.</p>

<h2>If you are under 60 today</h2>
<p>Your indexing year has not happened, so no one can know your exact factors. Calculators, including ours and the SSA's quick calculator, use the latest published index, ${h.usd(awi(2024), 2)} for 2024, and the 2026 bend points, which gives an estimate in today's dollars. For a worker born in 1970 with a steady ${h.usd(s)} in today's pay from 22 to 62, that method gives an AIME of ${h.usd(proj.aime)}. The real figure will be higher in nominal dollars, but so will the bend points, and the resulting benefit keeps about the same relation to average wages.</p>

<h2>What does not enter the AIME</h2>
<ul>
<li>Pay above the year's taxable maximum.</li>
<li>Earnings from work not covered by Social Security, such as some state and local government jobs with their own pension.</li>
<li>Investment income, pensions, rents and interest.</li>
<li>Years beyond the 35 best: they still earn credits, but they do not raise the average unless they replace a lower year.</li>
</ul>
<p>To see what your own AIME becomes once it goes through the formula, use the ${h.a('pia', 'PIA page')}; to test missing years, the ${h.a('fewer-than-35-years', 'fewer-than-35-years page')}.</p>`;
    },
  },
});
