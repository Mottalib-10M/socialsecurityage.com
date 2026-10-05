import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { benefitAtAge, computePia, fraRetirement, projectCareer } from '../../lib/engine/ss';

const Y = 1955;
const fra = fraRetirement(Y);
const bp = bendPoints(Y + 62);
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const b = { y: Y, m: 6, d: 15 };
const S = 60000;
const r = computePia(b, projectCareer(b, S, 22, 62));
const top = benefitAtAge(r.pia, 840, fra.total);
const colaGain = r.pia / r.piaAtEligibility - 1;
const retro = P.claiming.retroactive_months;

export default definePage({
  id: 'born-1955',
  group: 'birthyear',
  order: 1955,
  mini: 'birthColaLadder',
  miniHref: 'benefits-calculator',
  related: ['born-1956', 'claiming-at-70', 'cola-2026', 'withdraw-or-suspend', 'payment-schedule'],
  sources: ['cfr404_621', 'cfr404_313', 'ssaColaSeries', 'cfr404_409', 'ssaDelayed'],
  en: {
    slug: 'social-security-born-in-1955',
    nav: 'Born in 1955',
    card: `Past 70 in 2026: delayed credits are finished, ${Math.round(top.factor * 1000) / 10}% of the PIA is locked in, and up to ${retro} months can be paid back.`,
    title: 'Born in 1955: Social Security Past 70 in 2026, What Is Left',
    description: `Born in 1955 and not yet claiming in 2026? Credits stopped at 70, so waiting adds nothing. Your PIA uses ${Y + 62} bend points and ${P.cola_2026.pct}% is the latest COLA.`,
    h1: 'Social Security for people born in 1955, now past 70',
    intro: 'For this cohort the waiting game is over: every month not claimed after 70 is a month lost.',
    resume: `If you were born in 1955 (January 2, 1955 to January 1, 1956), you reached your full retirement age of ${fra.years} and ${fra.months} months in 2021 and turned 70 in 2025. Delayed retirement credits stop at 70, so your benefit is frozen at ${Math.round(top.factor * 10000) / 100}% of your primary insurance amount: ${840 - fra.total} months of credit at two thirds of 1% each. Your PIA was computed with the ${Y + 62} formula, bend points of ${$(bp[0])} and ${$(bp[1])}, on earnings indexed to the 2015 wage level, and every cost-of-living adjustment from December ${Y + 62} through the ${P.cola_2026.pct}% increase of December 2025 has been added, a gain of ${Math.round(colaGain * 1000) / 10}% even if you never filed. Anyone in this group who has not applied should know that the SSA pays at most ${retro} months before the month of the application (20 CFR 404.621). A worker who earned the equivalent of ${$(S)} in today's pay from 22 to 62 would collect ${$(top.benefit)} a month.`,
    faqs: [
      { q: 'I turned 71 and never filed for Social Security. Do I lose the money?', a: `Partly. An application made now can reach back up to ${retro} months, and since you are past 70 every one of those months carries the full delayed credit. Months older than that are not paid. Filing this month instead of next month is therefore the only lever left: each month of delay after 70 is simply forfeited, never added to the check.` },
      { q: 'Do COLAs from before I claimed count if I was born in 1955?', a: `Yes. Cost-of-living adjustments are added to the PIA from the year you turned 62, ${Y + 62}, whether or not you were collecting. A late filer starts with a PIA that already includes nine increases, from ${P.series.cola['2017']}% in December 2017 to ${P.cola_2026.pct}% in December 2025.` },
      { q: 'Does working at 71 still change my benefit?', a: 'It can. The earnings test no longer applies after full retirement age, so wages never cause withholding. If a year of earnings at 71 is higher than one of the 35 years used in your average, the SSA recomputes the PIA automatically once the wages are reported, and the check goes up.' },
      { q: 'Is the 1955 full retirement age really 66 and 2 months?', a: `Yes, under 20 CFR 404.409 the age rises by two months for people born in 1955. Someone born on January 1, 1956 is counted with this group. That age stopped mattering for the amount once you passed it: what counts now is the ${Math.round(top.factor * 10000) / 100}% factor reached at 70.` },
    ],
    body: (h) => {
      const rows = [[`${Y + 62} formula`, '', h.usd(r.piaAtEligibility, 2), h.usd(benefitAtAge(r.piaAtEligibility, 840, fra.total).benefit)],
        ...r.colas.map((c) => [`December ${c.year}`, `${c.pct}%`, h.usd(c.pia, 2), h.usd(benefitAtAge(c.pia, 840, fra.total).benefit)])];
      return `
<h2>Credits ended at 70, the clock did not</h2>
<p>The delayed credit described in ${h.src('cfr404_313', '20 CFR 404.313')} accrues only until the month you reach 70. For the 1955 cohort that month fell in 2025, so the factor applied to your PIA is fixed at ${h.pct(top.factor, 2)}. A person who was still holding out at 71 is not building anything: the benefit owed for each month since 70 is identical, and only the most recent ${retro} months can be recovered under ${h.src('cfr404_621', 'the retroactivity rule')}. Months before that window are gone for good.</p>
<p>The practical instruction is short. File for the month you want benefits to begin and ask for the retroactive months in the same application. The first payment then includes the arrears, and the regular check arrives on the Wednesday set by your birth date (see the ${h.a('payment-schedule', 'payment schedule')}).</p>
<h2>Nine COLAs on a ${Y + 62} PIA</h2>
<p>The formula year for everyone born in 1955 is ${Y + 62}, the year of the 62nd birthday. Earnings were indexed to 2015 wages, the year you turned 60, and the ${h.src('ssaColaSeries', 'cost-of-living adjustments')} have been compounding on top ever since. The ladder below follows a career at ${h.usd(S)} in today's pay, for which the AIME is ${h.usd(r.aime)}.</p>
${h.table(['Step', 'COLA', 'PIA', 'Paid with credits to 70'], rows, `Born in 1955, career from 22 to 62 at ${h.usd(S)} in today's pay. Each COLA rounded down to the dime`, ['l', 'r', 'r', 'r'])}
<p>The two large steps, ${P.series.cola['2021']}% for December 2021 and ${P.series.cola['2022']}% for December 2022, explain most of the gap between the PIA computed in ${Y + 62} and the one used today. The ${h.a('cola-2026', 'latest adjustment')} added ${h.usd(r.colas[r.colas.length - 1].pia - r.colas[r.colas.length - 2].pia, 2)} to this example's PIA.</p>
<h2>Already collecting since your sixties</h2>
<p>Most people born in 1955 filed long ago. If you started at 62 and 1 month, the cut for ${fra.total - 745} months of early payment was permanent, and the amount has followed the same COLAs. Two decisions remain open even then: a voluntary suspension earns nothing after 70, since no credit accrues past that month; and a ${h.a('withdraw-or-suspend', 'withdrawal')} is only possible within ${P.claiming.withdraw_within_months} months of entitlement, long past for this group. A widow or widower in this cohort may still switch to a higher survivor benefit if a spouse dies, which is covered on the ${h.a('survivor-calculator', 'survivor calculator')}.</p>
<p>When the Medicare Part B premium is taken from the check, it costs ${h.usd(P.medicare.part_b_2026, 2)} a month in 2026, so the deposit you see is the benefit minus that premium.</p>`;
    },
  },
});
