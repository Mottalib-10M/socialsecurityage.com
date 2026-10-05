import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { benefitAtAge, fraRetirement, breakEvenMonths, cumulative, earningsTest, spousalBenefit, survivorBenefit } from '../../lib/engine/ss';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pc = (x: number, d = 1) => `${(Math.round(x * 10 ** (d + 2)) / 10 ** d).toLocaleString('en-US')}%`;
const age = (m: number) => { const t = Math.round(m), y = Math.floor(t / 12), mo = t % 12; return mo ? `${y} and ${mo} month${mo > 1 ? 's' : ''}` : `${y}`; };
const FRA = fraRetirement(1964).total;
const PIA = 2000, S62 = 62 * 12 + 1;
const exact = benefitAtAge(PIA, 62 * 12, FRA), one = benefitAtAge(PIA, S62, FRA), full = benefitAtAge(PIA, FRA, FRA);
const cut = 1 - exact.factor;
const be = breakEvenMonths({ start: S62, benefit: one.benefit }, { start: FRA, benefit: full.benefit }) ?? 0;
const WAGE = 35000;
const et = earningsTest(one.benefit, WAGE, 'before');
const W = 2800;
const spouseOnW = spousalBenefit(W, 0, FRA, FRA);
const widowAfter62 = survivorBenefit({ deceasedPia: W, deceasedClaimMonths: S62, deceasedFraMonths: FRA, survivorClaimMonths: FRA, survivorFraMonths: FRA });
const widowAfter67 = survivorBenefit({ deceasedPia: W, deceasedClaimMonths: FRA, deceasedFraMonths: FRA, survivorClaimMonths: FRA, survivorFraMonths: FRA });
const fra66 = fraRetirement(1954).total;

