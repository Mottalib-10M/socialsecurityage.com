import { definePage } from '../../lib/page-types';
import { P, awi, taxableMax } from '../../lib/engine/params';
import { employeePayroll, selfEmploymentTax, computePia, projectCareer } from '../../lib/engine/ss';

const rt = (x: number) => `${(x * 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`;
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const T = P.taxable_max_2026, T25 = taxableMax(2025);
const K = P.extra.cbb_calc;
const raw = K.base_1994 * awi(2024) / awi(1992);
const maxTax = employeePayroll(T).oasdi;
const flat = Object.keys(P.series.taxable_max).map(Number).filter((y) => y > 1975 && taxableMax(y) === taxableMax(y - 1));
const MB = P.max_benefit_2026;

export default definePage({
  id: 'taxable-maximum',
  group: 'formula',
  order: 60,
  mini: 'payrollCap',
  miniHref: 'tax-calculator',
  related: ['maximum-benefit', 'average-wage-index', 'aime', 'self-employed', 'salary-150000'],
  sources: ['frNotice2026', 'ssaCbb', 'irsTc554', 'irsP505', 'ssaMaxExample'],
  en: {
    slug: 'social-security-taxable-maximum',
    nav: 'Taxable maximum 2026',
    card: `${$(T)} in 2026: the pay ceiling for both the ${rt(P.payroll.oasdi_employee)} tax and the benefit formula, ${$(maxTax)} of tax at most per worker.`,
    title: `Social Security Taxable Maximum 2026: ${$(T)} Wage Base`,
    description: `The 2026 Social Security wage base is ${$(T)}, up from ${$(T25)}: ${rt(P.payroll.oasdi_employee)} tax stops at ${$(maxTax)} per worker; pay above it adds nothing to benefits. Formula, table.`,
    h1: `The ${$(T)} taxable maximum: where Social Security stops counting your pay`,
    intro: 'One ceiling works in both directions: it limits the tax you pay and the earnings that build your benefit.',
    resume: `The Social Security taxable maximum, officially the contribution and benefit base, is ${$(T)} for wages paid in 2026 and for self-employment income of tax years beginning in 2026, up from ${$(T25)} in 2025. The SSA sets it by multiplying the 1994 base of ${$(K.base_1994)} by the ratio of the 2024 national average wage index (${$(awi(2024), 2)}) to the 1992 index (${$(awi(1992), 2)}), which gives ${$(raw, 2)}, rounded to the nearest multiple of $${K.rounding}. Employees pay ${rt(P.payroll.oasdi_employee)} up to that amount, at most ${$(maxTax, 2)} in 2026, and their employer pays the same; self-employed workers pay ${rt(P.payroll.oasdi_self_employed)} on net earnings up to the base. Medicare tax has no ceiling. The same limit applies on the benefit side: earnings above the base never enter your record, which is why the largest possible benefit at 70 in 2026 is ${$(MB.age70)} a month even for very high earners.`,
    faqs: [
      { q: 'Do I get a refund if I paid Social Security tax above the maximum?', a: `If two or more employers together withheld ${rt(P.payroll.oasdi_employee)} on more than ${$(T)} in 2026, the excess employee tax counts as tax paid when you file your return (IRS Publication 505). The employer share is not part of that credit. Box 4 of each W-2 shows the tax withheld.` },
      { q: 'Does the taxable maximum apply to Medicare tax?', a: `No. The ${rt(P.payroll.hi_employee)} Medicare tax for employees, and ${rt(P.payroll.hi_self_employed)} for the self-employed, applies to all wages and net self-employment earnings, with no cap at all, however high the pay. Only the ${rt(P.payroll.oasdi_employee)} Social Security part, or ${rt(P.payroll.oasdi_self_employed)} for the self-employed, stops at ${$(T)}.` },
      { q: 'If I earn far above the maximum, does Social Security see my full salary?', a: `No. Your earnings record shows at most the base of each year. A salary of ${$(500000)} in 2026 enters the record as ${$(T)}, exactly like a salary of ${$(T)}. That is how the SSA's maximum-earner examples are built: earnings "at or above" the base every year.` },
      { q: 'Can the taxable maximum go down?', a: `No. The base for the next year is the larger of the formula result and the current base, so a fall in average wages leaves it unchanged rather than lowering it. In the series since 1975 it stayed flat in ${flat.join(', ').replace(/, ([^,]+)$/, ' and $1')}.` },
      { q: 'How much Social Security tax does a self-employed person pay at the maximum?', a: `The ${rt(P.payroll.oasdi_self_employed)} applies to net earnings from self-employment, which are ${rt(P.payroll.se_net_factor)} of net profit, up to ${$(T)}. That ceiling is reached with a net profit of about ${$(Math.ceil(T / P.payroll.se_net_factor))}, and the Social Security part of the tax is then ${$(selfEmploymentTax(T / P.payroll.se_net_factor).oasdi, 2)}. Half of the self-employment tax is deductible when figuring adjusted gross income (IRS Topic 554).` },
    ],
    body: (h) => {
      const years = [1990, 1995, 2000, 2005, 2010, 2015, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
      const rows = years.map((y) => [String(y), h.usd(taxableMax(y)), h.usd(taxableMax(y) * P.payroll.oasdi_employee, 2), y > 1990 ? h.pct(taxableMax(y) / taxableMax(y - 1) - 1) : '']);
      const wages = [100000, 184500, 250000, 400000].map((w) => { const r = employeePayroll(w); return [h.usd(w), h.usd(r.oasdi, 2), h.usd(r.hi, 2), h.pct(r.oasdi / w, 2)]; });
      const b = { y: 1964, m: 6, d: 15 };
      const capped = computePia(b, projectCareer(b, T, 22, 62)), above = computePia(b, projectCareer(b, 2 * T, 22, 62));
      return `
<h2>The 2026 figure, rebuilt</h2>
<p>Section 230(b) of the Social Security Act ties the base to wages. The ${h.src('frNotice2026', 'notice of November 3, 2025')} applies it in three lines:</p>
<ol>
<li>${h.usd(K.base_1994)} × ${h.usd(awi(2024), 2)} ÷ ${h.usd(awi(1992), 2)} = ${h.usd(raw, 2)}.</li>
<li>Rounded to the nearest multiple of $${K.rounding}: ${h.usd(T)}.</li>
<li>${h.usd(T)} is larger than the current base, ${h.usd(T25)}, so it becomes the 2026 base.</li>
</ol>
<p>The 1994 base and the 1992 index are the fixed reference: the base for any year equals the 1994 base scaled by how much average wages grew between 1992 and two years before that year, unless the current base is already higher. The rise from 2025 is ${h.pct(T / T25 - 1)}, in line with the growth of the wage index between 2023 and 2024.</p>

<h2>The ceiling on the tax side</h2>
${h.table(['Wages in 2026', `Social Security tax (${rt(P.payroll.oasdi_employee)})`, `Medicare tax (${rt(P.payroll.hi_employee)})`, 'Effective Social Security rate'], wages, 'Employee share, 2026; additional Medicare tax not included', ['r', 'r', 'r', 'r'])}
<p>Up to ${h.usd(T)} the employee rate is a flat ${rt(P.payroll.oasdi_employee)}; above it, the Social Security tax stays at ${h.usd(maxTax, 2)}, so its share of pay falls as pay rises. Employers pay a matching ${h.usd(maxTax, 2)} at most per employee. For self-employed people the ${h.src('irsTc554', 'IRS rule')} is ${rt(P.payroll.oasdi_self_employed)} on ${rt(P.payroll.se_net_factor)} of net profit up to the base, plus ${rt(P.payroll.hi_self_employed)} on all of it; the ${h.a('self-employed', 'self-employed page')} runs the numbers.</p>
<p>Several jobs in one year: each employer withholds up to the base on its own payroll, so total withholding can exceed ${h.usd(maxTax, 2)}. The ${h.src('irsP505', 'IRS')} treats the excess employee tax as a payment on your return when the wages from two or more employers exceed ${h.usd(T)}.</p>

<h2>The ceiling on the benefit side</h2>
<p>Earnings above the base are not posted to your Social Security record. Each year's line is capped, then indexed, then averaged into the ${h.a('aime', 'AIME')}. Two careers born in 1964, one at exactly the base every year and one at twice the base, end with the same record and the same benefit:</p>
<ul>
<li>At the base: AIME ${h.usd(capped.aime)}, PIA ${h.usd(capped.pia, 2)}.</li>
<li>At twice the base: AIME ${h.usd(above.aime)}, PIA ${h.usd(above.pia, 2)}.</li>
</ul>
<p>Combined with the 15% bracket above the second bend point, the cap explains the ${h.src('ssaMaxExample', 'SSA\'s maximum-benefit table')} for 2026: ${h.usd(MB.age62)} at 62, ${h.usd(MB.age67)} at 67 and ${h.usd(MB.age70)} at 70 for someone with maximum earnings every year since 22. The ${h.a('maximum-benefit', 'maximum benefit page')} explains why few people get there.</p>

<h2>Thirty-six years of the base</h2>
${h.table(['Year', 'Taxable maximum', 'Maximum employee tax', 'Change vs prior year'], rows, `Contribution and benefit base and the ${rt(P.payroll.oasdi_employee)} employee tax at that level`, ['l', 'r', 'r', 'r'])}
<p>The series, kept by the ${h.src('ssaCbb', 'SSA actuaries')}, shows long steady rises with a few pauses. The base did not move in ${flat.filter((y) => y > 2000).join(', ').replace(/, ([^,]+)$/, ' and $1')}: those were the years after a December without a COLA (December 2009, 2010 and 2015). The four increases from 2023 to 2026 were all above 4%, following strong wage growth after 2021.</p>

<h2>The base against the average wage</h2>
<p>Dividing each year's base by that year's national average wage index shows how far up the pay scale Social Security reaches. In 1951 the base was ${h.num(taxableMax(1951) / awi(1951), 2)} times the average wage; by 1980 it was ${h.num(taxableMax(1980) / awi(1980), 2)} times; in 2024 it was ${h.num(taxableMax(2024) / awi(2024), 2)} times. Since the mid-1980s the ratio has stayed in a narrow band, between ${h.num(Math.min(...[1985, 1990, 2000, 2010, 2020, 2024].map((y) => taxableMax(y) / awi(y))), 2)} and ${h.num(Math.max(...[1985, 1990, 2000, 2010, 2020, 2024].map((y) => taxableMax(y) / awi(y))), 2)} in the years sampled here, because the base now follows the wage index.</p>
${h.table(['Year', 'Taxable maximum', 'Average wage index', 'Base ÷ average wage'], [1951, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2024].map((y) => [String(y), h.usd(taxableMax(y)), h.usd(awi(y), 2), h.num(taxableMax(y) / awi(y), 2)]), 'How many average wages the base represents', ['l', 'r', 'r', 'r'])}
<p>A worker paid exactly the average wage every year has a record with no year capped. A worker paid three times the average has every year capped since the 1980s, and the same record as anyone else at the base.</p>

<h2>Is earning above the base a loss?</h2>
<p>For benefits, pay above ${h.usd(T)} brings nothing, but it costs nothing in Social Security tax either. The ${rt(P.payroll.oasdi_employee)} you pay on pay up to the base buys benefit at a rate that falls through the 90%, 32% and 15% brackets of the formula, and the base is where the counting stops. Medicare tax, by contrast, applies to every dollar and does not raise any cash benefit. Our ${h.a('salary-150000', '$150,000 salary page')} shows a career close to the base.</p>`;
    },
  },
});
