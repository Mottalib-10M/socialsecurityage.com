import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { cobraCost } from '../../lib/engine/accounts';

const C = P.extra.cobra as { premium_max: number; premium_disability: number; months_job: number; months_disability: number; months_secondary: number; election_days: number; first_payment_days: number; grace_days: number; min_employees: number; marketplace_sep_days: number; medicare_sep_months: number };
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pc = (x: number) => `${Math.round(x * 100)}%`;
const PLAN = 1800;
const ex = cobraCost({ planMonthly: PLAN, months: C.months_job, disability: false, marketplaceMonthly: 0 });
const late = P.extra.abroad.medicare_late_penalty_per_12_months as number;

export default definePage({
  id: 'cobra-cost',
  group: 'retirement',
  order: 60,
  fold: true,
  mini: 'cobraBridge',
  miniHref: 'medicare-part-b',
  related: ['medicare-part-b', 'hsa-limits', 'claiming-at-62', 'irmaa', 'spousal-calculator'],
  sources: ['dolCobra', 'healthcareCobra', 'medicareStart', 'irsP969', 'cmsPartB'],
  en: {
    slug: 'cobra-cost-before-medicare',
    nav: 'COBRA cost before 65',
    card: `${pc(C.premium_max)} of the full plan cost, for ${C.months_job} months in most cases: the price of keeping a job's health plan until Medicare.`,
    title: `COBRA Cost 2026: ${pc(C.premium_max)} of the Premium Until Medicare at 65`,
    description: `COBRA cost in 2026: up to ${pc(C.premium_max)} of the full plan premium, ${C.months_job} to ${C.months_secondary} months (US Labor Dept.). Compare it with a Marketplace plan before Medicare at age 65.`,
    h1: 'COBRA cost when you retire before Medicare',
    intro: 'Enter what the plan really costs, your share and the employer\'s together, and how many months you need: the calculator totals COBRA and sets it against a Marketplace plan.',
    resume: `COBRA lets you keep your employer's group health plan after leaving the job, but you pay the whole premium: the plan may charge up to ${pc(C.premium_max)} of its full cost, the part your employer used to pay included, according to the Department of Labor. A plan costing ${$(PLAN)} a month for a couple therefore bills ${$(ex.monthly)} a month, or ${$(ex.total)} over the usual maximum of ${C.months_job} months. Coverage lasts ${C.months_job} months after a job ends or hours are cut, ${C.months_disability} months when the SSA finds you disabled, with ${pc(C.premium_disability)} allowed from month 19, and ${C.months_secondary} months for a spouse or child after a death, a divorce or the worker's Medicare entitlement. For someone who retires at 63 and a half, ${C.months_job} months reach exactly to Medicare at 65; earlier retirees need a Marketplace plan for the rest. COBRA does not protect Part B: it is not coverage from current work, so at 65 you must sign up for Medicare on time or face a lifelong penalty.`,
    faqs: [
      { q: 'How much does COBRA cost a month?', a: `The full premium of your plan plus at most a ${Math.round((C.premium_max - 1) * 100)}% administration fee. If your pay stub showed ${$(250)} a month and the employer paid ${$(550)}, COBRA costs about ${$(800 * C.premium_max)}. Ask the plan administrator for the total cost: the election notice states it. Family coverage commonly costs two to three times the single rate.` },
      { q: 'Can I get COBRA if my employer has fewer than 20 employees?', a: `Federal COBRA covers private employers with ${C.min_employees} or more employees in the prior year, and state and local governments. Many states have continuation laws, often called mini-COBRA, for smaller insured plans, with their own durations and cost rules. Federal employees have a separate program, temporary continuation of coverage. The employer's plan administrator can say which applies.` },
      { q: 'Can my wife stay on COBRA after I go on Medicare?', a: `Yes. When a worker becomes entitled to Medicare and the spouse loses the employer coverage because of it, the spouse can elect COBRA for up to ${C.months_secondary} months. If the worker enrolled in Medicare before leaving the job, the spouse's ${C.months_secondary} months run from the Medicare date when that is longer. A younger spouse can bridge to her own 65 this way.` },
      { q: 'Can I pay COBRA premiums from my HSA?', a: 'Yes. COBRA premiums are one of the few insurance premiums an HSA may pay tax-free, along with coverage while receiving unemployment compensation and Medicare premiums after 65 (IRS Publication 969). If the COBRA plan is a high-deductible plan, you also stay eligible to keep contributing to the HSA during those months.' },
      { q: 'Can I drop COBRA and buy a Marketplace plan in the middle of the year?', a: `Not on your own initiative: voluntarily ending COBRA or stopping payments is not a qualifying event for a Special Enrollment Period, HealthCare.gov warns. You can switch during the fall Open Enrollment Period, or within ${C.marketplace_sep_days} days after COBRA runs out or another life event occurs. The best moment to compare is when the job ends.` },
    ],
    body: (h) => {
      const plans = [700, 1000, 1500, 1800, 2400];
      const rows = plans.map((p) => { const r = cobraCost({ planMonthly: p, months: C.months_job, disability: false, marketplaceMonthly: 0 }); return [h.usd(p), h.usd(r.monthly), h.usd(r.total)]; });
      const durations = [
        ['Job ends (except gross misconduct) or hours reduced', 'Employee, spouse, children', `${C.months_job} months`],
        ['SSA disability within the first 60 days of COBRA', 'Whole family', `${C.months_disability} months, ${h.pct(C.premium_disability, 0)} from month 19`],
        ['Death of the employee', 'Spouse, children', `${C.months_secondary} months`],
        ['Divorce or legal separation', 'Spouse, children', `${C.months_secondary} months`],
        ['Employee becomes entitled to Medicare', 'Spouse, children', `${C.months_secondary} months`],
        ['Child ages out of the plan', 'Child', `${C.months_secondary} months`],
      ];
      const ages = [[ '60', 60, 5 * 12 ], ['62', 62, 3 * 12], ['63', 63, 2 * 12], ['63 and 6 months', 63.5, 18], ['64', 64, 12]].map(([l, , m]) => { const need = m as number; return [String(l), `${need} months`, need <= C.months_job ? 'COBRA alone is enough' : `COBRA ${C.months_job} months, then ${need - C.months_job} months of Marketplace`]; });
      return `
<h2>102% of what the plan really costs</h2>
<p>Most employees never see the full price of their health plan, because the employer pays most of it. COBRA ends that subsidy. The ${h.src('dolCobra', 'Department of Labor')} allows the plan to charge the total premium plus 2% for administration. The table gives the monthly bill and the total for the full ${C.months_job} months at several plan costs.</p>
${h.table(['Full plan cost a month', 'COBRA a month', `Over ${C.months_job} months`], rows, 'COBRA premiums at the federal maximum of 102%', ['r', 'r', 'r'])}
<p>Coverage is the same plan with the same network, deductible and the deductible already met this year, which is the real advantage in a year of heavy treatment. Coverage is retroactive: you may elect up to ${C.election_days} days after the notice or the loss of coverage, whichever is later, and then pay the first premium within ${C.first_payment_days} days for all months since the plan ended. Later premiums have a ${C.grace_days}-day grace period.</p>

<h2>18, 29 or 36 months</h2>
${h.table(['Qualifying event', 'Who can elect', 'Longest coverage'], durations, 'Federal COBRA continuation periods (Department of Labor)', ['l', 'l', 'l'])}
<p>A second qualifying event during the first ${C.months_job} months, such as the death of the former employee, can extend a spouse's coverage to ${C.months_secondary} months in total. Coverage also ends early if premiums stop, the employer ends all group plans, or the person gains other group coverage.</p>

<h2>The bridge from early retirement to 65</h2>
<p>For a retiree, the question is how many months stand between the last day of work and the first day of Medicare, usually the month of the 65th birthday.</p>
${h.table(['Retire at', 'Months to cover until 65', 'Bridge'], ages, `Federal COBRA without disability: ${C.months_job} months maximum`, ['l', 'r', 'l'])}
<p>Retiring at 62 leaves a gap of eighteen months after COBRA. Claiming Social Security at the same time does not help with health coverage, since Medicare does not start before 65 except for disability, and it reduces the benefit for life; the ${h.a('claiming-at-62', 'page on claiming at 62')} measures that cost. A spouse younger than the retiree may need cover even longer: if the retiree becomes entitled to Medicare while the spouse is on the plan, the spouse gets ${C.months_secondary} months.</p>

<h2>Turning 65 while on COBRA</h2>
<p>This is the costly mistake. People who work past 65 can delay Part B without penalty while covered by an employer plan based on current work, and then have ${C.medicare_sep_months} months to enroll after that coverage ends. ${h.src('medicareStart', 'Medicare.gov')} states that COBRA is not group health plan coverage for this purpose and that getting COBRA does not extend that window. Someone who stays on COBRA past the window, thinking he is covered, pays a Part B penalty of ${h.pct(late, 0)} for each full 12 months without Part B, for life, on top of the ${h.usd(P.medicare.part_b_2026, 2)} standard premium, and can only enroll during the General Enrollment Period.</p>
<p>The order matters too. If you already have Medicare when you elect COBRA, you can keep both. If you become entitled to Medicare after electing COBRA, the plan may end your COBRA, while your spouse and children keep theirs. Medicare usually pays first once you are retired, so the COBRA plan may pay little until you enroll in Part B.</p>
<!--mini:hsaSavings-->
<h2>COBRA or a Marketplace plan</h2>
<p>Losing job-based coverage opens a ${C.marketplace_sep_days}-day Special Enrollment Period on HealthCare.gov or a state exchange, whether or not you elect COBRA. ${h.src('healthcareCobra', 'HealthCare.gov')} notes that Marketplace plans may cost less, especially with premium tax credits, which depend on the household's projected income for the year. Early retirees living on savings often show low income and qualify; a large IRA withdrawal or ${h.a('roth-conversion', 'Roth conversion')} in the same year can remove the credit. COBRA wins when the deductible is already largely met, when a doctor or hospital is not in Marketplace networks, or for a few months of bridge only.</p>
<p>Two practical points. Electing COBRA and then dropping it voluntarily does not reopen the Marketplace until the next Open Enrollment, so compare before choosing. And if the COBRA plan is a high-deductible plan, contributions to a health savings account can continue, with the limits on the ${h.a('hsa-limits', 'HSA page')}; the HSA can also pay the COBRA premiums tax-free.</p>

<h2>Paying for it from retirement income</h2>
<p>Premiums of ${h.usd(ex.monthly)} a month are a large fixed cost when the paychecks stop. Medicare at 65 will cost far less for most people: ${h.usd(P.medicare.part_b_2026, 2)} a month for Part B in 2026 plus a drug plan, more above the ${h.a('irmaa', 'IRMAA thresholds')}. Over a full bridge the COBRA bill is often the largest single retirement expense before 65, which is why the comparison below deserves an hour with the election notice in hand.</p>

<h2>What the calculator compares</h2>
<p>Premiums only, month by month, at the federal 102% ceiling and 150% for the disability extension months. It does not compare deductibles, out-of-pocket maximums or networks, does not compute premium tax credits, and assumes the plan cost stays the same when the plan year renews, which it rarely does. State continuation laws and the federal employees' program follow their own rules.</p>`;
    },
  },
});
