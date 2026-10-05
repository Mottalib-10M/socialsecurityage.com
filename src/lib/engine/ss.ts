/**
 * Social Security retirement engine, 2026 rules. Pure functions, no network, no date of the day.
 * Every constant comes from params-2026.json (P). Rounding follows the law and the CFR examples:
 * AIME down to the dollar (20 CFR 404.211(f)), PIA down to the dime (404.212(c)), each COLA down
 * to the dime, an age reduction rounded UP to the dime before it is subtracted (404.410 examples),
 * a DRC increase rounded down to the dime (404.313(b)), the monthly benefit down to the dollar.
 */
import { P, awi, bendPoints, taxableMax, cola, LAST_AWI_YEAR, LAST_BP_YEAR, LAST_COLA_YEAR } from './params';

const EPS = 1e-9;
export const floorDime = (x: number) => Math.floor(x * 10 + EPS) / 10;
export const ceilDime = (x: number) => Math.ceil(x * 10 - EPS) / 10;
export const floorDollar = (x: number) => Math.floor(x + EPS);

/* ------------------------------------------------------------------ ages */

export interface BirthDate { y: number; m: number; d: number }
/** SSA treats you as attaining an age the day before your birthday: a person born on the 1st is
 *  handled as if born in the previous month, and someone born on January 1 as born the year before. */
export function effectiveBirth(b: BirthDate): { y: number; m: number } {
  if (b.d === 1) return b.m === 1 ? { y: b.y - 1, m: 12 } : { y: b.y, m: b.m - 1 };
  return { y: b.y, m: b.m };
}
export interface Fra { years: number; months: number; total: number }
function fraFrom(rows: { from: number; years: number; months: number }[], yearOfBirth: number, floorAge: number): Fra {
  let r = { years: floorAge, months: 0 };
  for (const row of rows) if (yearOfBirth >= row.from) r = row;
  return { years: r.years, months: r.months, total: r.years * 12 + r.months };
}
/** Full retirement age for retirement and spouse benefits (20 CFR 404.409(a)), by effective birth year. */
export const fraRetirement = (yearOfBirth: number): Fra => fraFrom(P.fra_retirement, yearOfBirth, 65);
/** Full retirement age for widow(er) benefits (20 CFR 404.409(b)): two years behind the retirement table. */
export const fraSurvivor = (yearOfBirth: number): Fra => fraFrom(P.fra_survivor, yearOfBirth, 65);
export const fraOf = (b: BirthDate) => fraRetirement(effectiveBirth(b).y);
/** Calendar month (year, month 1-12) in which an age in months is attained. */
export function monthAttaining(b: BirthDate, ageMonths: number): { y: number; m: number } {
  const e = effectiveBirth(b);
  const idx = e.y * 12 + (e.m - 1) + ageMonths;
  return { y: Math.floor(idx / 12), m: (idx % 12) + 1 };
}
export const fmtAge = (months: number) => ({ years: Math.floor(months / 12), months: months % 12 });

/* -------------------------------------------------------- age adjustments */

/** Fraction removed from the PIA for n months of entitlement before FRA (20 CFR 404.410(a)). */
export function workerReduction(n: number): number {
  const k = Math.max(0, n);
  return Math.min(36, k) * P.reduction.worker_first36 + Math.max(0, k - 36) * P.reduction.worker_after36;
}
/** Fraction removed from a spouse benefit for n months before FRA (20 CFR 404.410(b)). */
export function spouseReduction(n: number): number {
  const k = Math.max(0, n);
  return Math.min(36, k) * P.reduction.spouse_first36 + Math.max(0, k - 36) * P.reduction.spouse_after36;
}
/** Fraction added for n months of delay after FRA, born after 1942 (20 CFR 404.313). */
export const drcIncrease = (n: number) => Math.max(0, n) * P.drc.monthly_born_after_1942;

