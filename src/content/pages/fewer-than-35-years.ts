import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { computePia, projectCareer, benefitAtAge } from '../../lib/engine/ss';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const S = 70000;
const b = { y: 1964, m: 6, d: 15 };
const run = (n: number) => computePia(b, projectCareer(b, S, 62 - n, 62));
const full = run(35), y25 = run(25), y20 = run(20), y10 = run(10);
const bp = bendPoints(2026);

export default definePage({
  id: 'fewer-than-35-years',
  group: 'formula',
  order: 80,
  mini: 'zeroYears',
  miniHref: 'benefits-calculator',
  related: ['aime', 'credits', 'bend-points', 'working-after-fra', 'salary-50000'],
  sources: ['cfr404_211', 'cfr404_212', 'ssaBenefitFormula', 'frNotice2026'],
  en: {
    slug: 'fewer-than-35-years-of-work',
    nav: 'Fewer than 35 years',
    card: `Every missing year is a zero in the average. Twenty years at ${$(S)} still give ${Math.round((y20.pia / full.pia) * 100)}% of the 35-year PIA, thanks to the 90% bracket.`,
    title: 'Fewer Than 35 Years of Work: Social Security in 2026',
    description: `Fewer than 35 years of earnings in 2026: each missing year is a zero in the AIME. At ${$(S)} a year, 20 years give ${$(y20.pia)} of PIA against ${$(full.pia)} for 35.`,
    h1: 'Social Security with fewer than 35 years of work',
    intro: 'The formula always divides by 35 years. What you lose for each missing one depends on where your average lands.',
    resume: `Social Security averages your 35 highest years of indexed earnings over 420 months, whatever the length of your career. With fewer than 35 years, the missing years enter the average as zeros: 25 years of work at ${$(S)} in today's pay give an AIME of ${$(y25.aime)} instead of ${$(full.aime)}, a cut of 10/35. The PIA falls less than that, because the formula replaces the first ${$(bp[0])} of AIME at 90% and the zeros come off the top, at 32% or 15%. For a worker born in 1964, the PIA is ${$(full.pia, 2)} with 35 years, ${$(y25.pia, 2)} with 25, ${$(y20.pia, 2)} with 20 and ${$(y10.pia, 2)} with 10, or ${Math.round((y10.pia / full.pia) * 100)}% of the full-career amount with under a third of the years. You still need 40 credits, about ten years, to qualify. Each extra year that replaces a zero adds roughly ${$((full.pia - y25.pia) / 10)} a month at this salary, for life.`,
    faqs: [
      { q: 'Does the SSA use only my working years if I have fewer than 35?', a: `No. The divisor is fixed at 420 months for anyone born after 1928. With 22 years of earnings, the SSA adds 13 zero years and divides the total by 420 all the same (20 CFR 404.211). A shorter divisor would only exist for disability benefits at young ages.` },
      { q: 'Is working one more year at a low wage worth it if I have zeros?', a: `Usually yes. Any covered earnings, even ${$(10000)}, replace a zero, so the whole amount enters the average. In the 32% bracket, ${$(10000)} more in the 35-year total adds about ${$((10000 / 420) * 0.32, 2)} a month to the PIA, for life, plus every future COLA on it.` },
      { q: 'Why does my PIA not fall by the same share as my years?', a: `Because the zeros remove AIME from the top of your average, where the formula only pays 32% or 15%. The first ${$(bp[0])} of AIME, paid at 90%, stays intact much longer. Ten years at ${$(S)} keep ${Math.round((y10.pia / full.pia) * 100)}% of the 35-year PIA with ${Math.round((10 / 35) * 100)}% of the years.` },
      { q: 'If I already have 35 years, does a 36th year help?', a: `Only if it is higher, after indexing, than the lowest of your 35. It then replaces that year, and the gain is the difference divided by 420, multiplied by your bracket rate. A 36th year equal to the others adds nothing.` },
    ],
    body: (h) => {
      const ns = [10, 15, 20, 25, 30, 32, 34, 35];
      const rows = ns.map((n) => { const r = run(n); return [String(n), String(35 - n), h.usd(r.aime), h.usd(r.pia, 2), h.pct(r.pia / full.pia, 0), h.usd(benefitAtAge(r.pia, 744, 804).benefit)]; });
      const marg = [15, 25, 34].map((n) => [`${n} to ${n + 1}`, h.usd(run(n + 1).pia - run(n).pia, 2)]);
      const low = 30000, lowFull = computePia(b, projectCareer(b, low, 27, 62)), low20 = computePia(b, projectCareer(b, low, 42, 62));
      return `
<h2>The table: ${h.usd(S)} a year, from 10 to 35 years</h2>
${h.table(['Years worked', 'Zero years', 'AIME', 'PIA', 'Share of 35-year PIA', 'At 62'], rows, `Born 1964, ${h.usd(S)} in today's pay each year worked, career ending at 62, 2026 formula`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The AIME falls in a straight line, one thirty-fifth per missing year. The PIA does not: it falls slowly while the AIME is above ${h.usd(bp[0])}, because each lost dollar of AIME only costs 32 cents, then faster below that point, where each dollar costs 90 cents. That kink is the first ${h.a('bend-points', 'bend point')}.</p>

<h2>What a single year is worth</h2>
${h.table(['Years worked', 'Monthly PIA gain'], marg, `One more year at ${h.usd(S)}, born 1964`, ['l', 'r'])}
<p>At this salary each added year is worth about the same amount as long as the AIME stays in the 32% bracket: ${h.usd(S)} divided by 420 months, times 0.32. The 35th year is worth about as much as the 16th. After the 35th, a further year at the same pay is worth nothing, since it only ties with the years already counted. For someone close to 62 with a few zeros left, that makes the last working years among the most valuable of the career. The ${h.a('working-after-fra', 'working after full retirement age page')} covers years added after benefits start.</p>

<h2>Low pay, short career: the 90% bracket</h2>
<p>The cushion is strongest for lower earners. A worker at ${h.usd(low)} for 35 years has an AIME of ${h.usd(lowFull.aime)}; with 20 years it falls to ${h.usd(low20.aime)}, now inside the 90% bracket. The PIA goes from ${h.usd(lowFull.pia, 2)} to ${h.usd(low20.pia, 2)}, ${h.pct(low20.pia / lowFull.pia, 0)} of the full amount. That is by design: the ${h.src('cfr404_212', 'formula')} returns most on the first dollars of the average, which is where people with short or low-paid careers sit.</p>

<h2>Who has fewer than 35 years</h2>
<ul>
<li>People who started late after long studies, or stopped early.</li>
<li>Parents who left work for years to raise children: there is no caregiver credit in the retirement formula, the years are zeros.</li>
<li>Immigrants who arrived mid-career and have no U.S. earnings for their early years.</li>
<li>Workers with years in jobs not covered by Social Security, whose pension came from another system.</li>
</ul>
<p>For the last group, the Windfall Elimination Provision used to cut the formula further. It was repealed by the Social Security Fairness Act for benefits payable from January 2024, so the plain formula above now applies to everyone.</p>

<h2>Checking your own count</h2>
<p>Open your earnings record and count the years with covered earnings; a year before 22 counts too if it is among your best. Fewer than 35 means zeros in your average. The mini-calculator above gives the gain from one more year at a given pay; the ${h.a('benefits-calculator', 'full calculator')} does it on your real record. You also need ${P.credits.needed_retirement} ${h.a('credits', 'credits')} to qualify at all.</p>`;
    },
  },
});
