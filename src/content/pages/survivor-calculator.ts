import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { survivorBenefit, benefitAtAge, fraRetirement, fraSurvivor } from '../../lib/engine/ss';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pc = (x: number) => `${Math.round(x * 1000) / 10}%`;
const DFRA = fraRetirement(1962).total;
const SFRA = fraSurvivor(1964).total;
const D = 2500, OWN = 1800;
const S62 = 62 * 12 + 1, A60 = P.reduction.widow_earliest_age * 12;
const sv = (dc: number | null, sc: number) => survivorBenefit({ deceasedPia: D, deceasedClaimMonths: dc, deceasedFraMonths: DFRA, survivorClaimMonths: sc, survivorFraMonths: SFRA });
const at60 = sv(null, A60), full = sv(null, SFRA), early = sv(S62, SFRA), late = sv(70 * 12, SFRA), early60 = sv(S62, A60);
const deadEarly = benefitAtAge(D, S62, DFRA).benefit;
const own70 = benefitAtAge(OWN, 70 * 12, fraRetirement(1964).total).benefit, own62 = benefitAtAge(OWN, S62, fraRetirement(1964).total).benefit;
const F = P.family;

export default definePage({
  id: 'survivor-calculator',
  group: 'tools',
  order: 50,
  tool: 'survivor',
  related: ['surviving-divorced-spouse', 'spousal-calculator', 'when-to-claim', 'claiming-at-70', 'inherited-ira', 'irmaa'],
  sources: ['cfr404_410', 'poms615320', 'cfr404_335', 'ssaSurvivor', 'pomsDeemed', 'ssaWhileWorking'],
  en: {
    slug: 'survivor-benefits-calculator',
    nav: 'Survivor benefits',
    card: `From ${pc(1 - P.reduction.widow_max)} of the deceased's benefit at 60 to 100% at survivor full retirement age, with the ${pc(F.widow_limit)} floor.`,
    title: `Social Security Survivor Benefits 2026: ${pc(1 - P.reduction.widow_max)} at Age 60`,
    description: `Social Security survivor benefits in 2026: ${pc(1 - P.reduction.widow_max)} of the deceased's benefit at 60, 100% at survivor full retirement age, ${pc(F.widow_limit)} floor if they claimed early.`,
    h1: 'Social Security survivor benefits calculator for widows and widowers',
    intro: `Enter the PIA of the spouse who died, when they started, and when you want to start: the tool applies the age reduction and the ${pc(F.widow_limit)} limit.`,
    resume: `A widow or widower can receive up to 100% of what the deceased spouse was entitled to, from age ${P.reduction.widow_earliest_age} (50 if disabled). At ${P.reduction.widow_earliest_age} the benefit is ${pc(1 - P.reduction.widow_max)} of that amount; the ${pc(P.reduction.widow_max)} cut shrinks month by month and disappears at the survivor full retirement age, 67 for survivors born in 1962 or later. With a deceased PIA of ${$(D)}, that is ${$(at60.benefit)} at 60 and ${$(full.benefit)} at 67. If the deceased had waited to 70, the survivor inherits the delayed credits: ${$(late.benefit)}. If the deceased had started at 62, the RIB-LIM rule caps the survivor at the larger of the deceased's reduced check, ${$(deadEarly)}, or ${pc(F.widow_limit)} of the PIA: ${$(early.benefit)}. The marriage must have lasted ${F.widow_marriage_months} months, remarrying after ${F.widow_remarriage_age} keeps the benefit, and because deemed filing does not apply to survivor benefits, you can start one benefit and switch to the other later.`,
    faqs: [
      { q: 'My husband claimed at 62 and died at 66. Am I stuck with his reduced check?', a: `Not entirely. Under POMS RS 00615.320 your widow benefit is limited to the larger of his reduced benefit or ${pc(F.widow_limit)} of his PIA. With a PIA of ${$(D)} and a start at 62, he received ${$(deadEarly)}; you can receive ${$(early.benefit)} at your survivor full retirement age. Starting earlier lowers it further, to ${$(early60.benefit)} at 60.` },
      { q: 'Can I take the widow benefit now and my own retirement at 70?', a: `Yes. Deemed filing does not apply to survivor benefits (POMS GN 00204.035), so you can restrict the application to one benefit. With a ${$(D)} deceased PIA and an own PIA of ${$(OWN)}, you could collect ${$(at60.benefit)} from 60, then switch to your own ${$(own70)} at 70 if that is higher.` },
      { q: 'We were married eight months when he died. Is there a survivor benefit?', a: `Usually the marriage must have lasted at least ${F.widow_marriage_months} months before the death (20 CFR 404.335). The regulation lists exceptions: among them an accidental death, a death in the line of military duty, or being the parent of the deceased's child. Check them with the SSA before giving up.` },
      { q: 'I am 63 and plan to remarry. Will I lose my survivor benefit?', a: `No. A remarriage after age ${F.widow_remarriage_age} does not end widow or widower benefits. A remarriage before ${F.widow_remarriage_age} ends them, except for disabled survivors who remarry between 50 and 60. If the new spouse has a larger record, a spouse benefit on that record may later become the better choice.` },
      { q: 'Does the earnings test use my survivor full retirement age?', a: `No. The SSA applies the annual earnings test to survivor benefits using your full retirement age for retirement benefits, even when the survivor age is earlier and even if you never claim retirement benefits. In 2026 that means $1 withheld per $2 earned above ${$(P.earnings_test.lower_annual)} until the year you reach the retirement age.` },
    ],
    body: (h) => {
      const ages = [60, 61, 62, 63, 64, 65, 66, 67].map((a) => a * 12);
      const rows = ages.map((a) => [String(a / 12), h.usd(sv(null, a).benefit), h.usd(sv(S62, a).benefit), h.usd(sv(70 * 12, a).benefit)]);
      return `
<h2>Your start age against what the deceased did</h2>
${h.table(['Survivor starts at', 'Deceased had not started', 'Deceased started at 62', 'Deceased started at 70'], rows, `Deceased PIA ${h.usd(D)}, survivor born in 1964 (survivor full retirement age 67)`, ['l', 'r', 'r', 'r'])}
<p>The reduction for age follows ${h.src('cfr404_410', '20 CFR 404.410(c)')}: ${h.pct(P.reduction.widow_max)} spread evenly over the months from 60 to survivor full retirement age. For a survivor born in 1964 that is ${SFRA - A60} months, so each month earlier costs about ${h.pct(P.reduction.widow_max / (SFRA - A60), 2)} of the benefit. The middle column shows the RIB-LIM at work: from about 62 on, the reduced survivor amount would exceed ${h.pct(F.widow_limit)} of the PIA, so the cap holds it at ${h.usd(early.benefit)}.</p>

<h2>The ${h.pct(F.widow_limit)} floor, explained</h2>
<p>When a worker started early, the reduced check becomes the base for the survivor, but never below ${h.pct(F.widow_limit)} of the worker's PIA. The ${h.src('poms615320', 'POMS rule RS 00615.320')} states it as a limit: the widow benefit cannot exceed the larger of the deceased's reduced benefit or ${h.pct(F.widow_limit)} of the PIA. In practice it protects survivors of early claimants who start at or near full retirement age, and stops them from receiving the full 100% of a PIA the deceased never drew.</p>

<h2>Delayed credits pass to the survivor</h2>
<p>A worker who waited to 70 earned credits of 2/3 of 1% a month after full retirement age. Those credits are part of the benefit the survivor inherits: ${h.usd(late.benefit)} on a ${h.usd(D)} PIA, ${h.pct(late.benefit / D)} of it. This is the main reason the higher earner of a couple looks at 70: see the ${h.a('when-to-claim', 'break-even tool')} and ${h.a('claiming-at-70', 'waiting until 70')}.</p>

<h2>Switching between survivor and own benefits</h2>
<p>Retirement and spouse benefits are tied by ${h.src('pomsDeemed', 'deemed filing')}, but survivor benefits are not. A widow or widower who also has an own record can take one first and the other later. With an own PIA of ${h.usd(OWN)} and the ${h.usd(D)} record above, two orders are possible: the survivor benefit from 60, ${h.usd(at60.benefit)}, then the own benefit at 70, ${h.usd(own70)}; or the own benefit at 62, ${h.usd(own62)}, then the full survivor benefit at 67, ${h.usd(full.benefit)}. You are never paid both in full: when entitled to two, you receive the larger. The ${h.src('ssaSurvivor', 'SSA survivor page')} describes the switch.</p>

<h2>Two other bills the death changes</h2>
<p>The survivor benefit is rarely the only money question in the first year. The first tax return filed alone uses the single Medicare income bands, half the joint ones, so a widow with unchanged investment income can move up the ${h.a('irmaa', 'IRMAA scale')}; the death of a spouse is one of the events that lets the SSA use a newer, lower income. And an IRA left by the spouse can be rolled into the survivor's own IRA or kept as an inherited account, a choice explained on the ${h.a('inherited-ira', 'inherited IRA page')}.</p>

<h2>Conditions the tool assumes</h2>
<p>It treats you as a widow or widower married at least ${F.widow_marriage_months} months (${h.src('cfr404_335', '20 CFR 404.335')}), not remarried before ${F.widow_remarriage_age}, and not disabled. A former spouse married 10 years or more follows the rules on the ${h.a('surviving-divorced-spouse', 'surviving divorced spouse page')}. Children of the deceased receive their own benefits, usually ${h.pct(F.child_survivor, 0)} of the PIA each, within the ${h.a('family-maximum', 'family maximum')}. A lump-sum death payment of ${h.usd(F.lump_sum_death)} also goes to a spouse or to certain children.</p>`;
    },
  },
});
