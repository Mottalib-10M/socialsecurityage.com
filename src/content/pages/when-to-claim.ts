import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { benefitAtAge, breakEvenMonths, fraRetirement, survivorBenefit, earningsTest } from '../../lib/engine/ss';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const age = (m: number) => { const t = Math.round(m), y = Math.floor(t / 12), mo = t % 12; return mo ? `${y} and ${mo} month${mo > 1 ? 's' : ''}` : `${y}`; };
const FRA = fraRetirement(1964).total;
const PIA = 2000;
const S62 = 62 * 12 + 1, S70 = 70 * 12;
const e = benefitAtAge(PIA, S62, FRA), n = benefitAtAge(PIA, FRA, FRA), l = benefitAtAge(PIA, S70, FRA);
const be = (a: { start: number; benefit: number }, b: { start: number; benefit: number }) => breakEvenMonths(a, b) ?? 0;
const be6267 = be({ start: S62, benefit: e.benefit }, { start: FRA, benefit: n.benefit });
const be6770 = be({ start: FRA, benefit: n.benefit }, { start: S70, benefit: l.benefit });
const be6270 = be({ start: S62, benefit: e.benefit }, { start: S70, benefit: l.benefit });
const lowPia = 1000, highPia = 4000;
const beLow = be({ start: S62, benefit: benefitAtAge(lowPia, S62, FRA).benefit }, { start: S70, benefit: benefitAtAge(lowPia, S70, FRA).benefit });
const beHigh = be({ start: S62, benefit: benefitAtAge(highPia, S62, FRA).benefit }, { start: S70, benefit: benefitAtAge(highPia, S70, FRA).benefit });
const HI = 3000;
const widow = (start: number) => survivorBenefit({ deceasedPia: HI, deceasedClaimMonths: start, deceasedFraMonths: FRA, survivorClaimMonths: FRA, survivorFraMonths: FRA }).benefit;
const w62 = widow(S62), w67 = widow(FRA), w70 = widow(S70);
const job = 40000;
const et = earningsTest(e.benefit, job, 'before');