export interface ClaimResult { monthsEarly: number; monthsLate: number; factor: number; adjustment: number; benefit: number; benefitExact: number }
/** Monthly retirement benefit from a PIA when benefits start at `claimMonths` of age. */
export function benefitAtAge(pia: number, claimMonths: number, fraMonths: number): ClaimResult {
  const capped = Math.min(claimMonths, P.drc.stop_age * 12);
  const early = Math.max(0, fraMonths - capped), late = Math.max(0, capped - fraMonths);
  if (early > 0) {
    const cut = ceilDime(pia * workerReduction(early));
    const exact = pia - cut;
    return { monthsEarly: early, monthsLate: 0, factor: 1 - workerReduction(early), adjustment: -cut, benefit: floorDollar(exact), benefitExact: exact };
  }
  const add = floorDime(pia * drcIncrease(late));
  const exact = pia + add;
  return { monthsEarly: 0, monthsLate: late, factor: 1 + drcIncrease(late), adjustment: add, benefit: floorDollar(exact), benefitExact: exact };
}

/* ----------------------------------------------------------- AIME and PIA */

export interface YearRow { year: number; nominal: number; capped: number; factor: number; indexed: number; used: boolean }
export interface PiaResult {
  eligibilityYear: number; indexYear: number; projected: boolean;
  rows: YearRow[]; top: number; yearsWithEarnings: number; zeroYears: number;
  aime: number; bend: [number, number];
  parts: [number, number, number]; piaAtEligibility: number;
  colas: Array<{ year: number; pct: number; pia: number }>; pia: number;
}
/**
 * PIA from an earnings record (20 CFR 404.211 and 404.212).
 * - eligibility year = year of attaining 62; earnings are indexed to the AWI of the year of attaining 60;
 * - earnings above each year's contribution and benefit base are not counted;
 * - the highest 35 indexed years are averaged over 420 months, rounded down to the dollar;
 * - the bend points of the eligibility year apply; COLAs from the eligibility year onward are added.
 * When the person turns 62 after the last published parameters (2026), the AWI of 2024 and the 2026
 * bend points are used: an estimate in today's dollars, flagged `projected`.
 */
export function computePia(b: BirthDate, earnings: Record<number, number>): PiaResult {
  const e = effectiveBirth(b);
  const eligibilityYear = e.y + 62;
  const projected = eligibilityYear > LAST_BP_YEAR;
  const indexYear = Math.min(eligibilityYear - 2, LAST_AWI_YEAR);
  const target = awi(indexYear);
  const rows: YearRow[] = Object.entries(earnings)
    .map(([ys, v]) => ({ year: Number(ys), nominal: Math.max(0, Number(v) || 0) }))
    .filter((r) => r.year >= 1951 && r.nominal > 0)
    .sort((a, b2) => a.year - b2.year)
    .map((r) => {
      const capped = Math.min(r.nominal, taxableMax(r.year));
      const factor = r.year < indexYear ? target / awi(r.year) : 1;
      return { year: r.year, nominal: r.nominal, capped, factor, indexed: capped * factor, used: false };
    });
  const n = P.pia.computation_years;
  const ranked = [...rows].sort((a, b2) => b2.indexed - a.indexed || a.year - b2.year).slice(0, n);
  for (const r of ranked) r.used = true;
  const top = ranked.reduce((s, r) => s + r.indexed, 0);
  const aime = floorDollar(top / (n * 12));
  const bp = bendPoints(eligibilityYear);
  const bend: [number, number] = [bp[0], bp[1]];
  const [f1, f2, f3] = P.pia.factors;
  const parts: [number, number, number] = [f1 * Math.min(aime, bend[0]), f2 * Math.max(0, Math.min(aime, bend[1]) - bend[0]), f3 * Math.max(0, aime - bend[1])];
  const piaAtEligibility = floorDime(parts[0] + parts[1] + parts[2]);
  const colas: PiaResult['colas'] = [];
  let pia = piaAtEligibility;
  for (let y = eligibilityYear; y <= LAST_COLA_YEAR; y++) {
    const pct = cola(y);
    pia = floorDime(pia * (1 + pct / 100));
    colas.push({ year: y, pct, pia });
  }
  return { eligibilityYear, indexYear, projected, rows, top, yearsWithEarnings: rows.length, zeroYears: Math.max(0, n - rows.length), aime, bend, parts, piaAtEligibility, colas, pia };
}

