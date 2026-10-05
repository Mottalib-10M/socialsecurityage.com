import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { benefitAtAge, computePia, fraRetirement, fraSurvivor, projectCareer } from '../../lib/engine/ss';

const Y = 1960;
const fra = fraRetirement(Y);
const prev = fraRetirement(Y - 1);
const sfra = fraSurvivor(Y);
const bp = bendPoints(Y + 62);
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const b = { y: Y, m: 6, d: 15 };
const S = 50000;
const r = computePia(b, projectCareer(b, S, 22, 62));
const p62 = benefitAtAge(1, 745, fra.total).factor, q62 = benefitAtAge(1, 745, prev.total).factor;
const lastBig = Math.max(...Object.entries(P.series.cola).filter(([y, v]) => Number(y) < 2022 && v >= P.series.cola['2022']).map(([y]) => Number(y)));
const awiGrowth = P.series.awi['2020'] / P.series.awi['2019'] - 1;

export default definePage({
  id: 'born-1960',
  group: 'birthyear',
  order: 1960,
  mini: 'birthColaLadder',
  miniHref: 'benefits-calculator',
  related: ['born-1959', 'born-1961', 'full-retirement-age', 'claiming-at-62', 'average-wage-index'],
  sources: ['cfr404_409', 'cfr404_410', 'ssaAwi', 'ssaColaSeries', 'ssaBendPoints'],
  en: {
    slug: 'social-security-born-in-1960',
    nav: 'Born in 1960',
    card: 'The first cohort with a full retirement age of 67, reached in 2027, and a PIA carried by the 8.7% COLA of 2022.',
    title: 'Born in 1960: Social Security in 2026, First at Full Age 67',
    description: `Born in 1960: the first cohort whose full retirement age is 67, reached in 2027. Your 2022 PIA got the 8.7% COLA of that year and three more since, to 2026.`,
    h1: 'Social Security if you were born in 1960, the first age-67 cohort',
    intro: 'The rising schedule of full retirement ages ends with you: 67 from this year of birth on.',
    resume: `If you were born in 1960 (January 2, 1960 to January 1, 1961), your full retirement age is 67, the end point of the schedule in 20 CFR 404.409 and two months later than for 1959 births. You reach it in 2027 and are 66 in 2026. The extra two months make every early start a little smaller: claiming at 62 and 1 month keeps ${Math.round(p62 * 10000) / 100}% of the PIA instead of ${Math.round(q62 * 10000) / 100}% for the 1959 cohort, and waiting to 70 brings 124% rather than ${Math.round(benefitAtAge(1, 840, prev.total).factor * 10000) / 100}%. Your PIA was set in 2022, the year you turned 62, with bend points of ${$(bp[0])} and ${$(bp[1])} and earnings indexed to the 2020 average wage, ${P.series.awi['2020'].toLocaleString('en-US')}. Four COLAs have been added since, starting with ${P.series.cola['2022']}% for December 2022, so a career at ${$(S)} in today's pay now has a PIA of ${$(r.pia, 2)}, against ${$(r.piaAtEligibility, 2)} in 2022. Survivor full age is ${sfra.years} and ${sfra.months} months.`,
    faqs: [
      { q: 'Is 67 the full retirement age for everyone born in 1960 or later?', a: `Yes, under current law. The table in 20 CFR 404.409 raises the age in two-month steps for people born from 1938 and stops at 67 for anyone born in 1960 or later. A January 1, 1961 birth is counted as 1960, and so is anyone the SSA treats as born in 1960 by the day-before-birthday rule.` },
      { q: 'Did people born in 1960 get the 8.7% COLA if they had not claimed?', a: `Yes. COLAs are applied to the PIA from the year of eligibility, 2022 for you, whether or not you collect. The ${P.series.cola['2022']}% adjustment for December 2022 is therefore part of your PIA even if you plan to claim at 67 or 70.` },
      { q: 'Why does my 1960 benefit use the 2020 wage index?', a: `Earnings are indexed to the year you turned 60. For this cohort that was 2020, when the national average wage index rose ${(awiGrowth * 100).toFixed(1)}% to ${$(P.series.awi['2020'], 2)}. Every year before 2020 is scaled by that index; 2020 and later count at face value.` },
      { q: 'At 66 in 2026, how much do I lose by not waiting until 67?', a: `Starting 12 months before 67 cuts the PIA by 12 times 5/9 of 1%, about 6.7%, and the cut lasts for life. On the ${$(r.pia, 2)} PIA of our example, that is ${$(benefitAtAge(r.pia, 792, fra.total).benefit)} a month at 66 against ${$(benefitAtAge(r.pia, fra.total, fra.total).benefit)} at 67, before the next COLA.` },
    ],
    body: (h) => {
      const ages: Array<[string, number]> = [['62 and 1 month', 745], ['63', 756], ['64', 768], ['65', 780], ['66', 792], ['66 and 10 months', 802], ['67', 804], ['70', 840]];
      const rows = ages.map(([label, m]) => [label, h.pct(benefitAtAge(1, m, prev.total).factor, 2), h.pct(benefitAtAge(1, m, fra.total).factor, 2), h.usd(benefitAtAge(r.pia, m, fra.total).benefit)]);
      return `
<h2>Two months later than 1959, and the last step</h2>
<p>The ${h.src('cfr404_409', 'full retirement age table')} adds two months for each birth year from 1955 to 1959 and lands on 67 for 1960. Moving the full age back two months shifts the whole reduction scale: two more months counted at 5/12 of 1% for a start at 62, and two fewer months of delayed credit before 70 (${h.src('cfr404_410', '20 CFR 404.410')}). The difference is small, but it is permanent.</p>
${h.table(['Start at', 'Born 1959 (full age 66 and 10 months)', 'Born 1960 (full age 67)', `1960, PIA ${h.usd(r.pia, 2)}`], rows, `Share of the PIA paid by start age. Example: career at ${h.usd(S)} in today's pay`, ['l', 'r', 'r', 'r'])}
<p>The 1960 column is the same for every later cohort, which is why it appears on the ${h.a('full-retirement-age', 'full retirement age')} and ${h.a('claiming-at-62', 'claiming at 62')} pages.</p>
<h2>A formula year that caught the 2022 inflation</h2>
<p>Turning 62 in 2022 gave this cohort the 2022 bend points, ${h.usd(bp[0])} and ${h.usd(bp[1])}, computed from the 2020 national average wage. Then came the largest adjustment since ${lastBig}, ${P.series.cola['2022']}% for December 2022, followed by ${P.series.cola['2023']}%, ${P.series.cola['2024']}% and ${P.series.cola['2025']}% (${h.src('ssaColaSeries', 'SSA COLA series')}). Altogether those four increases raised the example PIA by ${h.pct(r.pia / r.piaAtEligibility - 1)}.</p>
<p>The cohort born one year later turned 62 in 2023, missed the 8.7% COLA but got bend points about ${h.pct(bendPoints(2023)[0] / bp[0] - 1)} higher, because wages jumped in 2021. For a steady career the two effects nearly cancel: our ${h.a('born-1961', '1961 page')} shows the comparison.</p>
<h2>The 2020 indexing year</h2>
<p>Your earnings before 2020 were multiplied by the ratio of the ${h.src('ssaAwi', '2020 average wage index')} to the index of each year. The 2020 figure, ${h.num(P.series.awi['2020'], 2)}, was ${h.pct(awiGrowth)} above 2019. Pay from 2020 onward is used as earned; the ${h.a('average-wage-index', 'wage index page')} lists every factor.</p>
<h2>Working at 66 in 2026</h2>
<p>Because full retirement age is 67, the whole of 2026 falls before it for this cohort. A person collecting while working faces the lower ${h.a('earnings-test', 'earnings limit')}, ${h.usd(P.earnings_test.lower_annual)} for the year, with $1 withheld for every $2 above it. In 2027, the year you turn 67, the higher limit of the year applies to the months before your birthday month. A widow or widower born in 1960 has a survivor full age of ${sfra.years} and ${sfra.months} months, four months ahead of the retirement one.</p>`;
    },
  },
});
