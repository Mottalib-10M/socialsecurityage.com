import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { computePia, projectCareer, benefitAtAge, spousalBenefit, survivorBenefit, familyMaximum, fraRetirement } from '../../lib/engine/ss';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const B = P.ssa_examples_2026.caseB, A = P.ssa_examples_2026.caseA;
const maxRec = Object.fromEntries(Array.from({ length: 40 }, (_, i) => [1986 + i, 1e7]));
const rb = computePia({ y: B.born, m: 6, d: 15 }, maxRec);
const fraB = fraRetirement(B.born);
const raw = rb.parts[0] + rb.parts[1] + rb.parts[2];
const bp21 = bendPoints(rb.eligibilityYear);
const pa = A.pia;
const fam = familyMaximum(pa, 2026);
const sp = spousalBenefit(pa, 0, 804, 804);
const sv = survivorBenefit({ deceasedPia: pa, deceasedClaimMonths: null, deceasedFraMonths: 804, survivorClaimMonths: 804, survivorFraMonths: 804 });

export default definePage({
  id: 'pia',
  group: 'formula',
  order: 40,
  mini: 'piaFamily',
  miniHref: 'benefits-calculator',
  related: ['aime', 'bend-points', 'cola-2026', 'family-maximum', 'spousal-calculator', 'survivor-calculator'],
  sources: ['ssaPiaExample', 'cfr404_212', 'frNotice2026', 'cfr404_403', 'ssaColaSeries'],
  en: {
    slug: 'primary-insurance-amount',
    nav: 'Primary insurance amount',
    card: `The PIA is the benefit at full retirement age and the base for spouse, survivor and family amounts. Case B shows five COLAs taking it to ${$(B.pia, 2)}.`,
    title: 'Primary Insurance Amount 2026: PIA, Rounding and COLAs',
    description: `Primary insurance amount 2026: the base of every benefit on a record, cut to the dime, raised by each COLA from 62. SSA case B: ${$(rb.piaAtEligibility, 2)} to ${$(B.pia, 2)}.`,
    h1: 'The primary insurance amount: the number every benefit is cut from',
    intro: 'Your check, your spouse\'s, your widow\'s and your children\'s are all fractions or multiples of one figure.',
    resume: `The primary insurance amount (PIA) is the monthly benefit a worker receives when starting exactly at full retirement age. It comes from the AIME through the bend-point formula of the year the worker turns 62, is rounded down to the next dime, and then grows with every cost-of-living adjustment from that year on, even if benefits have not started. The SSA's case B for 2026 shows the full chain: a worker born in ${B.born} with maximum earnings has an AIME of ${$(B.aime)}; the ${rb.eligibilityYear} formula (bend points ${$(bp21[0])} and ${$(bp21[1])}) gives ${$(raw, 2)}, truncated to ${$(rb.piaAtEligibility, 2)}; five COLAs of ${rb.colas.map((c) => `${c.pct}%`).join(', ')} take it to ${$(B.pia, 2)}, paid as ${$(B.benefit_fra)} at ${fraB.years} and ${fraB.months} months. Everything else is measured on the PIA: a spouse can get up to 50%, a widow or widower up to 100%, and the family as a whole no more than the family maximum.`,
    faqs: [
      { q: 'Is the PIA the amount I will actually be paid?', a: `Only if you start in the month you reach full retirement age. Starting at 62 with a full retirement age of 67 pays 70% of the PIA; waiting to 70 pays 124%. The PIA itself does not change with your start date, apart from the COLAs that are added every year from 62.` },
      { q: 'Why is my PIA in dimes but my check in whole dollars?', a: `The law rounds the PIA down to the next lower multiple of 10 cents, and each COLA result too (20 CFR 404.212). The monthly benefit derived from it is then rounded down to the dollar. Case A of the SSA has a PIA of ${$(A.pia, 2)} and a check of ${$(A.benefit62)} at 62.` },
      { q: 'Do COLAs raise my PIA if I have not claimed yet?', a: `Yes, from the year you turn 62. Case B turned 62 in ${rb.eligibilityYear} and only starts in 2026, at full retirement age, yet the PIA includes the five increases from ${rb.colas[0].year} to ${rb.colas[rb.colas.length - 1].year}. Waiting never makes you lose a cost-of-living adjustment.` },
      { q: 'How does my PIA set what my spouse can get?', a: `A spouse at their own full retirement age can receive up to half of your PIA, not of your actual check. With a PIA of ${$(pa, 2)} that is ${$(Math.floor(sp.fullSpousal))}. If the spouse starts earlier, that amount is reduced; if you delayed to 70, your delayed credits do not raise the spouse benefit.` },
      { q: 'What can change my PIA after I retire?', a: `Three things: each December's COLA; an automatic recomputation if a new year of earnings beats one of your 35 best (20 CFR 404.285); and a correction of your earnings record, within the time limits of the rules. Starting earlier or later changes the check, not the PIA.` },
    ],
    body: (h) => {
      const steps = rb.colas.map((c, i) => [String(c.year), `${c.pct}%`, h.usd(i === 0 ? rb.piaAtEligibility : rb.colas[i - 1].pia, 2), h.usd((i === 0 ? rb.piaAtEligibility : rb.colas[i - 1].pia) * (1 + c.pct / 100), 3), h.usd(c.pia, 2)]);
      const derived = [
        ['Worker at full retirement age', '100% of PIA', h.usd(benefitAtAge(pa, 804, 804).benefit)],
        ['Worker at 62 (FRA 67)', '70%', h.usd(benefitAtAge(pa, 744, 804).benefit)],
        ['Worker at 70', '124%', h.usd(benefitAtAge(pa, 840, 804).benefit)],
        ['Spouse at full retirement age', '50%', h.usd(Math.floor(sp.fullSpousal))],
        ['Widow(er) at full retirement age', '100%', h.usd(sv.benefit)],
        ['Child of a retired worker', `${P.family.child_of_retired * 100}%`, h.usd(Math.floor(pa * P.family.child_of_retired))],
        ['Child of a deceased worker', `${P.family.child_survivor * 100}%`, h.usd(Math.floor(pa * P.family.child_survivor))],
        ['Family maximum (2026 formula)', h.pct(fam / pa), h.usd(fam, 2)],
      ];
      return `
<h2>Case B, from AIME to check</h2>
<p>The SSA's ${h.src('ssaPiaExample', 'case B')} is a worker born in ${B.born} who earned at or above the taxable maximum every year from 1986 through 2025. That makes ${rb.eligibilityYear} the year of eligibility, so the formula is the ${rb.eligibilityYear} one, whatever the year of retirement.</p>
<ol>
<li>90% of the first ${h.usd(bp21[0])} of AIME: ${h.usd(rb.parts[0], 2)}.</li>
<li>32% of the AIME between ${h.usd(bp21[0])} and ${h.usd(bp21[1])}: ${h.usd(rb.parts[1], 2)}.</li>
<li>15% of the AIME above ${h.usd(bp21[1])}, here ${h.usd(B.aime - bp21[1])}: ${h.usd(rb.parts[2], 2)}.</li>
<li>Total ${h.usd(raw, 2)}, truncated to the dime: <strong>${h.usd(rb.piaAtEligibility, 2)}</strong>.</li>
</ol>
<p>Then come the cost-of-living adjustments. Each one multiplies the PIA of the previous step, and the product is cut to the dime before the next one is applied.</p>
${h.table(['COLA effective December', 'Rate', 'PIA before', 'Exact product', 'PIA after (to the dime)'], steps, `Case B, born ${B.born}: COLAs applied from the year of eligibility`, ['l', 'r', 'r', 'r', 'r'])}
<p>The final PIA is ${h.usd(B.pia, 2)}. Case B starts at full retirement age, ${fraB.years} and ${fraB.months} months, so no reduction applies and the check is the PIA cut to the dollar: ${h.usd(B.benefit_fra)}. Had the same worker waited two more months, to 67, delayed credits would have raised it to ${h.usd(benefitAtAge(B.pia, 804, fraB.total).benefit)}, the amount in the SSA's maximum-benefit table.</p>

<h2>Why the dime matters</h2>
<p>Truncating instead of rounding costs less than ten cents a month at each step. Over five COLAs the losses compound a little, which is why our engine and the SSA apply the cut at every step rather than once at the end: compute the five rates in one go on ${h.usd(rb.piaAtEligibility, 2)} and you get ${h.usd(rb.colas.reduce((x, c) => x * (1 + c.pct / 100), rb.piaAtEligibility), 2)}, a little more than the official ${h.usd(B.pia, 2)}. The rounding rule is in ${h.src('cfr404_212', '20 CFR 404.212')}.</p>

<h2>One PIA, eight amounts</h2>
<p>Take the SSA's case A PIA for 2026, ${h.usd(pa, 2)}, for a worker whose full retirement age is 67. Every benefit on that record is read off it:</p>
${h.table(['Benefit', 'Share of the PIA', 'Monthly amount'], derived, `PIA of ${h.usd(pa, 2)} (SSA case A, 2026), before any COLA`, ['l', 'r', 'r'])}
<p>The spouse and child amounts are maximums before the family cap. When a spouse and two children all claim on the same record, their combined benefits are reduced proportionally so the total, with the worker, stays within ${h.usd(fam, 2)}, the ${h.src('cfr404_403', 'family maximum')} for a PIA of that size. The ${h.a('family-maximum', 'family maximum page')} details the formula. A divorced spouse is paid outside that cap.</p>

<h2>What the PIA is not</h2>
<p>It is not your check if you start early or late: the ${h.a('claiming-at-62', 'reduction at 62')} and the ${h.a('claiming-at-70', 'credits up to 70')} apply to it, not to the AIME. It is not reset by later bend points: someone eligible in ${rb.eligibilityYear} keeps the ${rb.eligibilityYear} formula even when claiming in 2026, as case B shows. And it is not fixed forever: each year's ${h.a('cola-2026', 'COLA')} and any recomputation for new earnings raise it.</p>

<h2>Same career, different year of 62</h2>
<p>Two workers with identical careers relative to the national average wage can have different PIAs in 2026 simply because they turned 62 in different years. The table follows a steady ${h.usd(60000)} career in today's pay, from 22 to 62, for several birth years. The older cohorts have an older formula but more COLAs on top.</p>
${h.table(['Born', 'Turned 62', 'PIA at 62', 'COLAs added', 'PIA in 2026'], [1958, 1960, 1962, 1963, 1964].map((y) => { const b = { y, m: 6, d: 15 }; const r = computePia(b, projectCareer(b, 60000, 22, 62)); return [String(y), String(r.eligibilityYear), h.usd(r.piaAtEligibility, 2), String(r.colas.length), h.usd(r.pia, 2)]; }), 'Steady career at $60,000 in today\'s pay, PIA before and after cost-of-living adjustments', ['l', 'l', 'r', 'r', 'r'])}
<p>The gaps are small because the wage index moves the bend points and the indexed earnings together, while the COLAs follow prices. When prices outpace wages, the COLAs favor those already eligible; when wages outpace prices, the newer formula favors those turning 62 later.</p>

<h2>Finding your own PIA</h2>
<p>Your Social Security statement shows an estimated benefit at full retirement age, which is a PIA cut to the dollar. To rebuild it, start from your ${h.a('aime', 'AIME')}, apply the ${h.a('bend-points', 'bend points')} of the year you turn 62, round down to the dime, then add the COLAs from that year. The ${h.a('benefits-calculator', 'calculator')} does all of it from your earnings record. If you turn 62 after 2026, the figure is an estimate in today's dollars, since your own bend points are not published yet.</p>`;
    },
  },
});
