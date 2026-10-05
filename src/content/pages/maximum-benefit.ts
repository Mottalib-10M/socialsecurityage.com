import { definePage } from '../../lib/page-types';
import { P, bendPoints, taxableMax } from '../../lib/engine/params';
import { computePia, benefitAtAge, fraRetirement, piaFromAime, familyMaximum, employeePayroll } from '../../lib/engine/ss';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const M = P.max_benefit_2026;
const bp = bendPoints(2026);
const b = { y: 1964, m: 6, d: 15 };
const FRA = fraRetirement(1964).total;
const career = (first: number, last: number) => { const r: Record<number, number> = {}; for (let y = first; y <= last; y++) r[y] = taxableMax(y); return r; };
const maxRun = computePia(b, career(1986, 2025));
const atN = (n: number) => computePia(b, career(2025 - n + 1, 2025));
const n30 = atN(30), n35 = atN(35);
const tax = employeePayroll(P.taxable_max_2026);
const above = employeePayroll(500000);
const fam = familyMaximum(maxRun.pia);
const base24 = taxableMax(2024);
const k70 = benefitAtAge(1000, 840, FRA).factor;
const avgPia = piaFromAime(Math.floor(P.series.awi['2024'] / 12));
const n20 = atN(20), n27 = atN(27);
const crossYears = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].find((n) => atN(n).aime >= bp[1]) ?? 25;

