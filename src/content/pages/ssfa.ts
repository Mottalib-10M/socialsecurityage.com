import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { piaFromAime, computePia, projectCareer, benefitAtAge, survivorBenefit } from '../../lib/engine/ss';

const S = P.ssfa, X = P.extra.ssfa;
const bp = bendPoints(2026);
const signed = 'January 5, 2025';
// A teacher born in 1964 with 20 years of covered work at $45,000 in today's pay, the rest in a non-covered school system
const b = { y: 1964, m: 6, d: 15 };
const T = computePia(b, projectCareer(b, 45000, 22, 42));
const tAt67 = benefitAtAge(T.pia, 804, 804).benefit;
const SP = 2200;
const widow = survivorBenefit({ deceasedPia: SP, deceasedClaimMonths: 804, deceasedFraMonths: 804, survivorClaimMonths: 804, survivorFraMonths: 804 }).benefit;
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pctS = (x: number) => `${Math.round(x * 100)}%`;

export default definePage({
  id: 'ssfa',
  group: 'taxwork',
  order: 20,
  mini: 'taxSsfaStandard',
  miniHref: 'benefits-calculator',
  related: ['pia', 'bend-points', 'fewer-than-35-years', 'aime', 'benefits-calculator'],
  sources: ['pl118_273', 'ssaSsfa', 'ssaAbroadPub', 'cfr404_621', 'irsP915'],
  en: {
    slug: 'social-security-fairness-act',
    nav: 'Fairness Act (WEP, GPO repeal)',
    card: `WEP and GPO are gone for benefits from January 2024: a public pension no longer cuts your own, spouse or survivor benefit.`,
    title: 'Social Security Fairness Act 2026: WEP and GPO Repealed',
    description: `Social Security Fairness Act in 2026: Public Law ${S.public_law} ended WEP and GPO for benefits after ${S.applies_after}; ${S.payments_sent} million back payments, $${S.payments_total_billion} billion paid.`,
    h1: 'The Social Security Fairness Act: what the repeal of WEP and GPO means now',
    intro: 'A pension from a job outside Social Security no longer shrinks the benefit you earned in covered work, or the one you receive as a spouse or survivor.',
    resume: `The Social Security Fairness Act, Public Law ${S.public_law} signed on ${signed}, repealed the Windfall Elimination Provision and the Government Pension Offset for benefits payable for months after ${S.applies_after}. Since January 2024, a pension from work that did not pay Social Security tax, as for some teachers, firefighters and police officers in many states, federal employees under the Civil Service Retirement System and people covered by a foreign system, no longer reduces a retirement, spouse or survivor benefit. The SSA began adjusting payments on February 25, 2025, paid the increase back to January 2024 in a one-time deposit and, by July 7, 2025, had sent over ${S.payments_sent} million payments totaling $${S.payments_total_billion} billion. Your benefit now follows the standard formula: 90% of the first ${$(bp[0])} of average indexed monthly earnings, 32% up to ${$(bp[1])} and 15% above, in 2026. A teacher with 20 covered years at ${$(45000)} has an AIME of ${$(T.aime)} and a PIA of ${$(T.pia, 2)}. Anyone who never applied because of WEP or GPO should apply now.`,
    faqs: [
      { q: 'I retired from a state teachers\' plan and never applied for Social Security. Is it too late?', a: `No. The SSA says people who never applied for retirement because of WEP, or for spouse or survivor benefits because of GPO, may need to file now, and that the date of application can affect when benefits begin. Normal retroactivity rules apply: up to ${P.claiming.retroactive_months} months before the application month, within the limits of 20 CFR 404.621. Retirement and spouse claims can be filed online; survivor claims by phone at 1-800-772-1213.` },
      { q: 'Does everyone who worked for a state or city get a raise from the new law?', a: `No. Only people with a pension from work not covered by Social Security were affected by WEP or GPO. The SSA estimates that about ${pctS(X.covered_state_local_share)} of state and local employees work in covered jobs, paying Social Security tax, and see no change. Over ${X.affected_million} million people had a benefit reduced or eliminated by the two provisions before the repeal.` },
      { q: 'How far back does the retroactive payment go?', a: `To January 2024. ${S.applies_after} is the last month either provision applied, so benefits for January 2024 and later are recomputed. Because Social Security pays one month behind, the January 2024 benefit was the one received in February 2024. Most beneficiaries received their new monthly amount from April 2025, which is the benefit for March 2025.` },
      { q: 'Will the back payment from the Fairness Act raise my 2025 taxes?', a: `It can. IRS Publication 915 says a lump-sum payment received in 2025 is included in 2025 income even if part of it is for 2024. The publication also offers a lump-sum election that refigures the earlier year's share with that year's income, which can lower the taxable amount; worksheets in the publication compare both methods.` },
      { q: 'My husband had a large Social Security benefit and I have a city pension. What do I get as his widow now?', a: `The survivor benefit without any offset for your pension. If he had a PIA of ${$(SP)} and started at full retirement age, a widow at her own full retirement age receives ${$(widow)} a month, or the larger of that and her own benefit. Before 2024, the Government Pension Offset could reduce or wipe out this amount; it no longer applies to benefits payable from January 2024.` },
    ],
    body: (h) => {
      const aimes = [800, bp[0], 2000, 3000, 4500];
      const rows = aimes.map((a) => { const p = piaFromAime(a); return [h.usd(a), h.usd(p, 2), h.pct(p / a), h.usd(benefitAtAge(p, 62 * 12 + 1, 804).benefit)]; });
      const timeline = [
        [h.date('2025-01-05'), `Public Law ${S.public_law} (${S.bill}) is signed`],
        ['January 2024', 'First month for which WEP and GPO no longer apply'],
        [h.date(X.adjust_start), 'SSA begins adjusting benefits and sending back payments'],
        ['April 2025', 'Most beneficiaries receive the new monthly amount (benefit for March 2025)'],
        [h.date(X.payments_as_of), `Over ${S.payments_sent} million payments sent, $${S.payments_total_billion} billion in total, ${X.ahead_of_schedule_months} months ahead of schedule`],
        [h.date(X.new_applications_as_of), `${h.num(X.new_applications)} new applications taken since the law passed`],
      ];
      return `
<h2>What the law changed</h2>
<p>The ${h.src('pl118_273', 'Social Security Fairness Act (Public Law 118-273)')} repealed two provisions of the Social Security Act. The first, the Windfall Elimination Provision, changed how the SSA computed the retirement or disability benefit of someone who also received a pension from non-covered work; the ${h.src('ssaAbroadPub', 'SSA\'s own publication')} described it as using a different formula to figure the benefit. The second, the Government Pension Offset, reduced or eliminated spouse and survivor benefits for people with a government pension from non-covered work. Both stopped applying to benefits payable for months after ${S.applies_after}.</p>
<p>For anyone receiving or claiming benefits today, there is no WEP or GPO computation left. The benefit is computed as it is for every other worker, from the earnings on which Social Security tax was paid, and a spouse or survivor benefit is paid in full under the usual rules.</p>

<h2>Who was affected</h2>
<p>The ${h.src('ssaSsfa', 'SSA\'s page on the Act')} names the groups most concerned: some teachers, firefighters and police officers in many states, federal employees covered by the Civil Service Retirement System, and people whose work was covered by a foreign social security system. The common thread is a pension from a job that did not withhold Social Security tax, combined with a Social Security benefit earned elsewhere or through a spouse.</p>
<p>The job title alone does not decide anything. About ${pctS(X.covered_state_local_share)} of state and local public employees are in covered employment, pay Social Security tax and were never subject to WEP or GPO, so the repeal changes nothing for them. Before the repeal, the two provisions reduced or eliminated the benefits of over ${X.affected_million} million people.</p>

<h2>Your benefit under the standard formula</h2>
<p>With WEP gone, a career split between covered and non-covered work is computed like any short covered career. The SSA indexes the covered earnings, keeps the best 35 years, with zeros for the missing ones, and applies the formula of the year you turned 62. For 2026 that is 90% of the first ${h.usd(bp[0])} of AIME, 32% up to ${h.usd(bp[1])}, and 15% above (${h.a('bend-points', 'bend points')}).</p>
${h.table(['AIME', 'PIA, 2026 formula', 'PIA as a share of AIME', 'At 62 and 1 month'], rows, 'Standard formula for a worker turning 62 in 2026, before COLAs; full retirement age 67', ['l', 'r', 'r', 'r'])}
<p>Short covered careers produce low AIMEs, and the 90% bracket weighs heavily on them: an AIME of ${h.usd(800)} converts to a PIA of ${h.pct(piaFromAime(800) / 800)} of it, an AIME of ${h.usd(4500)} to ${h.pct(piaFromAime(4500) / 4500)}. Take a teacher born in 1964 who worked 20 years in covered jobs at the equivalent of ${h.usd(45000)} a year, then moved to a school system outside Social Security. Fifteen of the 35 years count as zero, so the AIME is ${h.usd(T.aime)}, and the 2026 formula gives a PIA of ${h.usd(T.pia, 2)}, or ${h.usd(tAt67)} a month at 67. That is the amount paid, whatever the size of the teacher's pension. The ${h.a('fewer-than-35-years', 'page on careers shorter than 35 years')} shows how each additional covered year raises it.</p>

<h2>Spouses and survivors with a public pension</h2>
<p>The second repeal matters even more for many households. A widow or widower who receives a pension from non-covered government work now gets the full survivor benefit: if the late spouse had a PIA of ${h.usd(SP)} and claimed at full retirement age, a survivor at full retirement age receives ${h.usd(widow)} a month. A spouse benefit, up to half of the worker's PIA, is paid in the same way. The usual rules still apply: reductions for starting early, the ${h.a('earnings-test', 'earnings test')} below full retirement age, and the rule that you are paid the larger of your own benefit and the spouse or survivor amount, not both in full.</p>

<h2>How the SSA paid it out</h2>
${h.table(['Date', 'Step'], timeline, 'Implementation milestones reported by the SSA', ['l', 'l'])}
<p>People already on the rolls did not need to file anything. The SSA recomputed their benefits, sent the retroactive amount back to January 2024 as a single deposit and mailed a notice; some received two notices, one when WEP or GPO was removed from the record and one when the monthly amount changed. The SSA says the size of the increase varied widely, from very little to more than ${h.usd(X.some_increase_over)} a month, depending on the type of benefit and the pension.</p>
<p>A back payment can arrive in a later tax year than the months it covers. ${h.src('irsP915', 'IRS Publication 915')} requires the taxable part of a lump-sum payment to be reported in the year received, and offers the lump-sum election, which recomputes the earlier year's share using that year's income and can lower the tax.</p>

<h2>What to do now</h2>
<ol>
<li><strong>Already receiving benefits:</strong> check that the SSA has your current mailing address and bank account, through a my Social Security account or by phone at 1-800-772-1213. No application is needed.</li>
<li><strong>Never applied because of WEP:</strong> apply for retirement benefits; the online application at ssa.gov/apply works for retirement and spouse claims. The SSA also takes these claims by phone.</li>
<li><strong>Never applied as a spouse or survivor because of GPO:</strong> file now. Survivor claims are not available online; call 1-800-772-1213.</li>
<li><strong>Not sure whether you applied:</strong> the SSA advises filing, because the application date can affect when benefits start. Retroactive benefits are limited to ${P.claiming.retroactive_months} months before the application month and cannot create a reduced benefit for age (${h.src('cfr404_621', '20 CFR 404.621')}).</li>
</ol>
<p>Medicare premiums follow the new benefit too. Someone who was billed directly because the benefit was too small will see the premium deducted from the Social Security payment once the record is updated; until the SSA's notice arrives, the SSA asks people to keep paying the bill so coverage does not lapse. To estimate the standard benefit from your own covered earnings, use the mini-calculator above or the ${h.a('benefits-calculator', 'full benefits calculator')}.</p>`;
    },
  },
});
