import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { spousalBenefit, spouseReduction, fraRetirement } from '../../lib/engine/ss';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pc = (x: number) => `${Math.round(x * 1000) / 10}%`;
const FRA = fraRetirement(1964).total;
const W = 3000, OWN = 800, BIG = 1600;
const S62 = 62 * 12 + 1;
const at62 = P.family.spouse_max * (1 - spouseReduction(FRA - 62 * 12));
const none62 = spousalBenefit(W, 0, S62, FRA), own62 = spousalBenefit(W, OWN, S62, FRA), ownFra = spousalBenefit(W, OWN, FRA, FRA);
const own70 = spousalBenefit(W, OWN, 70 * 12, FRA), big = spousalBenefit(W, BIG, FRA, FRA);
const kid = spousalBenefit(W, 0, S62, FRA, true);
const R = P.extra.claiming_rules;
const deemedYear = Number(R.deemed_filing_born_from.slice(0, 4));

export default definePage({
  id: 'spousal-calculator',
  group: 'tools',
  order: 40,
  tool: 'spouse',
  related: ['divorced-spouse', 'married-couples', 'family-maximum', 'survivor-calculator', 'full-retirement-age'],
  sources: ['ssaSpouse', 'cfr404_330', 'pomsDeemed', 'cfr404_410', 'cfr404_331', 'cfr404_415'],
  en: {
    slug: 'spousal-benefits-calculator',
    nav: 'Spousal benefits',
    card: `Up to half the worker's PIA at full retirement age, ${pc(at62)} at 62, and only the part above your own benefit.`,
    title: `Spousal Benefits 2026: Half the PIA, ${pc(at62)} at Age 62`,
    description: `Spousal benefits in 2026: up to 50% of the worker's PIA at your full retirement age, ${pc(at62)} at 62 when it is 67, paid only above your own PIA. Run your own case.`,
    h1: 'Spousal benefits calculator: what a husband or wife can draw on the other\'s record',
    intro: 'Enter both PIAs and the spouse\'s start age: the tool applies deemed filing and shows the own benefit and the spousal top-up separately.',
    resume: `A spouse can receive up to ${pc(P.family.spouse_max)} of the worker's primary insurance amount, but only at the spouse's own full retirement age and only as a top-up above the spouse's own PIA. With a full retirement age of 67, starting at exactly 62 cuts that half to ${pc(at62)} of the worker's PIA, because the spouse reduction is 25/36 of 1% for each of the first 36 months early and 5/12 of 1% beyond. If the worker's PIA is ${$(W)} and the spouse has no record, the spouse gets ${$(none62.total)} a month from 62 and 1 month and ${$(P.family.spouse_max * W)} at 67. If the spouse has an own PIA of ${$(OWN)}, deemed filing pays both together: ${$(own62.total)} at 62 and 1 month, ${$(ownFra.total)} at 67. There are no delayed credits on the spousal part, the worker must already be receiving benefits, and a spouse caring for the worker's child under 16 is paid without the age reduction.`,
    faqs: [
      { q: 'Can I take only the spousal benefit now and switch to my own at 70?', a: `Not if you were born on or after ${R.deemed_filing_born_from.replace(/^(\d{4})-01-02$/, 'January 2, $1')}. For you, deemed filing applies at any age: applying for one benefit counts as applying for both (POMS GN 00204.035, Bipartisan Budget Act of 2015). The restricted application that allowed spousal-only claims survives only for people born before that date, all of whom are now past 70.` },
      { q: 'My husband has not filed yet. Can I get a spouse benefit?', a: `No. Under 20 CFR 404.330 you are entitled as the spouse of an insured person who is entitled to old-age or disability benefits, so he must have filed. Your marriage must also have lasted at least ${R.spouse_marriage_years} year, with exceptions such as a shared child. A divorced spouse divorced for 2 years or more is the exception: the ex only needs to be 62.` },
      { q: 'Does my spousal benefit grow if I wait past 67?', a: `No. The spousal part stops growing at your full retirement age: delayed credits apply only to a worker's own benefit. With an own PIA of ${$(OWN)} on a ${$(W)} record, waiting to 70 gives ${$(own70.total)}: your own part rises to ${$(own70.ownBenefit)}, the ${$(own70.reducedExcess)} top-up stays flat.` },
      { q: 'If my wife claims on my record, does my own check go down?', a: `No. Your benefit is computed on your record alone and the spouse benefit is paid on top. The only shared limit is the family maximum, which caps the total on one record when children also draw benefits; a spouse alone stays under it. A divorced spouse is paid outside that cap altogether (20 CFR 404.403).` },
    ],
    body: (h) => {
      const ages = [S62, 63 * 12, 64 * 12, 65 * 12, 66 * 12, FRA, 70 * 12];
      const rows = ages.map((a) => { const x = spousalBenefit(W, 0, a, FRA), y = spousalBenefit(W, OWN, a, FRA); return [a === S62 ? '62 and 1 month' : String(a / 12), h.pct(x.total / W), h.usd(x.total), `${h.usd(y.ownBenefit)} + ${h.usd(y.reducedExcess)}`, h.usd(y.total)]; });
      return `
<h2>Own benefit first, spousal top-up second</h2>
<p>The spouse benefit is not half the worker's check added to yours. The SSA first pays your own retirement benefit, then adds the difference between half the worker's PIA and your own PIA, if there is one. Here, half of ${h.usd(W)} is ${h.usd(none62.fullSpousal)}; a spouse with an own PIA of ${h.usd(OWN)} has an excess of ${h.usd(own62.excess)}. Each part is reduced for age with its own rate. A spouse whose own PIA reaches half the worker's, say ${h.usd(BIG)}, gets no top-up at all: ${h.usd(big.total)}, the own benefit alone. This is condition (d) of ${h.src('cfr404_330', '20 CFR 404.330')}.</p>
${h.table(['Spouse starts at', 'Share of worker PIA, no own record', 'No own record', `Own PIA ${h.usd(OWN)}: own + spousal`, 'Total'], rows, `Worker PIA ${h.usd(W)}, spouse's full retirement age 67`, ['l', 'r', 'r', 'r', 'r'])}

<h2>Deemed filing: one application, both benefits</h2>
<p>For everyone born on or after January 2, ${deemedYear}, applying for your own retirement benefit counts as applying for the spouse benefit too, and the other way around, at any age (${h.src('pomsDeemed', 'POMS GN 00204.035')}). You cannot start the spousal part early and leave your own record to grow. That is why the tool takes a single start age for the spouse and returns both pieces together. Deemed filing does not apply to survivor benefits, which is a different strategy covered on the ${h.a('survivor-calculator', 'survivor calculator')}.</p>

<h2>The child-in-care exception</h2>
<p>A spouse of any age who has in care the worker's child under 16, or a disabled child, and that child is entitled on the worker's record, is paid the spouse benefit without the age reduction. With no own record and the worker's PIA at ${h.usd(W)}, that means ${h.usd(kid.total)} a month instead of ${h.usd(none62.total)}. POMS also exempts this case from deemed filing. When the child turns 16, POMS says the spouse benefit is suspended; a spouse who is 62 or older can then file an election to receive it reduced for age. The total paid on the record is limited by the ${h.a('family-maximum', 'family maximum')}, which often binds when several children draw benefits.</p>

<h2>Who must have filed, and whose earnings count</h2>
<p>A current spouse can only be paid once the worker is entitled to retirement or disability benefits. A divorced spouse, married for at least ${P.family.divorce_marriage_years} years and divorced for at least ${P.family.divorce_independent_years}, can be paid as soon as the ex is 62, filed or not (${h.src('cfr404_331', '20 CFR 404.331')}). If the worker claims before full retirement age and keeps working, the earnings test also withholds from the spouse benefit paid on that record, except for a divorced spouse divorced 2 years or more (${h.src('cfr404_415', '20 CFR 404.415(b)')}). The ${h.a('divorced-spouse', 'divorced spouse page')} covers the ex-spouse rules in detail.</p>

<h2>Limits of the tool</h2>
<p>It assumes a spouse full retirement age from the birth year you pick and a PIA for each person, taken from each statement. It does not apply the family maximum, the earnings test or the government pension rules that existed before the ${h.a('ssfa', 'Social Security Fairness Act')}. With a child in care, it compares the unreduced spouse benefit taken alone with the own benefit plus the top-up, and shows the higher of the two.</p>`;
    },
  },
});
