import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { familyMaximum } from '../../lib/engine/ss';

const F = P.family;
const bp = bendPoints(2026);
const [r1, r2, r3, r4] = P.family_max.factors;
const pc = (x: number) => `${Math.round(x * 100)}%`;
const PIA = 2400;
const FM = familyMaximum(PIA);
const POOL = FM - PIA;
const RET_EACH = POOL / 3;
const SURV_EACH = FM / 3;
const PEAK = familyMaximum(bp[3]) / bp[3];
const peakPc = `${Math.floor(PEAK * 100)}%`;
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export default definePage({
  id: 'family-maximum',
  group: 'family',
  order: 30,
  mini: 'famMaxCap',
  related: ['pia', 'divorced-spouse', 'married-couples', 'bend-points', 'surviving-divorced-spouse'],
  sources: ['cfr404_403', 'cfr404_404', 'frNotice2026', 'ssaBendPoints', 'ssaSurvivor', 'ssaAbroadPub'],
  en: {
    slug: 'social-security-family-maximum',
    nav: 'Family maximum',
    card: `Between ${pc(r1)} and ${peakPc} of the worker's PIA: the cap on everything a spouse and children can draw from one record, with 2026 bend points of ${$(bp[2])}, ${$(bp[3])} and ${$(bp[4])}.`,
    title: `Social Security Family Maximum 2026: ${pc(r1)} to ${peakPc} of PIA`,
    description: `Social Security family maximum 2026: ${pc(r1)}, ${pc(r2)}, ${pc(r3)} and ${pc(r4)} of the PIA split at ${$(bp[2])}, ${$(bp[3])} and ${$(bp[4])}, and how spouse and child checks get cut.`,
    h1: 'The family maximum: how much one record can pay a household',
    intro: 'A worker\'s record can support a spouse and several children, but only up to a ceiling computed from the worker\'s own PIA.',
    resume: `The family maximum caps the total monthly benefits paid on one worker's record to the worker, a spouse and children. For a worker who turns 62, becomes disabled or dies in 2026, it equals ${pc(r1)} of the first ${$(bp[2])} of the PIA, plus ${pc(r2)} of the PIA between ${$(bp[2])} and ${$(bp[3])}, plus ${pc(r3)} between ${$(bp[3])} and ${$(bp[4])}, plus ${pc(r4)} above ${$(bp[4])}, rounded down to the dime (20 CFR 404.403, Federal Register notice of November 3, 2025). A PIA of ${$(PIA)} gives a family maximum of ${$(FM, 2)}. While the worker is alive, the worker's own PIA counts first, leaving ${$(POOL, 2)} for dependents: a spouse and two children who would each receive ${pc(F.child_of_retired)} of the PIA, ${$(PIA * F.child_of_retired)}, get ${$(RET_EACH, 2)} each instead. After the worker's death, the whole ${$(FM, 2)} is shared by survivors, so three surviving children rated at ${pc(F.child_survivor)} are cut to ${$(SURV_EACH, 2)} each. Divorced spouses are paid outside the cap.`,
    faqs: [
      { q: 'Does the family maximum ever reduce the retired worker\'s own check?', a: `No. 20 CFR 404.404 reduces every benefit on the record except the one paid to the worker entitled to old-age or disability benefits. The worker's PIA is counted inside the total, which is why it eats into the room left for the family, but the worker's own monthly amount is never cut to make the family fit.` },
      { q: 'My oldest child turns 18 next month. Will my other kids get more?', a: `Possibly. The reduction is recomputed whenever the number of people entitled on the record changes. With one beneficiary fewer, the same family maximum is divided among fewer people, so each remaining share rises, up to its own full rate of ${pc(F.child_of_retired)} of the PIA (${pc(F.child_survivor)} after the worker's death). If the family was below the cap already, nothing changes.` },
      { q: 'Why is the family maximum a bigger share of the PIA for middle earners?', a: `Because of the ${pc(r2)} bracket. A PIA up to ${$(bp[2])} gives exactly ${pc(r1)}; the share then climbs to a peak at ${$(bp[3])}, where it reaches ${peakPc}, and falls back toward ${pc(r4)} for large PIAs. A family on a ${$(bp[3])} record can draw more relative to the PIA than a family on a ${$(4000)} record.` },
      { q: 'Is a divorced spouse counted when the SSA applies the family maximum?', a: `No. Under 20 CFR 404.403(a)(3), a divorced spouse or surviving divorced spouse is not reduced for the maximum, and everyone else's benefit is computed as if that person were not entitled. A current spouse and children therefore lose nothing when a former spouse claims on the same record, and the former spouse loses nothing because the family is large.` },
      { q: 'Which year\'s bend points set my family maximum?', a: `The year you first became eligible: the year you turn 62, become disabled or die, whichever comes first (20 CFR 404.403(a)(2)). Someone who turned 62 in 2023 keeps the 2023 family bend points, ${$(bendPoints(2023)[2])}, ${$(bendPoints(2023)[3])} and ${$(bendPoints(2023)[4])}, and the cap then rises with cost-of-living adjustments like the PIA.` },
    ],
    body: (h) => {
      const pias = [1000, bp[2], 2000, bp[3], 2800, bp[4], 3500, 4000];
      const rowsPia = pias.map((p) => { const fm = familyMaximum(p); return [h.usd(p), h.usd(fm, 2), h.pct(fm / p), h.usd(Math.max(0, fm - p), 2)]; });
      const years = [2020, 2022, 2023, 2024, 2025, 2026];
      const rowsYears = years.map((y) => { const b = bendPoints(y); return [String(y), h.usd(b[2]), h.usd(b[3]), h.usd(b[4]), h.usd(familyMaximum(PIA, y), 2)]; });
      const parts = [r1 * Math.min(PIA, bp[2]), r2 * Math.max(0, Math.min(PIA, bp[3]) - bp[2]), r3 * Math.max(0, Math.min(PIA, bp[4]) - bp[3]), r4 * Math.max(0, PIA - bp[4])];
      const famRows = [1, 2, 3, 4].map((n) => {
        const fullR = PIA * F.child_of_retired, fullS = PIA * F.child_survivor;
        const eachR = Math.min(fullR, POOL / n), eachS = Math.min(fullS, FM / n);
        return [String(n), h.usd(fullR * n), h.usd(eachR, 2), h.usd(fullS * n), h.usd(eachS, 2)];
      });
      return `
<h2>The 2026 formula, bracket by bracket</h2>
<p>The family maximum is a second formula applied to the PIA, built like the PIA formula itself. It has three bend points instead of two, and they move every year with the national average wage index. For 2026 they are ${h.usd(bp[2])}, ${h.usd(bp[3])} and ${h.usd(bp[4])}, published in the ${h.src('frNotice2026', 'Federal Register notice of November 3, 2025')} and listed with earlier years in the ${h.src('ssaBendPoints', 'SSA actuaries\' table')}. The rates come from ${h.src('cfr404_403', '20 CFR 404.403')}.</p>
<ul>
<li>${pc(r1)} of the PIA up to ${h.usd(bp[2])}</li>
<li>${pc(r2)} of the PIA between ${h.usd(bp[2])} and ${h.usd(bp[3])}</li>
<li>${pc(r3)} of the PIA between ${h.usd(bp[3])} and ${h.usd(bp[4])}</li>
<li>${pc(r4)} of the PIA above ${h.usd(bp[4])}</li>
</ul>
<p>The total is rounded down to the next lower dime. For a PIA of ${h.usd(PIA)}: ${h.usd(parts[0], 2)} from the first bracket, ${h.usd(parts[1], 2)} from the second and ${h.usd(parts[2], 2)} from the third, nothing from the fourth, for ${h.usd(FM, 2)}.</p>
${h.table(['Worker\'s PIA', 'Family maximum', 'As a share of PIA', 'Room above the PIA'], rowsPia, 'Family maximum for a worker first eligible in 2026', ['l', 'r', 'r', 'r'])}
<p>The share peaks around the second bend point. Below ${h.usd(bp[2])} a family can never draw more than half again the PIA, so a low-wage worker with a spouse and children quickly reaches the cap. Middle records leave the most room relative to the PIA. Above ${h.usd(bp[4])} each extra dollar of PIA adds ${h.usd(r4, 2)} of family maximum.</p>

<h2>Who gets what before the cap: 50% and 75%</h2>
<p>Each dependent has a full rate, the amount they would get if the record were not capped. While the worker is alive and drawing retirement benefits, a spouse and each eligible child are rated at ${pc(F.spouse_max)} of the worker's PIA. After the worker's death, each child is rated at ${pc(F.child_survivor)}, and a widow or widower at full retirement age at 100% (${h.src('ssaSurvivor', 'SSA survivor benefits table')}). The higher survivor rates explain why survivor families hit the cap more often than retired ones.</p>
<p>Children generally qualify while unmarried and under 18. Payments continue past 18 for a full-time student in elementary or secondary school, and for a child with a disability that began before 22, as the ${h.src('ssaAbroadPub', 'SSA publication 05-10137')} summarizes. A spouse caring for the worker's child under 16 or disabled can be paid at any age; otherwise a spouse qualifies from 62.</p>

<h2>How the SSA shares the cut</h2>
<p>When the full rates add up to more than the family maximum, ${h.src('cfr404_404', '20 CFR 404.404')} reduces each dependent's benefit in the same proportion, so the total equals the maximum. The retired or disabled worker's own benefit is never reduced, but an amount equal to the worker's PIA is counted inside the total. In a survivor family there is no living worker, so the whole maximum is available to the survivors.</p>
${h.table(['Dependents', 'Full rates, worker alive', 'Each, worker alive', 'Full rates, children after death', 'Each, after death'], famRows, `Worker's PIA ${h.usd(PIA)}, family maximum ${h.usd(FM, 2)}; before any reduction for age`, ['l', 'r', 'r', 'r', 'r'])}
<p>With one dependent, nobody is capped: ${h.usd(PIA * F.child_of_retired)} fits easily within ${h.usd(POOL, 2)} of room. With three, the alive-worker case gives each ${h.usd(RET_EACH, 2)} instead of ${h.usd(PIA * F.child_of_retired)}. After the worker's death, three surviving children rated at ${h.usd(PIA * F.child_survivor)} each would need ${h.usd(PIA * F.child_survivor * 3)}, and are cut to ${h.usd(SURV_EACH, 2)} each.</p>
<p>Reductions for age are a separate step listed next to the family maximum in 20 CFR 404.304. A spouse who starts at 62 while two children are also entitled can therefore see both: a share cut to fit the cap, and the early-claiming reduction that applies to anyone who starts before full retirement age.</p>

<h2>When a child leaves, the others move up</h2>
<p>The division is redone each time someone enters or leaves the family. A child turning 18 who is not a student drops out; the same maximum is then split among fewer people, and each remaining dependent rises toward the full rate. In the survivor example above, when one of the three children leaves, the two who remain share ${h.usd(FM, 2)} between them. Half of it would exceed their full rate, so each simply receives ${h.usd(PIA * F.child_survivor)}, and the cap stops binding.</p>

<h2>The year that fixes your family bend points</h2>
<p>The family maximum formula is the one of the year of first eligibility: the year the worker turns 62, becomes disabled or dies, whichever comes first, as paragraph (a)(2) of 404.403 specifies. Later years only add cost-of-living adjustments. A PIA of ${h.usd(PIA)} under each recent formula:</p>
${h.table(['Formula year', 'First bend point', 'Second', 'Third', `Family maximum for a ${h.usd(PIA)} PIA`], rowsYears, 'Family maximum bend points by year of eligibility, before COLAs', ['l', 'r', 'r', 'r', 'r'])}

<h2>Former spouses sit outside the ceiling</h2>
<p>Paragraph (a)(3) of 404.403 takes divorced spouses and surviving divorced spouses out of the computation altogether. They are paid their own full amount, and the current family is computed as if they did not exist. A worker with a former spouse married ten years, a current spouse and two children therefore supports four people with only three of them sharing the cap. The ${h.a('divorced-spouse', 'divorced spouse page')} and the ${h.a('surviving-divorced-spouse', 'surviving divorced spouse page')} work through those amounts.</p>
<p>To compute the PIA that feeds this formula, start from the ${h.a('pia', 'primary insurance amount page')}; the ${h.a('bend-points', 'bend points page')} shows the other formula that uses the same wage index.</p>`;
    },
  },
});
