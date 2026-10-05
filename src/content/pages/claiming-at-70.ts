import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { benefitAtAge, fraRetirement, breakEvenMonths, survivorBenefit, drcIncrease } from '../../lib/engine/ss';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pc = (x: number, d = 0) => `${(Math.round(x * 10 ** (d + 2)) / 10 ** d).toLocaleString('en-US')}%`;
const age = (m: number) => { const t = Math.round(m), y = Math.floor(t / 12), mo = t % 12; return mo ? `${y} and ${mo} month${mo > 1 ? 's' : ''}` : `${y}`; };
const FRA = fraRetirement(1964).total, S70 = P.drc.stop_age * 12;
const PIA = 2000;
const full = benefitAtAge(PIA, FRA, FRA), late = benefitAtAge(PIA, S70, FRA), at69 = benefitAtAge(PIA, 69 * 12, FRA);
const be = breakEvenMonths({ start: FRA, benefit: full.benefit }, { start: S70, benefit: late.benefit }) ?? 0;
const HI = 3200;
const widow70 = survivorBenefit({ deceasedPia: HI, deceasedClaimMonths: S70, deceasedFraMonths: FRA, survivorClaimMonths: FRA, survivorFraMonths: FRA });
const widow67 = survivorBenefit({ deceasedPia: HI, deceasedClaimMonths: FRA, deceasedFraMonths: FRA, survivorClaimMonths: FRA, survivorFraMonths: FRA });
const MED = P.extra.medicare_age.first_eligible;
const yearly = drcIncrease(12);

