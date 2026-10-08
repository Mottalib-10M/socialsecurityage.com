import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { inheritedRmd, singleLife, federalTax } from '../../lib/engine/accounts';

const R = P.extra.rmd as { relief_years: number[]; final_regs_apply_from: number; minor_child_majority: number; edb_age_gap: number; excise: number };
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const BAL = 400000;
// A 52-year-old daughter (51 in 2025) inherits from a father of 78 who died in 2024 after his RBD.
const ex = inheritedRmd({ balancePrevDec31: BAL, kind: 0, deathYear: 2024, year: 2026, benAgeYearAfterDeath: 51, ownerAgeAtDeath: 78, afterRbd: true });
const le51 = singleLife(51);
const OTHER = 90000;
const lumpTax = federalTax(OTHER + BAL, 0) - federalTax(OTHER, 0);
const evenTax = 10 * (federalTax(OTHER + BAL / 10, 0) - federalTax(OTHER, 0));

export default definePage({
  id: 'inherited-ira',
  group: 'retirement',
  order: 30,
  fold: true,
  mini: 'inheritedIra',
  miniHref: 'rmd-calculator',
  related: ['rmd-calculator', 'survivor-calculator', 'roth-conversion', 'irmaa', 'surviving-divorced-spouse'],
  sources: ['frRmd2024', 'cfr1_401a9_9', 'irsN2435', 'irsP590b', 'irsRmdFaq'],
  en: {
    slug: 'inherited-ira-rmd-calculator',
    nav: 'Inherited IRA',
    card: 'The 10-year rule, the yearly minimum when the owner had started RMDs, and the exceptions for spouses, minors and close-in-age heirs.',
    title: 'Inherited IRA RMD 2026: 10-Year Rule and Yearly Withdrawals',
    description: `Inherited IRA 2026: most heirs must empty it within 10 years, with a yearly RMD if the owner had started his (final IRS rules, from 2025). Calculator.`,
    h1: 'Inherited IRA RMD calculator and the 10-year rule',
    intro: 'Say who you are to the owner, when he or she died and whether RMDs had begun: the calculator gives the 2026 minimum and the year the account must be empty.',
    resume: `Most people who inherit an IRA from someone who died after 2019 must withdraw the whole account by December 31 of the tenth year after the death. Under the final IRS regulations that apply from ${R.final_regs_apply_from}, a second rule sits inside the first: if the owner had already reached the required beginning date, the heir must also take a minimum every year from the first year after the death, based on the heir's life expectancy in the Single Life Table, reduced by one each year. A daughter aged 51 the year after her father's death starts with a divisor of ${le51}; on ${$(BAL)} that is ${$(BAL / le51)} in year one. If the owner died before his RMD age, or the account is a Roth IRA, nothing is due until year ten. A surviving spouse, a minor child, a disabled or chronically ill heir, and anyone not more than ${R.edb_age_gap} years younger than the owner are eligible designated beneficiaries and may stretch withdrawals over their own life expectancy instead. The IRS waived penalties for yearly amounts missed from ${R.relief_years[0]} to ${R.relief_years[R.relief_years.length - 1]}.`,
    faqs: [
      { q: 'I inherited an IRA from my father in 2023 and took nothing. Do I owe a penalty?', a: `Not for 2023 or 2024: IRS Notice 2024-35 waived the ${Math.round(R.excise * 100)}% excise for yearly amounts missed in ${R.relief_years.join(', ')} by heirs under the 10-year rule. From 2025, the yearly minimum is required if your father had started his RMDs. The 10-year deadline is not moved by the relief: the account must still be empty by December 31, 2033.` },
      { q: 'When does the 10-year clock start on an inherited IRA?', a: 'On January 1 of the year after the death, and it ends on December 31 of the tenth year after the death. An owner who died in March 2025 or in December 2025 gives the same deadline, December 31, 2035. The year of death itself does not count, and no extension exists for heirs who learn of the account late.' },
      { q: 'Can I roll an inherited IRA into my own IRA?', a: 'Only a surviving spouse can. Any other heir must keep the money in an inherited IRA titled in the name of the deceased for the benefit of the heir, and move it only by a direct trustee-to-trustee transfer. A check paid to a non-spouse heir cannot be redeposited within 60 days: it is a taxable distribution, final.' },
      { q: 'Do I pay the 10% early withdrawal penalty on an inherited IRA?', a: 'No. Distributions to a beneficiary after the owner\'s death are exempt from the 10% additional tax at any age (IRS Publication 590-B). That is a reason for a young surviving spouse to stay a beneficiary rather than treat the IRA as her own: once it is hers, withdrawals before 59 and a half are penalized again.' },
      { q: 'Does the 10-year rule apply to an inherited Roth IRA?', a: 'Yes, for most heirs, but without yearly minimums. A Roth IRA owner is always treated as having died before the required beginning date, so a non-eligible heir only has to empty the account by the end of year ten. Withdrawals are tax-free once the account is five years old, counted from the owner\'s first Roth contribution.' },
    ],
    body: (h) => {
      const types = [
        ['Adult child, grandchild, friend, most trusts', '10-year rule; yearly minimum in years 1 to 9 if the owner had reached the required beginning date', 'December 31 of year 10'],
        ['Surviving spouse', 'Treat as own IRA, or stay beneficiary with life-expectancy payments recalculated each year, or the 10-year rule', 'None while payments continue'],
        [`Owner's child under ${R.minor_child_majority}`, `Life-expectancy payments until ${R.minor_child_majority}, then the 10-year rule`, `December 31 of the year the child turns ${R.minor_child_majority + 10}`],
        ['Disabled or chronically ill heir', 'Life-expectancy payments, reduced by one each year', 'None while payments continue'],
        [`Heir not more than ${R.edb_age_gap} years younger`, 'Life-expectancy payments; a sibling of about the same age is the usual case', 'None while payments continue'],
        ['Estate, charity, non-qualifying trust', '5-year rule if the owner died before the required beginning date, otherwise the owner\'s remaining life expectancy', 'Depends on the case'],
      ];
      const sched = Array.from({ length: 10 }, (_, i) => 2025 + i).reduce((acc: { rows: Array<Array<string | number>>; bal: number }, y) => {
        const r = inheritedRmd({ balancePrevDec31: acc.bal, kind: 0, deathYear: 2024, year: y, benAgeYearAfterDeath: 51, ownerAgeAtDeath: 78, afterRbd: true });
        acc.rows.push([String(y), r.divisor === 1 ? 'all' : h.num(r.divisor as number, 1), h.usd(acc.bal), h.usd(r.amount)]);
        acc.bal = (acc.bal - r.amount) * 1.05;
        return acc;
      }, { rows: [], bal: BAL }).rows;
      return `
<h2>Who you are decides the rule</h2>
<p>The SECURE Act of 2019 ended the lifetime stretch for most heirs and created five categories of eligible designated beneficiaries who keep it. The ${h.src('frRmd2024', 'final regulations of July 19, 2024')} fill in the details and apply to distribution years from ${R.final_regs_apply_from}. The table summarizes where each heir lands; age gaps and the child's age are measured on the date of the owner's death.</p>
${h.table(['Beneficiary', 'Withdrawal rule', 'Account empty by'], types, 'Inherited IRAs and defined contribution plans, owner died after 2019', ['l', 'l', 'l'])}

<h2>The yearly minimum inside the 10 years</h2>
<p>The regulations apply the old principle that money already flowing out must keep flowing "at least as rapidly". If the owner had reached the required beginning date, which is April 1 after the year he turned 73 for most people now dying, his heir must take an RMD in years one through nine and the rest in year ten. The divisor is the heir's life expectancy from the ${h.src('cfr1_401a9_9', 'Single Life Table')} at the heir's age in the year after the death, minus one for each later year; when the owner was younger than the heir, the owner's remaining life expectancy is used if it is longer.</p>
<p>Below, a daughter who was 51 in 2025 inherits ${h.usd(BAL)} from her father, who died in 2024 at 78. The balance is assumed to earn 5% a year after each withdrawal.</p>
${h.table(['Year', 'Divisor', 'Balance on Dec. 31 of prior year', 'Minimum withdrawal'], sched, 'Inherited IRA of a non-spouse heir, owner past his RMD age; 5% yearly growth assumed', ['l', 'r', 'r', 'r'])}
<p>For 2026 that is ${h.usd(ex.amount)}. The minimums are small at first because a 52-year-old has a long life expectancy, so most of the account is still there in 2034. That last-year balloon is what drives the tax decision below.</p>

<h2>The relief years and why 2025 is different</h2>
<p>The IRS first proposed the yearly-minimum reading in 2022, after many heirs had assumed they could wait until year ten. It then waived the excise four times, the last in ${h.src('irsN2435', 'Notice 2024-35')}, for minimums missed in ${R.relief_years.join(', ')}. Nothing has to be made up for those years. The relief ended with the final rules: a minimum due for 2025 that was not taken is now subject to the ${h.pct(R.excise, 0)} excise, reduced to 10% once corrected, and the deadline of the 10-year period never moved.</p>

<h2>Spreading the tax over the decade</h2>
<p>Everything withdrawn from a traditional inherited IRA is ordinary income in the year it comes out. The minimums are a floor, not a plan. A single heir with ${h.usd(OTHER)} of other taxable income who leaves ${h.usd(BAL)} to the tenth year owes about ${h.usd(lumpTax)} of federal tax on it in that one year, at 2026 rates. Taking ${h.usd(BAL / 10)} each year instead costs about ${h.usd(evenTax)} over the ten years, before growth. Even withdrawals also avoid one Medicare year at the top of the ${h.a('irmaa', 'IRMAA scale')} for heirs already 63 or older.</p>
<p>Years with low income, such as a gap between jobs, a sabbatical or the first year of retirement, are the cheapest moments to take more than the minimum.</p>

<h2>Surviving spouse: three paths</h2>
<p>A spouse who is the sole beneficiary has the most room. She can roll the account into her own IRA and treat it as hers, which gives her own RMD age and the Uniform Lifetime Table, the smallest required withdrawals. She can remain a beneficiary: if her husband died before his RMD age, she can wait until the year he would have reached it, and the divisor is her own life expectancy recalculated every year; under 59 and a half, this keeps penalty-free access. Since 2024 a spouse beneficiary can also elect to be treated as the deceased, which gives her the Uniform table without a rollover. The Social Security side of the same loss, the survivor benefit and when to switch to it, is on the ${h.a('survivor-calculator', 'survivor benefits page')}.</p>

<h2>Minor children and close-in-age heirs</h2>
<p>A child of the owner, not a grandchild, takes life-expectancy payments until ${R.minor_child_majority}, the age of majority set by the regulations, and then has ten more years. A parent who dies leaving an IRA to a 12-year-old gives that child yearly minimums until 21 and a final deadline at 31. A sister three years younger than the deceased, or any heir older than him, is eligible too and keeps the lifetime stretch, and so are heirs who meet the tax code's definition of disabled or chronically ill on the date of the death.</p>

<h2>Roth and 401(k) inheritances</h2>
<p>An inherited Roth IRA follows the same categories, but its owner is always considered to have died before the required beginning date. A non-spouse heir therefore has no yearly minimum and can let the account grow tax-free for ten years, then withdraw it tax-free if the five-year holding period is met. Employer plans such as 401(k) and 403(b) follow the same federal rules, but a plan may impose the 10-year rule where an IRA would allow the stretch, or require a faster payout. A direct transfer to an inherited IRA usually gives back the full set of options.</p>

<h2>What the calculator assumes</h2>
<p>It takes the balance of December 31, 2025, your age in 2026 and the year of death, and assumes the owner was 78 at death when RMDs had begun. When the owner was older than you, as in most inheritances, that assumption has no effect on the result. It does not handle trusts, estates or several beneficiaries on one account, which follow special rules, nor the owner's own RMD for the year of death, which the heir must take if the owner had not.</p>`;
    },
  },
});
