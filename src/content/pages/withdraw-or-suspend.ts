import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { benefitAtAge, drcIncrease } from '../../lib/engine/ss';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const W = P.claiming.withdraw_within_months, R = P.claiming.retroactive_months;
const PIA = 2000, FRA = 67 * 12;
const b62 = benefitAtAge(PIA, 62 * 12 + 1, FRA).benefit;
const b70 = benefitAtAge(PIA, 70 * 12, FRA).benefit;
const bFra = benefitAtAge(PIA, FRA, FRA).benefit;
const repay8 = b62 * 8;
const susp = benefitAtAge(PIA, FRA + 36, FRA).benefit;

export default definePage({
  id: 'withdraw-or-suspend',
  group: 'claiming',
  order: 70,
  mini: 'withdrawTrade',
  miniHref: 'when-to-claim',
  related: ['claiming-at-62', 'claiming-at-70', 'when-to-claim', 'full-retirement-age', 'divorced-spouse'],
  sources: ['cfr404_640', 'ssaWithdraw', 'cfr404_313', 'cfr404_621', 'pomsSuspension'],
  en: {
    slug: 'withdraw-or-suspend-social-security',
    nav: 'Withdraw or suspend',
    card: `Two ways back from a claim: withdraw within ${W} months and repay everything, or suspend after full retirement age to earn credits until 70.`,
    title: 'Withdraw or Suspend Social Security in 2026: Both Exits',
    description: `Undoing a claim in 2026: withdraw within ${W} months, once, repaying all benefits (20 CFR 404.640), or suspend after full retirement age to earn 8% a year to 70.`,
    h1: 'Withdrawing or suspending Social Security: the two ways to undo a claim',
    intro: 'Starting benefits is not always final. The rules offer one complete reset and one pause, each with its own price.',
    resume: `Social Security offers two exits from a retirement claim. The first is a withdrawal: under 20 CFR 404.640 you can withdraw your application within ${W} months of your first month of entitlement, only once in your life, provided you repay every benefit paid on it, including what your spouse or children received on your record, with their written consent. The SSA then treats the application as if it had never been filed, so a later claim starts fresh with a smaller reduction or with delayed credits. On a ${$(PIA)} PIA, someone who started at 62 and 1 month (${$(b62)} a month) and withdraws after eight checks repays ${$(repay8)}, then could restart at 70 for ${$(b70)}. The second exit is a voluntary suspension: from full retirement age to 70 you can stop payments and earn delayed retirement credits of 2/3 of 1% a month, effective from the month after your request (20 CFR 404.313). Benefits to family members on your record stop during the suspension, except those of a divorced spouse.`,
    faqs: [
      { q: 'Do I have to repay the Medicare premiums and the tax withheld if I withdraw?', a: `Yes. The SSA's withdrawal page says you repay what you and your family received plus the amounts it withheld for Medicare premiums, taxes and garnishments. If Medicare Part A paid medical bills during those months, that money goes back to Medicare too. The withdrawal is approved only once repayment is made or assured.` },
      { q: 'Can I withdraw a second time if I claim again later?', a: `No. Condition (b)(4)(ii) of 20 CFR 404.640 allows a withdrawal of an old-age application only if you have not previously withdrawn one. After a first withdrawal, the next claim is final, apart from a voluntary suspension once you reach full retirement age.` },
      { q: 'If I suspend at full retirement age, can my wife keep her spouse benefit?', a: `No. Under the rules in force since April 30, 2016, no benefits are paid on your record to a spouse or child during your voluntary suspension. The one exception is a divorced spouse, who keeps being paid (POMS GN 02409.100).` },
      { q: 'I suspended at 67. Do I need to ask to restart at 70?', a: `No. The suspension ends by itself with the month you reach 70, or earlier with the month after you ask for reinstatement. The delayed credits earned during the suspension are then added to the benefit, ${$(bFra)} becoming ${$(susp)} on a ${$(PIA)} PIA after three years.` },
      { q: 'Is it better to withdraw or to wait until full retirement age and suspend?', a: `They do different things. A withdrawal erases the early reduction, but it costs every dollar received and is open only in the first ${W} months. A suspension keeps the reduction already applied for months before full retirement age, costs nothing to repay and adds credits only from full retirement age.` },
    ],
    body: (h) => {
      const rows = [1, 3, 6, 9, 12].map((m) => [String(m), h.usd(b62 * m), h.usd(b70 - b62), String(Math.ceil((b62 * m) / (b70 - b62)))]);
      const sRows = [12, 24, 36].map((m) => [`${m} months`, h.pct(drcIncrease(m)), h.usd(benefitAtAge(PIA, FRA + m, FRA).benefit)]);
      return `
<h2>Withdrawal: erase the claim</h2>
<p>A withdrawal is the only way to make a claim disappear. ${h.src('cfr404_640', '20 CFR 404.640')} sets the conditions for an old-age application already decided:</p>
<ol>
<li>a written request, filed by you (or someone who can sign an application for you), while you are alive;</li>
<li>filed within ${W} months of the first month of entitlement;</li>
<li>no earlier withdrawal of an old-age application;</li>
<li>written consent of any other person whose benefits on your record would become erroneous, typically a spouse or a child;</li>
<li>repayment of all benefits paid on the application, or the SSA being satisfied that they will be repaid.</li>
</ol>
<p>The request is made on Form SSA-521, and the ${h.src('ssaWithdraw', 'SSA')} adds a practical point: the repayment covers the gross amounts, including Medicare premiums, taxes and garnishments withheld from your checks, plus any Part A medical costs Medicare paid in the meantime. Once approved, "the application will be considered as though it was never filed." You keep your earnings record and your credits; you lose the months already paid, since you hand them back. A future application is a first application, with the age reduction or the delayed credits of its own date.</p>

<h3>What a withdrawal costs and buys</h3>
<p>Take a ${h.usd(PIA)} PIA and a full retirement age of 67. Starting at 62 and 1 month pays ${h.usd(b62)}; starting at 70 pays ${h.usd(b70)}. The table shows the repayment after a given number of checks, and how many months at the higher rate it takes to earn that money back.</p>
${h.table(['Checks received', 'Repayment', 'Extra per month at 70', 'Months at 70 to recover it'], rows, `PIA ${h.usd(PIA)}, started at 62 and 1 month, restarted at 70; amounts before COLAs`, ['r', 'r', 'r', 'r'])}
<p>Even after twelve checks, the higher check at 70 earns the repayment back within ${Math.ceil((b62 * 12) / (b70 - b62))} months of the restart. The real question is whether you can live without the benefit from the withdrawal until 70, and whether you expect to live long enough for the higher check to pay off; the ${h.a('when-to-claim', 'claiming age page')} works through the break-even ages.</p>

<h3>Family members on your record</h3>
<p>If your spouse or a child started benefits on your record because you claimed, their entitlement falls with yours. That is why the regulation demands their written consent, and why their benefits are part of the repayment. A spouse who also has their own record can keep their own retirement benefit; only the part paid on yours is affected.</p>

<h2>Voluntary suspension: pause and earn credits</h2>
<p>After full retirement age the second door opens. ${h.src('cfr404_313', '20 CFR 404.313')} allows anyone entitled to retirement benefits to "voluntarily suspend" them and earn delayed retirement credits for each month of suspension, until the month of age 70. Even someone who started at 62 can do it once full retirement age arrives.</p>
<ul>
<li><strong>Timing.</strong> The suspension starts with the month after the month you ask for it. Benefits already paid are not touched.</li>
<li><strong>Credits.</strong> 2/3 of 1% of the PIA per month for anyone born after 1942, 8% a year.</li>
<li><strong>End.</strong> It stops with the month after you request reinstatement, or with the month you reach 70, whichever comes first (${h.src('pomsSuspension', 'POMS GN 02409.100')}).</li>
<li><strong>Family.</strong> Since April 30, 2016, no spouse or child benefits are paid on your record while you are suspended, except divorced-spouse benefits, and you cannot be paid on another record either.</li>
</ul>
${h.table(['Suspended from full retirement age', 'Credit added', `Benefit on a ${h.usd(PIA)} PIA`], sRows, 'Credits earned by a suspension starting at 67 (worker who started at full retirement age)', ['l', 'r', 'r'])}
<p>For someone who started early, the credits are added on top of the PIA while the reduction for the months already paid before full retirement age stays in place. The suspension does not undo the early claim, it only adds to it.</p>

<h2>Neither one: what retroactive benefits allow</h2>
<p>A third tool works before the claim rather than after. When you file, the ${h.src('cfr404_621', 'retroactivity rule')} lets benefits start up to ${R} months before the application month, but never for a month in which the benefit would be reduced for age. For a retirement benefit, in practice it only helps people filing after full retirement age: someone filing at 67 and 4 months can take the 4 months back to full retirement age, but not the months before it. Choosing a retroactive start also gives up the delayed credits of those months.</p>

<h2>Which exit is still open</h2>
<ul>
<li>Claimed at 62 or 63 less than ${W} months ago, then went back to work so that the ${h.a('earnings-test', 'earnings test')} withholds most checks: a withdrawal is still possible, and the sum to repay covers only the few checks actually paid.</li>
<li>Claimed early more than ${W} months ago: the withdrawal is closed; a suspension from full retirement age is the only way to add credits.</li>
<li>Claimed at full retirement age more than ${W} months ago: suspension until 70 earns up to ${h.pct(drcIncrease(36), 0)} more, but stops spouse benefits on the record in the meantime.</li>
</ul>`;
    },
  },
});
