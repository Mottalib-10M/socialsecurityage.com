import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { floorDime, floorDollar } from '../../lib/engine/ss';

const M = P.medicare, X = P.extra.medicare;
const PREM = M.part_b_2026;
const AVG = floorDollar(P.stats_aug_2026.retired_worker_avg);
const net = (b: number) => floorDollar(b) - PREM;
const T = X.irmaa_partb as Array<{ single_max: number | null; joint_max: number | null; irmaa: number; total: number }>;
// A retiree whose PIA was $2,000 before the COLA of December 2025
const PIA25 = 2000;
const PIA26 = floorDime(PIA25 * (1 + P.cola_2026.pct / 100));
const raise = floorDollar(PIA26) - floorDollar(PIA25);
const premRise = PREM - M.part_b_2025;
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export default definePage({
  id: 'medicare-part-b',
  group: 'taxwork',
  order: 30,
  mini: 'medNetDeposit',
  related: ['cola-2026', 'payment-schedule', 'average-benefit', 'tax-calculator', 'ssfa', 'irmaa'],
  sources: ['cmsPartB', 'ssaIrmaa', 'frNotice2026', 'ssaSnapshot', 'ssaSsfa', 'ssaAbroadPub'],
  en: {
    slug: 'medicare-premium-deducted-from-social-security',
    nav: 'Medicare premium deduction',
    card: `${$(PREM, 2)} a month comes out of most checks in 2026 for Medicare Part B, more for higher incomes: here is what lands in the bank.`,
    title: `Medicare Part B Premium 2026: ${$(PREM, 2)} Off Your Check`,
    description: `Medicare Part B costs ${$(PREM, 2)} a month in 2026, taken from your Social Security check, up from ${$(M.part_b_2025, 2)}. Net deposit, ${$(M.part_b_deductible_2026)} deductible, IRMAA tiers (CMS).`,
    h1: 'The Medicare Part B premium taken from your Social Security',
    intro: 'The amount in your Social Security letter is not the amount in your bank account. For most people the gap is the Part B premium.',
    resume: `The standard Medicare Part B premium is ${$(PREM, 2)} a month in 2026, up ${$(premRise, 2)} from ${$(M.part_b_2025, 2)} in 2025, according to CMS, and the annual Part B deductible is ${$(M.part_b_deductible_2026)}. If you receive Social Security and are enrolled in Part B, the premium is withheld from your monthly benefit before it is deposited. A retired worker paid the August 2026 average of ${$(AVG)} therefore receives ${$(net(AVG), 2)}. Higher incomes pay more: single filers whose 2024 modified adjusted gross income exceeded ${$(T[0].single_max as number)} (${$(T[0].joint_max as number)} on a joint return) pay an income-related monthly adjustment amount on top, from ${$(T[1].irmaa, 2)} to ${$(T[5].irmaa, 2)}, for a total premium of up to ${$(T[5].total, 2)}. The ${P.cola_2026.pct}% cost-of-living increase for 2026 and the premium increase move in opposite directions: on a ${$(PIA25)} benefit, the COLA added ${$(raise)} and the premium took back ${$(premRise, 2)}.`,
    faqs: [
      { q: 'Why is my Social Security deposit smaller than the amount on my award letter?', a: `The award letter shows the benefit before deductions. If you have Medicare Part B, the SSA withholds the premium, ${$(PREM, 2)} a month in 2026 for most people, and the deposit is what remains. A benefit of ${$(2000)} becomes a deposit of ${$(net(2000), 2)}. Voluntary federal tax withholding, if you asked for it on Form W-4V, comes out as well.` },
      { q: 'Does Medicare look at this year\'s income to set my premium?', a: `No. For 2026 the SSA uses the most recent federal tax return the IRS provides, generally the one filed in 2025 for tax year ${X.irmaa_tax_year}. If your income has since dropped because of a life-changing event such as retirement, reduced work hours, marriage, divorce or the death of a spouse, you can ask the SSA to use newer information, with documents proving the event.` },
      { q: 'What happens if my Social Security check is too small to cover the Part B premium?', a: `The SSA deducts what the benefit allows and you are billed for the rest. Its page on the Fairness Act states that when a benefit is not enough to cover the Medicare premium, the person is billed for the remainder. People who receive no Social Security yet pay Medicare directly on a bill.` },
      { q: 'Is the Part D surcharge also taken out of my check?', a: `Yes, for higher incomes. The Part D income-related adjustment, from ${$(X.irmaa_partd[1], 2)} to ${$(X.irmaa_partd[5], 2)} a month in 2026, is deducted from Social Security benefits regardless of how you pay the plan premium itself (SSA). The Part D plan premium can be paid to the plan directly or deducted, depending on what you chose.` },
      { q: 'Did the 2026 Part B increase wipe out my cost-of-living raise?', a: `Not for an average benefit. The ${P.cola_2026.pct}% COLA raised a ${$(PIA25)} benefit by ${$(raise)} a month, while the standard premium went up ${$(premRise, 2)}. The net deposit therefore rose by about ${$(raise - premRise, 2)}. On smaller benefits the COLA in dollars is smaller, so more of it goes to the premium increase.` },
    ],
    body: (h) => {
      const gross = [1000, 1500, AVG, 2500, 3500, P.max_benefit_2026.age70];
      const rows = gross.map((g) => [h.usd(g), h.usd(PREM, 2), h.usd(net(g), 2), h.usd(net(g) - floorDollar(g) * 0.1, 2)]);
      const irmaa = T.map((t, i) => [
        i === 0 ? `${h.usd(t.single_max as number)} or less` : t.single_max ? `${h.usd(T[i - 1].single_max as number)} to ${h.usd(t.single_max)}` : `${h.usd(T[i - 1].single_max as number)} or more`,
        i === 0 ? `${h.usd(t.joint_max as number)} or less` : t.joint_max ? `${h.usd(T[i - 1].joint_max as number)} to ${h.usd(t.joint_max)}` : `${h.usd(T[i - 1].joint_max as number)} or more`,
        h.usd(t.irmaa, 2), h.usd(t.total, 2), h.usd(X.irmaa_partd[i], 2),
      ]);
      const coupleNet = 2 * PREM;
      return `
<h2>From benefit to deposit</h2>
<p>Social Security computes your benefit, rounds it down to the dollar, then subtracts what you owe Medicare. The standard Part B premium for 2026 is ${h.usd(PREM, 2)}, set by CMS and announced on November 14, 2025 (${h.src('cmsPartB', 'CMS fact sheet')}). The subtraction happens every month, so the yearly cost for one person is ${h.usd(PREM * 12, 2)}. For a couple both enrolled, two premiums come out of two checks: ${h.usd(coupleNet, 2)} a month.</p>
${h.table(['Monthly benefit', 'Part B premium', 'Deposit', 'Deposit with 10% tax withheld'], rows, '2026, standard premium; the 10% column assumes voluntary withholding chosen on Form W-4V', ['l', 'r', 'r', 'r'])}
<p>The fourth column adds one common choice: voluntary federal tax withholding. The SSA offers ${P.taxation.withholding_options.map((x) => `${Math.round(x * 100)}%`).join(', ')} of the monthly benefit. Withholding is optional and is computed on the benefit, not on the deposit; the ${h.a('tax-calculator', 'tax calculator')} shows whether any of your benefit is taxable at all.</p>

<h2>Higher incomes: the income-related adjustment</h2>
<p>About ${Math.round(X.irmaa_share_partb * 100)}% of people with Part B pay more than the standard premium. For most beneficiaries the government pays about ${Math.round(X.government_share_standard * 100)}% of the cost of Part B; higher-income beneficiaries pay a larger share, and the ${h.src('ssaIrmaa', 'SSA')} collects the difference by withholding it from benefits. The 2026 amounts, from CMS, are below; the ${h.a('irmaa', 'IRMAA calculator')} applies them to your own income, filing status and household:</p>
${h.table(['Single filers, MAGI', 'Joint filers, MAGI', 'Part B adjustment', 'Part B total', 'Part D adjustment'], irmaa, `2026 monthly amounts, full Part B coverage; MAGI from the tax year ${X.irmaa_tax_year} return. Each band starts just above the previous limit`, ['l', 'l', 'r', 'r', 'r'])}
<p>Married people who lived with their spouse during the year but file separately follow a shorter scale in the CMS table, with the top two amounts applying from ${h.usd(T[0].single_max as number)}. Modified adjusted gross income here means adjusted gross income plus tax-exempt interest. A retiree with a single return showing ${h.usd(150000)} of MAGI falls in the third band and pays ${h.usd(T[2].total, 2)} a month for Part B, ${h.usd(T[2].irmaa, 2)} more than the standard premium; on a ${h.usd(3500)} benefit the deposit is ${h.usd(3500 - T[2].total - X.irmaa_partd[2], 2)} once the Part D adjustment of ${h.usd(X.irmaa_partd[2], 2)} is also withheld.</p>

<h2>A two-year lag, and how to correct it</h2>
<p>The adjustment for 2026 is based on the most recent return the IRS provides to the SSA, generally the return filed in 2025 for ${X.irmaa_tax_year}. Sometimes the IRS has only the ${X.irmaa_tax_year - 1} return; in that case you can send the newer one. The lag matters most in the first years of retirement, when a final salary year or a large retirement plan distribution can push income above the first threshold even though current income is much lower.</p>
<p>The SSA will make a new decision when income fell after one of these events: marriage, divorce or death of a spouse; you or your spouse stopped working or reduced hours; loss of income-producing property in a disaster or event beyond your control; the end or reorganization of an employer pension plan; or a settlement from an employer after closure, bankruptcy or reorganization. An amended tax return can also change the figure, with a copy of the amended return and the IRS acknowledgment.</p>

<h2>The COLA and the premium in the same January</h2>
<p>Each January, two numbers change your deposit at once. The cost-of-living increase of ${P.cola_2026.pct}% for 2026 (${h.src('frNotice2026', 'Federal Register')}) raised a benefit of ${h.usd(PIA25)} to ${h.usd(floorDollar(PIA26))}. In the same month, the standard premium rose from ${h.usd(M.part_b_2025, 2)} to ${h.usd(PREM, 2)}. The deposit went from ${h.usd(floorDollar(PIA25) - M.part_b_2025, 2)} to ${h.usd(floorDollar(PIA26) - PREM, 2)}, a net gain of ${h.usd(raise - premRise, 2)} rather than the ${h.usd(raise)} the COLA alone suggests. The ${h.a('cola-2026', 'COLA page')} details who received the increase.</p>

<h2>The deductible is separate</h2>
<p>The ${h.usd(M.part_b_deductible_2026)} annual deductible for 2026, up from ${h.usd(X.part_b_2025_deductible)} in 2025, is not withheld from Social Security. You pay it as you receive Part B services: the first ${h.usd(M.part_b_deductible_2026)} of covered outpatient and doctor costs in the year are yours before Part B starts paying its share. Only premiums, and income-related adjustments, come out of the check.</p>

<h2>When the deduction does not happen</h2>
<p>Several situations break the automatic link between the check and the premium. People who enroll in Medicare at 65 but delay Social Security receive a bill instead. Benefits too small to cover the premium leave a remainder to pay on a bill. And people abroad face a different calculation: the ${h.src('ssaAbroadPub', 'SSA publication for beneficiaries outside the United States')} notes that Medicare generally does not cover care received outside the country, and that enrolling later adds ${Math.round(P.extra.abroad.medicare_late_penalty_per_12_months * 100)}% to the premium for each 12-month period you could have been enrolled. The ${h.a('payment-schedule', 'payment schedule page')} shows on which Wednesday the net deposit arrives.</p>`;
    },
  },
});
