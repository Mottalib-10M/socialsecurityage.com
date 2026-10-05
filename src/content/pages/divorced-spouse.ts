import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { spousalBenefit, familyMaximum, fraRetirement, benefitAtAge } from '../../lib/engine/ss';

const F = P.family;
const FRA = fraRetirement(1960).total;
const EX = 2800, OWN = 900;
const atFra = spousalBenefit(EX, OWN, FRA, FRA);
const at62 = spousalBenefit(EX, OWN, 62 * 12 + 1, FRA);
const none = spousalBenefit(EX, 1500, FRA, FRA);
const zero62 = spousalBenefit(EX, 0, 62 * 12 + 1, FRA);
const fmEx = familyMaximum(EX);
const pool = fmEx - EX;
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export default definePage({
  id: 'divorced-spouse',
  group: 'family',
  order: 10,
  mini: 'famDivorcedSpouse',
  miniHref: 'spousal-calculator',
  related: ['spousal-calculator', 'surviving-divorced-spouse', 'family-maximum', 'claiming-at-62', 'full-retirement-age'],
  sources: ['cfr404_331', 'cfr404_403', 'cfr404_415', 'cfr404_410', 'ssaSpouse'],
  en: {
    slug: 'divorced-spouse-benefits',
    nav: 'Divorced spouse benefits',
    card: `Ten years of marriage open a check worth up to half of your ex's PIA, paid without touching the ex's benefit or the new spouse's.`,
    title: 'Divorced Spouse Benefits 2026: Half the Ex\'s PIA, Rules',
    description: `Divorced spouse benefits in 2026: up to 50% of the ex's PIA after a 10-year marriage, from 62, your own PIA counted first. Worked cases under 20 CFR 404.331.`,
    h1: 'Social Security benefits on an ex-spouse\'s record',
    intro: 'A marriage that lasted ten years keeps paying after the divorce, and the ex never sees a cent less.',
    resume: `A divorced spouse can draw up to ${Math.round(F.spouse_max * 100)}% of the former spouse's primary insurance amount when the conditions of 20 CFR 404.331 are met: the marriage lasted at least ${F.divorce_marriage_years} years before the divorce became final, you are not married now, you are 62 or older, your own PIA is below that half, and the ex is entitled to benefits or, if you have been divorced for ${F.divorce_independent_years} years or more, simply 62 or older. Your own retirement benefit is paid first and the ex's record only fills the gap. With an ex whose PIA is ${$(EX)} and an own PIA of ${$(OWN)}, the full spouse amount is ${$(atFra.fullSpousal)}, so the record adds ${$(atFra.excess)} and you receive ${$(atFra.total)} a month at a full retirement age of 67, or ${$(at62.total)} if you start at 62 and 1 month. None of it is taken from the ex, from a new spouse or from the ex's children: under 20 CFR 404.403 a divorced spouse is paid outside the family maximum.`,
    faqs: [
      { q: 'Will my ex\'s check go down if I claim on their record?', a: `No. The ex's own check is computed from their PIA alone, and a divorced spouse's benefit is excluded from the family maximum (20 CFR 404.403(a)(3)), so a current spouse and children on that record are not cut either. The regulation lists no consent from the ex among its conditions: you file the application yourself, on your own schedule.` },
      { q: 'My ex is 64 and still working. Can I claim before they retire?', a: `Yes, provided you have been divorced for at least ${F.divorce_independent_years} years and the ex is at least 62. Under 20 CFR 404.331(f) this is independent entitlement: you are paid even though the ex has not filed. Divorced for less than two years, you have to wait until the ex is actually entitled to retirement or disability benefits.` },
      { q: 'We were married nine years and eight months. Is there any way around the ten-year rule?', a: `Not for divorced spouse benefits. The regulation requires at least ${F.divorce_marriage_years} years of marriage immediately before the divorce became final, counted from the date of the marriage to the date the decree became final. A couple who separated earlier but finalized the divorce after the tenth anniversary meets the condition; one who finalized it before does not.` },
      { q: 'If my ex earns a lot while I collect, will my check be withheld?', a: `Not once you have been divorced for two years. Since January 1985, 20 CFR 404.415(b) bars the SSA from withholding a divorced spouse's benefit because of the worker's excess earnings when the divorce is at least two years old. Your own wages are another matter: under full retirement age they can trigger withholding under the earnings test.` },
      { q: 'I have a bigger retirement benefit than half of my ex\'s. Do I get anything extra?', a: `No. Condition (e) of 20 CFR 404.331 excludes anyone whose own PIA equals or exceeds the full spouse amount. With an ex's PIA of ${$(EX)}, the half is ${$(none.fullSpousal)}; an own PIA of ${$(1500)} already passes it, so you are paid on your own record only, at ${$(benefitAtAge(1500, FRA, FRA).benefit)} at 67.` },
      { q: 'Can a divorced spouse who never worked get benefits at 62?', a: `Yes. With no own PIA, the whole spouse amount comes from the ex's record. At 62 and 1 month with a full retirement age of 67, the ${$(zero62.fullSpousal)} spouse amount is cut by ${Math.round((1 - zero62.reducedExcess / zero62.fullSpousal) * 1000) / 10}%, leaving ${$(zero62.total)} a month for life. At 67 the full ${$(zero62.fullSpousal)} would be paid. There are no delayed credits on a spouse benefit after 67.` },
    ],
    body: (h) => {
      const rowsOwn = [0, 400, 900, 1200, 1400, 1600].map((own) => {
        const f = spousalBenefit(EX, own, FRA, FRA), e = spousalBenefit(EX, own, 62 * 12 + 1, FRA);
        return [h.usd(own), f.onlyOwn ? 'none' : h.usd(f.excess, 2), h.usd(e.total), h.usd(f.total)];
      });
      const rowsAge = [62, 63, 64, 65, 66, 67].map((a) => {
        const m = a * 12 + (a === 62 ? 1 : 0); const r = spousalBenefit(EX, OWN, m, FRA);
        return [a === 62 ? '62 and 1 month' : String(a), String(r.monthsEarly), h.usd(r.ownBenefit, 2), h.usd(r.reducedExcess, 2), h.usd(r.total)];
      });
      const kids = 3, capped = pool / kids;
      return `
<h2>The six conditions, read from the regulation</h2>
<p>The ${h.src('cfr404_331', 'divorced spouse rule, 20 CFR 404.331')}, lists its requirements as lettered paragraphs. Every one of them has to be true in the same month for a check to be due.</p>
<ol>
<li><strong>A valid marriage of ${F.divorce_marriage_years} years or more</strong>, ending immediately before the divorce became final. The date that counts is the date the decree became final, not the date you moved out.</li>
<li><strong>An application.</strong> Nothing is paid automatically; you file for spouse benefits on the ex's record.</li>
<li><strong>You are not married.</strong> You are treated as unmarried for the whole month in which a divorce occurs. A new marriage removes this condition.</li>
<li><strong>You are 62 or older throughout a month</strong> in which the other conditions are met. Most people therefore start at 62 and 1 month.</li>
<li><strong>Your own PIA is smaller than the full spouse amount.</strong> If your own retirement or disability benefit is based on a PIA at least equal to half of the ex's, nothing is added.</li>
<li><strong>The ex is entitled, or you are divorced for ${F.divorce_independent_years} years and the ex is 62.</strong> The last paragraph, (f), lets you collect before the ex retires once the divorce is two years old.</li>
</ol>
<p>The ex does not have to agree or sign anything. The ex's later marriages change nothing for you either.</p>

<h2>Working the numbers on one record</h2>
<p>Take a former spouse with a primary insurance amount of ${h.usd(EX)}, both of you born in 1960 or later so that full retirement age is 67. Half of that PIA, ${h.usd(atFra.fullSpousal)}, is the most a divorced spouse can receive at full retirement age. What the record actually pays is the gap between that half and your own PIA. The table shows the arithmetic for six own records.</p>
${h.table(['Your own PIA', 'Added from the ex\'s record', 'Total at 62 and 1 month', 'Total at 67'], rowsOwn, `Former spouse's PIA ${h.usd(EX)}; both born 1960 or later`, ['l', 'r', 'r', 'r'])}
<p>Two lessons sit in those rows. Someone who never worked receives the whole half, ${h.usd(atFra.fullSpousal)} at 67. Someone with an own PIA of ${h.usd(1600)} receives nothing extra, because condition (e) is not met; only their own retirement benefit is paid. Between the two, every dollar of own PIA replaces a dollar from the ex's record at full retirement age, so the total stays at ${h.usd(atFra.fullSpousal)} as long as the top-up exists.</p>

<h2>What starting early costs on each part</h2>
<p>Your own benefit and the top-up shrink at different speeds when you start before 67. The own part loses 5/9 of 1% a month for the first 36 months and 5/12 of 1% after that; the spouse part loses 25/36 of 1% a month for 36 months and 5/12 of 1% after that, as ${h.src('cfr404_410', '20 CFR 404.410')} sets out. With an own PIA of ${h.usd(OWN)} and the ex's ${h.usd(EX)}:</p>
${h.table(['Start at', 'Months early', 'Own part', 'Top-up part', 'Monthly total'], rowsAge, `Own PIA ${h.usd(OWN)}, former spouse's PIA ${h.usd(EX)}, full retirement age 67`, ['l', 'r', 'r', 'r', 'r'])}
<p>At 62 and 1 month the total is ${h.usd(at62.total)}, or ${h.pct(at62.total / atFra.total)} of the ${h.usd(atFra.total)} available at 67. Waiting beyond 67 raises only the own part, through delayed credits; the top-up never grows after full retirement age, which is why most divorced spouses with a large top-up have no reason to wait past 67. The ${h.a('spousal-calculator', 'spousal benefits calculator')} runs the same computation for any pair of PIAs and any month.</p>

<h2>Why the ex, a new spouse and the ex's children are untouched</h2>
<p>Each worker's record has a ceiling on what the whole family can draw, the ${h.a('family-maximum', 'family maximum')}. For a PIA of ${h.usd(EX)} first payable in 2026, it is ${h.usd(fmEx, 2)}. Suppose the ex remarried and has a new spouse and two young children all entitled on the record: at 50% each they would claim ${h.usd(EX * F.spouse_max * kids)}, more than the ${h.usd(pool, 2)} left after the worker's own PIA. Each of the three is therefore cut to about ${h.usd(capped, 2)}.</p>
<p>A divorced spouse in that family is not part of the calculation. Paragraph (a)(3) of ${h.src('cfr404_403', '20 CFR 404.403')} says a divorced spouse's benefit is not reduced for the maximum, and that everyone else's benefit is computed as if the divorced spouse did not exist. You still receive your full ${h.usd(atFra.total)} at 67, and the new household loses nothing because you claimed. Several former spouses, each married ten years, can be paid on the same record in this way.</p>

<h2>Earnings: yours count, the ex's do not</h2>
<p>The retirement earnings test can hold back benefits for people under full retirement age who earn above the yearly limit. ${h.src('cfr404_415', '20 CFR 404.415')} handles the two sides of a divorce differently. If the ex keeps working and earns a high salary, a divorced spouse who has been divorced for at least two years is not affected: paragraph (b) has excluded those benefits from withholding since January 1985. Your own work is different. Wages above the limit while you are under 67 are charged against your own benefits, top-up included, as the ${h.a('earnings-test', 'earnings limit page')} explains.</p>

<h2>Remarriage and the ex's death</h2>
<p>Because condition (c) requires you to be unmarried, marrying again normally ends the divorced spouse benefit. The ex's own remarriage has no effect on your claim.</p>
<p>If the ex dies, the spouse benefit stops being the relevant one. A divorced spouse whose marriage lasted ten years can then qualify as a surviving divorced spouse, with a benefit worth up to 100% of what the ex was entitled to instead of 50%, payable from 60. The ${h.a('surviving-divorced-spouse', 'surviving divorced spouse page')} covers that switch, including the rule that a remarriage after 60 does not end it.</p>

<h2>Documents and a realistic timeline</h2>
<p>An application on an ex's record asks for proof of the marriage, proof of its end and your own identity. The divorce decree matters most, because the date it became final settles the ten-year count. Benefits can be paid for up to ${P.claiming.retroactive_months} months before the month you apply, though never for a month that would make a spouse benefit reduced for age (${h.src('cfr404_621', '20 CFR 404.621')}); before 67, a late application costs months rather than buying them back.</p>
<p>For a quick view of the household amounts, the mini-calculator above takes the ex's PIA and yours. For a full earnings history of your own, the ${h.a('benefits-calculator', 'benefits calculator')} rebuilds your PIA year by year before you compare it with half of the ex's.</p>`;
    },
  },
});
