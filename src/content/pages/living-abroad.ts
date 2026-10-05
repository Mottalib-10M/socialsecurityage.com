import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { taxableBenefits } from '../../lib/engine/ss';

const T = P.taxation, A = P.extra.abroad;
const NR = T.nonresident_share * T.nonresident_rate;
const BEN = 1800;
const nrTax = BEN * NR, swiss = BEN * A.switzerland_treaty_rate;
const citizen = taxableBenefits(BEN * 12, 20000, 'single');
const the = (s: string) => (/^(United|Czech|Slovak|Netherlands|Philippines)/.test(s) ? `the ${s}` : s);
const list = (xs: string[]) => xs.slice(0, -1).map(the).join(', ') + ' and ' + the(xs[xs.length - 1]);
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pc = (x: number) => `${(x * 100).toFixed(1).replace(/\.0$/, '')}%`;

export default definePage({
  id: 'living-abroad',
  group: 'taxwork',
  order: 40,
  mini: 'abroadNonresidentTax',
  miniHref: 'tax-calculator',
  related: ['tax-calculator', 'earnings-test', 'medicare-part-b', 'payment-schedule', 'ssfa'],
  sources: ['irsP915', 'ssaAbroadPub', 'ssaPaymentsAbroad', 'ssaWhileWorking'],
  en: {
    slug: 'social-security-living-abroad',
    nav: 'Living abroad',
    card: `${pc(NR)} withheld for most noncitizens abroad, nothing for residents of nine treaty countries, ordinary US rules for citizens: retiring overseas in 2026.`,
    title: `Social Security Living Abroad 2026: ${pc(NR)} Tax, Payment Rules`,
    description: `Social Security abroad 2026: noncitizens lose ${pc(NR)} to US tax (30% of 85%) unless a treaty helps; citizens taxed as at home. Six-month rule, lists, work test.`,
    h1: 'Collecting Social Security while living outside the United States',
    intro: 'Moving abroad does not end your benefit, but citizenship decides whether it keeps coming and how much tax the SSA keeps back.',
    resume: `Social Security keeps paying most retirees who move abroad, in US dollars and without adjustment for exchange rates, but the rules split by citizenship. A US citizen can be paid in any country where the SSA can send payments, and remains subject to US income tax on up to 85% of benefits under the same thresholds as at home. A noncitizen who is not a green card holder has ${pc(T.nonresident_rate)} withheld from ${pc(T.nonresident_share)} of each payment, an effective ${pc(NR)}, unless a tax treaty applies: residents of ${list(A.treaty_exempt)} pay no US tax on their benefits, and residents of Switzerland are taxed at ${pc(A.switzerland_treaty_rate)} of the whole benefit. On a ${$(BEN)} monthly benefit, that is ${$(nrTax)} withheld under the standard rule and ${$(swiss)} in Switzerland. Noncitizens also need a qualifying condition, such as citizenship of a listed country, to keep receiving payments after six full calendar months outside the United States (SSA publication 05-10137, April 2026).`,
    faqs: [
      { q: 'I am an American citizen retiring to Portugal. Will the SSA withhold 30% of my check?', a: `No. The ${pc(T.nonresident_rate)} withholding applies to nonresident aliens. IRS Publication 915 states that the SSA will not withhold US tax from your benefits if you are a US citizen. You file a US return as you would at home, and up to 85% of your benefits can be taxable depending on your other income. Portugal may tax them too; the SSA suggests asking the country's embassy.` },
      { q: 'Which countries exempt Social Security from the 30% nonresident tax?', a: `Residents of ${list(A.treaty_exempt)} are exempt under tax treaties, according to the SSA and IRS Publication 915; for Italy, the IRS adds that you must also be an Italian citizen. Residents of Switzerland are taxed at ${pc(A.switzerland_treaty_rate)} of the total benefit. Under the treaty with India, benefits for US government service are exempt for people who are both residents and nationals of India.` },
      { q: 'I have a green card and moved back to my home country. Why was 25.5% taken from my benefit?', a: `Possibly by mistake. Publication 915 says lawful permanent residents are treated as resident aliens for tax until that status is taken away or abandoned, and their benefits are not subject to the 30% withholding. If tax was withheld because of a foreign address, the SSA refunds it when it can do so in the same calendar year; otherwise the refund is claimed from the IRS.` },
      { q: 'How long can a noncitizen stay outside the United States before payments stop?', a: `Six full calendar months, unless an exception applies. Absence starts counting after ${A.outside_days_in_row} days in a row abroad; payments stop after six full calendar months outside and resume only after a full calendar month back in the United States, present from the first minute to the last. Citizens of many countries, listed by the SSA, are exempt from this rule.` },
      { q: 'Does the earnings test still apply if I work abroad before full retirement age?', a: `Yes, in one of two forms. If your foreign work is not subject to US Social Security tax, the foreign work test withholds your benefit for each month you work more than ${A.foreign_work_test_hours} hours outside the United States, whatever you earn. If the work is covered by US Social Security, the ordinary annual test applies, with the ${$(P.earnings_test.lower_annual)} limit of 2026.` },
    ],
    body: (h) => {
      const rows = [1000, BEN, 2500, 3500].map((b) => [h.usd(b), h.usd(b * NR, 2), h.usd(b * A.switzerland_treaty_rate, 2), h.usd(0), h.usd(b - b * NR, 2)]);
      const incomes = [0, 20000, 40000].map((o) => { const r = taxableBenefits(BEN * 12, o, 'single'); return [h.usd(o), h.usd(r.provisional), h.usd(r.taxable), h.pct(r.share)]; });
      return `
<h2>Citizens and noncitizens are taxed differently</h2>
<p>The first question for anyone collecting abroad is citizenship, not country. A US citizen, or a lawful permanent resident, is taxed by the United States on worldwide income wherever they live, and Social Security benefits follow the usual rule: up to 85% can be taxable depending on other income (${h.src('irsP915', 'IRS Publication 915')}). The SSA does not withhold anything automatically; you can ask for voluntary withholding, and you file a return.</p>
<p>A nonresident alien is taxed at source. The SSA withholds ${h.pct(T.nonresident_rate)} of ${h.pct(T.nonresident_share)} of each payment, which comes to ${h.pct(NR)} of the benefit, and reports it on Form SSA-1042S at the end of the year. Tax treaties change that for residents of a few countries.</p>
${h.table(['Monthly benefit', 'Standard 25.5%', 'Switzerland 15%', 'Treaty-exempt countries', 'Deposit, standard case'], rows, 'Nonresident alien withholding, 2026; before any Medicare premium', ['l', 'r', 'r', 'r', 'r'])}
<p>The treaty-exempt list in the ${h.src('ssaAbroadPub', 'SSA publication 05-10137')} is ${list(A.treaty_exempt)}; the United Kingdom means England, Scotland, Wales and Northern Ireland. Publication 915 adds that an Italian resident must also be an Italian citizen to benefit. Under the treaty with India, benefits based on US federal, state or local government employment are exempt for people who are both residents and nationals of India. The SSA's Alien Tax Screening Tool checks a specific case.</p>

<h2>A US citizen abroad: same thresholds as at home</h2>
<p>Living in Lisbon or Mexico City changes nothing in the formula of Publication 915. Half of the benefits plus other income, including tax-exempt interest, is compared with ${h.usd(T.base1.single)} and ${h.usd(T.base2.single)} for a single filer. With ${h.usd(BEN)} a month, ${h.usd(BEN * 12)} a year:</p>
${h.table(['Other income', 'Provisional income', 'Taxable benefits', 'Share taxable'], incomes, `Single filer, ${h.usd(BEN * 12)} of benefits a year`, ['l', 'r', 'r', 'r'])}
<p>At ${h.usd(20000)} of other income, ${h.usd(citizen.taxable)} of the benefits is taxable. The country you live in may tax the same benefit; the SSA's publication points out that many foreign governments do and suggests asking that country's embassy in Washington before you move.</p>

<h2>Will the payments keep coming? The rules for noncitizens</h2>
<p>For US citizens, the ${h.src('ssaPaymentsAbroad', 'SSA')} continues payments in any country where it can send them. Noncitizens must meet one of the conditions listed in publication 05-10137, or payments stop after six full calendar months outside the United States. "Outside" means away from the 50 states, the District of Columbia, Puerto Rico, the US Virgin Islands, Guam, the Northern Mariana Islands and American Samoa for at least ${A.outside_days_in_row} days in a row. Once payments stop, they restart only after a full calendar month in the United States.</p>
<ul>
<li><strong>Citizens of ${A.citizen_countries_all_benefits.length} countries</strong> keep all types of benefits abroad, among them ${list(A.citizen_countries_all_benefits.slice(0, 8))}.</li>
<li><strong>Citizens of a second group</strong>, which includes Mexico, the Philippines and Australia, keep benefits based on their own earnings; dependents and survivors must also meet residency conditions.</li>
<li><strong>Citizens of a third group</strong>, which includes China, India and Morocco, keep benefits if the worker earned at least ${A.list5_credits} credits or lived ${A.list5_years_in_us} years in the United States.</li>
<li><strong>Residents of a country with a Social Security agreement</strong> keep their benefits, with special limits for residents of Austria, Belgium, Denmark, Germany, Sweden and Switzerland.</li>
</ul>
<p>Dependents and survivors who are not US citizens may need to show ${A.dependent_residency_years} years of residence in the United States in the family relationship, unless an exception applies. The SSA's Payments Abroad Screening Tool walks through these conditions for one person.</p>

<h2>Where payments cannot go</h2>
<p>The Treasury prohibits payments to people living in ${list(A.treasury_blocked)}. A US citizen there receives the withheld payments after moving to a country where payment is possible; a noncitizen loses the payments for the months spent there. The SSA generally cannot send payments to ${list(A.ssa_restricted)}, with exceptions under restricted conditions. Elsewhere, the SSA can deposit into a US bank account from any country or, in countries with an international direct deposit agreement, into a local account.</p>

<h2>Work before full retirement age</h2>
<p>The ${h.src('ssaWhileWorking', 'SSA earnings test')} follows you abroad, in two versions. If your foreign job is not subject to US Social Security tax, including when an international agreement exempts you, the foreign work test withholds the benefit for every month with more than ${A.foreign_work_test_hours} hours of work, regardless of pay; owning a business counts even without working in it. If your work abroad is covered by US Social Security, the ordinary annual test applies: ${h.usd(P.earnings_test.lower_annual)} in 2026, ${h.usd(1)} withheld per ${h.usd(2)} above it. Dependents on the record lose their payments for the same months. From full retirement age on, neither test applies. The ${h.a('earnings-test', 'earnings limit page')} details the US version.</p>

<h2>Reporting and questionnaires</h2>
<p>The SSA sends questionnaires to beneficiaries abroad every year or every two years, depending on age, payee status, the type of benefit and the country; failing to return one stops payments. Changes of address, work, marriage, divorce and similar events must be reported to the SSA or the Federal Benefits Unit. The benefit itself is computed in dollars and does not rise or fall with exchange rates.</p>
<p>Medicare is a separate decision. It generally does not pay for care outside the United States, so some people abroad hold off on Part B, at the price of a premium ${Math.round(A.medicare_late_penalty_per_12_months * 100)}% higher for each 12-month period they could have been enrolled. The ${h.a('medicare-part-b', 'Medicare premium page')} shows the 2026 amounts.</p>`;
    },
  },
});
