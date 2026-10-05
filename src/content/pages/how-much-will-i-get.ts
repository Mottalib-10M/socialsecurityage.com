import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { quickEstimate, computePia, projectCareer, benefitAtAge } from '../../lib/engine/ss';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const b = { y: 1964, m: 6, d: 15 };
const q = (s: number) => quickEstimate(b, s, 22, 62, 804);
const mid = q(60000), low = q(30000);
const A = P.ssa_examples_2026.caseA;
const bp = bendPoints(2026);
const ten = computePia(b, projectCareer(b, 60000, 52, 62));
const twenty = computePia(b, projectCareer(b, 60000, 42, 62));
const avg = P.stats_aug_2026.retired_worker_avg;
const St = P.extra.statement;

export default definePage({
  id: 'how-much-will-i-get',
  group: 'claiming',
  order: 10,
  mini: 'claimSalaryAge',
  miniHref: 'benefits-calculator',
  related: ['benefits-calculator', 'average-benefit', 'aime', 'pia', 'when-to-claim', 'fewer-than-35-years'],
  sources: ['ssaRetireExample', 'ssaSnapshot', 'cfr404_211', 'cfr404_212', 'ssaStatement', 'cfr404_802'],
  en: {
    slug: 'how-much-social-security-will-i-get',
    nav: 'How much will I get?',
    card: `Four numbers set your check: 35 years of pay, your AIME, the formula of the year you turn 62 and your start age.`,
    title: `Your Social Security Check in 2026: How Much You Will Get`,
    description: `How much Social Security will you get in 2026? A ${$(60000)} career pays about ${$(mid.atFra.benefit)} a month at 67. The four numbers that set your check, with worked examples.`,
    h1: 'How much Social Security will I get?',
    intro: 'Four numbers decide the amount. Once you know which ones you control, the estimate stops being a mystery.',
    resume: `Your Social Security retirement check is set by four numbers. First, your 35 best years of earnings, each capped at that year's taxable maximum and indexed to wage growth. Second, their monthly average, the AIME, rounded down to the dollar. Third, the formula of the year you turn 62, which for 2026 replaces 90% of the first ${$(bp[0])} of AIME, 32% up to ${$(bp[1])} and 15% above: that gives your primary insurance amount, or PIA. Fourth, the age you start, which keeps between ${Math.round(benefitAtAge(1000, 62 * 12, 804).factor * 100)}% and ${Math.round(benefitAtAge(1000, 840, 804).factor * 100)}% of the PIA when full retirement age is 67. For a worker born in 1964 who earned the equivalent of ${$(60000)} a year in today's pay from 22 to 62, that is an AIME of ${$(mid.pia.aime)}, a PIA of ${$(mid.pia.pia, 2)}, and ${$(mid.at62.benefit)} a month at 62, ${$(mid.atFra.benefit)} at 67 or ${$(mid.at70.benefit)} at 70. The average retired worker received ${$(avg, 2)} in August 2026.`,
    faqs: [
      { q: 'How much Social Security will I get if I make $60,000 a year?', a: `About ${$(mid.atFra.benefit)} a month at a full retirement age of 67, under 2026 rules and in today's dollars, if you earned that much (in today's money) every year from 22 to 62. Starting at 62 and 1 month gives ${$(mid.at62.benefit)}; waiting to 70 gives ${$(mid.at70.benefit)}. Your PIA would be ${$(mid.pia.pia, 2)}.` },
      { q: 'Is my benefit based on my last five years or my best 35?', a: 'Your best 35 years, after indexing. The SSA multiplies each year before the year you turn 60 by the growth of the national average wage since then, keeps the 35 highest results and divides their total by 420 months (20 CFR 404.211). Recent years count at face value but have no special weight.' },
      { q: 'Will I get anything if I only worked ten years?', a: `Yes, if those ten years earned the 40 credits required. Ten years at ${$(60000)} in today's pay leave 25 zeros in the 35-year average: the AIME falls to ${$(ten.aime)} and the PIA to ${$(ten.pia, 2)}. Because the first ${$(bp[0])} of AIME is replaced at 90%, the benefit falls far less than the earnings.` },
      { q: 'Does my check go up after I start?', a: `Yes, in two ways. Each January a cost-of-living adjustment is added, ${P.cola_2026.pct}% for 2026. And if you keep working and a new year beats one of your 35 best, the SSA recomputes the benefit automatically; the raise is paid in December of the following year, retroactive to that January.` },
      { q: 'I am 61. When will the SSA send me a statement?', a: `If you have no online account, the SSA mails a Statement to workers aged ${St.mailed_from_age} and older about ${St.mailed_months_before_birthday} months before their birthday. With a my Social Security account you can see it at any time, with estimates at ${St.ages_shown} start ages and your full earnings history.` },
    ],
    body: (h) => {
      const salaries = [30000, 45000, 60000, 80000, 100000, 140000, P.taxable_max_2026];
      const rows = salaries.map((s) => { const r = q(s); return [h.usd(s), h.usd(r.pia.aime), h.usd(r.pia.pia, 2), h.usd(r.at62.benefit), h.usd(r.atFra.benefit), h.usd(r.at70.benefit)]; });
      const caseA62 = benefitAtAge(A.pia, 62 * 12, 67 * 12).benefit;
      return `
<h2>Number one: your 35 best years</h2>
<p>Everything starts with your earnings record, the year-by-year list of pay on which you paid Social Security tax. Earnings above each year's taxable maximum, ${h.usd(P.taxable_max_2026)} in 2026, are not counted and were not taxed. The SSA indexes each year before the year you turn 60 to today's wage level: a ${h.usd(A.earnings_1986)} salary in 1986 becomes ${h.usd(A.indexed_1986)} for someone turning 62 in 2026, because average wages grew about ${A.factor_1986} times since then. It then keeps the 35 highest indexed years. Fewer than 35 years means zeros in the average, which is the single most common reason for a lower check than expected; the ${h.a('fewer-than-35-years', 'page on short careers')} shows what each missing year costs.</p>

<h2>Number two: the monthly average, AIME</h2>
<p>The 35 indexed years are added and divided by 420, the number of months in 35 years, then rounded down to the dollar (${h.src('cfr404_211', '20 CFR 404.211')}). For a career at ${h.usd(60000)} in today's pay, the AIME is ${h.usd(mid.pia.aime)}; for ${h.usd(30000)}, it is ${h.usd(low.pia.aime)}. A steady career at a given rank against the national average wage simply gives that salary divided by 12. The ${h.a('aime', 'AIME page')} walks through the indexing year by year.</p>

<h2>Number three: the formula of the year you turn 62</h2>
<p>The AIME goes through three brackets, set by the ${h.a('bend-points', 'bend points')} of the year you turn 62: in 2026, 90% of the first ${h.usd(bp[0])}, 32% up to ${h.usd(bp[1])}, 15% above (${h.src('cfr404_212', '20 CFR 404.212')}). The result, rounded down to the dime, is your PIA, the amount payable at full retirement age. The formula is progressive: a ${h.usd(30000)} career gets a PIA of ${h.usd(low.pia.pia, 2)}, about ${Math.round((low.pia.pia * 12 / 30000) * 100)}% of the salary, while a ${h.usd(60000)} career gets ${h.usd(mid.pia.pia, 2)}, about ${Math.round((mid.pia.pia * 12 / 60000) * 100)}%. From the year you turn 62, every cost-of-living adjustment is added to the PIA, whether or not you have claimed. The ${h.a('pia', 'PIA page')} goes into the details.</p>

<h2>Number four: the age you start</h2>
<p>Starting before full retirement age reduces the PIA for life; starting after it adds delayed credits until 70. With a full retirement age of 67, the check is ${h.pct(benefitAtAge(1000, 62 * 12, 804).factor, 0)} of the PIA at 62, 100% at 67 and ${h.pct(benefitAtAge(1000, 840, 804).factor, 0)} at 70. This is the only one of the four numbers you choose at the end, and it moves the amount more than a decade of extra work would. Use the ${h.a('when-to-claim', 'break-even tool')} to compare starts.</p>

<h2>Worked examples, from ${h.usd(30000)} to the maximum</h2>
${h.table(['Pay in today\'s dollars', 'AIME', 'PIA', 'At 62 and 1 month', 'At 67', 'At 70'], rows, 'Worker born in 1964, same rank against the national average wage from 22 to 62, 2026 formula, today\'s dollars', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The last line is a career at the taxable maximum every year: it lands on the SSA's own maximum figures for someone turning 62 in 2026, covered on the ${h.a('maximum-benefit', 'maximum benefit page')}. Doubling pay from ${h.usd(30000)} to ${h.usd(60000)} raises the PIA by about ${Math.round((mid.pia.pia / low.pia.pia - 1) * 100)}%, not 100%, because the 90% bracket is used up early.</p>

<h2>Checking an estimate against the SSA's own example</h2>
<p>The SSA publishes a worked case for 2026: a worker born in 1964 with earnings from 1986 to 2025. Its AIME is ${h.usd(A.aime)} and its PIA ${h.usd(A.pia, 2)}; at exactly 62 that pays ${h.usd(caseA62)}, the ${h.usd(A.benefit62)} shown in the ${h.src('ssaRetireExample', 'SSA example')}. The engine behind this page reproduces every step of it. Against the average benefit, ${h.usd(avg, 2)} for retired workers in August 2026 according to the ${h.src('ssaSnapshot', 'SSA Monthly Statistical Snapshot')}, this worker would be ${A.pia >= avg ? 'above' : 'below'} the average at 67 and ${caseA62 >= avg ? 'above' : 'below'} it at 62. The ${h.a('average-benefit', 'average benefit page')} explains what that national figure hides.</p>

<h2>Reading your own Statement</h2>
<p>Your ${h.src('ssaStatement', 'Social Security Statement')} shows a bar graph of estimated monthly benefits at ${St.ages_shown} start ages, from 62 to 70, and your earnings history year by year. Two checks are worth doing. First, compare the earnings column with your W-2s or tax returns: a missing year lowers the average, and the regulations give 3 years, 3 months and 15 days after a year to correct it routinely (${h.src('cfr404_802', '20 CFR 404.802')}). Second, count the years with earnings: fewer than 35 means another year of work replaces a zero, which is worth much more than raising a year that already counts. Then paste that column into the ${h.a('benefits-calculator', 'earnings-record calculator')}: it redoes the indexing and the formula on your actual years.</p>
<p>The same PIA also sets what your family can draw: up to half of it for a husband or wife at their own full retirement age, as the ${h.a('spousal-calculator', 'spousal calculator')} shows, and up to all of it for a widow or widower.</p>`;
    },
  },
});
