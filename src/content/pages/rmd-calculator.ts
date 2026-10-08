import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { ownerRmd, uniformDivisor, rmdExcise, federalTax } from '../../lib/engine/accounts';

const R = P.extra.rmd as { excise: number; excise_corrected: number; correction_years: number };
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pc = (x: number) => `${Math.round(x * 1000) / 10}%`;
const BAL = 500000;
const at73 = ownerRmd(BAL, 73, 1953);
const at75 = ownerRmd(BAL, 75, 1960);
const d73 = uniformDivisor(73) as number, d80 = uniformDivisor(80) as number, d90 = uniformDivisor(90) as number;
// First-year trap: born 1953, 73 in 2026, delays to April 1, 2027, then the 2027 RMD in the same year.
const first = at73.amount;
const second = ((BAL - first) * 1.05) / (uniformDivisor(74) as number);
const otherIncome = 60000;
const stackTwo = federalTax(otherIncome + first + second, 0) - federalTax(otherIncome, 0);
const spread = 2 * (federalTax(otherIncome + first, 0) - federalTax(otherIncome, 0));

export default definePage({
  id: 'rmd-calculator',
  group: 'retirement',
  order: 20,
  fold: true,
  mini: 'rmdOwner',
  miniHref: 'inherited-ira',
  related: ['inherited-ira', 'roth-conversion', 'irmaa', 'tax-calculator', 'working-after-fra'],
  sources: ['cfr1_401a9_9', 'irsRmdFaq', 'frRmd2024', 'frRmd1959', 'irsP590b', 'irsP590a', 'irsSenior'],
  en: {
    slug: 'rmd-calculator',
    nav: 'RMD calculator',
    card: `Balance on December 31 divided by the IRS divisor: ${d73} at 73, so about ${pc(1 / d73)} of the account, rising every year after.`,
    title: 'RMD 2026: Required Minimum Distribution at Age 73 or 75',
    description: `RMD 2026: divide the December 31, 2025 balance by the IRS Uniform Lifetime Table: ${d73} at 73. First RMD at 73, or 75 if born in 1960 or later; 25% if missed.`,
    h1: 'RMD calculator: your 2026 required minimum distribution',
    intro: 'Give the balance of December 31, 2025 and your year of birth: the calculator applies the IRS table, tells you whether a withdrawal is due in 2026 and by which date.',
    resume: `A required minimum distribution is the account balance on December 31 of the previous year divided by the factor of the IRS Uniform Lifetime Table for the age you reach this year: ${d73} at 73, ${uniformDivisor(75)} at 75, ${d80} at 80, ${d90} at 90. On ${$(BAL)}, the 2026 RMD at 73 is ${$(at73.amount)}. Traditional IRAs, SEP and SIMPLE IRAs, 401(k), 403(b) and 457(b) plans are concerned; Roth IRAs are not, during the owner's life. The first RMD is due for the year you turn 73 if you were born from 1951 to 1959, and 75 if you were born in 1960 or later; that first one can wait until April 1 of the next year, all later ones are due by December 31. Missing all or part of it costs an excise tax of ${pc(R.excise)} of the shortfall, cut to ${pc(R.excise_corrected)} when the withdrawal is made within the correction window, and the IRS can waive it for a reasonable error fixed promptly.`,
    faqs: [
      { q: 'Can I take my RMD from just one of my IRAs?', a: `Yes, for IRAs. You compute the RMD of each traditional IRA separately, add them up, and may withdraw the total from any one or several of them (IRS Publication 590-B). The same pooling works among 403(b) accounts. It does not work between types: a 401(k) RMD must come out of that 401(k), and an IRA withdrawal never satisfies a 401(k) requirement.` },
      { q: 'Do I have to take an RMD if I am still working at 73?', a: `From your current employer's 401(k) or 403(b), usually not: most plans let an employee who owns 5% or less of the company wait until April 1 after the year of retirement. The exception never covers IRAs, including SEP and SIMPLE IRAs, nor plans of former employers. Those RMDs start at 73 or 75 whatever your work status.` },
      { q: 'Is the RMD based on today\'s balance or last year\'s?', a: `On the balance at the close of December 31 of the year before. The 2026 RMD uses the value of December 31, 2025, even if the market fell 20% since. A rollover or transfer still in transit on that date is added back to the receiving account's balance under the regulations, so moving money in late December does not shrink the number.` },
      { q: 'Can I put my RMD into a Roth IRA?', a: `No. A required minimum distribution cannot be rolled over or converted (IRS Publication 590-A). In a year when you plan a Roth conversion, the first dollars out of the IRA are treated as the RMD until it is satisfied; only the amount above it can be converted. Take the RMD first, then convert.` },
      { q: 'Do Roth 401(k) accounts still have required distributions?', a: `Not any more. Since 2024, designated Roth accounts in 401(k) and 403(b) plans follow the Roth IRA rule: nothing is required while the owner is alive, as the IRS RMD FAQ confirms. Heirs of a Roth account still face the post-death rules, including the 10-year deadline, but owners no longer need to roll a Roth 401(k) into a Roth IRA just to escape RMDs.` },
      { q: 'What if my wife is more than 10 years younger than me?', a: `If she is the sole beneficiary of the account for the whole year and more than 10 years younger, you use the Joint and Last Survivor Table instead of the Uniform Lifetime Table. Its divisor is larger, so the RMD is smaller. At 75 with a 60-year-old wife the factor is 28.3 instead of ${uniformDivisor(75)}. This calculator applies the uniform table only.` },
    ],
    body: (h) => {
      const ages = [72, 73, 74, 75, 76, 77, 78, 79, 80, 82, 85, 88, 90, 95, 100];
      const rows = ages.map((a) => { const d = uniformDivisor(a) as number; return [String(a), h.num(d, 1), h.pct(1 / d, 2), h.usd(100000 / d)]; });
      const years = [1950, 1951, 1955, 1959, 1960, 1962, 1965].map((y) => { const s = y >= 1960 ? 75 : y >= 1951 ? 73 : 72; return [String(y), String(s), String(y + s), `April 1, ${y + s + 1}`]; });
      return `
<h2>The Uniform Lifetime Table, age by age</h2>
<p>Since 2022 the IRS has used the life tables of ${h.src('cfr1_401a9_9', '26 CFR 1.401(a)(9)-9')}, which give longer divisors than the old ones, so the required share of the account is smaller at every age. The share climbs slowly through the seventies and steeply after 85. Its purpose is to empty the account over a joint lifetime, not to force the money out quickly.</p>
${h.table(['Age in the year', 'Divisor', 'Share of the balance', 'RMD per $100,000'], rows, 'Uniform Lifetime Table, distribution years from 2022', ['l', 'r', 'r', 'r'])}

<h2>73 or 75: what your birth year decides</h2>
<p>The SECURE 2.0 Act of 2022 raised the starting age twice. The final regulations of July 2024 (${h.src('frRmd2024', 'Treasury Decision 10001')}) set it at 73 for people born from 1951 through 1958 and 75 for those born on or after January 1, 1960. The law's text, read literally, put people born in 1959 in both groups; the ${h.src('frRmd1959', 'proposed regulations published the same day')} settle it at 73, and the calculator follows them.</p>
${h.table(['Born in', 'RMD age', 'First RMD year', 'Latest date for it'], years, 'First required distribution by year of birth', ['l', 'r', 'r', 'r'])}
<p>Someone born in 1950 reached 72 in 2022, before the change took effect, and has been taking RMDs since. A person born in 1962 has until 2037 for the first one, which leaves eleven years from 64 for planned withdrawals or conversions in lower brackets.</p>

<h2>The April 1 option and its trap</h2>
<p>Only the first RMD may wait until April 1 of the following year. Waiting means two RMDs in the same calendar year: the delayed one and the regular one for that year, due by December 31. For a single retiree born in 1953 with ${h.usd(BAL)} at the end of 2025 and ${h.usd(otherIncome)} of other taxable income, the 2026 RMD is ${h.usd(first)}. Delayed into 2027 and stacked with a 2027 RMD of about ${h.usd(second)} (at 5% growth), the two cost ${h.usd(stackTwo)} of federal income tax in 2027, against about ${h.usd(spread)} if each lands in its own year. The bunched year can also push income over an ${h.a('irmaa', 'IRMAA threshold')} two years later.</p>
<p>The delay still helps in one case: a year in which income is unusually high, such as a final salary year at 73. Otherwise taking the first RMD in its own year is the cheaper choice.</p>
<!--mini:rmdPath-->
<h2>Which accounts, which balances</h2>
<p>Each account has its own RMD, computed on its own December 31 balance. The aggregation rules then decide where the money can come from: all traditional IRAs, SEP and SIMPLE IRAs form one pool, all 403(b) contracts another, and every 401(k) or 457(b) plan stands alone (${h.src('irsP590b', 'IRS Publication 590-B')}). An inherited IRA never pools with your own accounts; it follows the rules on the ${h.a('inherited-ira', 'inherited IRA page')}. Roth IRAs need nothing during your lifetime, and since 2024 neither do Roth 401(k) or Roth 403(b) accounts, according to the ${h.src('irsRmdFaq', 'IRS RMD questions and answers')}.</p>
<p>Withholding is allowed on any RMD and counts as paid in evenly through the year, which makes a single December withdrawal with heavy withholding a simple way to cover estimated taxes.</p>

<h2>Missing an RMD: 25%, 10% or nothing</h2>
<p>The excise tax of section 4974, reported on Form 5329, is ${h.pct(R.excise, 0)} of the amount not withdrawn. If the shortfall is taken out and a corrected return filed within the correction window, generally ${R.correction_years} years, it falls to ${h.pct(R.excise_corrected, 0)}. On a missed ${h.usd(at73.amount)} RMD that is ${h.usd(rmdExcise(at73.amount, false))} or ${h.usd(rmdExcise(at73.amount, true))}. The IRS can also waive it entirely when the shortfall came from a reasonable error and steps are being taken to fix it: you withdraw the amount, attach a statement to Form 5329 and enter the waiver request on the form. Before 2023 the penalty was 50%.</p>

<h2>What an RMD does to the rest of your taxes</h2>
<p>An RMD is ordinary income. It adds to the provisional income that decides how much of Social Security is taxed, up to 85% of benefits, which the ${h.a('tax-calculator', 'benefit tax calculator')} shows on your own figures. It raises the modified adjusted gross income that sets Medicare premiums two years later. And it can push income into the phase-out range of the temporary senior deduction of ${h.usd(P.taxation.senior_deduction.amount)} for people 65 and older, which shrinks once MAGI passes ${h.usd(P.taxation.senior_deduction.phaseout_single)} single or ${h.usd(P.taxation.senior_deduction.phaseout_joint)} joint (${h.src('irsSenior', 'IRS')}).</p>
<p>Two moves reduce the effect. A qualified charitable distribution, sent directly from the IRA to a charity from age 70 and a half, counts toward the RMD and is excluded from income. And the years before the RMD age are often the low-income window for ${h.a('roth-conversion', 'partial Roth conversions')}, which shrink the balance the divisor will later apply to.</p>

<h2>Limits of the calculator</h2>
<p>It applies the Uniform Lifetime Table to a single account balance. It does not use the Joint and Last Survivor Table for a much younger spouse, does not compute annuity payouts from a defined benefit plan, which follow their own schedule, and treats the RMD age by year of birth without the still-working exception. Balances projected forward assume a constant return, which no account delivers.</p>`;
    },
  },
});
