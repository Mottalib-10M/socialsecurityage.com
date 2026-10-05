import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { benefitAtAge, spousalBenefit, survivorBenefit, floorDollar, taxableBenefits } from '../../lib/engine/ss';

const F = P.family;
const FRA = 804, E62 = 62 * 12 + 1, A70 = 840, LATE = 80 * 12;
const HI = 3000, LO = 1000;

/** Household for one strategy: ages in months when each spouse starts (same-age couple, FRA 67). */
function plan(hiStart: number, loStart: number) {
  const hi = benefitAtAge(HI, hiStart, FRA).benefit;
  const loOwn = benefitAtAge(LO, loStart, FRA);
  // the spousal top-up can only begin once the higher earner has filed
  const topStart = Math.max(hiStart, loStart);
  const top = spousalBenefit(HI, LO, topStart, FRA).reducedExcess;
  const lo = floorDollar(loOwn.benefitExact + top);
  const widow = survivorBenefit({ deceasedPia: HI, deceasedClaimMonths: hiStart, deceasedFraMonths: FRA, survivorClaimMonths: LATE, survivorFraMonths: FRA }).benefit;
  const survivor = Math.max(widow, loOwn.benefit);
  return { hi, lo, total: hi + lo, survivor, widowerKeeps: hi };
}
const both62 = plan(E62, E62), both67 = plan(FRA, FRA), split = plan(A70, E62), late = plan(A70, FRA);
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const tax = taxableBenefits(both67.total * 12, 30000, 'joint');

