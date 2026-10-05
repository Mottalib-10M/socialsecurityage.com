import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { benefitAtAge, computePia, fraRetirement, fraSurvivor, projectCareer } from '../../lib/engine/ss';

const Y = 1958;
const fra = fraRetirement(Y);
const sfra = fraSurvivor(Y);
const bp = bendPoints(Y + 62);
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const b = { y: Y, m: 6, d: 15 };
const W = 60000;
const base = projectCareer(b, W, 22, 54);
const r0 = computePia(b, base);
const steps = [2024, 2025, 2026].reduce<Array<{ year: number; e: Record<number, number> }>>((acc, y) => { const prev = acc.length ? acc[acc.length - 1].e : base; acc.push({ year: y, e: { ...prev, [y]: W } }); return acc; }, []);
const last = computePia(b, steps[2].e);
const late = 840 - fra.total;

export default definePage({
  id: 'born-1958',
  group: 'birthyear',
  order: 1958,
  mini: 'birthColaLadder',
  miniHref: 'benefits-calculator',
  related: ['born-1957', 'born-1959', 'working-after-fra', 'fewer-than-35-years', 'aime'],
  sources: ['cfr404_409', 'cfr404_211', 'ssaWhileWorking', 'ssaBendPoints', 'ssaColaSeries'],
  en: {
    slug: 'social-security-born-in-1958',
    nav: 'Born in 1958',
    card: `Full age ${fra.years} and ${fra.months} months was reached in 2024. At 68, wages no longer cut the check and can still raise it.`,
    title: 'Born in 1958: Social Security at 68 in 2026, Work Still Pays',
    description: `Born in 1958: full retirement age 66 and 8 months came in 2024. At 68 in 2026 the earnings test is gone, and a year of pay can replace a weak year on record.`,
    h1: 'Social Security for people born in 1958 who are still earning',
    intro: 'Past full retirement age, a paycheck can only push your benefit up.',
    resume: `People born in 1958 (January 2, 1958 to January 1, 1959) reached their full retirement age of ${fra.years} and ${fra.months} months in 2024 and are 68 in 2026. Two rules work in their favor if they still earn wages. The retirement earnings test stopped applying in the month of full retirement age, so pay of any size no longer causes withholding. And every year of covered earnings enters the record at face value, because indexing stopped in 2018, the year they turned 60: when a year of 2026 pay beats one of the 35 years in the average, the SSA recomputes the PIA. The base formula is the ${Y + 62} one, with bend points of ${$(bp[0])} and ${$(bp[1])}, raised since by six COLAs including ${P.series.cola['2022']}% for December 2022. In our example, a worker with ${35 - Object.keys(base).length} empty years who keeps earning ${$(W)} from 66 to 68 lifts the PIA from ${$(r0.pia, 2)} to ${$(last.pia, 2)}. Delayed credits run to 70, in 2028, for up to ${late} months.`,
    faqs: [
      { q: 'I am 68 and still working full time. Will my Social Security be withheld?', a: `No. Withholding under the earnings test applies only before full retirement age, ${fra.years} and ${fra.months} months for your cohort, which you passed in 2024. From that month on, there is no limit on wages or self-employment income, and benefits are paid in full however much you earn.` },
      { q: 'How does the SSA know to raise my benefit after a good year?', a: 'It reviews the record once your employer reports the year\'s wages. If the new year is higher than the lowest of the 35 years used in your average, the benefit is recomputed automatically with the new year in place of the old one. You do not need to file anything, and the review continues every year you keep earning.' },
      { q: 'Did the pandemic year 2020 lower benefits for people born in 1958?', a: `Not through the formula. The ${Y + 62} bend points were derived from the 2018 national average wage index, and 1958 births were indexed to 2018 as well, so the 2020 wage figures played no part in their PIA. Their 2020 earnings, if any, count at face value like every year after 2018.` },
      { q: 'What is the survivor full retirement age for a 1958 birth?', a: `It is ${sfra.years} and ${sfra.months} months, four months earlier than the ${fra.years} and ${fra.months} months that apply to your own benefit (20 CFR 404.409). Past that age, a widow or widower receives the full survivor amount; at 68 in 2026 you are past it.` },
    ],
    body: (h) => {
      const rows = [['Record ends at 53', String(Object.keys(base).length), h.usd(r0.aime), h.usd(r0.pia, 2)],
        ...steps.map((s) => { const x = computePia(b, s.e); return [`Plus ${s.year} at ${h.usd(W)}`, String(Object.keys(s.e).length), h.usd(x.aime), h.usd(x.pia, 2)]; })];
      return `
<h2>No more earnings limit after 66 and 8 months</h2>
<p>The ${h.a('earnings-test', 'retirement earnings test')} withholds $1 for every $2 or $3 above its thresholds, but only in the months before full retirement age (${h.src('ssaWhileWorking', 'SSA, Receiving benefits while working')}). For a 1958 birth those months ended in 2024. Anything withheld before then was not lost: the SSA recalculated the benefit at full retirement age to give credit for the months not paid.</p>
<h2>Recomputation: when a late year replaces an early one</h2>
<p>The average indexed monthly earnings always uses the best 35 years (${h.src('cfr404_211', '20 CFR 404.211')}). Earnings from 2018, the year you turned 60, onward are not indexed, so a ${h.usd(W)} salary in 2026 counts as ${h.usd(W)}. Earlier years were scaled up to 2018 wages instead, which means a modest early year can be smaller than today's pay. The table follows a worker who stopped at 53 with ${35 - Object.keys(base).length} empty years, then went back to work at 66.</p>
${h.table(['Earnings record', 'Years with pay', 'AIME', 'PIA with COLAs'], rows, `Born in 1958, earlier career at ${h.usd(W)} in today's pay. Each extra year fills a zero`, ['l', 'r', 'r', 'r'])}
<p>Each year that fills a zero adds about ${h.usd((last.pia - r0.pia) / 3, 2)} a month to the PIA in this example. Replacing a low year rather than a zero adds less. For the reasoning behind empty years, see ${h.a('fewer-than-35-years', 'fewer than 35 years of work')}.</p>
<h2>The ${Y + 62} formula and its COLAs</h2>
<p>All 1958 births use the ${Y + 62} bend points, ${h.usd(bp[0])} and ${h.usd(bp[1])}, published from the 2018 average wage of ${h.num(P.series.awi['2018'], 2)} (${h.src('ssaBendPoints', 'SSA bend point table')}). Six adjustments followed: ${[2020, 2021, 2022, 2023, 2024, 2025].map((y) => `${P.series.cola[String(y)]}%`).join(', ')}. Together they multiply a ${Y + 62} PIA by about ${h.num(r0.pia / r0.piaAtEligibility, 3)}.</p>
<p>A worker who has not filed at all is gaining delayed credits on top, two thirds of 1% a month, until the month of the 70th birthday in 2028. After that, recomputation is the only thing that can still raise the amount. Our ${h.a('aime', 'AIME guide')} explains which years make up the average.</p>`;
    },
  },
});