/** PIA formula alone, for a given AIME and eligibility year (rounded down to the dime). */
export function piaFromAime(aime: number, eligibilityYear = P.year): number {
  const bp = bendPoints(eligibilityYear); const [f1, f2, f3] = P.pia.factors;
  return floorDime(f1 * Math.min(aime, bp[0]) + f2 * Math.max(0, Math.min(aime, bp[1]) - bp[0]) + f3 * Math.max(0, aime - bp[1]));
}

/**
 * A career rebuilt from one salary: the worker is assumed to have kept the same position relative to
 * the national average wage every year (past pay = salary × AWI(year) ÷ AWI(2024)); 2025 and later
 * years are taken at today's salary, without growth (estimate in today's dollars).
 */
export function projectCareer(b: BirthDate, salaryToday: number, startAge: number, stopAge: number): Record<number, number> {
  const e = effectiveBirth(b);
  const out: Record<number, number> = {};
  const last = awi(LAST_AWI_YEAR);
  for (let age = Math.max(startAge, 14); age < stopAge; age++) {
    const y = e.y + age;
    if (y < 1951) continue;
    out[y] = y <= LAST_AWI_YEAR ? Math.round(salaryToday * awi(y) / last) : salaryToday;
  }
  return out;
}

export interface QuickEstimate { pia: PiaResult; fra: Fra; at62: ClaimResult; atFra: ClaimResult; at70: ClaimResult; atClaim: ClaimResult; claimMonths: number }
/** The whole chain from a salary: career, PIA, benefits at 62 (62 + 1 month), FRA, 70 and a chosen age. */
export function quickEstimate(b: BirthDate, salaryToday: number, startAge: number, stopAge: number, claimMonths: number): QuickEstimate {
  const pia = computePia(b, projectCareer(b, salaryToday, startAge, stopAge));
  const fra = fraOf(b);
  return { pia, fra, claimMonths, at62: benefitAtAge(pia.pia, 62 * 12 + 1, fra.total), atFra: benefitAtAge(pia.pia, fra.total, fra.total), at70: benefitAtAge(pia.pia, 70 * 12, fra.total), atClaim: benefitAtAge(pia.pia, claimMonths, fra.total) };
}

/* -------------------------------------------------------- break-even ages */

/** Age (in months) at which a later start catches up with an earlier one in total benefits received,
 *  in today's dollars (equal COLAs leave the crossover unchanged). Null if the later start never catches up. */
export function breakEvenMonths(early: { start: number; benefit: number }, late: { start: number; benefit: number }): number | null {
  if (late.benefit <= early.benefit) return null;
  return (late.benefit * late.start - early.benefit * early.start) / (late.benefit - early.benefit);
}
/** Total received from `start` (age in months) to the end of `age` (in years). */
export const cumulative = (benefit: number, startMonths: number, ageYears: number) => Math.max(0, ageYears * 12 - startMonths) * benefit;

/* ----------------------------------------------------- spouse and survivor */

export interface SpousalResult { fullSpousal: number; excess: number; reducedExcess: number; ownBenefit: number; total: number; monthsEarly: number; onlyOwn: boolean }
/**
 * Spouse benefit with deemed filing: the spouse gets their own benefit plus, if half the worker's PIA
 * exceeds their own PIA, the excess, reduced by 25/36 and 5/12 of 1% a month before FRA. No delayed
 * credits on the spousal part. A child under 16 (or disabled) in care removes the reduction.
 */