export default definePage({
  id: 'when-to-claim',
  group: 'tools',
  order: 20,
  tool: 'claiming',
  related: ['claiming-at-62', 'claiming-at-70', 'full-retirement-age', 'survivor-calculator', 'earnings-test'],
  sources: ['cfr404_410', 'cfr404_313', 'poms615320', 'ssaEarlyRetire', 'ssaDelayed', 'ssaWhileWorking'],
  en: {
    slug: 'when-to-take-social-security',
    nav: 'When to claim',
    card: `Break-even ages between 62, 67 and 70: waiting to 70 overtakes a start at 62 around age ${Math.floor(be6270 / 12)}.`,
    title: `Social Security Break-Even Age 2026: 62 vs 67 vs 70`,
    description: `When to take Social Security in 2026: with a full retirement age of 67, a start at 70 overtakes a start at 62 around age ${Math.floor(be6270 / 12)}. See your own break-even ages.`,
    h1: 'When to take Social Security: the break-even age for each start',
    intro: 'Every month you wait raises the check for life; the question is how long it takes for the bigger check to make up for the months you did not collect.',
    resume: `For a worker whose full retirement age is 67, a primary insurance amount of ${$(PIA)} pays ${$(e.benefit)} a month from 62 and 1 month, ${$(n.benefit)} at 67 and ${$(l.benefit)} at 70. Added up month by month in today's dollars, the start at 67 catches up with the start at 62 at about age ${age(be6267)}, the start at 70 catches up with the start at 67 at about ${age(be6770)}, and 70 overtakes 62 at about ${age(be6270)}. Those ages barely move with the size of the benefit, because the early reduction (5/9 of 1% a month for 36 months, 5/12 of 1% beyond) and the delayed credit of 2/3 of 1% a month are percentages of the same PIA. Two facts change the picture for many households: a widow or widower inherits the larger check of a spouse who waited, and the 2026 earnings test holds back $1 of every $2 earned above ${$(P.earnings_test.lower_annual)} if you claim early and keep working.`,
    faqs: [
      { q: 'Does the size of my benefit change my break-even age?', a: `Hardly. With a PIA of ${$(lowPia)} or ${$(highPia)}, a start at 70 overtakes a start at 62 and 1 month at about ${age(beLow)} and ${age(beHigh)}. Both checks are fixed percentages of the same PIA under 20 CFR 404.410 and 404.313, so the crossover depends on the gap in months and percentages, not on the dollar amount. Only rounding to the dollar moves it slightly.` },
      { q: 'How does my claiming age change what my wife gets if I die first?', a: `Her widow benefit is based on what you were receiving. With a PIA of ${$(HI)} and a survivor at full retirement age, she would get ${$(w70)} if you had started at 70, ${$(w67)} if you started at 67, and ${$(w62)} if you had started at 62, the floor of ${P.family.widow_limit * 100}% of your PIA set by POMS RS 00615.320.` },
      { q: 'If I start at 64, can I move to a bigger check later?', a: `Two doors exist. Within ${P.claiming.withdraw_within_months} months of your first month of entitlement you can withdraw the application once, repaying everything received (20 CFR 404.640). After full retirement age you can ask to suspend payments, and each suspended month earns the delayed credit of 2/3 of 1% until 70.` },
      { q: 'Do these break-even ages count interest on the money I receive early?', a: 'No. The tool adds up checks in today\'s dollars and nothing else: no interest, no taxes, no Medicare premiums. If the early checks are invested or let you leave savings untouched, the crossover moves later; if they would be spent anyway, the simple count is the closer picture. The calculation is a yardstick, not a forecast of your lifespan.' },
    ],
    body: (h) => {
      const pairs: Array<[number, number]> = [[S62, 63 * 12], [63 * 12, 64 * 12], [64 * 12, 65 * 12], [65 * 12, 66 * 12], [66 * 12, FRA], [FRA, 68 * 12], [68 * 12, 69 * 12], [69 * 12, S70], [S62, FRA], [FRA, S70], [S62, S70]];
      const rows = pairs.map(([a, b]) => { const x = benefitAtAge(PIA, a, FRA).benefit, y = benefitAtAge(PIA, b, FRA).benefit; return [age(a), age(b), `${h.usd(x)} vs ${h.usd(y)}`, age(be({ start: a, benefit: x }, { start: b, benefit: y }))]; });
      const gaps = pairs.slice(0, 8).map(([a, b]) => (be({ start: a, benefit: benefitAtAge(PIA, a, FRA).benefit }, { start: b, benefit: benefitAtAge(PIA, b, FRA).benefit }) - b) / 12);
      return `
<h2>The crossover, start age by start age</h2>
<p>A break-even age is the birthday at which the total received from a later start equals the total from an earlier one. Before it, the early claimant is ahead; after it, the patient one is. The tool above computes it for your own PIA and birth year. The table below does it for a worker born in 1964, with a full retirement age of 67 and a PIA of ${h.usd(PIA)}, one year of delay at a time and then for the three classic pairs.</p>
${h.table(['Earlier start', 'Later start', 'Monthly checks', 'Totals equal at'], rows, `PIA ${h.usd(PIA)}, full retirement age 67, totals in today's dollars`, ['l', 'l', 'r', 'r'])}
<p>The pattern is regular. Each year of delay before 67 adds ${h.pct(P.reduction.worker_after36 * 12)} or ${h.pct(P.reduction.worker_first36 * 12)} of the PIA, and each year after 67 adds ${h.pct(P.drc.monthly_born_after_1942 * 12, 0)}. A one-year delay therefore pays back in roughly ${Math.floor(Math.min(...gaps))} to ${Math.ceil(Math.max(...gaps))} years after the later start, and the crossover between the extremes, 62 and 70, sits around ${age(be6270)}. The reduction rates come from ${h.src('cfr404_410', '20 CFR 404.410')} and the delayed credits from ${h.src('cfr404_313', '20 CFR 404.313')}.</p>

<h2>Why cost-of-living raises do not shift the result</h2>
<p>Each December, every retirement benefit is raised by the same percentage, ${P.cola_2026.pct}% for the increase payable in January 2026. A start at 62 and a start at 70 both carry that raise, from the same months, so in inflation-adjusted dollars the two streams keep exactly the same ratio and the crossover stays where it is. COLAs from 62 onward are applied to your PIA even if you have not claimed yet, which is why the tool can work in today's dollars without losing anything. Adding up nominal dollars instead gives slightly more weight to later, larger checks and pulls the crossover a little earlier.</p>

<h2>The married higher earner: the check outlives you</h2>
<p>For a couple, the break-even is not only about the life of the person who claims. When the higher earner dies, the survivor keeps the larger of the two checks. If that higher earner had a PIA of ${h.usd(HI)}, a widow or widower at full retirement age receives ${h.usd(w70)} if the deceased had waited to 70, ${h.usd(w67)} after a start at 67, and ${h.usd(w62)} after a start at 62. That last figure is not the deceased's reduced check: the ${h.src('poms615320', 'RIB-LIM rule (POMS RS 00615.320)')} lets the survivor keep the larger of that check or ${P.family.widow_limit * 100}% of the PIA. The relevant horizon becomes the longer of two lives, which pushes the arithmetic toward a later start for the higher earner. The ${h.a('survivor-calculator', 'survivor calculator')} runs any combination.</p>

<h2>Claiming early while still working</h2>
<p>Before full retirement age, the ${h.a('earnings-test', 'earnings test')} holds back $1 of benefits for every $2 of wages above ${h.usd(P.earnings_test.lower_annual)} in 2026. With ${h.usd(job)} of pay and a ${h.usd(e.benefit)} check started at 62, ${h.usd(et.withheld)} is withheld over the year, about ${et.monthsWithheld} monthly payments. Those months are not lost: at full retirement age the SSA recomputes the benefit as if you had started later, as the ${h.src('ssaWhileWorking', 'SSA explains')}. But the early check you planned on does not arrive while you work, so the break-even reasoning only applies to the months actually paid.</p>

<h2>What the tool leaves out</h2>
<p>It counts gross checks, not taxes on them, not Medicare premiums withheld from them, and not the return the money could earn. It does not know your health, your other income or your spouse's record. The age at which you start is a personal decision; this page only measures how the totals compare. For the details at each end, see ${h.a('claiming-at-62', 'starting at 62')} and ${h.a('claiming-at-70', 'waiting until 70')}.</p>`;
    },
  },
});
