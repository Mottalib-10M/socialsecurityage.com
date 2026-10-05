import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { benefitAtAge, fraRetirement, fraSurvivor, survivorBenefit } from '../../lib/engine/ss';

const Y = 1957;
const fra = fraRetirement(Y);
const sfra = fraSurvivor(Y);
const bp = bendPoints(Y + 62);
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const own = 1500;
const dec = 2400;
const own70 = benefitAtAge(own, 840, fra.total);
const own69 = benefitAtAge(own, 828, fra.total);
const at60 = survivorBenefit({ deceasedPia: dec, deceasedClaimMonths: null, deceasedFraMonths: fra.total, survivorClaimMonths: 720, survivorFraMonths: sfra.total });

export default definePage({
  id: 'born-1957',
  group: 'birthyear',
  order: 1957,
  mini: 'fraByYear',
  miniHref: 'survivor-calculator',
  related: ['born-1956', 'born-1958', 'survivor-calculator', 'claiming-at-70', 'married-couples'],
  sources: ['cfr404_409', 'cfr404_410', 'ssaSurvivor', 'cfr404_313', 'ssaBendPoints'],
  en: {
    slug: 'social-security-born-in-1957',
    nav: 'Born in 1957',
    card: `Two full ages: ${fra.years} and ${fra.months} months for your own benefit, ${sfra.years} and ${sfra.months} months as a widow or widower. You turn 69 in 2026.`,
    title: 'Born in 1957: Social Security at 69 in 2026, Two Full Ages',
    description: `Born in 1957: full retirement age 66 and 6 months, survivor full age only 66 and 2 months. At 69 in 2026 you have one year of credits left before 70 in 2027.`,
    h1: 'Social Security for the 1957 cohort, at 69',
    intro: 'Your two full retirement ages sit four months apart, and one year of delayed credits remains.',
    resume: `Anyone born in 1957 (January 2, 1957 through January 1, 1958) has two different full retirement ages. For a worker's own benefit and for spouse benefits it is ${fra.years} and ${fra.months} months, reached in 2023; for a widow or widower benefit it is ${sfra.years} and ${sfra.months} months, because the survivor table in 20 CFR 404.409 runs two years behind. In 2026 this cohort is 69, past both, so a survivor benefit taken now is paid at 100% of what the deceased was entitled to, and an own benefit not yet started still gains two thirds of 1% a month until 70, in 2027, for a maximum of ${Math.round(own70.factor * 100)}% of the PIA. The PIA itself comes from the ${Y + 62} formula, bend points ${$(bp[0])} and ${$(bp[1])}, on earnings indexed to the 2017 average wage, plus the COLAs of December ${Y + 62} to December 2025. A widow who started survivor benefits at 60, in 2017, receives ${Math.round((1 - P.reduction.widow_max) * 1000) / 10}% of the deceased's amount for life.`,
    faqs: [
      { q: 'Why is my survivor full retirement age earlier than my own?', a: `Congress raised the two ages on separate schedules. The worker table starts rising with people born in 1938; the widow table starts with people born in 1940 and moves two years later at each step. For a 1957 birth that gives ${sfra.years} and ${sfra.months} months for survivor benefits and ${fra.years} and ${fra.months} months for retirement, both under 20 CFR 404.409.` },
      { q: 'Widowed at 69, can I take the survivor benefit now and my own later?', a: `Yes. You receive the higher of the two at any time, and you can start one and switch to the other later. Taking the survivor benefit now and your own at 70, in 2027, lets your own amount collect its last ${840 - 828} months of credit, if your own benefit at 70 would be the larger one.` },
      { q: 'Is one more year of waiting worth it at 69?', a: `A year of delay from 69 to 70 adds 8 percentage points of PIA. On a PIA of ${$(own)}, the check moves from ${$(own69.benefit)} to ${$(own70.benefit)}, a gain of ${$(own70.benefit - own69.benefit)} a month, paid for by giving up about ${$(own69.benefit * 12)} of benefits in that year.` },
      { q: 'Which bend points apply to people born in 1957?', a: `Those of ${Y + 62}, the year you turned 62: ${$(bp[0])} and ${$(bp[1])}. They never change afterwards, even if you claim at 70. What has raised your PIA since is the cost-of-living series, ${P.series.cola['2019']}% for December ${Y + 62} and every adjustment after it.` },
    ],
    body: (h) => {
      const ages: Array<[string, number]> = [['60 (2017)', 720], ['62 (2019)', 744], ['64 (2021)', 768], ['65 (2022)', 780], ['66 (2023)', 792], [`${sfra.years} and ${sfra.months} months (2023)`, sfra.total], ['69 (2026)', 828]];
      const rows = ages.map(([label, m]) => { const x = survivorBenefit({ deceasedPia: dec, deceasedClaimMonths: null, deceasedFraMonths: fra.total, survivorClaimMonths: m, survivorFraMonths: sfra.total }); return [label, String(x.monthsEarly), h.pct(1 - x.reductionPct, 1), h.usd(x.benefit)]; });
      return `
<h2>Four months between the two tables</h2>
<p>The 1957 cohort is the first whose survivor full age in ${h.src('cfr404_409', '20 CFR 404.409')} goes above 66: ${sfra.years} and ${sfra.months} months, against ${fra.years} and ${fra.months} months for retirement. Widows and widowers born in 1945 through 1956 all had 66. The gap matters only for a person who becomes a widow or widower before reaching both ages, since the survivor reduction is spread over the months between 60 and the survivor full age, not the worker full age.</p>
<p>The reduction for widow benefits is ${h.pct(P.reduction.widow_max)} at 60, scaled down month by month (${h.src('cfr404_410', '20 CFR 404.410')}). The table applies it to a deceased worker with a PIA of ${h.usd(dec)} who had not started benefits.</p>
${h.table(['Survivor benefit starts at', 'Months before survivor full age', 'Share paid', 'Monthly amount'], rows, `Widow or widower born in 1957, deceased PIA of ${h.usd(dec)}, before COLAs`, ['l', 'r', 'r', 'r'])}
<p>A widow who chose 60 in 2017 locked in ${h.usd(at60.benefit)} in this example. At 69 there is nothing left to reduce: the full amount is payable, and if the deceased had earned delayed credits, those count too. When the deceased had started early, a separate limit applies, explained on the ${h.a('survivor-calculator', 'survivor calculator')}.</p>
<h2>Your own benefit in its final year of growth</h2>
<p>If you have not filed on your own record, credits have been running since 2023. At 69 they stand at ${h.pct(own69.factor - 1)}, and the remaining months to 70 bring the total to ${h.pct(own70.factor - 1)} (${h.src('cfr404_313', '20 CFR 404.313')}). A married person weighing this should also look at what the higher earner's choice does to the ${h.a('married-couples', 'household')}, since the larger benefit becomes the survivor benefit.</p>
<h2>The ${Y + 62} formula year</h2>
<p>Turning 62 in ${Y + 62} placed this cohort on bend points of ${h.usd(bp[0])} and ${h.usd(bp[1])}, with 2017 as the indexing year (average wage ${h.num(P.series.awi['2017'], 2)}). Since then, seven cost-of-living adjustments have been applied, the largest being ${P.series.cola['2022']}% for December 2022, and they were credited even to people who had not claimed. The ${h.a('claiming-at-70', 'claiming at 70 page')} shows the same arithmetic for every cohort that still has credits to earn.</p>`;
    },
  },
});
