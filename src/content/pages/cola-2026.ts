import { definePage } from '../../lib/page-types';
import { P, cola } from '../../lib/engine/params';
import { floorDime, computePia, projectCareer, benefitAtAge } from '../../lib/engine/ss';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const C = P.cola_2026, X = P.extra.cola_calc;
const q24 = C.cpiw_q3_2024, q25 = C.cpiw_q3_2025;
const mean25 = (X.cpiw_2025.jul + X.cpiw_2025.aug + X.cpiw_2025.sep) / 3;
const rise = q25 / q24 - 1;
const avg = P.stats_aug_2026.retired_worker_avg;
const after = (p: number) => floorDime(p * (1 + C.pct / 100));
const partB = P.medicare.part_b_2026 - P.medicare.part_b_2025;
const zeroYears = Object.entries(P.series.cola).filter(([, v]) => v === 0).map(([y]) => Number(y));

export default definePage({
  id: 'cola-2026',
  group: 'formula',
  order: 50,
  mini: 'colaRaise',
  related: ['pia', 'medicare-part-b', 'average-benefit', 'born-1964', 'benefits-calculator'],
  sources: ['frNotice2026', 'ssaColaSeries', 'cmsPartB', 'ssaSnapshot'],
  en: {
    slug: 'social-security-cola',
    nav: 'COLA 2026',
    card: `${C.pct}% from January 2026, computed from the CPI-W of July to September. Who gets it, how it is rounded, and the record since 1975.`,
    title: `Social Security COLA 2026: ${C.pct}%, How It Was Computed`,
    description: `The 2026 Social Security COLA is ${C.pct}%: CPI-W third-quarter average ${q24} in 2024 to ${q25} in 2025. Who receives it, the rounding, and every COLA since 1975.`,
    h1: `The ${C.pct}% cost-of-living adjustment for 2026`,
    intro: 'A rise in one price index between two summers, rounded to a tenth, becomes a raise for every beneficiary on the rolls.',
    resume: `Social Security benefits rose by ${C.pct}% for the month of December 2025, the first payment at the new rate arriving in January 2026. The increase comes from the consumer price index for urban wage earners and clerical workers (CPI-W): its average for July, August and September 2025 was ${q25}, against ${q24} for the same quarter of 2024, a rise of ${(rise * 100).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}% that the law rounds to the nearest tenth, ${C.pct}%. It applies to everyone eligible for December 2025 benefits, which for retirement means anyone who turned 62 in 2025 or earlier, whether or not they had started collecting. People turning 62 in 2026 get their first COLA in December 2026. The increase is applied to the PIA and rounded down to the dime: a ${$(2000)} PIA becomes ${$(after(2000), 2)}. On the average retired-worker benefit of ${$(avg, 2)} in August 2026, the raise was worth roughly ${$(avg - avg / (1 + C.pct / 100))} a month, while the Medicare Part B premium rose ${$(partB, 2)} the same January.`,
    faqs: [
      { q: 'I turn 62 in 2026. Do I miss the 2.8% raise for good?', a: `In a sense, yes: COLAs start in the year you turn 62, so the ${C.pct}% effective December 2025 is not part of your PIA. Your formula year is 2026, though, and its bend points were raised with wages instead. Your first COLA is the one effective December 2026, added even if you wait to claim.` },
      { q: 'Why is the COLA based on the CPI-W and not the CPI for older people?', a: `Because when automatic increases began in 1975, the CPI for urban wage earners and clerical workers was the only consumer price index. The SSA's 2026 notice explains that it follows that precedent, even though the Bureau of Labor Statistics has since built other indexes, and uses the CPI-W for every computation.` },
      { q: 'Can the COLA ever be negative?', a: `No. A COLA is paid only when the third-quarter CPI-W average is higher than in the last quarter that produced an increase. When prices do not rise, the COLA is zero and benefits stay where they are, as happened for ${zeroYears.map((y) => `December ${y}`).join(', ')}.` },
      { q: 'When will the 2027 COLA be known?', a: `It depends on the CPI-W for July, August and September 2026, compared with the ${q25} average of 2025. The SSA must publish it in the Federal Register by November 1; the 2026 notice appeared on November 3, 2025. We do not forecast it: this page will show the official figure once published.` },
      { q: 'Does the COLA apply to my spouse and survivor benefits too?', a: `Yes. Spouse, survivor and child benefits are fractions of the worker's PIA, so they rise when the PIA rises. Supplemental Security Income rose by the same ${C.pct}%, with the new federal amounts paid from the check dated December 31, 2025.` },
    ],
    body: (h) => {
      const hist = Object.keys(P.series.cola).map(Number).filter((y) => y >= 2005).sort((a, b) => b - a).map((y) => [`December ${y}`, `January ${y + 1}`, h.pct(cola(y) / 100)]);
      const b62 = { y: 1963, m: 6, d: 15 }, b26 = { y: 1964, m: 6, d: 15 };
      const r63 = computePia(b62, projectCareer(b62, 60000, 22, 62)), r64 = computePia(b26, projectCareer(b26, 60000, 22, 62));
      const examples = [1000, 1500, 2000, 2500, 3000, 4000].map((p) => [h.usd(p, 2), h.usd(after(p), 2), h.usd(after(p) - p, 2), h.usd(Math.floor(after(p)))]);
      return `
<h2>The computation, number by number</h2>
<p>The ${h.src('frNotice2026', 'SSA notice of November 3, 2025')} gives the monthly CPI-W readings: ${X.cpiw_2025.jul} for July 2025, ${X.cpiw_2025.aug} for August and ${X.cpiw_2025.sep} for September. Their mean is ${h.num(mean25, 3)}. The previous computation quarter, the third quarter of 2024, averaged ${q24}.</p>
<ol>
<li>${q25} ÷ ${q24} = ${h.num(q25 / q24, 5)}.</li>
<li>Increase: ${h.num(rise * 100, 3)}%.</li>
<li>Rounded to the nearest tenth of a percent: <strong>${C.pct}%</strong>.</li>
</ol>
<p>One more test is written in the law. If the trust funds' reserves fell below ${X.fund_ratio_floor_pct}% of a year's cost, the COLA would be capped at the growth of the average wage. For 2025 the ratio was ${X.fund_ratio_2025_pct}%, so no cap applied.</p>

<h2>Who receives it</h2>
<p>The notice states the rule: benefits increase by ${C.pct}% "for individuals eligible for December 2025 benefits." Eligibility, not entitlement. For retirement, that covers:</p>
<ul>
<li>everyone already collecting in December 2025;</li>
<li>everyone who turned 62 in 2025 or earlier but has not claimed yet: the COLA is built into their PIA and will be there when they start;</li>
<li>spouses, survivors and children paid on those records, whose amounts follow the worker's PIA.</li>
</ul>
<p>Waiting does not forfeit anything. A person born in 1958 who turned 62 in 2020 and plans to claim at 70, in 2028, already carries the six increases from December 2020 to December 2025 in the PIA, ${h.pct([2020, 2021, 2022, 2023, 2024, 2025].reduce((x, y) => x * (1 + cola(y) / 100), 1) - 1)} combined before rounding, and the delayed credits are then computed on that larger figure.</p>
<p>It does not reach the PIA of someone who turns 62 in 2026. Compare two neighbors with the same steady ${h.usd(60000)} career: born in 1963, eligible in 2025, the PIA is ${h.usd(r63.piaAtEligibility, 2)} under the 2025 formula, raised to ${h.usd(r63.pia, 2)} by the COLA. Born in 1964, eligible in 2026, the PIA is ${h.usd(r64.pia, 2)} under the 2026 formula, with no COLA yet. The 2026 bend points moved with wages, so the gap is small. The ${h.a('born-1964', '1964 page')} has the full picture for that cohort.</p>

<h2>What ${C.pct}% does to a PIA</h2>
<p>The increase is applied to the PIA, the product is cut to the dime, and your check is then derived from the new PIA and cut to the dollar. That is why two people with close PIAs can see raises a few cents apart.</p>
${h.table(['PIA in December 2025 (before)', 'PIA from the increase', 'Monthly raise', 'Check at full retirement age'], examples, `Effect of the ${C.pct}% COLA, rounding down to the dime then to the dollar`, ['r', 'r', 'r', 'r'])}
<p>If you started early or late, your check is a fixed share of the PIA: it rises by about the same ${C.pct}%. A retiree who claimed at 62 with a full retirement age of 67 and a ${h.usd(2000)} PIA receives 70% of it: ${h.usd(benefitAtAge(after(2000), 744, 804).benefit)} a month after the increase instead of ${h.usd(benefitAtAge(2000, 744, 804).benefit)}.</p>

<h2>The Medicare premium takes part of it</h2>
<p>For people enrolled in Medicare Part B whose premium is deducted from the benefit, the ${h.src('cmsPartB', 'standard premium')} went from ${h.usd(P.medicare.part_b_2025, 2)} to ${h.usd(P.medicare.part_b_2026, 2)}, ${h.usd(partB, 2)} more. On a ${h.usd(1000)} PIA, the ${C.pct}% raise is ${h.usd(after(1000) - 1000, 2)}: the premium rise absorbs a large share of it. On ${h.usd(3000)}, the raise is ${h.usd(after(3000) - 3000, 2)} and most of it remains. The ${h.a('medicare-part-b', 'Medicare Part B page')} covers deductions in detail.</p>

<h2>Twenty years of COLAs</h2>
<p>The ${h.src('ssaColaSeries', 'SSA series')} starts in 1975, the first year of automatic adjustments. The more recent part shows how uneven the increases are:</p>
${h.table(['Effective for', 'First paid', 'COLA'], hist, 'Social Security cost-of-living adjustments, most recent first', ['l', 'l', 'r'])}
<p>The ${cola(2022)}% of December 2022 is the largest since ${Object.entries(P.series.cola).filter(([y, v]) => Number(y) < 2022 && v >= cola(2022)).map(([y]) => y).pop()}. Zero years, ${zeroYears.join(', ')}, followed quarters when the CPI-W did not exceed the level of the last increase. Over the five COLAs from December 2021 to December 2025, a PIA grew by ${h.pct([2021, 2022, 2023, 2024, 2025].reduce((x, y) => x * (1 + cola(y) / 100), 1) - 1)} before rounding.</p>

<h2>The next one</h2>
<p>The December 2026 adjustment will compare the CPI-W average for July to September 2026 with ${q25}. Nothing about it is known until the September 2026 index is out and the SSA announces the figure; the formal notice must appear in the Federal Register by November 1. This page does not forecast it and will show the published rate as soon as it is official.</p>`;
    },
  },
});
