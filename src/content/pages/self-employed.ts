import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { selfEmploymentTax, computePia, projectCareer, benefitAtAge, creditsFor } from '../../lib/engine/ss';

const R = P.payroll;
const CAP = P.taxable_max_2026;
const capProfit = CAP / R.se_net_factor;
const minProfit = R.se_min_net / R.se_net_factor;
const fourCredits = (P.credits.qc_amount * P.credits.max_per_year) / R.se_net_factor;
const ex = selfEmploymentTax(60000);
const b = { y: 1970, m: 6, d: 15 };
const careerPia = (profit: number) => computePia(b, projectCareer(b, Math.round(profit * R.se_net_factor), 27, 62));
const HIGH = 70000, LOW = 55000;
const pHigh = careerPia(HIGH), pLow = careerPia(LOW);
const taxHigh = selfEmploymentTax(HIGH), taxLow = selfEmploymentTax(LOW);
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pc = (x: number, d = 1) => `${(x * 100).toFixed(d).replace(/\.0+$/, '')}%`;

export default definePage({
  id: 'self-employed',
  group: 'taxwork',
  order: 10,
  mini: 'taxSelfEmployed',
  related: ['taxable-maximum', 'credits', 'aime', 'earnings-test', 'benefits-calculator'],
  sources: ['irsTc554', 'irsSeTax', 'ssaCbb', 'ssaCredits', 'ssaWorkPub'],
  en: {
    slug: 'social-security-self-employed',
    nav: 'Self-employed',
    card: `${pc(R.oasdi_self_employed + R.hi_self_employed)} on ${pc(R.se_net_factor, 2)} of net profit, Social Security part capped at ${$(CAP)}: what you pay in 2026 and what it builds.`,
    title: 'Social Security for the Self-Employed 2026: 15.3% SE Tax',
    description: `Self-employed 2026: SE tax of 15.3% on 92.35% of net profit, the 12.4% part capped at ${$(CAP)}, due from $400; and how each deduction trims your future benefit.`,
    h1: 'Social Security when you work for yourself',
    intro: 'A sole proprietor pays both halves of the payroll tax, and the same Schedule SE figure later becomes the earnings the SSA uses for the benefit.',
    resume: `Self-employed workers pay Social Security and Medicare through self-employment tax: ${pc(R.oasdi_self_employed)} for Social Security plus ${pc(R.hi_self_employed)} for Medicare, ${pc(R.oasdi_self_employed + R.hi_self_employed)} in all, applied to ${pc(R.se_net_factor, 2)} of net profit (IRS Topic 554). The ${pc(R.oasdi_self_employed)} part stops at the 2026 contribution and benefit base of ${$(CAP)} of net earnings, reached at about ${$(capProfit)} of profit; the Medicare part has no cap. No tax is due when net earnings from self-employment are under ${$(R.se_min_net)}. On a ${$(60000)} profit, the tax is ${$(ex.total)}: ${$(ex.oasdi)} for Social Security and ${$(ex.hi)} for Medicare, and the ${$(ex.base)} of net earnings earn the year's ${ex.credits} credits. The same net earnings go on your Social Security record, so every business deduction that lowers the tax also lowers future benefits: over a career, ${$(HIGH)} of yearly profit builds a PIA of ${$(pHigh.pia)} and ${$(LOW)} a PIA of ${$(pLow.pia)}, for a worker born in 1970.`,
    faqs: [
      { q: 'Why is self-employment tax charged on 92.35% of my profit and not all of it?', a: `The factor is 100% minus ${pc(R.oasdi_employer + R.hi_employee, 2)}, the employer's share of Social Security and Medicare tax on wages. Applying it to net profit mirrors the fact that an employee's wages are paid after the employer has borne its own share. You can also deduct half of the self-employment tax when computing adjusted gross income (IRS Topic 554).` },
      { q: 'I made $350 from a side gig. Do I owe self-employment tax?', a: `No. The tax applies when net earnings from self-employment, that is ${pc(R.se_net_factor, 2)} of profit, reach ${$(R.se_min_net)}. A profit of ${$(350)} gives ${$(350 * R.se_net_factor, 2)} of net earnings, below the threshold, so no tax is due and no credit is earned. The threshold is crossed at a profit of about ${$(Math.ceil(minProfit))}.` },
      { q: 'How much profit do I need to earn four credits this year?', a: `Four credits require ${$(P.credits.qc_amount * P.credits.max_per_year)} of covered earnings in 2026, one per ${$(P.credits.qc_amount)}. For the self-employed, credits are counted on net earnings, ${pc(R.se_net_factor, 2)} of profit, so a profit of about ${$(Math.ceil(fourCredits))} is needed. Forty credits make you eligible for retirement benefits; more credits do not raise the amount.` },
      { q: 'I already collect Social Security. Do I still pay SE tax on my consulting income?', a: `Yes. IRS Topic 554 states that you can be liable for self-employment tax even if you currently receive Social Security benefits. The tax is due at any age once net earnings reach ${$(R.se_min_net)}. The upside is that new earnings can replace a lower year among your best 35, and the SSA recomputes the benefit when they do.` },
      { q: 'Does my business profit count toward the earnings limit before full retirement age?', a: `Yes. Net earnings from self-employment count, alongside wages. Under full retirement age, ${$(P.earnings_test.lower_annual)} is the 2026 limit, with ${$(1)} withheld per ${$(2)} above it. The SSA also looks at the time you spend in the business: more than ${P.extra.earnings_test_detail.se_hours_not_retired_above} hours a month generally means you are not retired for the monthly test.` },
    ],
    body: (h) => {
      const profits = [5000, 20000, 60000, 120000, Math.round(capProfit), 250000];
      const rows = profits.map((p) => { const r = selfEmploymentTax(p); return [h.usd(p), h.usd(r.base), h.usd(r.oasdi), h.usd(r.hi), h.usd(r.total), String(r.credits)]; });
      const rec = projectCareer(b, Math.round(HIGH * R.se_net_factor), 27, 62);
      const yr = 2030;
      const cut = { ...rec, [yr]: rec[yr] - Math.round(10000 * R.se_net_factor) };
      const dPia = careerPia(HIGH).pia - computePia(b, cut).pia;
      const saved = selfEmploymentTax(HIGH).total - selfEmploymentTax(HIGH - 10000).total;
      const careerRows = [40000, LOW, HIGH, 100000].map((p) => { const r = careerPia(p); return [h.usd(p), h.usd(selfEmploymentTax(p).oasdi), h.usd(r.aime), h.usd(r.pia, 2), h.usd(benefitAtAge(r.pia, 804, 804).benefit)]; });
      return `
<h2>From net profit to Schedule SE</h2>
<p>Self-employment tax starts from the profit on Schedule C (or your partnership share), gross receipts minus ordinary and necessary business expenses. The ${h.src('irsTc554', 'IRS Topic 554')} then takes ${h.pct(R.se_net_factor, 2)} of that profit as net earnings from self-employment, and applies two rates: ${h.pct(R.oasdi_self_employed)} for Social Security on net earnings up to the contribution and benefit base, ${h.usd(CAP)} in 2026 (${h.src('ssaCbb', 'SSA base table')}), and ${h.pct(R.hi_self_employed)} for Medicare on all of it. Nothing is due when net earnings are under ${h.usd(R.se_min_net)}.</p>
${h.table(['Net profit', 'Net earnings (92.35%)', 'Social Security 12.4%', 'Medicare 2.9%', 'Total SE tax', 'Credits'], rows, '2026 self-employment tax; additional Medicare tax not included', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Two thresholds stand out. Around ${h.usd(capProfit)} of profit, net earnings hit ${h.usd(CAP)} and the Social Security part stops growing at ${h.usd(CAP * R.oasdi_self_employed)}; above it only the ${h.pct(R.hi_self_employed)} Medicare part continues. At the other end, about ${h.usd(Math.ceil(fourCredits))} of profit earns the four credits allowed in a year. The IRS adds an additional Medicare tax above ${h.usd(R.addl_medicare_single)} for single filers and ${h.usd(R.addl_medicare_joint)} on joint returns, computed on Form 8959 and not shown here.</p>

<h2>Paying both halves, and deducting one</h2>
<p>An employee pays ${h.pct(R.oasdi_employee)} plus ${h.pct(R.hi_employee, 2)} and the employer pays the same again. A sole proprietor is both, which is why the rates double. Two adjustments soften the comparison: the ${h.pct(R.se_net_factor, 2)} factor removes the equivalent of the employer's share from the base, and half of the self-employment tax is deductible when you compute adjusted gross income. That deduction lowers income tax only; your Social Security earnings stay at the full net earnings figure.</p>

<h2>Credits come from net earnings, not from the tax paid</h2>
<p>The SSA counts one credit for each ${h.usd(P.credits.qc_amount)} of covered earnings in 2026, four at most (${h.src('ssaCredits', 'SSA credits page')}). For a self-employed person, covered earnings are the net earnings from self-employment, so a ${h.usd(20000)} profit gives ${h.usd(20000 * R.se_net_factor)} and the full ${creditsFor(20000 * R.se_net_factor)} credits. Credits decide eligibility, 40 for retirement benefits; the amount depends on the earnings themselves. When profit is small or negative, the IRS allows two optional methods on Schedule SE that can still produce credits; the Schedule SE instructions set out who may use them.</p>

<h2>Every deduction has a price in benefits</h2>
<p>The profit you report is also the earnings the SSA writes on your record. The ${h.src('irsTc554', 'IRS')} notes that the SSA uses the information from Schedule SE to compute your benefits. A legitimate business expense lowers income tax, self-employment tax and future Social Security at the same time. The table follows a worker born in 1970 who reports the same profit, in today's money, for exactly 35 years, from 27 to 61.</p>
${h.table(['Yearly net profit', 'Social Security tax per year', 'AIME', 'PIA', 'Monthly at 67'], careerRows, '35-year career from 27 to 61 at a steady rank against the national average wage; amounts in today\'s dollars', ['l', 'r', 'r', 'r', 'r'])}
<p>Reporting ${h.usd(LOW)} instead of ${h.usd(HIGH)} for a whole career saves ${h.usd(taxHigh.total - taxLow.total)} of self-employment tax a year, and lowers the PIA from ${h.usd(pHigh.pia, 2)} to ${h.usd(pLow.pia, 2)}, ${h.usd(pHigh.pia - pLow.pia, 2)} a month for life. A single year matters much less, because the AIME averages 35 years: an extra ${h.usd(10000)} of expenses in ${yr} saves ${h.usd(saved)} of self-employment tax that year and lowers the PIA by ${h.usd(dPia, 2)} a month, because with exactly 35 years of earnings every year counts. Whether the trade is worth it depends on your bracket in the ${h.a('bend-points', 'PIA formula')}, your expected years of retirement and your income tax, which this page does not model.</p>

<h2>Still self-employed after you claim</h2>
<p>Self-employment tax has no age limit. The ${h.src('irsSeTax', 'IRS page on self-employment tax')} confirms that the rules apply at any age, and Topic 554 adds that receiving benefits does not exempt you. Two consequences follow. A good year at 66 or 68 can replace a weaker year among your 35 best and raise your benefit, which the SSA recomputes automatically. And before full retirement age, net earnings from self-employment count toward the ${h.a('earnings-test', 'earnings test')}: ${h.usd(P.earnings_test.lower_annual)} in 2026, with ${h.usd(1)} withheld for every ${h.usd(2)} above it. For the monthly test in the first year, the ${h.src('ssaWorkPub', 'SSA publication on work and benefits')} treats more than ${P.extra.earnings_test_detail.se_hours_not_retired_above} hours a month in the business as generally not retired, and fewer than ${P.extra.earnings_test_detail.se_hours_retired_below} hours as retired.</p>

<h2>Where to go from here</h2>
<p>The cap of ${h.usd(CAP)} and the credit amount of ${h.usd(P.credits.qc_amount)} move every year with average wages; the ${h.a('taxable-maximum', 'taxable maximum page')} shows how the cap evolved. To see what your own Schedule SE history is worth, paste the net earnings of each year into the ${h.a('benefits-calculator', 'benefits calculator')}: it indexes them, keeps the best 35 and applies the formula, exactly as it would for wages.</p>`;
    },
  },
});
