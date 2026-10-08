import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { rothConversion, standardDeduction, bracketRoom } from '../../lib/engine/accounts';

const T = P.extra.tax2026 as { rates: number[]; single: number[]; joint: number[]; hoh: number[]; std: { single: number; joint: number; hoh: number } };
const I = P.extra.irmaa2026 as { joint: number[]; single: number[] };
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const TAXABLE = 90000, MAGI = TAXABLE + T.std.joint;
const room12 = bracketRoom(60000, 1);
const big = rothConversion(TAXABLE, MAGI, 150000, 1);

export default definePage({
  id: 'roth-conversion',
  group: 'retirement',
  order: 40,
  fold: true,
  mini: 'rothConvert',
  miniHref: 'irmaa',
  related: ['irmaa', 'rmd-calculator', 'tax-calculator', 'inherited-ira', 'claiming-at-70'],
  sources: ['irsInflation2026', 'irsRp2532', 'irsP590a', 'irsP590b', 'cmsPartB', 'irsSenior'],
  en: {
    slug: 'roth-conversion-calculator',
    nav: 'Roth conversion',
    card: `The tax a conversion adds at 2026 rates, the room left in your bracket, and the Medicare surcharge it can trigger two years later.`,
    title: 'Roth Conversion Tax 2026: Bracket Cost and the IRMAA Echo',
    description: `Roth conversion in 2026: the amount is taxed at your top rates (10% to 37%, 2026 tables) and counts in the MAGI that sets 2028 Medicare premiums. Calculator.`,
    h1: 'Roth conversion calculator: the tax now and the Medicare cost later',
    intro: 'Enter your 2026 taxable income and MAGI without the conversion, then the amount: the calculator stacks it on top and shows each cost it creates.',
    resume: `A Roth conversion adds the converted amount to your taxable income for the year, so it is taxed at the rates of the brackets it fills, not at your average rate. In 2026 a married couple with ${$(TAXABLE)} of taxable income sits in the 12% bracket with ${$(bracketRoom(TAXABLE, 1))} of room before 22%; converting ${$(150000)} costs about ${$(big.tax)} of federal tax, an average of ${Math.round(big.effective * 1000) / 10}% on the converted dollars, with the last ones taxed at ${Math.round(big.topRate * 100)}%. The same amount enters modified adjusted gross income, which the SSA reads two years later: a 2026 conversion sets the Medicare premiums of 2028, and above ${$(I.joint[0])} joint or ${$(I.single[0])} single in today's bands it adds an IRMAA surcharge for each spouse on Medicare. Converted money then grows tax-free with no required distributions for the owner. A conversion cannot be undone, the RMD of the year cannot be converted, and each conversion starts its own five-year clock for the 10% penalty before 59 and a half.`,
    faqs: [
      { q: 'Can I undo a Roth conversion if the market drops?', a: 'No. Recharacterizing a conversion back to a traditional IRA was abolished for conversions made after 2017 (IRS Publication 590-A). The tax is due on the value converted, even if the account falls the next month. Converting in several smaller steps through the year, or after a decline, is the only way to manage that risk.' },
      { q: 'Should I convert to a Roth before I start Social Security?', a: `The years between retirement and claiming, and before RMDs start at 73 or 75, are often the lowest-income years a household will see, so conversions there are taxed in the 10% or 12% brackets. Once benefits start, each converted dollar can also make up to 85 cents of Social Security taxable, which raises its real marginal rate. Delaying benefits to 70 lengthens that window.` },
      { q: 'Is there an income limit for converting to a Roth IRA?', a: 'No. The income limits apply to direct Roth IRA contributions, not to conversions, and the old $100,000 conversion limit was repealed in 2010. Anyone with a traditional IRA, or a 401(k) that allows in-plan conversions or a rollover, can convert any amount in any year, whatever the income.' },
      { q: 'Do I have to convert my whole IRA at once?', a: 'No. You choose the dollar amount, and you can convert several times in the same year. If the IRA holds after-tax contributions, the pro-rata rule applies: each conversion carries the same share of basis as all your traditional, SEP and SIMPLE IRAs combined on December 31, reported on Form 8606. You cannot convert only the after-tax dollars.' },
      { q: 'Does a Roth conversion reduce my Social Security under the earnings test?', a: 'No. The retirement earnings test counts only wages and net self-employment earnings. IRA withdrawals, conversions, pensions, interest and capital gains are not work income, so they never cause the SSA to withhold benefits before full retirement age. They can, however, make more of the benefit taxable on the federal return.' },
    ],
    body: (h) => {
      const amounts = [10000, 25000, 50000, 75000, 100000, 150000, 250000];
      const rows = amounts.map((a) => { const r = rothConversion(TAXABLE, MAGI, a, 1); return [h.usd(a), h.usd(r.tax), h.pct(r.effective), h.pct(r.topRate, 0), r.irmaaAfter === 0 ? 'none' : `tier ${r.irmaaAfter}`]; });
      const br = T.rates.map((rate, i) => [h.pct(rate, 0), i === 0 ? `up to ${h.usd(T.single[0])}` : i < 6 ? `${h.usd(T.single[i - 1])} to ${h.usd(T.single[i])}` : `over ${h.usd(T.single[5])}`, i === 0 ? `up to ${h.usd(T.joint[0])}` : i < 6 ? `${h.usd(T.joint[i - 1])} to ${h.usd(T.joint[i])}` : `over ${h.usd(T.joint[5])}`, i === 0 ? `up to ${h.usd(T.hoh[0])}` : i < 6 ? `${h.usd(T.hoh[i - 1])} to ${h.usd(T.hoh[i])}` : `over ${h.usd(T.hoh[5])}`]);
      const single = rothConversion(40000, 40000 + T.std.single, 75000, 0);
      return `
<h2>The converted dollars sit on top of everything else</h2>
<p>The cost of a conversion is the difference between the tax on your income with it and the tax without it. Because it comes last, it is taxed at the highest rates you reach. The table takes a married couple with ${h.usd(TAXABLE)} of taxable income in 2026, about ${h.usd(MAGI)} of MAGI once the ${h.usd(standardDeduction(1))} standard deduction is added back, and converts increasing amounts.</p>
${h.table(['Converted', 'Extra federal tax', 'Average rate', 'Top rate reached', 'IRMAA tier in 2028*'], rows, 'Married filing jointly, 2026 rate tables (Rev. Proc. 2025-32). *At 2026 thresholds', ['r', 'r', 'r', 'r', 'l'])}
<p>The jump between ${h.usd(100000)} and ${h.usd(150000)} is the line between the 22% and 24% brackets, which is much narrower in cost than the one between 12% and 22%. For many retirees the useful target is to "fill" the 12% or the 22% bracket exactly, and stop.</p>

<h2>The 2026 brackets to fill</h2>
<p>The ${h.src('irsInflation2026', 'IRS adjustments for 2026')}, with the rate schedules of ${h.src('irsRp2532', 'Revenue Procedure 2025-32')}, apply to taxable income, after the standard deduction of ${h.usd(T.std.single)} single, ${h.usd(T.std.joint)} joint or ${h.usd(T.std.hoh)} head of household.</p>
${h.table(['Rate', 'Single', 'Married filing jointly', 'Head of household'], br, '2026 federal income tax brackets on taxable income', ['l', 'l', 'l', 'l'])}
<p>A couple with ${h.usd(60000)} of taxable income has ${h.usd(room12)} of room in the 12% bracket. Converting exactly that amount costs 12 cents per dollar; one dollar more costs 22.</p>

<h2>Two years later: the Medicare echo</h2>
<p>The SSA sets each year's Part B and Part D premiums from the tax return of two years before, so a conversion in 2026 shows up on the bills of 2028. In the table above, the couple crosses the first joint threshold of ${h.usd(I.joint[0])} with a conversion of ${h.usd(150000)} and pays tier ${big.irmaaAfter} surcharges for both spouses, about ${h.usd(big.irmaaExtraYear)} for the year. A single filer with ${h.usd(40000)} of taxable income converting ${h.usd(75000)} pays ${h.usd(single.tax)} of income tax and ${single.irmaaExtraYear > 0 ? `${h.usd(single.irmaaExtraYear)} of surcharges two years on` : 'no surcharge'}. The thresholds will be indexed by 2028, so the real line will sit a little higher. A conversion is a voluntary income spike, not a life-changing event, so it cannot be erased with Form SSA-44. The bands are on the ${h.a('irmaa', 'IRMAA page')}.</p>
<p>Converting before 63 avoids the echo entirely, because income at 62 and earlier sets premiums before Medicare begins at 65.</p>
<!--mini:irmaaSurcharge-->
<h2>Two five-year clocks</h2>
<p>The first applies to each conversion separately. If you are under 59 and a half and withdraw converted money within five years, counted from January 1 of the year of the conversion, the taxable part of that conversion is hit by the 10% additional tax, though not taxed again (${h.src('irsP590b', 'IRS Publication 590-B')}). After 59 and a half this clock no longer matters for the penalty.</p>
<p>The second decides whether earnings are tax-free. A distribution is qualified once five years have passed since January 1 of the year of your first contribution or conversion to any Roth IRA, and you are 59 and a half, disabled, or the money goes to an heir. For a retiree who opens a first Roth IRA at 66 with a conversion, earnings become tax-free at 71; the converted principal itself can come out tax-free at any time.</p>

<h2>Where conversions meet Social Security</h2>
<p>Converted income counts in the provisional income formula that decides how much of the benefit is taxable. Below the base amounts, a conversion can turn untaxed benefits into taxed ones, so each extra dollar converted may add 85 cents of taxable benefits and a 12% bracket behaves like 22%. The ${h.a('tax-calculator', 'benefit tax calculator')} shows where you stand. The temporary deduction for people 65 and older, ${h.usd(P.taxation.senior_deduction.amount)} through 2028, also shrinks once MAGI passes ${h.usd(P.taxation.senior_deduction.phaseout_single)} single or ${h.usd(P.taxation.senior_deduction.phaseout_joint)} joint (${h.src('irsSenior', 'IRS')}). These interactions are why the cheapest conversion years are usually before benefits start; ${h.a('claiming-at-70', 'claiming at 70')} widens them.</p>

<h2>The RMD comes first</h2>
<p>From the year you reach your RMD age, the first dollars leaving a traditional IRA are deemed to be the required distribution, and an RMD cannot be converted (${h.src('irsP590a', 'Publication 590-A')}). Withdraw it, then convert the amount you chose. Every dollar converted earlier reduces the balance the ${h.a('rmd-calculator', 'RMD divisor')} will later apply to, and heirs inheriting a Roth IRA have no yearly minimum under the ${h.a('inherited-ira', '10-year rule')}.</p>

<h2>Paying the tax</h2>
<p>The conversion tax is best paid from a taxable account. Withholding it from the conversion itself reduces the amount reaching the Roth, and under 59 and a half the withheld part is a distribution subject to the 10% penalty. A large conversion late in the year may require an estimated payment; paying at least the prior year's tax through withholding or estimates avoids the underpayment penalty.</p>

<h2>Limits of the calculator</h2>
<p>It computes regular federal income tax only, on ordinary income. It ignores state income tax, the 3.8% net investment income tax, the taxation of Social Security, the senior deduction phase-out and the effect on capital gains rates, all of which can raise the real cost, sometimes a lot. The IRMAA line uses the 2026 thresholds and joint bands for a couple both on Medicare.</p>`;
    },
  },
});