export default definePage({
  id: 'claiming-at-70',
  group: 'claiming',
  order: 40,
  mini: 'delayTo70Gain',
  miniHref: 'when-to-claim',
  related: ['when-to-claim', 'claiming-at-62', 'survivor-calculator', 'maximum-benefit', 'withdraw-or-suspend'],
  sources: ['cfr404_313', 'ssaDelayed', 'cfr404_621', 'ssaMedicareSignup', 'poms615320', 'cfr404_409'],
  en: {
    slug: 'social-security-at-70',
    nav: 'Waiting until 70',
    card: `${pc(late.factor)} of your PIA for life when full retirement age is 67, and the same amount for a surviving spouse.`,
    title: `Social Security at 70 in 2026: ${pc(late.factor)} of Your Full Benefit`,
    description: `Social Security at 70 in 2026: delayed credits of ${pc(yearly)} a year lift the check to ${pc(late.factor)} of your PIA if full retirement age is 67. No credit after 70; Medicare at 65.`,
    h1: 'Waiting until 70 for Social Security: the credits, the timing, the survivor',
    intro: 'Each month past full retirement age adds two-thirds of a percent, for life, and for your widow or widower after you.',
    resume: `Delaying Social Security past full retirement age earns a credit of 2/3 of 1% for each month, ${pc(yearly)} a year, for anyone born in 1943 or later (20 CFR 404.313). With a full retirement age of 67, starting at 70 pays ${pc(late.factor)} of your primary insurance amount: a ${$(PIA)} PIA becomes ${$(late.benefit)} a month instead of ${$(full.benefit)}. Credits stop at ${P.drc.stop_age}: there is nothing to gain from waiting longer, and an application reaches back only ${P.claiming.retroactive_months} months. Credits earned during a year are added to your check the following January, except in the year you turn 70. In today's dollars the start at 70 overtakes a start at 67 at about age ${age(be)}. The credits also pass to a surviving spouse, who inherits the larger check. Medicare does not wait: eligibility starts at ${MED}, and if you are not yet collecting Social Security you must sign up for it yourself.`,
    faqs: [
      { q: 'Is it 8% a year for everyone who delays?', a: `Yes for anyone born in 1943 or later: 2/3 of 1% per month, ${pc(yearly)} per year, under 20 CFR 404.313. The total at 70 depends on how many months lie between full retirement age and 70: ${pc(benefitAtAge(1000, S70, fraRetirement(1955).total).factor, 2)} for someone born in 1955, ${pc(late.factor)} for 1960 and later.` },
      { q: 'I started benefits at 69 in March. Why did my check rise the next January?', a: `Because the SSA adds delayed credits earned during a calendar year to the benefit in the following January. When you start mid-year, your first checks include only the credits for the months up to the previous December; the months from January to the start are added the next January. The year you turn 70 is the exception: all credits apply at once.` },
      { q: 'Should I sign up for Medicare at 65 even if I wait for Social Security?', a: `Medicare and Social Security are separate decisions. The SSA says most people sign up for Part A and Part B when first eligible, typically at ${MED}. Only people already receiving Social Security at ${MED} are enrolled in Part A automatically; if you are waiting for 70, you have to enroll yourself, unless employer coverage lets you delay Part B.` },
      { q: 'I forgot to apply and I am now 70 and 9 months. What do I lose?', a: `Up to three months. Your application can be made retroactive for ${P.claiming.retroactive_months} months (20 CFR 404.621), so applying at 70 and 9 months gets you paid from 70 and 3 months. Credits stopped at 70 anyway, so the months between 70 and 70 and 3 months are simply lost.` },
      { q: 'If I wait until 70, does my wife get a bigger spouse benefit while I am alive?', a: `No. A spouse benefit is figured from your PIA, at most ${pc(P.family.spouse_max)} of it at her own full retirement age, and your delayed credits are not part of the PIA. With a ${$(PIA)} PIA she can receive up to ${$(PIA * P.family.spouse_max)} whether you start at 67 or 70. Your credits reach her only as a widow, through the survivor benefit.` },
    ],
    body: (h) => {
      const starts = [FRA, 68 * 12, 69 * 12, S70];
      const rows = starts.map((s) => { const r = benefitAtAge(PIA, s, FRA); return [String(s / 12), h.pct(r.factor), h.usd(r.benefit), h.usd(r.benefit * 12), h.usd(Math.max(0, (85 * 12 - s)) * r.benefit), h.usd(Math.max(0, (95 * 12 - s)) * r.benefit)]; });
      const years = [1955, 1956, 1957, 1958, 1959, 1960];
      const rows2 = years.map((y) => { const f = fraRetirement(y); return [y === 1960 ? '1960 and later' : String(y), age(f.total), String(S70 - f.total), h.pct(benefitAtAge(1000, S70, f.total).factor, 2)]; });
      return `
<h2>Three years of credits, priced</h2>
${h.table(['Start at', 'Share of PIA', 'Monthly', 'Yearly', 'Received by 85', 'Received by 95'], rows, `PIA ${h.usd(PIA)}, full retirement age 67, today's dollars`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The credit is linear: each month of delay adds the same 2/3 of 1% of the PIA, so the year from 69 to 70 is worth as much as the year from 67 to 68, ${h.usd(late.benefit - at69.benefit)} a month here. The ${h.src('cfr404_313', 'regulation')} rounds each increase down to the dime and the monthly payment down to the dollar. By 85, the start at 67 has still collected more in total; by 95, the start at 70 is clearly ahead. The crossover is about ${age(be)}.</p>

<h2>Born earlier, more months of credit</h2>
${h.table(['Born in', 'Full retirement age', 'Credit months to 70', 'Share of PIA at 70'], rows2, 'Delayed retirement credits of 2/3 of 1% per month, born 1943 or later', ['l', 'l', 'r', 'r'])}
<p>Because full retirement age rose from 66 to 67 over the birth years 1955 to 1960, the room for delayed credits shrank from ${S70 - fraRetirement(1955).total} to ${S70 - FRA} months. The ${h.src('ssaDelayed', 'SSA\'s delayed retirement page')} gives the same percentages. The credit rate itself has not changed since the cohort born in 1943.</p>

<h2>When the credits show up in your check</h2>
<p>Credits are counted month by month but paid on a calendar rhythm. Suppose you start benefits in the middle of a year, between full retirement age and 70: your first check includes the credits earned through the previous December. The credits for the months of the current year are added the following January. In the year you reach 70, the SSA applies all credits as soon as you start, so a claim at exactly 70 needs no catch-up. This is why some people see their check rise in the first January after claiming, on top of the cost-of-living adjustment.</p>

<h2>Nothing to gain after 70, and a short window behind you</h2>
<p>No credit is earned for any month after the month you turn 70. An application also reaches back at most ${P.claiming.retroactive_months} months (${h.src('cfr404_621', '20 CFR 404.621')}), so someone who files at 71 has lost six months for nothing. The same rule protects the delay in the other direction: when you file after full retirement age, the retroactive months can never go back to a month before full retirement age if that would make the benefit reduced for age. A retroactive start also means fewer months of credit, so reaching back is not free either.</p>

<h2>The survivor gets the delay too</h2>
<p>For a married higher earner, waiting raises two checks: their own and the one their spouse will inherit. A widow or widower at full retirement age receives 100% of what the deceased was receiving, delayed credits included. With a PIA of ${h.usd(HI)}, the survivor gets ${h.usd(widow70.benefit)} if the deceased had started at 70, against ${h.usd(widow67.benefit)} after a start at 67. Early starts are partly cushioned by the ${h.src('poms615320', 'RIB-LIM floor')}, but late starts carry their full increase. The ${h.a('survivor-calculator', 'survivor calculator')} shows every combination.</p>

<h2>Medicare at ${MED} whatever you decide</h2>
<p>Medicare eligibility did not move when full retirement age rose; it is ${MED} for everyone. According to the ${h.src('ssaMedicareSignup', 'SSA')}, people already receiving Social Security at ${MED} are enrolled in Part A automatically. Someone waiting for 70 receives no Social Security at ${MED} and must enroll during the initial enrollment period, unless covered by an employer group health plan, in which case a special enrollment period applies later. The standard Part B premium for 2026 is ${h.usd(P.medicare.part_b_2026, 2)} a month.</p>

<h2>Income in the years of waiting</h2>
<p>Delaying means living on something else from your sixties to 70: wages, savings or a pension. The ${h.a('earnings-test', 'earnings test')} does not matter here, since it stops at full retirement age, and you can work any amount while your credits build. If you change your mind after full retirement age, you can start at any month; past it, there is no reduction to fear. The ${h.a('when-to-claim', 'break-even tool')} compares 70 with any earlier start, and ${h.a('maximum-benefit', 'the maximum benefit page')} shows what 70 means for a maximum earner.</p>`;
    },
  },
});
