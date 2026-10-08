import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { hsa, hsaMonthsBeforeMedicare } from '../../lib/engine/accounts';

const H = P.extra.hsa2026 as { self: number; family: number; catchup55: number; hdhp_min_deductible: { self: number; family: number }; hdhp_oop_max: { self: number; family: number }; self_2025: number; family_2025: number; penalty_nonqualified: number; excess_excise: number; parta_retro_months: number; fica_employee: number };
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const fam = hsa({ family: true, age55: false, months: 12, contribution: H.family, fedRate: 0.22, stateRate: 0, payroll: true });
// Turns 65 and applies for Social Security in September 2026: Part A goes back 6 months, to March.
const septMonths = hsaMonthsBeforeMedicare(3);
const sept = hsa({ family: true, age55: true, months: septMonths, contribution: 0, fedRate: 0, stateRate: 0, payroll: false });

export default definePage({
  id: 'hsa-limits',
  group: 'retirement',
  order: 50,
  fold: true,
  mini: 'hsaSavings',
  miniHref: 'irmaa',
  related: ['irmaa', 'medicare-part-b', 'cobra-cost', 'working-after-fra', 'roth-conversion'],
  sources: ['irsRp2519', 'irsP969', 'cfr42_406_6', 'cmsPartB'],
  en: {
    slug: 'hsa-contribution-limits',
    nav: 'HSA limits 2026',
    card: `${$(H.self)} self-only, ${$(H.family)} family, ${$(H.catchup55)} more from 55, and zero from the first month of Medicare.`,
    title: `HSA Contribution Limits 2026: ${$(H.self)} and ${$(H.family)}, Tax Savings`,
    description: `HSA limits 2026: ${$(H.self)} self-only, ${$(H.family)} family, plus ${$(H.catchup55)} at 55 (Rev. Proc. 2025-19). Contributions stop once Medicare starts. Tax savings calculator.`,
    h1: 'HSA contribution limits for 2026 and your tax saving',
    intro: 'Pick your coverage, your age and the month Medicare starts, if it does this year: the calculator prorates the limit and adds up the tax the contribution saves.',
    resume: `For 2026 the health savings account limit is ${$(H.self)} with self-only coverage and ${$(H.family)} with family coverage under a high-deductible health plan, up from ${$(H.self_2025)} and ${$(H.family_2025)} in 2025, according to IRS Revenue Procedure 2025-19. People who are 55 or older by the end of the year add ${$(H.catchup55)}. To qualify, the plan's deductible must be at least ${$(H.hdhp_min_deductible.self)} for one person or ${$(H.hdhp_min_deductible.family)} for a family, with out-of-pocket costs capped at ${$(H.hdhp_oop_max.self)} and ${$(H.hdhp_oop_max.family)}. A family contribution of ${$(H.family)} made through payroll saves about ${$(fam.totalSaved)} of federal tax at a 22% bracket, because it escapes both income tax and the 7.65% payroll tax. The limit drops to zero from the first month you are enrolled in Medicare, and Part A started after 65 reaches back up to ${H.parta_retro_months} months, so contributions should stop half a year before you apply for Medicare or Social Security.`,
    faqs: [
      { q: 'Can I keep contributing to my HSA if I delay Medicare at 65?', a: `Yes, as long as you are not enrolled in any part of Medicare and still have HDHP coverage, usually through an employer with 20 or more workers. The catch is Social Security: claiming retirement benefits at or after 65 enrolls you in Part A automatically, and Part A cannot be refused while keeping benefits. Delaying both keeps the HSA open.` },
      { q: 'How much can I put in my HSA if I turn 65 in the middle of 2026?', a: `One twelfth of the yearly limit for each month before Medicare starts. With family coverage, the catch-up and Part A from July 1, that is six months: ${$(hsa({ family: true, age55: true, months: 6, contribution: 0, fedRate: 0, stateRate: 0, payroll: false }).limit)}. Medicare usually begins on the first day of the month you turn 65, or the month before if your birthday is on the 1st.` },
      { q: 'Can my HSA pay my Medicare premiums?', a: 'Yes, once you are 65. Premiums for Part A, Part B, Part D and Medicare Advantage plans are qualified medical expenses, including the income-related surcharges (IRS Publication 969). Medigap supplement premiums are not. Paying Part B from the HSA does not stop the SSA from deducting it: you reimburse yourself from the account instead.' },
      { q: 'What happens if I contributed too much after enrolling in Medicare?', a: `The excess is taxed at ${Math.round(H.excess_excise * 100)}% every year it stays in the account. Ask the HSA custodian to return the excess and its earnings before the due date of your return, including extensions: the 6% then does not apply, and only the earnings are taxable. Employer contributions above the limit also count as excess.` },
      { q: 'Can my spouse and I both make the $1,000 catch-up contribution?', a: `Yes, if both of you are 55 or older and eligible, but each catch-up must go into the account of the spouse it belongs to. One family HSA cannot take two catch-ups. A couple with family coverage, both over 55, can put in ${$(H.family + H.catchup55)} in one account and ${$(H.catchup55)} in a second account in the other spouse's name.` },
    ],
    body: (h) => {
      const rows = [
        ['Contribution limit, self-only', h.usd(H.self_2025), h.usd(H.self)],
        ['Contribution limit, family', h.usd(H.family_2025), h.usd(H.family)],
        ['Catch-up from age 55', h.usd(H.catchup55), h.usd(H.catchup55)],
      ];
      const rates = [0.12, 0.22, 0.24, 0.32];
      const save = rates.map((r) => { const a = hsa({ family: false, age55: false, months: 12, contribution: H.self, fedRate: r, stateRate: 0, payroll: true }); const b = hsa({ family: false, age55: false, months: 12, contribution: H.self, fedRate: r, stateRate: 0, payroll: false }); return [h.pct(r, 0), h.usd(b.totalSaved), h.usd(a.totalSaved)]; });
      const apply = [['March 2026', 'September 2025, or the month you turned 65 if later', 'None from that month'], ['September 2026', 'March 2026', 'Two months allowed in 2026'], ['January 2027', 'July 2026', 'Six months allowed in 2026']];
      return `
<h2>2026 against 2025</h2>
<p>The limits are indexed each year to inflation. The 2026 figures come from ${h.src('irsRp2519', 'Revenue Procedure 2025-19')}; the ${h.usd(H.catchup55)} catch-up is fixed by law and has not changed since 2009.</p>
${h.table(['Item', '2025', '2026'], rows, 'Health savings accounts and high-deductible health plans (IRS)', ['l', 'r', 'r'])}
<p>The plan itself must qualify: in 2026 a deductible of at least ${h.usd(H.hdhp_min_deductible.self)} for one person or ${h.usd(H.hdhp_min_deductible.family)} for a family, and out-of-pocket costs, premiums aside, of no more than ${h.usd(H.hdhp_oop_max.self)} and ${h.usd(H.hdhp_oop_max.family)}. The limit counts everything paid in for the year: your own deposits, payroll deferrals and employer money alike. Contributions for 2026 can be made until the filing deadline in April 2027.</p>

<h2>Turning 65: the month Medicare starts, the limit stops</h2>
<p>${h.src('irsP969', 'IRS Publication 969')} is blunt: from the first month you are enrolled in Medicare, your contribution limit is zero. Owning an HSA is still allowed and spending from it is unaffected; only new money stops. The yearly limit is then prorated, one twelfth for each month of eligibility before Medicare, and the catch-up is prorated the same way.</p>
<p>The trap is that enrollment can be dated in the past. Under ${h.src('cfr42_406_6', '42 CFR 406.6(d)(4)')}, an application for premium-free Part A filed more than ${H.parta_retro_months} months after you first became eligible is retroactive to the sixth month before the month of filing. Applying for Social Security retirement benefits after 65 counts as that application. Months already covered by HSA contributions then become months of Medicare, and the money paid in for them becomes an excess.</p>
${h.table(['You apply for Medicare or Social Security in', 'Part A starts', 'HSA contributions'], apply, `Part A retroactivity of up to ${H.parta_retro_months} months, never before the month you turned 65`, ['l', 'l', 'l'])}
<p>For a family plan holder over 55 who applies in September 2026, Part A starts in March and the 2026 limit is ${h.usd(sept.limit)}, two months of the full ${h.usd(H.family + H.catchup55)}. Employer deposits must be stopped too, which usually means telling human resources the date before the payroll year starts.</p>

<h2>What the deduction is worth</h2>
<p>Money going in through an employer's cafeteria plan avoids income tax and the employee's ${h.pct(H.fica_employee, 2)} share of Social Security and Medicare tax. Money paid in directly and deducted on the return avoids income tax only. On the self-only limit of ${h.usd(H.self)}:</p>
${h.table(['Federal bracket', 'Deducted on the return', 'Through payroll'], save, 'Federal tax saved on a 2026 self-only contribution, state tax excluded', ['l', 'r', 'r'])}
<p>One side effect is easy to miss: payroll contributions also lower the wages on which Social Security benefits are computed, by a tiny amount. One year of ${h.usd(H.self)} less covered pay lowers average indexed monthly earnings by about ${h.usd(H.self / 420)} and, in the 32% bracket of the formula, the PIA by about ${h.usd(H.self / 420 * 0.32)} a month; a whole career of it weighs more, which the ${h.a('benefits-calculator', 'earnings-record calculator')} can measure. California and New Jersey tax HSA contributions at the state level, so their residents keep only the federal saving.</p>
<!--mini:cobraBridge-->
<h2>After 65: a tax-free fund for Medicare costs</h2>
<p>Once Medicare starts, the account becomes a dedicated health fund. Withdrawals for qualified expenses stay tax-free: deductibles, copays, dental and vision care, and the premiums for Part B, Part D and Medicare Advantage, surcharges included (${h.src('irsP969', 'Publication 969')}). For a single retiree in the third income tier, the 2026 Part B premium alone is ${h.usd(P.extra.irmaa2026.partb_irmaa[2] + P.medicare.part_b_2026, 2)} a month, as the ${h.a('irmaa', 'IRMAA brackets')} show, and the HSA can reimburse it. Withdrawals for anything else are taxable but, after 65, no longer charged the ${h.pct(H.penalty_nonqualified, 0)} additional tax, which makes the account work like a traditional IRA for non-medical spending.</p>
<p>Reimbursement has no deadline. Receipts for expenses paid out of pocket after the account was opened can be reimbursed years later, a common way to let the balance grow invested while keeping access to it.</p>

<h2>The last-month rule and its year of testing</h2>
<p>Someone eligible on December 1 is treated as eligible for the whole year and can contribute the full limit, even after joining an HDHP late. The price is a testing period: eligibility must continue through December 31 of the next year. Enrolling in Medicare during that period breaks it, and the extra contributions become taxable income with a 10% additional tax. People who expect Medicare the following year should contribute only for the months they really had.</p>

<h2>HSAs in the years before Medicare</h2>
<p>An HSA follows its owner. After a job ends, COBRA coverage of an HDHP keeps you eligible, and the HSA can pay COBRA premiums themselves, one of the few insurance premiums it covers; the ${h.a('cobra-cost', 'COBRA cost page')} compares that bridge with a Marketplace plan. Since the 2025 tax law, which Publication 969 notes, an HDHP may also cover telehealth before the deductible without breaking eligibility.</p>

<h2>What the calculator leaves out</h2>
<p>It prorates by whole months and assumes eligibility the whole time before Medicare. It ignores state tax, which most states align with the federal treatment, and the effect of the contribution on credits that depend on income. For a family plan where both spouses are 55 or older, it computes one catch-up; the second goes in the other spouse's own account.</p>`;
    },
  },
});