export function spousalBenefit(workerPia: number, ownPia: number, claimMonths: number, fraMonths: number, childInCare = false): SpousalResult {
  const fullSpousal = floorDime(workerPia * P.family.spouse_max);
  const own = ownPia > 0 ? benefitAtAge(ownPia, claimMonths, fraMonths) : null;
  const ownBenefit = own ? own.benefitExact : 0;
  const excess = Math.max(0, floorDime(fullSpousal - ownPia));
  const monthsEarly = childInCare ? 0 : Math.max(0, fraMonths - claimMonths);
  const reducedExcess = excess > 0 ? excess - ceilDime(excess * spouseReduction(monthsEarly)) : 0;
  const combined = floorDollar(ownBenefit + reducedExcess);
  // With a child in care, the spouse is not deemed to file for their own benefit (POMS GN 00204.035):
  // they may take the unreduced spouse benefit alone when it pays more.
  if (childInCare && floorDollar(fullSpousal) > combined) return { fullSpousal, excess: fullSpousal, reducedExcess: fullSpousal, ownBenefit: 0, total: floorDollar(fullSpousal), monthsEarly: 0, onlyOwn: false };
  return { fullSpousal, excess, reducedExcess, ownBenefit, total: combined, monthsEarly, onlyOwn: excess === 0 };
}

export interface SurvivorResult { base: number; monthsEarly: number; reductionPct: number; reduced: number; limit: number | null; benefit: number; limited: boolean }
/**
 * Widow(er) benefit (20 CFR 404.410(c)): 100% of what the deceased received (or their PIA if they had
 * not started), reduced by 28.5% spread over the months from 60 to the survivor FRA. If the deceased had
 * started early, the RIB-LIM caps it at the larger of their reduced benefit or 82.5% of the PIA (POMS RS 00615.320).
 */
export function survivorBenefit(o: { deceasedPia: number; deceasedClaimMonths: number | null; deceasedFraMonths: number; survivorClaimMonths: number; survivorFraMonths: number }): SurvivorResult {
  const claimed = o.deceasedClaimMonths !== null ? benefitAtAge(o.deceasedPia, o.deceasedClaimMonths, o.deceasedFraMonths) : null;
  const base = claimed && claimed.monthsLate > 0 ? claimed.benefitExact : o.deceasedPia;
  const start = Math.max(o.survivorClaimMonths, P.reduction.widow_earliest_age * 12);
  const span = o.survivorFraMonths - P.reduction.widow_earliest_age * 12;
  const monthsEarly = Math.max(0, o.survivorFraMonths - start);
  const reductionPct = span > 0 ? (monthsEarly * P.reduction.widow_max) / span : 0;
  const reduced = base - ceilDime(base * reductionPct);
  let limit: number | null = null, value = reduced;
  if (claimed && claimed.monthsEarly > 0) {
    limit = Math.max(claimed.benefitExact, floorDime(o.deceasedPia * P.family.widow_limit));
    if (reduced > limit) value = limit;
  }
  return { base, monthsEarly, reductionPct, reduced, limit, benefit: floorDollar(value), limited: value !== reduced };
}

/** Family maximum for a worker first eligible in `eligibilityYear` (20 CFR 404.403, formula of the year). */
export function familyMaximum(pia: number, eligibilityYear = P.year): number {
  const bp = bendPoints(eligibilityYear); const [a, b2, c, d] = P.family_max.factors;
  const [, , f1, f2, f3] = bp;
  return floorDime(a * Math.min(pia, f1) + b2 * Math.max(0, Math.min(pia, f2) - f1) + c * Math.max(0, Math.min(pia, f3) - f2) + d * Math.max(0, pia - f3));
}

/* ------------------------------------------------------ work and taxes */

export type FraYearStatus = 'before' | 'fraYear' | 'after';
export interface EarningsTestResult { limit: number; excess: number; withheld: number; annualBenefit: number; kept: number; monthsWithheld: number }
/** Retirement earnings test 2026: $1 withheld per $2 above $24,480; in the year of FRA, $1 per $3 above
 *  $65,160 counting only earnings before the FRA month; nothing from the FRA month on. */
