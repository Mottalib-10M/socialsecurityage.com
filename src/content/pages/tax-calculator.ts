import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { taxableBenefits } from '../../lib/engine/ss';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pc = (x: number) => `${Math.round(x * 1000) / 10}%`;
const T = P.taxation;
const SB = 24000, JB = 40000;
const s1 = taxableBenefits(SB, 15000, 'single'), s2 = taxableBenefits(SB, 25000, 'single'), s3 = taxableBenefits(SB, 45000, 'single');
const j1 = taxableBenefits(JB, 30000, 'joint');
const mfs = taxableBenefits(SB, 10000, 'separate_together');
const mfsApart = taxableBenefits(SB, 10000, 'single');
const SD = T.senior_deduction;
const wh = T.withholding_options.map((x) => `${Math.round(x * 100)}%`);

export default definePage({
  id: 'tax-calculator',
  group: 'tools',
  order: 60,
  tool: 'tax',
  related: ['medicare-part-b', 'earnings-test', 'living-abroad', 'average-benefit', 'married-couples'],
  sources: ['irsP915', 'irsSenior', 'ssaWhileWorking', 'frNotice2026'],
  en: {
    slug: 'social-security-tax-calculator',
    nav: 'Tax on benefits',
    card: `Provisional income against ${$(T.base1.single)} and ${$(T.base2.single)} (single) or ${$(T.base1.joint)} and ${$(T.base2.joint)} (joint): up to 85% of your benefits taxable each year.`,
    title: `Social Security Tax Calculator 2026: Taxable Share up to 85%`,
    description: `Social Security tax calculator for 2026: provisional income above ${$(T.base1.single)} single or ${$(T.base1.joint)} joint makes up to 50%, then 85%, of your benefits taxable each year.`,
    h1: 'How much of your Social Security is taxable',
    intro: 'Enter the benefits from your SSA-1099, your other income and your filing status: the tool follows the IRS worksheet line by line.',
    resume: `Federal income tax reaches Social Security benefits through provisional income: your other income, tax-exempt interest included, plus half of your benefits. For a single filer, nothing is taxable while that total stays at or under ${$(T.base1.single)}; up to 50% of benefits becomes taxable above it and up to 85% above ${$(T.base2.single)}. For a married couple filing jointly the two thresholds are ${$(T.base1.joint)} and ${$(T.base2.joint)}. Married filing separately and living together at any time in the year, the threshold is zero. The thresholds are written in section 86 of the Internal Revenue Code and are not indexed to inflation, so more retirees cross them every year. With ${$(SB)} of benefits and ${$(25000)} of other income, a single filer has ${$(s2.provisional)} of provisional income and ${$(s2.taxable)} of taxable benefits, ${pc(s2.share)}. Never more than 85% of benefits is taxable. The extra ${$(SD.amount)} deduction for people ${SD.age} and older (tax years ${SD.years.replace('-', ' to ')}) lowers taxable income, not this share.`,
    faqs: [
      { q: 'Why have the $25,000 and $32,000 thresholds never gone up?', a: `Because the law sets them in dollars and gives no indexing rule. Section 86 of the Internal Revenue Code fixes ${$(T.base1.single)} and ${$(T.base1.joint)} for the 50% tier and ${$(T.base2.single)} and ${$(T.base2.joint)} for the 85% tier, and IRS Publication 915 still uses those amounts. Benefits rise with each cost-of-living adjustment, so the same retiree crosses a threshold sooner each year.` },
      { q: 'Does the new $6,000 deduction for seniors make my benefits tax-free?', a: `No. The deduction of ${$(SD.amount)} per person aged ${SD.age} or more, for tax years ${SD.years.replace('-', ' to ')}, is subtracted from income after the taxable part of your benefits has been computed. It can lower the tax you owe, but the share of benefits on line 6b stays the same. It phases out above ${$(SD.phaseout_single)} of modified AGI (${$(SD.phaseout_joint)} joint), per the IRS.` },
      { q: 'How do I get federal tax withheld from my Social Security checks?', a: `File Form W-4V with the SSA and choose a rate: ${wh.join(', ')} of each monthly payment. Those four rates are the only choices on the form. Without withholding, tax due on benefits can be paid through estimated tax payments during the year, as with any other income.` },
      { q: 'We file separately but live together. Why is most of my benefit taxed?', a: `Because for married filing separately and living together at any time during the year, both thresholds are zero. With ${$(SB)} of benefits and ${$(10000)} of other income, ${$(mfs.taxable)} is taxable, against ${$(mfsApart.taxable)} for a spouse who lived apart all year and uses the ${$(T.base1.single)} threshold.` },
    ],
    body: (h) => {
      const others = [10000, 15000, 20000, 25000, 30000, 40000, 50000, 60000];
      const rows = others.map((o) => { const a = taxableBenefits(SB, o, 'single'), b = taxableBenefits(JB, o, 'joint'); return [h.usd(o), h.usd(a.taxable), h.pct(a.share), h.usd(b.taxable), h.pct(b.share)]; });
      return `
<h2>Provisional income, the number that decides</h2>
<p>The IRS does not tax benefits on their own. It builds a test figure: adjusted gross income without the benefits, plus tax-exempt interest, plus half the benefits. That is Worksheet 1 of ${h.src('irsP915', 'IRS Publication 915')}, which the tool reproduces. Tax-exempt municipal bond interest is not taxed itself, but it counts here and can make benefits taxable. Taxable pensions, IRA withdrawals, wages, interest, dividends and capital gains all count.</p>
${h.table(['Other income', `Single, ${h.usd(SB)} benefits: taxable`, 'Share', `Joint, ${h.usd(JB)} benefits: taxable`, 'Share'], rows, 'Taxable part of benefits for federal income tax, IRS Publication 915 Worksheet 1', ['l', 'r', 'r', 'r', 'r'])}

<h2>Two tiers, then a cap</h2>
<p>Between the first and second threshold, taxable benefits equal half of the provisional income above the first threshold, capped at half the benefits. Above the second threshold, 85% of the excess is added to a fixed amount from the first tier. The result can never exceed 85% of benefits, which is why the share in the table stops at ${h.pct(T.rate2)} however high the other income. A single filer with ${h.usd(SB)} of benefits reaches that ceiling at ${h.usd(45000)} of other income: ${h.usd(s3.taxable)} taxable. With ${h.usd(15000)} only, the first tier applies and ${h.usd(s1.taxable)} is taxable.</p>
<p>The taxable amount is not a tax. It is added to your other income and taxed at your marginal rate. A couple filing jointly with ${h.usd(JB)} of benefits and ${h.usd(30000)} of other income reports ${h.usd(j1.taxable)} of taxable benefits on line 6b of Form 1040.</p>

<h2>Thresholds that never move</h2>
<p>The ${h.usd(T.base1.single)} and ${h.usd(T.base1.joint)} amounts of the first tier and the ${h.usd(T.base2.single)} and ${h.usd(T.base2.joint)} amounts of the second are written as fixed dollars in section 86 of the Internal Revenue Code, with no indexing clause, and Publication 915 repeats them unchanged. Benefits, meanwhile, rise every January with the cost-of-living adjustment, ${P.cola_2026.pct}% for 2026 (${h.src('frNotice2026', 'SSA notice')}). The effect is a slow increase in the share of retirees who pay tax on part of their benefits.</p>

<h2>The senior deduction does not change the taxable share</h2>
<p>For tax years ${SD.years.replace('-', ' through ')}, people ${SD.age} or older by the end of the year can deduct an extra ${h.usd(SD.amount)}, or ${h.usd(SD.amount * 2)} for a couple filing jointly when both qualify, as described by the ${h.src('irsSenior', 'IRS')}. Married people must file jointly to claim it, and it phases out above ${h.usd(SD.phaseout_single)} of modified AGI (${h.usd(SD.phaseout_joint)} joint). It reduces taxable income after the worksheet above, so the taxable part of your benefits is the same with or without it; only the tax computed on the total can fall.</p>

<h2>Other situations</h2>
<p>Nonresident aliens are taxed differently: ${h.pct(T.nonresident_share)} of benefits is taxed at ${h.pct(T.nonresident_rate, 0)}, unless a tax treaty exempts or reduces it, which is the case for residents of Canada, Egypt, Germany, Ireland, Israel, Italy, Japan, Romania and the United Kingdom. See ${h.a('living-abroad', 'Social Security abroad')}. The ${h.a('medicare-part-b', 'Part B page')} covers the ${h.usd(P.medicare.part_b_2026, 2)} monthly premium, a separate question from income tax. State income taxes follow their own rules and are not computed here. Working while collecting raises provisional income and may also trigger the ${h.a('earnings-test', 'earnings test')}.</p>`;
    },
  },
});
