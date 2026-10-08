import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { irmaa } from '../../lib/engine/accounts';

const I = P.extra.irmaa2026 as { single: number[]; joint: number[]; mfs: number[]; partb_irmaa: number[]; partd_irmaa: number[]; partb_standard: number; tax_year: number; share_paying: number };
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const STD = I.partb_standard;
const top = I.partb_irmaa[5] + STD;
const cliff = irmaa(I.single[0] + 1, 0);
const cliffYear = cliff.yearly;
const couple = irmaa(300000, 1, 2);
const widow = irmaa(180000, 0), widowJoint = irmaa(180000, 1, 2);

export default definePage({
  id: 'irmaa',
  group: 'retirement',
  order: 10,
  fold: true,
  mini: 'irmaaSurcharge',
  miniHref: 'medicare-part-b',
  related: ['medicare-part-b', 'roth-conversion', 'rmd-calculator', 'hsa-limits', 'survivor-calculator', 'tax-calculator'],
  sources: ['cmsPartB', 'cfr418', 'ssa44', 'ssaIrmaa'],
  en: {
    slug: 'irmaa-brackets',
    nav: 'IRMAA brackets 2026',
    card: `Six tiers set by your ${I.tax_year} income: from ${$(I.partb_irmaa[1], 2)} to ${$(I.partb_irmaa[5], 2)} a month on Part B, plus a Part D surcharge, per person.`,
    title: `IRMAA Brackets 2026: Medicare Surcharge Up to ${$(I.partb_irmaa[5])} a Month`,
    description: `IRMAA 2026: Part B rises from ${$(STD, 2)} to as much as ${$(top, 2)} a month when 2024 MAGI tops ${$(I.single[0])} single or ${$(I.joint[0])} joint (CMS). Surcharge calculator.`,
    h1: 'IRMAA brackets for 2026 and the Medicare surcharge calculator',
    intro: 'Enter the modified adjusted gross income from your 2024 return: the calculator finds the tier and adds up what Part B and Part D will cost you in 2026.',
    resume: `IRMAA, the income-related monthly adjustment amount, adds ${$(I.partb_irmaa[1], 2)} to ${$(I.partb_irmaa[5], 2)} a month to the ${$(STD, 2)} standard Part B premium in 2026, and ${$(I.partd_irmaa[1], 2)} to ${$(I.partd_irmaa[5], 2)} to Part D, for each person on Medicare. It is set from the 2024 tax return: a single filer pays it once modified adjusted gross income exceeds ${$(I.single[0])}, a couple filing jointly once it exceeds ${$(I.joint[0])}. Above ${$(I.single[4])} single or ${$(I.joint[4])} joint, the total Part B premium reaches ${$(top, 2)}. Married people who lived together and filed separately follow a shorter scale that jumps straight to the fourth tier at ${$(I.mfs[0] + 1)}. The tiers are cliffs: one dollar over ${$(I.single[0])} costs a single person ${$(cliffYear, 2)} for the year. About ${Math.round(I.share_paying * 100)}% of people with Part B pay it, according to CMS. Retirement, a death, a divorce or reduced work hours let you ask the SSA, on Form SSA-44, to use a newer and lower income.`,
    faqs: [
      { q: 'I retired last year and my income dropped. How do I get IRMAA lowered?', a: `Stopping work is a life-changing event under 20 CFR 418.1205. File Form SSA-44 with the SSA, give your estimated income for the current year and proof of the retirement, such as an employer letter. If the lower income moves you to a lower tier, the new decision generally applies from January 1 of the year you ask. Without such an event, the SSA keeps the ${I.tax_year} return.` },
      { q: 'Is IRMAA charged per person or per couple?', a: `Per person. On a joint return the thresholds are double the single ones, but each spouse enrolled in Medicare pays the surcharge on his or her own premium. A couple with ${$(300000)} of joint MAGI is in the third tier and pays ${$(couple.monthly, 2)} a month in Part B and Part D surcharges together, or ${$(couple.yearly, 2)} over 2026.` },
      { q: 'What happens if my MAGI is one dollar over an IRMAA threshold?', a: `You pay the whole surcharge of the higher tier. There is no phase-in: the CMS table applies a fixed amount to every income between two bounds. At ${$(I.single[0] + 1)} of single MAGI the extra cost is ${$(cliff.partB, 2)} for Part B and ${$(cliff.partD, 2)} for Part D each month, ${$(cliffYear, 2)} a year, for a single dollar of income. Each upper bound is included in the lower tier.` },
      { q: 'Do I pay IRMAA if I have a Medicare Advantage plan?', a: `Yes. Medicare Advantage members still pay the Part B premium, so the Part B adjustment applies to them on the same income scale. If the Advantage plan includes drug coverage, the Part D adjustment applies as well, because it follows the drug coverage and not the type of plan. Both amounts are collected by the SSA or billed by Medicare, never by the plan.` },
      { q: 'Does a Roth conversion count toward IRMAA?', a: `Yes. The converted amount is taxable income, so it raises adjusted gross income and therefore MAGI, the figure the SSA uses two years later. A ${$(50000)} conversion done in 2026 is read on the 2026 return, which sets the 2028 premiums. A conversion is not a life-changing event, so Form SSA-44 cannot remove its effect.` },
      { q: 'Will the IRMAA brackets be different in 2027?', a: `Most likely. The lower thresholds are adjusted each year for inflation, which is why the first one moved to ${$(I.single[0])} for 2026, and CMS announces the next year's premiums and income ranges in the fall. The 2027 surcharges will be read on 2025 returns. Until CMS publishes them, the 2026 table above is the latest official one.` },
    ],
    body: (h) => {
      const rows = [0, 1, 2, 3, 4, 5].map((t) => {
        const s = t === 0 ? `${h.usd(I.single[0])} or less` : t < 5 ? `${h.usd(I.single[t - 1] + 1)} to ${h.usd(I.single[t])}` : `${h.usd(I.single[4])} or more`;
        const j = t === 0 ? `${h.usd(I.joint[0])} or less` : t < 5 ? `${h.usd(I.joint[t - 1] + 1)} to ${h.usd(I.joint[t])}` : `${h.usd(I.joint[4])} or more`;
        return [String(t), s, j, h.usd(I.partb_irmaa[t] + STD, 2), h.usd(I.partd_irmaa[t], 2), h.usd((I.partb_irmaa[t] + I.partd_irmaa[t]) * 12, 2)];
      });
      // tier 4 upper bound is "less than" the top threshold
      rows[4][1] = `${h.usd(I.single[3] + 1)} to ${h.usd(I.single[4] - 1)}`; rows[4][2] = `${h.usd(I.joint[3] + 1)} to ${h.usd(I.joint[4] - 1)}`;
      const mfs = [[`${h.usd(I.mfs[0])} or less`, h.usd(STD, 2), h.usd(0, 2)], [`${h.usd(I.mfs[0] + 1)} to ${h.usd(I.mfs[1] - 1)}`, h.usd(I.partb_irmaa[4] + STD, 2), h.usd(I.partd_irmaa[4], 2)], [`${h.usd(I.mfs[1])} or more`, h.usd(I.partb_irmaa[5] + STD, 2), h.usd(I.partd_irmaa[5], 2)]];
      return `
<h2>The 2026 tiers on one page</h2>
<p>Each tier is a band of 2024 modified adjusted gross income. The SSA compares your MAGI with the band for your filing status and charges the fixed amount of that band; the ${h.src('cmsPartB', 'CMS fact sheet of November 14, 2025')} publishes the figures and ${h.src('cfr418', '20 CFR part 418')} sets the method. Tier 0 is the standard premium. The yearly column adds the Part B and Part D surcharges for one person over twelve months.</p>
${h.table(['Tier', 'Single filers, 2024 MAGI', 'Joint filers, 2024 MAGI', 'Part B total a month', 'Part D surcharge', 'Surcharges per year'], rows, 'Medicare 2026, full Part B coverage, per person enrolled', ['l', 'l', 'l', 'r', 'r', 'r'])}
<p>The single column also covers heads of household, qualifying surviving spouses and married people filing separately who lived apart from their spouse for the whole year, as ${h.src('cfr418', '20 CFR 418.1115(b)')} provides. Part D surcharges apply on top of whatever premium your drug plan charges, and they are owed even when the plan premium is zero.</p>

<h2>The separate-return scale</h2>
<p>A married person who files a separate return and lived with the spouse at any time in the year has only three possible outcomes. The scale skips the first three surcharge tiers entirely: anyone above ${h.usd(I.mfs[0])} lands directly in the fourth.</p>
${h.table(['2024 MAGI, separate return, lived together', 'Part B total a month', 'Part D surcharge'], mfs, 'Married filing separately, 2026 (CMS)', ['l', 'r', 'r'])}
<p>Filing separately therefore rarely saves on Medicare. A spouse with ${h.usd(120000)} on a separate return pays ${h.usd(I.partb_irmaa[4] + STD, 2)} for Part B, while the same couple filing jointly at ${h.usd(240000)} would sit in the first surcharge tier at ${h.usd(I.partb_irmaa[1] + STD, 2)} each.</p>

<h2>Which income, from which year</h2>
<p>For 2026 the SSA reads the ${I.tax_year} federal return that the IRS transmits. If that return is not available, it uses ${I.tax_year - 1}, then corrects once the newer data arrives. MAGI here is adjusted gross income, line 11 of Form 1040, plus tax-exempt interest from line 2a. Everything that raises AGI raises it: wages, IRA and 401(k) withdrawals, required minimum distributions, Roth conversions, capital gains, dividends, rental profit, and the taxable part of Social Security itself. Withdrawals from a Roth IRA that are qualified, and money from a health savings account spent on medical care, do not count.</p>
<p>Two consequences follow. A large one-off income in the year you turned 63 shows up in your first Medicare year at 65. And the decisions that shape your premium are always two years ahead of the bill, which is where a ${h.a('roth-conversion', 'Roth conversion')} or the first ${h.a('rmd-calculator', 'required minimum distribution')} has to be weighed.</p>
<!--mini:irmaaLifeEvent-->
<h2>Form SSA-44: the seven events that reopen the decision</h2>
<p>The SSA uses newer income only when it fell because of a major life-changing event listed in ${h.src('cfr418', '20 CFR 418.1205')}, and only if the drop changes your tier. The events are: death of a spouse; marriage; divorce or annulment; you or your spouse stopped working or reduced hours; loss of income-producing property through a disaster or another event beyond your control; the end, termination or reorganization of an employer's pension plan; and a settlement from an employer or former employer after closure, bankruptcy or reorganization. Events that change expenses but not income, such as medical bills, and investment losses from ordinary market risk do not qualify (section 418.1210).</p>
<p>The request is made on ${h.src('ssa44', 'Form SSA-44')}, with proof of the event and of the income: a signed copy of the newer return if it is filed, otherwise an estimate for the current year. A new decision is generally effective in January of the year you ask, which means a request made in October still revises the whole year and refunds or credits the surcharges already withheld. If the estimate later proves too low, you must tell the SSA, and the premiums are adjusted once the IRS data for that year arrives.</p>

<h2>When the tax data itself is wrong</h2>
<p>Disagreeing with the IRS figure is not grounds for a reconsideration. The SSA dismisses such a request and asks for proof of the correction instead (sections 418.1330 and 418.1335). Two documents work: an amended return accepted by the IRS, with its acknowledgment, which the SSA uses for the year it replaces (section 418.1150), or an IRS letter confirming the corrected figures. A reconsideration on Form SSA-561 remains the path when the SSA misapplied the table, for example by treating a widow as a joint filer.</p>

<h2>The first single return after a death</h2>
<p>A surviving spouse usually files jointly for the year of the death and alone afterward, while household income often falls less than by half: pensions continue, the larger Social Security check is kept, and investment income stays. The thresholds are halved overnight. With ${h.usd(180000)} of income, the household paid nothing extra on a joint return; the same ${h.usd(180000)} on a single return means tier ${widow.tier}, ${h.usd(widow.yearly, 2)} of surcharges a year, against ${h.usd(widowJoint.yearly, 2)} before. The death of a spouse is a qualifying event, so Form SSA-44 can bring forward a lower year. The ${h.a('survivor-calculator', 'survivor benefit page')} shows which of the two Social Security checks continues.</p>

<h2>Keeping MAGI under a threshold</h2>
<p>The tools are the ones that move adjusted gross income. Qualified charitable distributions from an IRA, available from age 70 and a half, are excluded from income and count toward the RMD (IRS Publication 590-B). Spreading Roth conversions over several smaller years keeps each one under the next bound; the calculator above shows the room left. Harvesting gains or selling a property in a year before Medicare, or in a year already high, avoids touching two premium years. Health savings account money spent on qualified expenses never enters AGI, though contributions must stop when Medicare starts, as the ${h.a('hsa-limits', 'HSA page')} explains. Taxable Social Security counts as well, which the ${h.a('tax-calculator', 'benefit tax calculator')} estimates.</p>

<h2>What the calculator does not cover</h2>
<p>It applies the full Part B coverage table. People who keep only the immunosuppressive drug coverage after a kidney transplant have a lower base premium and slightly different surcharges in the CMS table. It does not compute the Part A premium, which only people with fewer than 40 credits pay, nor late-enrollment penalties, which add a percentage to the base premium and not to the adjustment. And it uses the thresholds of 2026: projections for 2027 and 2028 will move once CMS publishes the new bands.</p>`;
    },
  },
});