export default definePage({
  id: 'married-couples',
  group: 'family',
  order: 40,
  mini: 'famCoupleTotal',
  related: ['when-to-claim', 'spousal-calculator', 'survivor-calculator', 'claiming-at-70', 'family-maximum', 'tax-calculator'],
  sources: ['cfr404_330', 'pomsDeemed', 'cfr404_335', 'poms615320', 'cfr404_313', 'irsP915'],
  en: {
    slug: 'social-security-for-married-couples',
    nav: 'Married couples',
    card: 'Two records, one household: the spousal top-up while both are alive, and the larger check that the survivor keeps.',
    title: 'Social Security for Married Couples 2026: Household Math',
    description: `Social Security for married couples 2026: two own benefits, a spousal top-up up to 50% of the higher PIA, and the larger check kept by the survivor, worked out.`,
    h1: 'Social Security for a married couple, both checks at once',
    intro: 'A couple collects on two records while both are alive and on one record afterwards. The second phase is where most of the money is decided.',
    resume: `A married couple receives two monthly checks: each spouse's own retirement benefit, plus a spousal top-up for the lower earner when half of the higher earner's PIA exceeds the lower earner's own PIA. When the first spouse dies, the household drops to one check, and the survivor keeps the larger of the two. Take a couple born in 1964 with PIAs of ${$(HI)} and ${$(LO)}. If both start at 67, the household gets ${$(both67.total)} a month: ${$(both67.hi)} for the higher earner and ${$(both67.lo)} for the other, own benefit plus top-up. If both start at 62 and 1 month, the household gets ${$(both62.total)}, and a widow or widower would later be limited to ${$(both62.survivor)}. If the higher earner waits until 70, delayed credits raise that check to ${$(split.hi)}, and the survivor keeps ${$(split.survivor)} for life. The higher earner's claiming age therefore sets the household's income twice: once for the couple and once for whichever spouse outlives the other.`,
    faqs: [
      { q: 'We both worked full careers. Does either of us get a spousal benefit?', a: `Only if one PIA is less than half of the other. A couple with PIAs of ${$(2600)} and ${$(1800)} gets nothing extra: half of ${$(2600)} is ${$(1300)}, below ${$(1800)}. Each spouse is paid on their own record, and the spousal rules matter only after a death, when the survivor can switch to the larger of the two benefits.` },
      { q: 'Can my wife collect a spousal benefit before I file for my own?', a: `No. A spouse benefit requires the worker to be entitled to retirement or disability benefits (20 CFR 404.330). Unlike a divorced spouse divorced for two years, a current spouse cannot be paid on a record whose owner has not filed. That is why, when the higher earner delays to 70, the lower earner can start only their own benefit in the meantime.` },
      { q: 'If I file for my own benefit, am I automatically filing for spousal too?', a: `Yes, for anyone born on or after January 2, 1954. Under the deemed filing rule of the Bipartisan Budget Act of 2015 (POMS GN 00204.035), an application for one benefit is treated as an application for the other when you are eligible for both at that time. You can no longer take the spousal benefit alone and let your own benefit grow.` },
      { q: 'How long do we need to be married for spousal benefits?', a: `At least ${P.extra.claiming_rules.spouse_marriage_years} year for a spouse benefit on a living worker's record, unless you are both the natural parents of a child or meet another exception of 20 CFR 404.330, and ${F.widow_marriage_months} months before death for a widow or widower benefit, with exceptions such as an accidental death. After a divorce, the test becomes ${F.divorce_marriage_years} years.` },
      { q: 'How much of a couple\'s Social Security is taxable?', a: `It depends on other income. A joint return adds half of the benefits to other income and compares it with ${$(P.taxation.base1.joint)} and ${$(P.taxation.base2.joint)} (IRS Publication 915). A couple receiving ${$(both67.total * 12)} a year with ${$(30000)} of other income has ${$(Math.round(tax.taxable))} of benefits taxable, about ${Math.round(tax.share * 100)}% of the total.` },
    ],
    body: (h) => {
      const rows = [
        ['Both at 62 and 1 month', both62],
        ['Both at 67', both67],
        ['Higher earner at 70, other at 62 and 1 month', split],
        ['Higher earner at 70, other at 67', late],
      ].map(([label, r]: any) => [label, h.usd(r.hi), h.usd(r.lo), h.usd(r.total), h.usd(r.survivor)]);
      const pairs = [[3000, 1000], [3000, 0], [2600, 1800], [2200, 2200]].map(([a, b]) => {
        const s = spousalBenefit(a, b, FRA, FRA);
        const w = survivorBenefit({ deceasedPia: a, deceasedClaimMonths: FRA, deceasedFraMonths: FRA, survivorClaimMonths: LATE, survivorFraMonths: FRA }).benefit;
        return [`${h.usd(a)} and ${h.usd(b)}`, s.onlyOwn ? 'none' : h.usd(s.excess), h.usd(a + s.total), h.usd(Math.max(w, b))];
      });
      const gap62 = both62.survivor, gap70 = split.survivor;
      return `
<h2>Two phases in one marriage</h2>
<p>Social Security treats a couple as two workers who may also be each other's dependents. While both are alive, each draws on their own record, and the lower earner may add a top-up from the other's record. After the first death, the survivor stops receiving one check and keeps whichever is larger: their own retirement benefit or a widow or widower benefit equal to what the deceased was receiving, within the limits of ${h.src('cfr404_335', '20 CFR 404.335')}. Planning for a couple means planning for both phases at the same time, because the same claiming decision moves both.</p>

<h2>The spousal top-up, and when it is zero</h2>
<p>A spouse can receive up to ${Math.round(F.spouse_max * 100)}% of the worker's PIA at full retirement age. The SSA pays the spouse's own benefit first, then adds the difference between half of the worker's PIA and the spouse's own PIA, if there is one. Since the Bipartisan Budget Act of 2015, anyone born on or after January 2, 1954 who files for one is deemed to file for both (${h.src('pomsDeemed', 'POMS GN 00204.035')}), so the two parts start together once the worker has filed.</p>
${h.table(['PIAs of the two spouses', 'Top-up at 67', 'Household at 67', 'Survivor keeps'], pairs, 'Both born 1960 or later, both starting at 67, survivor claiming after full retirement age', ['l', 'r', 'r', 'r'])}
<p>Two full careers of similar length usually leave no top-up at all: with ${h.usd(2600)} and ${h.usd(1800)}, half of the larger PIA is below the smaller one. The one-earner couple gets the largest relative boost, ${h.usd(1500)} a month on top of ${h.usd(3000)}, without any work history for the second spouse. A spouse must have been married to the worker for at least a year in most cases (${h.src('cfr404_330', '20 CFR 404.330')}), and the worker must already be entitled.</p>

<h2>Four ways to claim, two numbers per strategy</h2>
<p>The table below follows a same-age couple born in 1964, with PIAs of ${h.usd(HI)} and ${h.usd(LO)}, through four claiming plans. "Household" is the monthly total once both checks are running; "Survivor" is what the lower earner receives as a widow or widower if the higher earner dies first, assuming the survivor is past full retirement age by then.</p>
${h.table(['Plan', 'Higher earner', 'Other spouse', 'Household', 'Survivor'], rows, 'Monthly amounts before cost-of-living adjustments; same-age couple, full retirement age 67', ['l', 'r', 'r', 'r', 'r'])}
<p>The household column already rewards patience: ${h.usd(both67.total)} at 67 against ${h.usd(both62.total)} at 62. The survivor column is where the gap widens. If the higher earner started at 62 and 1 month, the survivor is held to ${h.usd(gap62)}, because the RIB-LIM rule of ${h.src('poms615320', 'POMS RS 00615.320')} limits a widow or widower to the larger of the deceased's reduced benefit or ${(F.widow_limit * 100).toFixed(1)}% of the PIA. If the higher earner waited until 70, the survivor inherits the delayed credits of ${h.src('cfr404_313', '20 CFR 404.313')} and keeps ${h.usd(gap70)}, which is ${h.usd(gap70 - gap62)} a month more for as long as the survivor lives.</p>

<h2>Why the higher earner's delay protects the survivor</h2>
<p>Two facts combine. The lower earner's own check stops mattering once the higher earner dies, since the survivor takes the larger benefit. And unless both die in the same month, one spouse outlives the other, sometimes by decades. A delay by the higher earner therefore pays out over two lifetimes: as a larger check while that spouse lives, then as the survivor's check after. A delay by the lower earner pays out over one life only, and it disappears entirely if the lower earner becomes a survivor with a larger widow or widower benefit.</p>
<p>The same logic explains the split strategy in the third row. The lower earner can start their own benefit at 62 and 1 month, ${h.usd(benefitAtAge(LO, E62, FRA).benefit)}, while the higher earner waits. The top-up cannot start until the higher earner files, so until then the household lives on one small check. From 70, the top-up of ${h.usd(spousalBenefit(HI, LO, A70, FRA).reducedExcess)} is added unreduced, because the lower earner is past full retirement age when it begins, while the lower earner's own part keeps its early reduction.</p>
<p>The cost of delay is real: eight years without the higher earner's check, from 62 to 70, in the third plan. The ${h.a('when-to-claim', 'claiming age calculator')} shows the break-even ages for one person; for a couple, the survivor column above is the reason break-even arithmetic on a single life understates the value of waiting.</p>

<h2>Timing rules that apply only to couples</h2>
<ul>
<li><strong>No spousal benefit before the worker files.</strong> A current spouse needs the worker to be entitled; only a divorced spouse divorced for at least two years can be paid on an unfiled record.</li>
<li><strong>No delayed credits on the top-up.</strong> The spousal part reaches its maximum at the spouse's own full retirement age, so delaying it past 67 gains nothing.</li>
<li><strong>Survivor benefits can start at 60.</strong> A widow or widower can begin at ${h.pct(1 - P.reduction.widow_max)} of the deceased's benefit and later switch to their own retirement benefit, or the reverse.</li>
<li><strong>Marriage length.</strong> One year for a spouse benefit in most cases; ${F.widow_marriage_months} months before death for a widow or widower benefit, with exceptions.</li>
</ul>

<h2>Taxes on a joint return</h2>
<p>On a joint return, half of the couple's combined benefits is added to their other income and compared with two thresholds, ${h.usd(P.taxation.base1.joint)} and ${h.usd(P.taxation.base2.joint)}, which are not indexed to inflation (${h.src('irsP915', 'IRS Publication 915')}). At ${h.usd(both67.total * 12)} a year of benefits and ${h.usd(30000)} of pensions or interest, ${h.usd(tax.taxable)} of the benefits are taxable. The ${h.a('tax-calculator', 'tax calculator')} runs other combinations; a survivor who later files as single faces the lower thresholds of ${h.usd(P.taxation.base1.single)} and ${h.usd(P.taxation.base2.single)}.</p>
<p>A record that also supports children falls under the ${h.a('family-maximum', 'family maximum')}; for most retired couples without dependent children, the cap is not reached, because a single spouse at 50% fits within it.</p>`;
    },
  },
});
