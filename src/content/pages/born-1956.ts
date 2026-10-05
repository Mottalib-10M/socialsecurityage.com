import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { benefitAtAge, computePia, fraRetirement, projectCareer } from '../../lib/engine/ss';

const Y = 1956;
const fra = fraRetirement(Y);
const bp = bendPoints(Y + 62);
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const b = { y: Y, m: 6, d: 15 };
const S = 60000;
const r = computePia(b, projectCareer(b, S, 22, 62));
const at70 = benefitAtAge(r.pia, 840, fra.total);
const atFra = benefitAtAge(r.pia, fra.total, fra.total);
const late = 840 - fra.total;
const retro = P.claiming.retroactive_months;

export default definePage({
  id: 'born-1956',
  group: 'birthyear',
  order: 1956,
  mini: 'birthDrcClock',
  miniHref: 'when-to-claim',
  related: ['born-1955', 'born-1957', 'claiming-at-70', 'when-to-claim', 'working-after-fra'],
  sources: ['cfr404_313', 'ssaDelayed', 'cfr404_621', 'cfr404_409', 'ssaBendPoints'],
  en: {
    slug: 'social-security-born-in-1956',
    nav: 'Born in 1956',
    card: `You turn 70 in 2026: the last delayed credits land this year, for ${Math.round(at70.factor * 10000) / 100}% of the PIA at most.`,
    title: 'Born in 1956: Social Security at 70 in 2026, Last Credits',
    description: `Born in 1956: you turn 70 in 2026, the last month of delayed credits. ${late} months past full age 66 and 4 months lift the benefit to ${Math.round(at70.factor * 10000) / 100}% of your PIA.`,
    h1: 'Social Security if you were born in 1956: the year you turn 70',
    intro: 'This is the deadline year: the 70th birthday month is the last one that adds anything to the check.',
    resume: `People born in 1956 (from January 2, 1956 to January 1, 1957) turn 70 during 2026, which makes this the final year in which waiting raises a Social Security retirement benefit. Their full retirement age, ${fra.years} and ${fra.months} months, arrived in 2022; each month of delay since then has added two thirds of 1% to the primary insurance amount, so a claim starting in the month of the 70th birthday pays ${Math.round(at70.factor * 10000) / 100}% of the PIA, the result of ${late} months of credit. The PIA itself was set by the ${Y + 62} formula (bend points ${$(bp[0])} and ${$(bp[1])}) on earnings indexed to 2016 wages, then raised by every COLA from December ${Y + 62} through the ${P.cola_2026.pct}% increase of December 2025. For a career at ${$(S)} in today's pay, that means ${$(atFra.benefit)} a month at full retirement age against ${$(at70.benefit)} from 70. Any month after 70 adds nothing.`,
    faqs: [
      { q: 'My 70th birthday is in 2026. What month should my benefit start?', a: `The month you reach 70, because no credit accrues after it. The SSA considers you 70 the day before your birthday, so someone born on the 1st reaches it in the previous month. Filing a few months late still works: an application can reach back ${retro} months when the benefit is not reduced for age, which lets a late filer start at 70 anyway.` },
      { q: 'Why did my delayed credits not show up last January?', a: 'Credits earned in a year are normally added to the benefit the following January. The year you reach 70 is the exception: those credits are applied right away when your benefit starts. Someone who files at 70 in 2026 therefore receives the whole increase from the first payment.' },
      { q: 'Are credits worth the same for every month I waited after 66 and 4 months?', a: `Yes. For anyone born after 1942 the rate is two thirds of 1% per month, 8% a year, from the full retirement age to 70 (20 CFR 404.313). For the 1956 cohort that means ${late} months, so the maximum gain is ${Math.round((at70.factor - 1) * 10000) / 100}%, slightly less than the 32% available to people whose full age is 66.` },
      { q: 'If I already started at 66 in 2022, can I still pick up credits?', a: `Only by suspending, and only until 70. After full retirement age you may ask the SSA to suspend payments; each suspended month then earns the same two thirds of 1%. With 70 arriving in 2026, the few months left offer a small gain compared with the payments given up.` },
    ],
    body: (h) => {
      const ages: Array<[string, number]> = [[`${fra.years} and ${fra.months} months (2022)`, fra.total], ['67 (2023)', 804], ['68 (2024)', 816], ['69 (2025)', 828], ['69 and 6 months (2025-2026)', 834], ['69 and 9 months (2026)', 837], ['70 (2026)', 840]];
      const rows = ages.map(([label, m]) => { const x = benefitAtAge(r.pia, m, fra.total); return [label, String(x.monthsLate), h.pct(x.factor, 2), h.usd(x.benefit)]; });
      return `
<h2>The last stretch of delayed credits</h2>
<p>Delayed retirement credits exist only between full retirement age and 70 (${h.src('cfr404_313', '20 CFR 404.313')}). For people born in 1956 that window opened in 2022 and closes in 2026, in the month of the 70th birthday. Late in the window each month adds the same two thirds of 1% as early on, which is why the table keeps climbing in a straight line right up to the end.</p>
${h.table(['Benefit starts at', 'Months of credit', 'Share of PIA', `Example (PIA ${h.usd(r.pia, 2)})`], rows, `Born in 1956, career at ${h.usd(S)} in today's pay. PIA includes COLAs through December 2025`, ['l', 'r', 'r', 'r'])}
<p>The step from 69 to 70 is worth ${h.usd(at70.benefit - benefitAtAge(r.pia, 828, fra.total).benefit)} a month in this example, for life and before future COLAs. Whether a year of waiting pays off is a question of how long benefits are collected; the ${h.a('when-to-claim', 'claiming-age tool')} computes the break-even age.</p>
<h2>Filing on time, or a little late</h2>
<p>Being a few weeks late is not costly. The ${h.src('cfr404_621', 'retroactivity rule')} allows benefits for up to ${retro} months before the month you apply, provided the benefit is not reduced for age, which is never the case at 70. An application filed in the autumn can therefore still begin in the birthday month. Waiting longer than ${retro} months after 70 does lose money, because the oldest months fall outside the window.</p>
<p>One timing detail matters for the first check. Normally credits earned during a year are added only the next January, but the year of the 70th birthday is handled differently, and the full ${h.pct(at70.factor - 1, 2)} increase is applied from the start (${h.src('ssaDelayed', 'SSA delayed retirement page')}).</p>
<h2>The ${Y + 62} formula behind every 1956 benefit</h2>
<p>All 1956 births share the ${Y + 62} bend points, ${h.usd(bp[0])} and ${h.usd(bp[1])}, a year in which the first bend point rose by only ${h.usd(bp[0] - bendPoints(2017)[0])} because the national average wage index grew only ${h.pct(P.series.awi['2016'] / P.series.awi['2015'] - 1)} in 2016. Their AIME was indexed to the 2016 national average wage, ${h.num(P.series.awi['2016'], 2)}, and the earnings of 2016 and later count at face value. Since ${Y + 62} the PIA has grown by ${h.pct(r.pia / r.piaAtEligibility - 1)} through COLAs, from ${h.usd(r.piaAtEligibility, 2)} to ${h.usd(r.pia, 2)} in this example.</p>
<p>Still at work at 70? Earnings no longer trigger any withholding past full retirement age, and a strong year can replace a weak one in the 35 used for the average, as explained on ${h.a('working-after-fra', 'working after full retirement age')}.</p>`;
    },
  },
});