export default definePage({
  id: 'maximum-benefit',
  group: 'claiming',
  order: 50,
  mini: 'capYearsBenefit',
  miniHref: 'benefits-calculator',
  related: ['taxable-maximum', 'claiming-at-70', 'bend-points', 'salary-150000', 'how-much-will-i-get'],
  sources: ['ssaMaxExample', 'ssaCbb', 'frNotice2026', 'cfr404_212', 'cfr404_313'],
  en: {
    slug: 'maximum-social-security-benefit',
    nav: 'Maximum benefit',
    card: `${$(M.age62)} at 62 to ${$(M.age70)} at 70 in 2026, for steady earnings at the taxable maximum since 22.`,
    title: `Maximum Social Security Benefit 2026: ${$(M.age70)} at Age 70`,
    description: `Maximum Social Security benefit in 2026: ${$(M.age70)} a month at 70, ${$(M.age67)} at 67 and ${$(M.age62)} at 62, for 35 or more years of steady pay at the taxable maximum.`,
    h1: 'The maximum Social Security benefit, and what it takes to get it',
    intro: 'It is a demanding target: pay at the taxable maximum nearly every year of a career, then the right start age.',
    resume: `For people starting benefits in January 2026, the SSA puts the maximum monthly retirement benefit at ${$(M.age62)} at 62 and 1 month, ${$(M.age65)} at 65, ${$(M.age66)} at 66, ${$(M.age67)} at 67 and ${$(M.age70)} at 70. Each figure assumes earnings at or above the taxable maximum every year from age 22, which is ${$(P.taxable_max_2026)} in 2026. Two rules cap it. Pay above the taxable maximum is neither taxed nor counted, so the average indexed monthly earnings cannot exceed about ${$(M.aime62)} for someone turning 62 in 2026. And the benefit formula replaces only 15% of AIME above the second bend point of ${$(bp[1])}, so the primary insurance amount tops out at ${$(M.pia62, 2)}. The amounts at 65 to 70 belong to older cohorts, with their own formula years and cost-of-living adjustments, which is why ${$(M.age70)} is not simply ${Math.round(k70 * 100)}% of ${$(M.age67)}, which would be ${$(Math.floor(M.age67 * k70))}. Thirty-five years at the maximum are needed; with thirty, the PIA falls to ${$(n30.pia, 2)}.`,
    faqs: [
      { q: 'How much do I have to earn to get the maximum Social Security?', a: `At least the taxable maximum of each year, ${$(P.taxable_max_2026)} in 2026, for 35 years. Because the maximum rises with wages, that meant ${$(taxableMax(2000))} in 2000 and ${$(taxableMax(1990))} in 1990. A career that only reached the maximum in its last fifteen years falls well short, as the table on this page shows.` },
      { q: 'Does earning $500,000 a year raise my benefit above someone on $184,500?', a: `No. Social Security tax and benefits both stop at the taxable maximum. In 2026 an employee earning ${$(500000)} pays the same ${$(above.oasdi)} of Social Security tax as one earning ${$(P.taxable_max_2026)}, and both are credited with the same ${$(P.taxable_max_2026)} for the year. Only the ${(P.payroll.hi_employee * 100).toFixed(2)}% Medicare tax continues on all pay.` },
      { q: 'Can I get more than the maximum by waiting past 70?', a: `No. Delayed retirement credits stop with the month you turn 70 (20 CFR 404.313), so ${$(M.age70)} is the ceiling for a January 2026 start at 70. After that, only the annual cost-of-living adjustment raises the check, ${P.cola_2026.pct}% for 2026, and a late application reaches back just ${P.claiming.retroactive_months} months.` },
      { q: 'Why does the SSA maximum at 70 differ from 124% of the maximum at 67?', a: `Because they are different people. Someone 70 in January 2026 turned 62 in 2018, so the 2018 bend points and every COLA from 2018 to 2025 apply. Someone 67 in January 2026 turned 62 in 2021. The SSA computes each one with its own earnings history, formula year and COLAs.` },
      { q: 'What is the most a family can receive on one maximum record?', a: `For a worker turning 62 in 2026 with the maximum PIA of ${$(maxRun.pia, 2)}, the family maximum is ${$(fam, 2)} a month, worker included (20 CFR 404.403). Spouse and child benefits on the record are reduced so that the total stays within it; a divorced spouse is paid outside it.` },
    ],
    body: (h) => {
      const ns = [40, 35, 30, 25, 20, 15, 10];
      const rows = ns.map((n) => { const r = atN(n); return [String(n), h.usd(r.aime), h.usd(r.pia, 2), h.usd(benefitAtAge(r.pia, FRA, FRA).benefit), h.usd(benefitAtAge(r.pia, 840, FRA).benefit)]; });
      return `
<h2>The SSA's table for 2026</h2>
${h.table(['Start in January 2026 at', 'Maximum monthly benefit'], [['62 and 1 month', h.usd(M.age62)], ['65', h.usd(M.age65)], ['66', h.usd(M.age66)], ['67', h.usd(M.age67)], ['70', h.usd(M.age70)]], 'Steady earnings at or above the taxable maximum since age 22', ['l', 'r'])}
<p>These amounts are the ${h.src('ssaMaxExample', 'SSA actuaries\' maximum-earner examples')}. The first row is the cleanest: a worker born in 1964, turning 62 in 2026, with maximum earnings every year from 1986 to 2025. Our engine rebuilds it from the ${h.src('ssaCbb', 'taxable maximum series')}: AIME ${h.usd(maxRun.aime)}, PIA ${h.usd(maxRun.pia, 2)}, and ${h.usd(benefitAtAge(maxRun.pia, 62 * 12 + 1, FRA).benefit)} at 62 and 1 month, matching the SSA to the dollar.</p>

<h2>Why the ceiling exists: two caps stacked</h2>
<p>The first cap is the taxable maximum, also called the contribution and benefit base: ${h.usd(P.taxable_max_2026)} in 2026, set by the ${h.src('frNotice2026', 'SSA notice of November 2025')}. Pay above it is not taxed for Social Security and never enters the earnings record. Earnings are indexed to the wage level of 2024, the year a 2026 retiree turned 60, when the base was ${h.usd(base24)}; a steady earner at the base therefore has an AIME close to ${h.usd(Math.floor(base24 / 12))}. The SSA example gives ${h.usd(M.aime62)}, a little more, because 2025 counts at face value with its higher base.</p>
<p>The second cap is the formula itself (${h.src('cfr404_212', '20 CFR 404.212')}). Above ${h.usd(bp[1])} of AIME, only 15 cents of each extra dollar reach the PIA. Between an AIME at the second bend point, which gives ${h.usd(piaFromAime(bp[1]), 2)}, and the maximum AIME, the remaining ${h.usd(M.aime62 - bp[1])} of average pay adds only ${h.usd(M.pia62 - piaFromAime(bp[1]), 2)}. A maximum earner pays about ${h.usd(tax.oasdi)} of employee Social Security tax in 2026, and the same again from the employer, for a benefit that replaces a far smaller share of pay than for an average earner.</p>

<h2>How many years at the maximum you need</h2>
${h.table(['Years at the maximum', 'AIME', 'PIA', 'At 67', 'At 70'], rows, 'Worker born in 1964, maximum earnings in the most recent years up to 2025, no other earnings, 2026 formula', ['l', 'r', 'r', 'r', 'r'])}
<p>Thirty-five years at the base give an AIME of ${h.usd(n35.aime)}, slightly under the SSA figure because a longer career lets the best 35 include a few early years when the base was higher relative to wages. Below 35 years, the missing years count as zeros and the AIME falls in proportion, but the PIA falls less, because the cut comes out of the 15% bracket first. Twenty years at the maximum still give a PIA of ${h.usd(n20.pia, 2)}, more than the ${h.usd(avgPia, 2)} of a full career at the 2024 national average wage. Below ${crossYears} years the AIME drops under the second bend point, where each dollar is worth 32 cents again. The ${h.a('taxable-maximum', 'taxable maximum page')} shows how the base has moved since 1951.</p>

<h2>From the maximum PIA to the maximum check</h2>
<p>The PIA is the amount at full retirement age. Starting at 62 and 1 month keeps ${h.pct(benefitAtAge(1000, 62 * 12 + 1, FRA).factor)} of it when full retirement age is 67, and waiting to 70 adds delayed credits of 2/3 of 1% a month (${h.src('cfr404_313', '20 CFR 404.313')}), for ${h.pct(benefitAtAge(1000, 840, FRA).factor, 0)}. A maximum earner born in 1964 who waits to 70, in 2034, would receive ${h.usd(benefitAtAge(maxRun.pia, 840, FRA).benefit)} in today's dollars, before the cost-of-living adjustments of 2026 to 2033. The SSA's ${h.usd(M.age70)} for a start at 70 in January 2026 is ${M.age70 < M.age67 * k70 ? 'lower' : 'higher'} than ${Math.round(k70 * 100)}% of its ${h.usd(M.age67)} at 67, ${h.usd(Math.floor(M.age67 * k70))}, because each figure belongs to a different birth cohort with its own formula year, its own wage indexing and its own COLAs. See ${h.a('claiming-at-70', 'Social Security at 70')} for the timing of credits.</p>

<h2>What it takes in a real career</h2>
<p>The full maximum asks a lot, and the SSA figures read best as a ceiling rather than a target: it needs pay at the base nearly every year from the early twenties, with no gaps for school, children, unemployment or a career change. Someone who first reached the base at 35 and kept it to 62 has 27 such years; with little else on the record, that means an AIME of ${h.usd(n27.aime)} and a PIA of ${h.usd(n27.pia, 2)}. Self-employed workers reach the base through net earnings from self-employment, which are ${h.pct(P.payroll.se_net_factor, 2)} of net profit: a profit of about ${h.usd(Math.ceil(P.taxable_max_2026 / P.payroll.se_net_factor))} is needed to be credited with the full ${h.usd(P.taxable_max_2026)} in 2026, as the ${h.a('self-employed', 'self-employed page')} explains. Compare with the ${h.a('salary-150000', 'estimate for a $150,000 salary')}, or paste your own record into the ${h.a('benefits-calculator', 'earnings-record calculator')}, which also shows which of your 35 years still count.</p>`;
    },
  },
});
