import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { earningsTest, benefitAtAge, fraRetirement } from '../../lib/engine/ss';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const T = P.earnings_test;
const X = P.extra.earnings_test_detail;
const pub = earningsTest(X.pub_example_benefit, X.pub_example_earnings, 'before');
const B = 1800, PAY = 40000;
const a = earningsTest(B, PAY, 'before');
const FB = 2500, FPAY = 80000, FMONTHS = 8;
const f = earningsTest(FB, FPAY, 'fraYear', FMONTHS);
const FRA = fraRetirement(1964).total, PIA = 2000, S62 = 62 * 12 + 1;
const start = benefitAtAge(PIA, S62, FRA), redo = benefitAtAge(PIA, S62 + 12, FRA);

export default definePage({
  id: 'earnings-test',
  group: 'tools',
  order: 70,
  tool: 'earnings',
  related: ['working-after-fra', 'claiming-at-62', 'when-to-claim', 'self-employed', 'tax-calculator'],
  sources: ['ssaWhileWorking', 'ssaWorkPub', 'cfr404_435', 'cfr404_415', 'frNotice2026'],
  en: {
    slug: 'social-security-earnings-limit',
    nav: 'Earnings limit',
    card: `${$(T.lower_annual)} under full retirement age, ${$(T.higher_annual)} in the year you reach it: what is withheld, and when it comes back.`,
    title: `Social Security Earnings Limit 2026: ${$(T.lower_annual)} and ${$(T.higher_annual)}`,
    description: `Social Security earnings limit 2026: ${$(T.lower_annual)} under full retirement age ($1 withheld per $2 above), ${$(T.higher_annual)} in the year you reach full age ($1 per $3 above).`,
    h1: 'The Social Security earnings limit and what it holds back',
    intro: 'Collecting before full retirement age while still working? Enter your monthly benefit and your 2026 pay to see how many checks the SSA keeps, and when.',
    resume: `In 2026, if you collect Social Security before full retirement age and work, the SSA withholds $1 of benefits for every $2 you earn above ${$(T.lower_annual)} (${$(T.lower_monthly)} a month). In the calendar year you reach full retirement age, the limit rises to ${$(T.higher_annual)} (${$(T.higher_monthly)} a month), only earnings before the month you reach that age count, and $1 is withheld for every $3 above it. From that month on, there is no limit. The SSA does not trim each check: it holds back whole monthly payments from January until the amount is covered. A ${$(B)} benefit with ${$(PAY)} of 2026 wages loses ${$(a.withheld)}, about ${a.monthsWithheld} checks. Only wages and net self-employment earnings count, not pensions, interest or investment income. Withheld months are not lost for good: at full retirement age the benefit is recomputed upward to credit them.`,
    faqs: [
      { q: 'Does the SSA take money out of every check, or stop checks altogether?', a: `It stops whole checks. In the SSA's own 2026 example, a ${$(X.pub_example_benefit)} benefit and ${$(X.pub_example_earnings)} of earnings mean ${$(pub.withheld)} to withhold: the January and February payments are held, checks resume in March, and the ${$(pub.monthsWithheld * X.pub_example_benefit - pub.withheld)} withheld beyond what was due is paid back in 2027.` },
      { q: 'I retired in October after earning $45,000. Do I lose my November and December checks?', a: `No, if this is your first year of retirement. Under the grace-year rule (20 CFR 404.435), you are paid for any whole month in which you earn ${$(T.lower_monthly)} or less and do not work substantially in self-employment, whatever you earned earlier in the year. From the next year on, only the annual limit applies.` },
      { q: 'Do my pension and IRA withdrawals count toward the limit?', a: `No. Only wages from work and net earnings from self-employment count. Pensions, annuities, investment income, interest, capital gains and other government or military retirement benefits are ignored. An employee's contribution to a retirement plan counts if it is included in gross wages, according to SSA Publication 05-10069.` },
      { q: 'If my benefits were withheld for a year, do I get that money back?', a: `Not as a lump sum. At full retirement age the SSA recomputes your benefit as if you had started later. With a ${$(PIA)} PIA started at 62 and 1 month, the check is ${$(start.benefit)}; twelve withheld months raise it to ${$(redo.benefit)} a month from 67, for life.` },
      { q: 'My wife gets benefits on my record. Does my salary affect her checks?', a: 'Yes. If you are under full retirement age and earn above the limit, the withholding applies to benefits paid on your record, including a spouse or child benefit (20 CFR 404.415). A divorced spouse divorced for 2 years or more is not affected. Her own earnings, in turn, reduce only her own benefit.' },
    ],
    body: (h) => {
      const pays = [T.lower_annual, 30000, 40000, 50000, 60000, 70000];
      const BEN = 1500;
      const rows = pays.map((e) => { const r = earningsTest(BEN, e, 'before'); return [h.usd(e), h.usd(r.withheld), String(r.monthsWithheld), h.usd(r.kept)]; });
      return `
<h2>How much is withheld, check by check</h2>
${h.table(['2026 earnings', 'Withheld', 'Checks held', 'Paid in 2026'], rows, `Benefit of ${h.usd(BEN)} a month, under full retirement age all year`, ['l', 'r', 'r', 'r'])}
<p>The excess above ${h.usd(T.lower_annual)} is halved and the SSA holds back as many whole checks as needed, starting in January, based on the estimate of earnings you give it. If your earnings change during the year, the SSA asks you to report it right away so the withholding can be adjusted; money held beyond what was due is paid the following year, as in its own example. The figures come from the ${h.src('ssaWhileWorking', 'SSA page on working while receiving benefits')} and the ${h.src('frNotice2026', 'Federal Register notice')} that set the 2026 amounts.</p>

<h2>The year you reach full retirement age</h2>
<p>In that calendar year the limit is ${h.usd(T.higher_annual)}, the ratio becomes $1 for every $3, and only earnings before the month you reach full retirement age are counted. Someone with a ${h.usd(FB)} benefit who reaches 67 in September and earns ${h.usd(FPAY)} from January to August has ${h.usd(f.excess)} above the limit: ${h.usd(f.withheld)} is withheld, about ${f.monthsWithheld} checks. What is earned from September on does not count at all.</p>

<h2>The first-year monthly rule</h2>
<p>People who retire mid-year often earned more than the annual limit before stopping. For one year, usually the first, ${h.src('cfr404_435', '20 CFR 404.435')} lets the SSA pay any whole month in which you are considered retired: wages of ${h.usd(T.lower_monthly)} or less (${h.usd(T.higher_monthly)} in the year you reach full retirement age) and no substantial self-employment. For the self-employed, the ${h.src('ssaWorkPub', 'SSA publication on work and benefits')} says more than ${X.se_hours_not_retired_above} hours a month in the business generally means you are not retired, less than ${X.se_hours_retired_below} hours means you are, and in between it depends on the skill involved and the size of the business.</p>

<h2>What counts as earnings, and when</h2>
<p>Wages count when they are earned, not when paid: a bonus or accumulated vacation pay received in 2026 for work done in 2025 belongs to 2025. Net self-employment income counts when received. Pensions, annuities, interest, dividends, capital gains, and government or military retirement benefits do not count. The ${h.a('self-employed', 'self-employed page')} explains how net earnings are measured.</p>

<h2>The money comes back as a higher check</h2>
<p>At full retirement age the SSA recomputes your reduction, leaving out the months in which benefits were withheld. A benefit started at 62 and 1 month on a ${h.usd(PIA)} PIA pays ${h.usd(start.benefit)}; with twelve months withheld, it becomes ${h.usd(redo.benefit)} from 67. The SSA also reviews every working beneficiary's record each year, and a new high-earning year raises the benefit too. Once you reach full retirement age, see ${h.a('working-after-fra', 'working after full retirement age')}. Spouses and survivors drawing benefits only because they care for a child do not get this recredit.</p>`;
    },
  },
});
