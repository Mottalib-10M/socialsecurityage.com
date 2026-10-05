import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { computePia, projectCareer, earningsTest, employeePayroll, selfEmploymentTax, taxableBenefits, fraRetirement, benefitAtAge } from '../../lib/engine/ss';

const rt = (x: number) => `${(x * 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`;
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const b = { y: 1959, m: 6, d: 15 };
const fra = fraRetirement(1959);
const S = 60000, E = 90000;
const career = projectCareer(b, S, 22, 62);
const base = computePia(b, career);
const plus = computePia(b, { ...career, 2026: E });
const low = base.rows.filter((r) => r.used).sort((x, y) => x.indexed - y.indexed)[0];
const gain = plus.pia - base.pia;
const pay = employeePayroll(E);
const yearly = benefitAtAge(base.pia, fra.total, fra.total).benefit * 12;
const tax = taxableBenefits(yearly, E, 'joint');

export default definePage({
  id: 'working-after-fra',
  group: 'claiming',
  order: 80,
  mini: 'workingRecompute',
  miniHref: 'benefits-calculator',
  related: ['earnings-test', 'withdraw-or-suspend', 'fewer-than-35-years', 'tax-calculator', 'aime'],
  sources: ['ssaWhileWorking', 'cfr404_285', 'irsP15', 'irsSeTax', 'irsP915'],
  en: {
    slug: 'working-after-full-retirement-age',
    nav: 'Working after full retirement age',
    card: `No earnings limit from the month you reach full retirement age, and each year of new pay can raise your benefit for life.`,
    title: 'Working After Full Retirement Age in 2026: No Limit, Raises',
    description: `Working after full retirement age in 2026: no earnings limit from your FRA month, payroll tax still due, a yearly recomputation if new pay beats a top-35 year.`,
    h1: 'Working after full retirement age: what changes and what does not',
    intro: 'From the month you reach full retirement age, a paycheck no longer costs you any benefit. It can still add to it.',
    resume: `Once you reach full retirement age, ${fra.years} and ${fra.months} months for people born in 1959 and 67 for anyone born in 1960 or later, the earnings test stops: starting with that month, the SSA no longer withholds benefits whatever you earn, and it recalculates your benefit to credit any months withheld earlier. Your wages remain subject to Social Security and Medicare tax at any age, ${rt(P.payroll.oasdi_employee)} and ${rt(P.payroll.hi_employee)} for employees, and self-employment tax still applies to net profit. In return, every year of new earnings is checked against your record: the SSA reviews it automatically each year (20 CFR 404.285), and if the new year beats one of your 35 best, your PIA rises, with the increase paid from January of the following year. A worker born in 1959 with a steady ${$(S)} career who earns ${$(E)} in 2026 would see the PIA move from ${$(base.pia, 2)} to ${$(plus.pia, 2)}, about ${$(gain, 2)} a month more for life. Higher earnings can also make more of the benefit taxable.`,
    faqs: [
      { q: 'Does a 2026 raise count fully, or is it indexed down?', a: `It counts in full. Earnings from the year you turn 60 on are never indexed, so ${$(E)} earned in 2026 enters your record as ${$(E)}, up to the ${$(P.taxable_max_2026)} taxable maximum. Your older years, by contrast, are lifted by wage indexing, which is why a late raise has to be large to beat them.` },
      { q: 'When will I see the increase from this year\'s work?', a: `After the year ends. The SSA reviews the records of all beneficiaries with wages reported for the previous year. If the new year is one of your highest, it recalculates the benefit and pays the increase retroactively to January of the year after the earnings, so 2026 pay shows up as a raise effective January 2027.` },
      { q: 'If I keep working and have not claimed yet, what do I gain?', a: `Two things at once: delayed retirement credits of 2/3 of 1% a month until 70, and any recomputation from new high years. The credits are applied to the PIA as recomputed, so the two add up. Claiming does not stop either the payroll tax or the recomputations.` },
      { q: 'Can working after full retirement age lower my Social Security?', a: `No. A year of earnings replaces one of your 35 years only if it is higher after indexing; otherwise it is ignored. The only way more work leaves you with less is through income tax: higher wages raise provisional income, which can make up to 85% of the benefit taxable.` },
      { q: 'Do I still need to report my earnings to the SSA after full retirement age?', a: `Not for the earnings test, which no longer applies. Your employer reports wages on Form W-2 as for any worker, and that is what the annual review uses. Self-employed people file Schedule SE, which the SSA uses to post their earnings.` },
    ],
    body: (h) => {
      const tests = [40000, 60000, 90000, 150000, P.taxable_max_2026].map((e) => { const r = computePia(b, { ...career, 2026: e }); return [h.usd(e), h.usd(r.aime), h.usd(r.pia, 2), h.usd(r.pia - base.pia, 2)]; });
      const se = selfEmploymentTax(E);
      return `
<h2>The earnings test ends with the month of full retirement age</h2>
<p>The SSA's page on ${h.src('ssaWhileWorking', 'receiving benefits while working')} is explicit about full retirement age: "Beginning with the month you reach that age, your earnings no longer reduce your benefits, no matter how much you earn." In the calendar year you reach it, only earnings before that month count against the higher limit of ${h.usd(P.earnings_test.higher_annual)}, at $1 withheld for every $3 above it. From the month itself, nothing is withheld. Any benefits withheld before full retirement age are not lost: the SSA recalculates the amount at that age to give you credit for the months it held back. The ${h.a('earnings-test', 'earnings limit page')} covers the rules before that point.</p>
<p>An example for the year itself. A worker born in June 1959 reaches ${fra.years} and ${fra.months} months in April 2026 and collects ${h.usd(benefitAtAge(base.pia, fra.total, fra.total).benefit)} a month. If they earn ${h.usd(70000)} from January to March, ${h.usd(70000 - P.earnings_test.higher_annual)} is above the limit, so ${h.usd(earningsTest(benefitAtAge(base.pia, fra.total, fra.total).benefit, 70000, 'fraYear', 3).withheld)} is withheld from the benefits for those months. Whatever they earn from April onward changes nothing.</p>

<h2>Taxes keep running</h2>
<p>Reaching full retirement age, or receiving benefits, does not exempt a paycheck from payroll tax. ${h.src('irsP15', 'IRS Publication 15')} states that wages are subject to Social Security and Medicare taxes "regardless of the employee's age or whether they are receiving social security benefits." On ${h.usd(E)} of wages in 2026 that is ${h.usd(pay.oasdi, 2)} of Social Security tax and ${h.usd(pay.hi, 2)} of Medicare tax for the employee, matched by the employer. For the self-employed the ${h.src('irsSeTax', 'IRS')} says the self-employment tax rules "apply no matter how old you are"; the same ${h.usd(E)} as net profit costs ${h.usd(se.total, 2)}.</p>
<p>The other tax is the one on the benefit. Under ${h.src('irsP915', 'IRS Publication 915')}, half of the benefit plus other income determines how much of the benefit is taxable. A married couple filing jointly with ${h.usd(yearly)} of benefits and ${h.usd(E)} of wages has a provisional income of ${h.usd(tax.provisional)}, above the ${h.usd(tax.base2)} threshold, so ${h.usd(tax.taxable)} of the benefit, ${h.pct(tax.share, 0)}, is taxable. The ${h.a('tax-calculator', 'benefit tax calculator')} runs other cases.</p>

<h2>The yearly recomputation</h2>
<p>Under ${h.src('cfr404_285', '20 CFR 404.285')}, "each year, we examine the earnings record of every retired, disabled, and deceased worker" to see whether the PIA can be recomputed, and the SSA does it without a request. The rule that decides is the same as for the first computation: the 35 highest indexed years count. A new year enters only by pushing out a lower one.</p>
<p>Take a worker born in 1959, full retirement age ${fra.years} and ${fra.months} months, reached in 2026. The career is a steady ${h.usd(S)} in today's pay from 22 to 62, so the lowest of the 35 years used is worth ${h.usd(low.indexed)} after indexing. Here is what one more year of pay in 2026 does:</p>
${h.table(['Earnings in 2026', 'AIME', 'PIA', 'Monthly gain'], tests, `Worker born in 1959, eligible in ${base.eligibilityYear}, steady ${h.usd(S)} career; COLAs to December 2025 included`, ['r', 'r', 'r', 'r'])}
<p>Two lessons. A year below the lowest of the 35 adds nothing at all: it is simply not used. And the gain is modest even for a big year, because only the difference between the new year and the dropped one enters, divided by 420 months, then passed through the 32% or 15% bracket of the formula. On the other hand, it is paid for life and grows with every future COLA. Workers with ${h.a('fewer-than-35-years', 'fewer than 35 years')} gain far more, since their new year replaces a zero.</p>

<h2>Recomputation and delayed credits together</h2>
<p>If you work past full retirement age without claiming, both mechanisms run. Each month without benefits earns a delayed retirement credit until 70, and each year of high pay can raise the PIA to which those credits apply. Someone with a ${h.usd(base.pia, 2)} PIA who waits from ${fra.years} and ${fra.months} months to 70 gets ${h.usd(benefitAtAge(base.pia, 840, fra.total).benefit)} a month; if a 2026 year at ${h.usd(E)} lifts the PIA to ${h.usd(plus.pia, 2)}, the same wait gives ${h.usd(benefitAtAge(plus.pia, 840, fra.total).benefit)}. Someone already collecting can still add credits only by a ${h.a('withdraw-or-suspend', 'voluntary suspension')}.</p>

<h2>Practical points</h2>
<ul>
<li>Check your earnings record each year: the recomputation uses what is posted there. A missing W-2 year means a missing raise.</li>
<li>The raise from a recomputation appears from January of the year after the earnings, not right away.</li>
<li>Payroll tax stops counting toward your record above the year's taxable maximum, ${h.usd(P.taxable_max_2026)} in 2026, but Medicare tax keeps applying to every dollar.</li>
</ul>`;
    },
  },
});
