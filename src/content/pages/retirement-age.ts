import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { fraRetirement, fraSurvivor, benefitAtAge, monthAttaining } from '../../lib/engine/ss';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pc = (x: number, d = 1) => `${(Math.round(x * 10 ** (d + 2)) / 10 ** d).toLocaleString('en-US')}%`;
const age = (m: number) => { const y = Math.floor(m / 12), mo = m % 12; return mo ? `${y} and ${mo} month${mo > 1 ? 's' : ''}` : `${y}`; };
const f60 = fraRetirement(1960);
const MED = P.extra.medicare_age.first_eligible;
const W60 = P.reduction.widow_earliest_age;
const k62 = benefitAtAge(1000, 62 * 12, f60.total).factor, k70 = benefitAtAge(1000, 840, f60.total).factor;
const b1964 = { y: 1964, m: 6, d: 15 };
const when = (m: number) => monthAttaining(b1964, m).y;

export default definePage({
  id: 'retirement-age',
  group: 'claiming',
  order: 20,
  mini: 'ageLadderByYear',
  miniHref: 'full-retirement-age',
  related: ['full-retirement-age', 'claiming-at-62', 'claiming-at-70', 'when-to-claim', 'working-after-fra'],
  sources: ['cfr404_409', 'ssaNra', 'cfr404_313', 'cfr404_621', 'ssaMedicareSignup', 'ssaWhileWorking'],
  en: {
    slug: 'social-security-retirement-age',
    nav: 'Retirement age',
    card: `62, 67 and 70 for your own check, 60 for a widow or widower, 65 for Medicare: five ages that are all called retirement age.`,
    title: `Social Security Retirement Age 2026: 62, 67, 70 and Beyond`,
    description: `Social Security retirement age in 2026: benefits from 62, full amount at 67 if born in 1960 or later, no gain after 70, survivors from 60, Medicare at 65.`,
    h1: 'Social Security retirement age: which of the five ages people mean',
    intro: 'Ask five people what the retirement age is and you may get five right answers. Each one switches on a different rule.',
    resume: `There is no single Social Security retirement age. Retirement benefits can start at 62, in practice at 62 and 1 month for most people, at ${pc(k62, 0)} of the full amount when full retirement age is 67. Full retirement age itself is ${age(f60.total)} for anyone born in 1960 or later and between 66 and 66 and 10 months for people born from 1943 to 1959. Delayed retirement credits stop at ${P.drc.stop_age}, when the check reaches ${pc(k70, 0)} of the full amount for a full retirement age of 67; waiting longer adds nothing. Two other ages often get mixed in: ${W60}, the earliest age for widow and widower benefits, and ${MED}, the age at which Medicare starts whatever you decide about Social Security. No age forces you to stop working: the earnings test only applies before full retirement age, and the law sets no age by which you must claim. For someone born in mid-1964, those ages fall in ${when(W60 * 12)}, ${when(62 * 12 + 1)}, ${when(MED * 12)}, ${when(f60.total)} and ${when(840)}.`,
    faqs: [
      { q: 'Can I retire at 55 and collect Social Security?', a: `Not a retirement benefit: the earliest is 62. A widow or widower can start survivor benefits at ${W60}, or 50 if disabled. Disability benefits follow their own rules at any age. Stopping work at 55 does not stop you from claiming at 62 later, but the years from 55 to 62 with no earnings may count as zeros among your best 35.` },
      { q: 'Is there an age by which I have to claim Social Security?', a: `No. But delayed credits stop at ${P.drc.stop_age}, so waiting longer brings nothing, and an application can reach back at most ${P.claiming.retroactive_months} months (20 CFR 404.621). Someone who applies at 71 is paid from 70 and 6 months at the earliest; the first 6 months after 70 are gone. Applying in the months before 70 avoids the problem.` },
      { q: 'Does Medicare start at my full retirement age?', a: `No. Medicare eligibility starts at ${MED} for everyone, even though full retirement age is now ${age(f60.total)} for people born in 1960 or later. If you already receive Social Security at ${MED}, you are enrolled in Part A automatically; if you are waiting, you have to sign up yourself during the enrollment window around your birthday.` },
      { q: 'Do I have to stop working when I reach retirement age?', a: `No. No law sets a retirement age for workers. Before full retirement age, earnings above ${$(P.earnings_test.lower_annual)} in 2026 cause part of your benefits to be withheld if you collect while working; from the month you reach full retirement age, you can earn any amount and keep every check.` },
      { q: 'Why did my mother retire with full benefits at 65 and I have to wait until 67?', a: `Because full retirement age was 65 for people born in 1937 or earlier and then rose by two months per birth year, to 66 for 1943 to 1954 and to 67 for 1960 and later. The schedule is in 20 CFR 404.409. Medicare stayed at 65.` },
    ],
    body: (h) => {
      const years = [1955, 1956, 1957, 1958, 1959, 1960, 1964, 1970];
      const rows = years.map((y) => { const f = fraRetirement(y), bb = { y, m: 6, d: 15 }; return [String(y), String(monthAttaining(bb, 62 * 12 + 1).y), `${age(f.total)} (${monthAttaining(bb, f.total).y})`, `${h.pct(benefitAtAge(1000, 840, f.total).factor)} (${monthAttaining(bb, 840).y})`, `${age(fraSurvivor(y).total)}`]; });
      return `
<h2>Five ages, five different switches</h2>
<p><strong>${W60}</strong> is the earliest age for a widow or widower who is not disabled, at ${h.pct(1 - P.reduction.widow_max)} of the deceased's benefit. <strong>62</strong> is the earliest age for your own retirement benefit and for a spouse benefit, both permanently reduced. <strong>${MED}</strong> opens Medicare. <strong>Full retirement age</strong>, between 66 and 67 depending on the birth year, pays your full PIA and ends the earnings test. <strong>${P.drc.stop_age}</strong> is where delayed credits stop. When someone says "retirement age", they usually mean full retirement age, but some mean 62, the first possible check, and others ${MED}, the Medicare age.</p>

<h2>Your ages by birth year</h2>
${h.table(['Born in', 'First check possible', 'Full retirement age (year)', 'Share at 70 (year)', 'Survivor full age'], rows, 'Calendar years for a mid-year birthday; born on January 1, use the previous year', ['l', 'l', 'l', 'r', 'l'])}
<p>The share at 70 depends on how many months lie between full retirement age and 70, each earning 2/3 of 1% under ${h.src('cfr404_313', '20 CFR 404.313')}. A person born in 1955, with a full retirement age of ${age(fraRetirement(1955).total)}, earns more credit months than someone born in 1960 and ends at a higher percentage. The ages themselves come from ${h.src('cfr404_409', '20 CFR 404.409')} and the ${h.src('ssaNra', 'SSA\'s retirement age table')}.</p>

<h2>Why 62 is not really 62</h2>
<p>To be entitled for a month, you must be 62 throughout that month. Since the SSA counts you as reaching an age the day before your birthday, only people born on the 1st or 2nd of a month are 62 for their whole birthday month. Everyone else starts at 62 and 1 month at the earliest. The difference is small, one month of reduction less, but it explains why first checks never quite match calculators that assume exactly 62.</p>

<h2>Full retirement age has moved; Medicare has not</h2>
<p>For people born in 1937 and before, full retirement age and Medicare age were both 65. The full retirement age has since risen to ${age(f60.total)}, while Medicare eligibility stayed at ${MED}. The ${h.src('ssaMedicareSignup', 'SSA')} says most people sign up for Part A and Part B when first eligible, typically at ${MED}, and that someone already receiving Social Security at ${MED} is enrolled in Part A automatically. A person who waits until 67 or 70 for Social Security has to sign up for Medicare separately; delaying one does not delay the other.</p>

<h2>Survivors have their own calendar</h2>
<p>Widows and widowers follow a second full retirement age table that runs two years behind the retirement one: 66 for those born from 1945 to 1956, rising to 67 only for people born in 1962 or later. Between ${W60} and that age, the survivor benefit is reduced; at that age it reaches 100% of what the deceased was entitled to. For the earnings test, though, the SSA uses the retirement full retirement age, as its ${h.src('ssaWhileWorking', 'page on working while receiving benefits')} states. The ${h.a('survivor-calculator', 'survivor calculator')} applies both.</p>

<h2>No mandatory age, but a practical deadline</h2>
<p>Nothing forces you to claim at any age. Past ${P.drc.stop_age}, however, each month without a check is simply lost, since there is no credit to earn and an application only reaches back ${P.claiming.retroactive_months} months (${h.src('cfr404_621', '20 CFR 404.621')}). That retroactive window also has a floor: it cannot reach back to a month before full retirement age if that would reduce the benefit. In practice, people who plan to wait apply a few months before their 70th birthday.</p>
<p>Work is a separate question. You can keep working while collecting at any age. Before full retirement age, the ${h.a('earnings-test', 'earnings test')} holds back part of your benefits above a yearly limit; from that age, earnings no longer matter, as described in ${h.a('working-after-fra', 'working after full retirement age')}.</p>

<h2>Which age matters for your decision</h2>
<p>For the size of your own check, the comparison is between 62, full retirement age and 70: each month earlier costs 5/9 of 1% (5/12 beyond 36 months) and each month later earns 2/3 of 1%. For a couple, the survivor age of the lower earner matters as much as the claiming age of the higher earner. For health coverage, ${MED} is the date to plan around. The pages on ${h.a('claiming-at-62', 'starting at 62')} and ${h.a('claiming-at-70', 'waiting until 70')} take each end in turn, and the ${h.a('full-retirement-age', 'full retirement age tool')} gives the exact month from your date of birth.</p>`;
    },
  },
});
