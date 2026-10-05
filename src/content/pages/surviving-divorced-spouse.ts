import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { survivorBenefit, benefitAtAge, fraSurvivor, fraRetirement, fmtAge } from '../../lib/engine/ss';

const F = P.family;
const SFRA = fraSurvivor(1962).total;
const WFRA = fraRetirement(1960).total;
const PIA = 2400;
const surv = (deceasedClaim: number | null, start: number) =>
  survivorBenefit({ deceasedPia: PIA, deceasedClaimMonths: deceasedClaim, deceasedFraMonths: WFRA, survivorClaimMonths: start, survivorFraMonths: SFRA });
const at60 = surv(null, 720), atFra = surv(null, SFRA);
const rib = surv(62 * 12 + 1, SFRA), drc = surv(840, SFRA);
const OWN = 1700;
const own70 = benefitAtAge(OWN, 840, WFRA).benefit, own62 = benefitAtAge(OWN, 62 * 12 + 1, WFRA).benefit;
const perMonth = (P.reduction.widow_max / (SFRA - P.reduction.widow_earliest_age * 12)) * 100;
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export default definePage({
  id: 'surviving-divorced-spouse',
  group: 'family',
  order: 20,
  mini: 'famSurvivorDivorced',
  miniHref: 'survivor-calculator',
  related: ['survivor-calculator', 'divorced-spouse', 'family-maximum', 'claiming-at-70', 'married-couples'],
  sources: ['cfr404_336', 'cfr404_335', 'cfr404_410', 'poms615320', 'cfr404_403', 'ssaSurvivor'],
  en: {
    slug: 'surviving-divorced-spouse-benefits',
    nav: 'Surviving divorced spouse',
    card: 'After a ten-year marriage, a former spouse can collect up to the full benefit of the deceased ex, from 60, even after remarrying at 60 or later.',
    title: 'Surviving Divorced Spouse Benefits 2026: 71.5% to 100%',
    description: `Surviving divorced spouse benefits 2026: up to 100% of the late ex's benefit after a 10-year marriage, from 60 (50 if disabled), kept if you remarry after 60.`,
    h1: 'Survivor benefits for a divorced spouse',
    intro: 'The death of a former spouse can double what a divorce already paid, and the timing of your claim decides how much of it you keep.',
    resume: `A surviving divorced spouse is paid on the record of a former husband or wife who died fully insured, under the same scale as a widow or widower: from 71.5% of the deceased's benefit at 60 to 100% at survivor full retirement age, which is 67 for anyone born in 1962 or later. The conditions in 20 CFR 404.336 are a marriage of at least ${F.divorce_marriage_years} years before the divorce became final, an age of 60 or more (50 with a qualifying disability), no own retirement benefit equal to or above the ex's PIA, and being unmarried, except that a remarriage after 60 does not count against you. If the ex had a PIA of ${$(PIA)} and never claimed, the check is ${$(at60.benefit)} a month starting at 60 and ${$(atFra.benefit)} starting at 67. If the ex had started at 62, the RIB-LIM rule caps it at ${$(rib.benefit)}; if the ex waited until 70, it rises to ${$(drc.benefit)}. Like a living divorced spouse, a surviving one is paid outside the family maximum.`,
    faqs: [
      { q: 'I remarried at 61. Can I still collect on my first husband\'s record?', a: `Yes. Paragraph (e)(1) of 20 CFR 404.336 keeps the benefit for anyone who remarried after turning ${F.widow_remarriage_age}. A remarriage before 60 ends eligibility, unless you were already a disabled surviving divorced spouse and remarried after 50. The test looks at your age on the wedding date, not at the date you apply, so a marriage at 61 followed by a claim at 64 is fine.` },
      { q: 'How much less is a survivor check started at 60 instead of 67?', a: `For a survivor born in 1962 or later, ${(P.reduction.widow_max * 100).toFixed(1)}% less, spread evenly over the 84 months between 60 and 67: about ${perMonth.toFixed(3)}% per month early. On an ex's PIA of ${$(PIA)}, that is ${$(at60.benefit)} at 60 against ${$(atFra.benefit)} at 67. The reduction is permanent; it does not disappear when you reach 67.` },
      { q: 'My ex claimed at 62 and died at 75. Why is my survivor benefit not his full PIA?', a: `Because of the widow's limit known as RIB-LIM (POMS RS 00615.320). When the deceased had taken a reduced retirement benefit, the survivor benefit is capped at the larger of that reduced benefit or ${(F.widow_limit * 100).toFixed(1)}% of the PIA. With a PIA of ${$(PIA)} started at 62 and 1 month, the cap is ${$(rib.benefit)}, even if you wait until 67 to claim.` },
      { q: 'I already get a divorced spouse check. Do I have to reapply after my ex dies?', a: `Often not. Under 20 CFR 404.336(b)(1), someone entitled to a divorced spouse benefit in the month before the death is converted without a new application if they have reached full retirement age or receive no retirement or disability benefit of their own. Below that age and with your own benefit, a separate election of the reduced survivor benefit is required.` },
      { q: 'Can I take the survivor check first and my own retirement at 70?', a: `Yes, the two benefits can start at different times, and you are paid the larger one. With an own PIA of ${$(OWN)}, you could take ${$(at60.benefit)} as a survivor from 60, then switch to your own benefit at 70, which delayed credits raise to ${$(own70)}. The reverse order works too: your own ${$(own62)} at 62, then ${$(atFra.benefit)} as a survivor at 67.` },
    ],
    body: (h) => {
      const ages = [60, 61, 62, 63, 64, 65, 66, 67].map((a) => {
        const r = surv(null, a * 12);
        return [String(a), String(r.monthsEarly), h.pct(1 - r.reductionPct), h.usd(r.benefit)];
      });
      const exCases = [
        ['Had not started benefits', null],
        ['Started at 62 and 1 month', 62 * 12 + 1],
        ['Started at 67', 67 * 12],
        ['Started at 70', 840],
      ] as Array<[string, number | null]>;
      const caseRows = exCases.map(([label, m]) => {
        const r60 = surv(m, 720), r67 = surv(m, SFRA);
        return [label, h.usd(r60.benefit), h.usd(r67.benefit), r67.limited ? `capped at ${h.usd(r67.limit as number)}` : 'no cap'];
      });
      const sfraRows = [1957, 1958, 1959, 1960, 1961, 1962].map((y) => {
        const s = fraSurvivor(y), age = fmtAge(s.total), months = s.total - 720;
        return [String(y), `${age.years} and ${age.months} months`.replace(' and 0 months', ''), String(months), `${(P.reduction.widow_max / months * 100).toFixed(3)}%`];
      });
      return `
<h2>From divorced spouse to surviving divorced spouse</h2>
<p>While a former spouse is alive, the most their record can pay you is half of their PIA. Their death changes the reference point: the survivor benefit is computed on the full amount, up to 100%. That is why the same ten-year marriage that brought ${h.usd(PIA * F.spouse_max)} a month at full retirement age on a ${h.usd(PIA)} record can bring ${h.usd(atFra.benefit)} once the ex has died. The rule is written in ${h.src('cfr404_336', '20 CFR 404.336')} for divorced survivors; the amounts follow the widow and widower rules of ${h.src('cfr404_335', '20 CFR 404.335')} and the reductions of ${h.src('cfr404_410', '20 CFR 404.410')}.</p>
<p>The deceased must have been fully insured, which for a retirement-age worker usually means 40 credits. The ${h.a('divorced-spouse', 'divorced spouse page')} covers the living-ex case; this one starts on the day of death.</p>

<h2>Who qualifies: the five tests of 404.336</h2>
<ul>
<li><strong>Marriage length.</strong> A valid marriage of at least ${F.divorce_marriage_years} years immediately before the divorce became final. The nine-month duration rule for widows does not apply here; the ten-year test replaces it.</li>
<li><strong>Age.</strong> At least 60. Between 50 and 59 you can qualify only with a disability that began no later than seven years after the death (or after a previous survivor entitlement ended) and lasted through a five-month waiting period.</li>
<li><strong>Application.</strong> Required, except in the conversion cases described below.</li>
<li><strong>No larger own benefit.</strong> You are excluded if you are entitled to an old-age benefit equal to or larger than the deceased's PIA.</li>
<li><strong>Marital status.</strong> You must be unmarried, unless you remarried after 60, or remarried after 50 while entitled as a disabled survivor.</li>
</ul>
<p>The remarriage exception is the detail people most often miss. A widow who remarries at 58 loses the right; one who waits until after her sixtieth birthday keeps it.</p>

<h2>The age scale, month by month</h2>
<p>A survivor benefit started at 60 is ${h.pct(1 - P.reduction.widow_max)} of the full amount. The ${(P.reduction.widow_max * 100).toFixed(1)}% gap is spread evenly over the months between 60 and survivor full retirement age, which for people born in 1962 or later is 67. For a deceased ex with a PIA of ${h.usd(PIA)} who had not claimed:</p>
${h.table(['Survivor starts at', 'Months early', 'Share kept', 'Monthly benefit'], ages, `Deceased ex's PIA ${h.usd(PIA)}; survivor born 1962 or later`, ['l', 'r', 'r', 'r'])}
<p>Survivor full retirement age runs two years behind the retirement table, so older survivors reach it sooner and spread the same ${(P.reduction.widow_max * 100).toFixed(1)}% over fewer months:</p>
${h.table(['Survivor born in', 'Survivor full retirement age', 'Months from 60', 'Cut per month early'], sfraRows, 'Survivor full retirement age, 20 CFR 404.409(b)', ['l', 'l', 'r', 'r'])}

<h2>What the ex did with their own claim matters</h2>
<p>The base of a survivor benefit is not always the PIA. If the deceased had earned delayed retirement credits, the base is the larger benefit they were receiving. If the deceased had started early, a cap applies: the ${h.src('poms615320', 'RIB-LIM rule in POMS RS 00615.320')} limits the survivor to the larger of the deceased's reduced benefit or ${(F.widow_limit * 100).toFixed(1)}% of the PIA. Same ${h.usd(PIA)} PIA, four histories:</p>
${h.table(['The ex', 'Survivor at 60', 'Survivor at 67', 'RIB-LIM'], caseRows, 'Survivor born 1962 or later, ex born 1960 or later', ['l', 'r', 'r', 'l'])}
<p>The cap only binds above a certain age. A survivor who starts at 60 receives ${h.usd(surv(62 * 12 + 1, 720).benefit)} in the early-claimer case, already below the cap of ${h.usd(rib.limit as number)}, so the ex's early start costs nothing at that age. A survivor who waits until 67 hits the cap and gets ${h.usd(rib.benefit)} instead of ${h.usd(atFra.benefit)}. The opposite history, an ex who waited until 70, lifts the survivor to ${h.usd(drc.benefit)} at 67. You cannot change the ex's decisions after a divorce, but you can read them before choosing your own start month. The ${h.a('survivor-calculator', 'survivor benefits calculator')} reproduces each line.</p>

<h2>Two benefits, two start dates</h2>
<p>Many surviving divorced spouses also have a retirement benefit of their own. Social Security pays the larger of the two each month, but it lets you start them at different ages, which opens two sequences:</p>
<ol>
<li><strong>Survivor first, own later.</strong> With an own PIA of ${h.usd(OWN)}, take ${h.usd(at60.benefit)} as a survivor from 60, let your own record build delayed credits, and switch at 70 to ${h.usd(own70)}.</li>
<li><strong>Own first, survivor later.</strong> Start your own reduced benefit at 62 and 1 month, ${h.usd(own62)}, and move to the unreduced survivor benefit, ${h.usd(atFra.benefit)}, at 67.</li>
</ol>
<p>Which one pays more over a lifetime depends on how the two PIAs compare and on how long you expect to collect. Condition (d) of the regulation sets a floor on the question: if your own old-age benefit is already equal to or larger than the ex's PIA, there is no survivor entitlement to sequence.</p>

<h2>Conversion without a new application</h2>
<p>If you were already collecting as a divorced spouse when the ex died, the SSA does not always need a new claim. Paragraph (b)(1) of 404.336 converts the benefit automatically for someone who has reached full retirement age, or who has no retirement or disability benefit of their own. If you are under that age and also draw your own retirement benefit, you file a certificate electing the reduced survivor benefit, as paragraph (b)(3) describes, because the choice to accept a reduction is yours.</p>

<h2>The ex's new family is not affected</h2>
<p>A deceased worker may leave a widow or widower and young children, all entitled to survivor benefits capped by the ${h.a('family-maximum', 'family maximum')}. A surviving divorced spouse sits outside that cap: ${h.src('cfr404_403', '20 CFR 404.403(a)(3)')} says the benefits of a divorced spouse or surviving divorced spouse are not reduced for the maximum, and everyone else is computed as if they were absent. Your claim neither lowers their checks nor is lowered by them. Several former spouses of the same person can each draw a survivor benefit, provided each marriage lasted ten years.</p>`;
    },
  },
});