export default definePage({
  id: 'claiming-at-62',
  group: 'claiming',
  order: 30,
  mini: 'earlyClaimCut',
  miniHref: 'when-to-claim',
  related: ['when-to-claim', 'claiming-at-70', 'earnings-test', 'withdraw-or-suspend', 'retirement-age'],
  sources: ['cfr404_410', 'ssaEarlyRetire', 'cfr404_621', 'cfr404_640', 'poms615320', 'ssaWhileWorking'],
  en: {
    slug: 'social-security-at-62',
    nav: 'Claiming at 62',
    card: `Starting at 62 keeps ${pc(exact.factor, 0)} of your PIA for life when full retirement age is 67, and the earnings test can hold checks back.`,
    title: `Social Security at 62 in 2026: a Permanent ${pc(cut, 0)} Cut`,
    description: `Social Security at 62 in 2026: if full retirement age is 67, the check is ${pc(cut, 0)} smaller for life, the first month is usually 62 and 1 month, and work can hold it.`,
    h1: 'Taking Social Security at 62: what you keep and what you give up',
    intro: 'Sixty-two is the first door, not a discount that ends later: the reduction stays for the rest of your life.',
    resume: `Claiming Social Security at 62 cuts your benefit by ${pc(cut, 0)} for life when your full retirement age is 67, the case for everyone born in 1960 or later: a ${$(PIA)} PIA pays ${$(exact.benefit)} instead of ${$(full.benefit)}. The cut is 5/9 of 1% for each of the 36 months closest to full retirement age and 5/12 of 1% for each earlier month (20 CFR 404.410). Most people cannot start at exactly 62, because you must be 62 for a whole month; unless you were born on the 1st or 2nd, the first month is 62 and 1 month, which keeps ${pc(one.factor)}, or ${$(one.benefit)}. Cost-of-living adjustments apply to the reduced check, so the gap never closes. If you keep working, the 2026 earnings test withholds $1 for every $2 above ${$(P.earnings_test.lower_annual)}. For a married higher earner, starting at 62 also lowers what a surviving spouse inherits, though never below ${pc(P.family.widow_limit)} of the PIA.`,
    faqs: [
      { q: 'I turn 62 on the 15th. When is my first check?', a: `You can be entitled from the month after your birthday month, because you must be 62 for the whole month. Benefits for a month are paid the following month, so a person turning 62 on May 15 can be entitled from June and receive the first payment in July, on the Wednesday set by their day of birth.` },
      { q: 'Does the 62 reduction go away when I reach full retirement age?', a: `No. The reduced amount becomes your benefit for life, raised only by cost-of-living adjustments. The one exception is the earnings test: months in which benefits were withheld because you worked are removed from the reduction at full retirement age, and the check is recomputed upward.` },
      { q: 'I claimed at 62 six months ago and regret it. Can I undo it?', a: `Yes, once. Within ${P.claiming.withdraw_within_months} months of your first month of entitlement you can withdraw the application (20 CFR 404.640). You must repay everything received, including benefits paid to family members on your record, who must consent. Your record is then treated as if you had never applied.` },
      { q: 'If I wait until 63 to apply, can I get back pay to 62?', a: `No. An application can reach back up to ${P.claiming.retroactive_months} months, but not to a month that would make a retirement benefit reduced for age (20 CFR 404.621). Before full retirement age, every month is a reduced month, so benefits start no earlier than the month you apply.` },
      { q: 'Does my wife get less if I take my benefit at 62?', a: `Her spouse benefit, no: it is computed from your PIA, not from your reduced check, and reduced only for her own age. Her widow benefit, yes. With a PIA of ${$(W)}, she would inherit ${$(widowAfter62.benefit)} after your start at 62 instead of ${$(widowAfter67.benefit)} after a start at 67.` },
    ],
    body: (h) => {
      const pias = [1000, 1500, 2000, 2500, 3000, 3500];
      const rows = pias.map((p) => { const a = benefitAtAge(p, S62, FRA).benefit, f = benefitAtAge(p, FRA, FRA).benefit; return [h.usd(p), h.usd(a), h.usd(f - a), h.usd(cumulative(a, S62, 80) - cumulative(f, FRA, 80)), h.usd(cumulative(a, S62, 90) - cumulative(f, FRA, 90))]; });
      return `
<h2>Exactly how much 62 removes</h2>
<p>The reduction counts the months between your first check and full retirement age. With 67, a start at exactly 62 is 60 months early: 36 months at 5/9 of 1% (20%) plus 24 at 5/12 of 1% (10%), so ${h.pct(cut, 0)}. With a full retirement age of 66, as for people born from 1943 to 1954, it was ${h.pct(1 - benefitAtAge(1000, 62 * 12, fra66).factor, 0)}. The ${h.src('ssaEarlyRetire', 'SSA\'s reduction table')} lists every birth year, and the rule itself is ${h.src('cfr404_410', '20 CFR 404.410')}. The SSA rounds the reduction up to the dime before subtracting it and pays the result rounded down to the dollar.</p>

<h2>The running total: ahead early, behind later</h2>
${h.table(['PIA', 'At 62 and 1 month', 'Less per month', 'Lead (+) or gap (-) at 80', 'At 90'], rows, 'Start at 62 and 1 month against a start at 67, cumulative totals in today\'s dollars', ['l', 'r', 'r', 'r', 'r'])}
<p>By 67 the early claimant has collected 59 checks that the patient one has not. From then on the patient one receives more each month and closes the gap at about ${age(be)}. A positive figure in the table means the early start is still ahead at that age; a negative one means waiting has paid off. The crossover is nearly the same whatever the PIA, because both checks are percentages of it. The ${h.a('when-to-claim', 'break-even tool')} runs any pair of start ages.</p>

<h2>Working while collecting at 62</h2>
<p>The ${h.a('earnings-test', 'earnings test')} is the catch for anyone who claims at 62 and keeps a job. With ${h.usd(WAGE)} of wages in 2026 and a ${h.usd(one.benefit)} check, ${h.usd(et.withheld)} is withheld, roughly ${et.monthsWithheld} checks held back from January. The months withheld are credited back at full retirement age through a smaller reduction, as the ${h.src('ssaWhileWorking', 'SSA explains')}, but the income you planned on in your sixties is not there. Only wages and net self-employment count; pensions and investment income do not.</p>

<h2>Cost-of-living raises do not reward claiming early</h2>
<p>A common belief is that starting at 62 lets you "collect the COLAs" sooner. It does not work that way. From the year you turn 62, every cost-of-living adjustment is added to your PIA whether you have claimed or not, so someone who waits to 67 starts with a PIA that already includes five years of increases. The ${P.cola_2026.pct}% raise payable in January 2026, for example, was applied to the PIA of everyone who turned 62 in 2025 or earlier, claimed or not. What claiming early changes is only the percentage of that PIA you receive, and that percentage is fixed on the day you start. The comparisons on this page are therefore in today's dollars: COLAs scale both options by the same factor.</p>

<h2>Situations where the early start comes out ahead</h2>
<p>The arithmetic favors 62 in a few identifiable cases. Someone with a serious health condition or a family history of short lives may not reach the late seventies, where waiting starts to pay. A single person with no other income may need the check simply to avoid drawing down savings at a bad time. A lower earner in a couple, whose own benefit will later be replaced by a larger survivor benefit, loses little by starting early on their own record. None of this is a recommendation: it is where the numbers in the table tilt the other way.</p>

<h2>What the early start does to a spouse</h2>
<p>A husband or wife's spouse benefit is based on the worker's PIA, not on the reduced check: with a PIA of ${h.usd(W)}, a spouse at full retirement age gets ${h.usd(spouseOnW.total)} whether the worker started at 62 or 70. But the spouse cannot claim it until the worker has filed, so an early start opens that door sooner. The survivor side runs the other way: the ${h.src('poms615320', 'RIB-LIM rule')} limits a widow or widower to the larger of the deceased's reduced check or ${h.pct(P.family.widow_limit)} of the PIA, ${h.usd(widowAfter62.benefit)} here instead of ${h.usd(widowAfter67.benefit)}.</p>

<h2>No back pay, but one way out</h2>
<p>Applying late does not recover the months since 62: before full retirement age, ${h.src('cfr404_621', '20 CFR 404.621')} forbids retroactive months that would be reduced for age. The reverse door exists. Within ${P.claiming.withdraw_within_months} months of starting, you can withdraw your application once and repay what you received (${h.src('cfr404_640', '20 CFR 404.640')}), after which the SSA treats you as never having applied. The ${h.a('withdraw-or-suspend', 'withdraw or suspend page')} covers both options. At the other end of the range, see ${h.a('claiming-at-70', 'Social Security at 70')}.</p>`;
    },
  },
});
