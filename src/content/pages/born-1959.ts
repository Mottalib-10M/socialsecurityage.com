import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { benefitAtAge, earningsTest, piaFromAime, fraRetirement, fraSurvivor, monthAttaining } from '../../lib/engine/ss';

const Y = 1959;
const fra = fraRetirement(Y);
const sfra = fraSurvivor(Y);
const bp = bendPoints(Y + 62);
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const B = P.ssa_examples_2026.caseB;
const T = P.earnings_test;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const reach = (m: number) => monthAttaining({ y: Y, m, d: 15 }, fra.total);
const nov = reach(11);
const ex = earningsTest(B.benefit_fra, 80000, 'fraYear', nov.m - 1);

export default definePage({
  id: 'born-1959',
  group: 'birthyear',
  order: 1959,
  mini: 'birthFraYearTest',
  miniHref: 'earnings-test',
  related: ['born-1958', 'born-1960', 'earnings-test', 'full-retirement-age', 'maximum-benefit'],
  sources: ['cfr404_409', 'ssaWhileWorking', 'frNotice2026', 'ssaRetireExample', 'cfr404_430'],
  en: {
    slug: 'social-security-born-in-1959',
    nav: 'Born in 1959',
    card: `Full age ${fra.years} and ${fra.months} months lands between November 2025 and October 2026, with a ${$(T.higher_annual)} earnings limit before it.`,
    title: 'Born in 1959: Full Retirement Age in 2026 and Earnings Limit',
    description: `Born in 1959: full retirement age is 66 and 10 months, reached by most in 2026. Before that month, ${$(T.higher_annual)} of pay is allowed; $1 in $3 above it is held back.`,
    h1: 'Social Security for people born in 1959: the full-age year',
    intro: 'For most of this cohort, 2026 is the year the earnings limit disappears, at a month that depends on your birthday.',
    resume: `People born in 1959 (January 2, 1959 to January 1, 1960) have a full retirement age of ${fra.years} and ${fra.months} months, the last step before 67. Those born in January or February 1959 reached it in late 2025; everyone born from March 1959 on reaches it in 2026, from January for March births to October for December births, and a person born on January 1, 1960 counts as a December 1959 birth. In the calendar year of full retirement age, a working beneficiary is under the higher earnings-test limit, ${$(T.higher_annual)} for 2026, counting only pay earned before the month of full age, with $1 withheld for every $3 above it; from that month on there is no limit. The PIA of this cohort uses the ${Y + 62} formula, bend points ${$(bp[0])} and ${$(bp[1])}, plus the COLAs of December ${Y + 62} through December 2025. The SSA's own maximum-earner example is a 1959 birth: AIME ${$(B.aime)}, PIA ${$(B.pia, 2)}, ${$(B.benefit_fra)} a month at full retirement age.`,
    faqs: [
      { q: 'Born in November 1959, when exactly do I hit full retirement age?', a: `In ${MONTHS[nov.m - 1]} ${nov.y}. Add ${fra.years} years and ${fra.months} months to the month of birth; someone born on November 1 is treated as born in October, so reaches it a month earlier. From that month on, the benefit is unreduced and earnings no longer matter.` },
      { q: 'Do my earnings after full retirement age count toward the 2026 limit?', a: `No. Only earnings before the month you reach full retirement age are compared with the ${$(T.higher_annual)} limit, as the SSA explains in its guide to working while receiving benefits. A person reaching it in ${MONTHS[nov.m - 1]} counts January through ${MONTHS[nov.m - 2]} only. Pay received from ${MONTHS[nov.m - 1]} on is ignored, however large.` },
      { q: 'What happens to benefits withheld in the year I reach full age?', a: 'They are not lost. At full retirement age the SSA recalculates your benefit as if you had started later by the number of months withheld, so the monthly amount goes up for the rest of your life. The recalculation is automatic and covers months withheld in earlier years as well.' },
      { q: 'Why is the SSA maximum example someone born in 1959?', a: `The SSA illustrates the top of the scale with a worker who earned the taxable maximum every year and reaches full retirement age in 2026. With an AIME of ${$(B.aime)} on the ${Y + 62} bend points, the PIA starts at ${$(piaFromAime(B.aime, Y + 62), 2)} and the COLAs of December 2021 to December 2025 carry it to ${$(B.pia, 2)}.` },
    ],
    body: (h) => {
      const rows = MONTHS.map((name, i) => { const at = reach(i + 1); const n = at.y === 2026 ? at.m - 1 : 0; return [name, `${MONTHS[at.m - 1]} ${at.y}`, String(n), n > 0 ? h.usd(T.higher_annual) : 'none in 2026']; });
      return `
<h2>Your full-age month, birth month by birth month</h2>
<p>The ${h.src('cfr404_409', 'regulation')} sets ${fra.years} years and ${fra.months} months for this cohort. Because the SSA considers that you attain an age on the day before your birthday, a person born on the 1st reaches each age one month earlier than the table suggests. For everyone else, the full-age month is the one shown here.</p>
${h.table(['Born in 1959 in', 'Full retirement age reached', 'Months of 2026 under the test', 'Limit on those months'], rows, 'Births on the 2nd of the month or later. Born on the 1st: use the line above', ['l', 'l', 'r', 'r'])}
<p>A January or February birth has no earnings test at all in 2026. A March birth reaches full age in January, so no month of 2026 is counted either. From April births on, the months before the full-age month carry the ${h.usd(T.higher_annual)} limit, set in the ${h.src('frNotice2026', 'SSA notice for 2026')}.</p>
<h2>A worked case: still employed in the full-age year</h2>
<p>Suppose a person born in November 1959 collects ${h.usd(B.benefit_fra)} a month and earns ${h.usd(80000)} between January and August 2026. The excess over ${h.usd(T.higher_annual)} is ${h.usd(ex.excess)}; one third of it, ${h.usd(ex.withheld)}, is withheld, the equivalent of ${ex.monthsWithheld} monthly payment${ex.monthsWithheld > 1 ? 's' : ''}. The earnings from ${MONTHS[nov.m - 1]} onward do not enter the test (${h.src('ssaWhileWorking', 'SSA, Receiving benefits while working')}). Run your own numbers with the ${h.a('earnings-test', 'earnings limit calculator')}.</p>
<h2>The ${Y + 62} formula and the maximum example</h2>
<p>Turning 62 in ${Y + 62} fixed the bend points at ${h.usd(bp[0])} and ${h.usd(bp[1])}, computed from the 2019 average wage of ${h.num(P.series.awi['2019'], 2)}. The ${h.src('ssaRetireExample', 'SSA calculation example')} for a maximum earner born in 1959 lands on ${h.usd(B.pia, 2)} after five COLAs, ${[2021, 2022, 2023, 2024, 2025].map((y) => `${P.series.cola[String(y)]}%`).join(', ')}. Started at full age that pays ${h.usd(benefitAtAge(B.pia, fra.total, fra.total).benefit)}; started at 70 it would be ${h.usd(benefitAtAge(B.pia, 840, fra.total).benefit)}, with ${840 - fra.total} months of credit. Our ${h.a('maximum-benefit', 'maximum benefit page')} compares it with the 2026 maximum for younger workers.</p>
<p>Survivor benefits follow a separate calendar: the survivor full retirement age for a 1959 birth is ${sfra.years} and ${sfra.months} months.</p>`;
    },
  },
});