export function earningsTest(monthlyBenefit: number, earnings: number, status: FraYearStatus, monthsBeforeFra = 12): EarningsTestResult {
  const T = P.earnings_test;
  const months = status === 'fraYear' ? Math.max(0, Math.min(12, monthsBeforeFra)) : status === 'before' ? 12 : 0;
  const annualBenefit = monthlyBenefit * months;
  if (status === 'after') return { limit: Infinity, excess: 0, withheld: 0, annualBenefit: monthlyBenefit * 12, kept: monthlyBenefit * 12, monthsWithheld: 0 };
  const limit = status === 'fraYear' ? T.higher_annual : T.lower_annual;
  const excess = Math.max(0, earnings - limit);
  const withheld = Math.min(annualBenefit, excess * (status === 'fraYear' ? T.higher_withhold : T.lower_withhold));
  return { limit, excess, withheld, annualBenefit, kept: annualBenefit - withheld, monthsWithheld: monthlyBenefit > 0 ? Math.min(months, Math.ceil(withheld / monthlyBenefit - EPS)) : 0 };
}

export type FilingStatus = 'single' | 'joint' | 'separate_together';
export interface TaxResult { provisional: number; base1: number; base2: number; taxable: number; share: number; tier: 0 | 50 | 85 }
/** Taxable part of benefits, IRS Publication 915 Worksheet 1 (IRC § 86). `otherIncome` includes tax-exempt interest. */
export function taxableBenefits(benefits: number, otherIncome: number, status: FilingStatus): TaxResult {
  const T = P.taxation;
  const base1 = T.base1[status], base2 = T.base2[status];
  const half = benefits * T.rate1;
  const provisional = otherIncome + half;
  if (benefits <= 0 || provisional <= base1) return { provisional, base1, base2, taxable: 0, share: 0, tier: 0 };
  const l10 = provisional - base1, l11 = base2 - base1;
  const l12 = Math.max(0, l10 - l11), l13 = Math.min(l10, l11);
  const l15 = Math.min(half, l13 * T.rate1);
  const taxable = Math.min(l15 + l12 * T.rate2, benefits * T.rate2);
  return { provisional, base1, base2, taxable, share: taxable / benefits, tier: l12 > 0 ? 85 : 50 };
}

export interface SeTaxResult { netEarnings: number; base: number; oasdi: number; hi: number; total: number; credits: number }
/** Self-employment tax 2026 (IRS Topic 554): 92.35% of net profit, 12.4% up to the $184,500 base, 2.9% on all. */
export function selfEmploymentTax(netProfit: number): SeTaxResult {
  const R = P.payroll;
  const base = Math.max(0, netProfit) * R.se_net_factor;
  if (base < R.se_min_net) return { netEarnings: netProfit, base, oasdi: 0, hi: 0, total: 0, credits: 0 };
  const oasdi = Math.min(base, P.taxable_max_2026) * R.oasdi_self_employed;
  const hi = base * R.hi_self_employed;
  return { netEarnings: netProfit, base, oasdi, hi, total: oasdi + hi, credits: creditsFor(base) };
}
/** Employee share of Social Security and Medicare tax on 2026 wages (additional Medicare tax not included). */
export function employeePayroll(wages: number): { oasdi: number; hi: number; total: number; capped: boolean } {
  const R = P.payroll;
  const oasdi = Math.min(Math.max(0, wages), P.taxable_max_2026) * R.oasdi_employee;
  const hi = Math.max(0, wages) * R.hi_employee;
  return { oasdi, hi, total: oasdi + hi, capped: wages > P.taxable_max_2026 };
}
/** Credits (quarters of coverage) earned in 2026: one per $1,890, four at most. */
export const creditsFor = (earnings: number) => Math.min(P.credits.max_per_year, Math.floor(Math.max(0, earnings) / P.credits.qc_amount + EPS));

/* ------------------------------------------------------------- calendar */

/** Payment date of a given month (20 CFR 404.1807): 2nd, 3rd or 4th Wednesday by the worker's day of birth. */
export function paymentDay(year: number, month: number, birthDay: number): number {
  const nth = birthDay <= 10 ? P.payment_days.days_1_10 : birthDay <= 20 ? P.payment_days.days_11_20 : P.payment_days.days_21_31;
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const firstWed = 1 + ((3 - first + 7) % 7);
  return firstWed + (nth - 1) * 7;
}
