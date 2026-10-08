/**
 * Medicare and retirement-account engine (2026): IRMAA tiers, required minimum distributions,
 * inherited IRA withdrawals, federal tax on a Roth conversion, HSA limits and COBRA cost.
 * Every number is read from `params-2026.json > extra` (irmaa2026, rmd, tax2026, hsa2026, cobra);
 * the pages and mini-calculators call these functions, never a formula of their own.
 */
import { P } from './params';

const X = P.extra;
const I = X.irmaa2026 as { single: number[]; joint: number[]; mfs: number[]; mfs_tiers: number[]; partb_irmaa: number[]; partd_irmaa: number[]; partb_standard: number; tax_year: number };
const R = X.rmd as { uniform: Record<string, number>; single: Record<string, number>; applicable_age: Array<{ born_from: number; age: number }>; applicable_age_1959_proposed: number; excise: number; excise_corrected: number; minor_child_majority: number; edb_age_gap: number };
const T = X.tax2026 as { rates: number[]; single: number[]; joint: number[]; hoh: number[]; std: { single: number; joint: number; hoh: number } };
const H = X.hsa2026 as { self: number; family: number; catchup55: number; fica_employee: number };
const C = X.cobra as { premium_max: number; premium_disability: number; months_job: number; months_disability: number; months_secondary: number };

/* ---------------------------------------------------------------- IRMAA */

/** 0 = single, head of household, surviving spouse, or separate return living apart all year;
 *  1 = married filing jointly; 2 = married filing separately, lived with the spouse during the year. */
export type IrmaaStatus = 0 | 1 | 2;
export interface IrmaaResult { tier: number; partB: number; partD: number; totalB: number; monthly: number; yearly: number; nextAt: number | null; roomBelowNext: number | null }

/** Tier 0 to 5 from the 2024 MAGI (20 CFR 418.1115; CMS 2026 fact sheet). Bounds are "up to and including",
 *  except the start of the top tier, which applies from the amount itself ($500,000 / $750,000 / $391,000). */
export function irmaaTier(magi: number, status: IrmaaStatus): number {
  if (status === 2) {
    if (magi <= I.mfs[0]) return 0;
    return magi < I.mfs[1] ? I.mfs_tiers[1] : I.mfs_tiers[2];
  }
  const b = status === 1 ? I.joint : I.single;
  for (let i = 0; i < 4; i++) if (magi <= b[i]) return i;
  return magi < b[4] ? 4 : 5;
}

/** First MAGI that lands in the next tier, or null at the top. */
export function irmaaNextThreshold(magi: number, status: IrmaaStatus): number | null {
  const tier = irmaaTier(magi, status);
  if (tier === 5) return null;
  if (status === 2) return tier === 0 ? I.mfs[0] + 1 : I.mfs[1];
  const b = status === 1 ? I.joint : I.single;
  return tier < 4 ? b[tier] + 1 : b[4];
}

export function irmaa(magi: number, status: IrmaaStatus, people = 1): IrmaaResult {
  const tier = irmaaTier(Math.max(0, magi), status);
  const partB = I.partb_irmaa[tier], partD = I.partd_irmaa[tier];
  const monthly = (partB + partD) * people;
  const nextAt = irmaaNextThreshold(Math.max(0, magi), status);
  return { tier, partB, partD, totalB: I.partb_standard + partB, monthly, yearly: monthly * 12, nextAt, roomBelowNext: nextAt === null ? null : nextAt - 1 - Math.max(0, magi) };
}

/* ---------------------------------------------------------------- RMD */

/** Age of the first required distribution (IRC 401(a)(9)(C)(v); 26 CFR 1.401(a)(9)-2(b)(2), 1959 per the 2024 proposed rule). */
export function rmdStartAge(birthYear: number): number {
  if (birthYear >= 1960) return 75;
  if (birthYear >= 1951) return 73;
  return 72;
}

const lookup = (t: Record<string, number>, age: number, max: number) => t[String(Math.min(Math.max(Math.floor(age), 0), max))];
/** Uniform Lifetime Table divisor (26 CFR 1.401(a)(9)-9(c)); ages under 72 have none. */
export const uniformDivisor = (age: number): number | null => (age < 72 ? null : lookup(R.uniform, age, 120));
/** Single Life Table life expectancy (26 CFR 1.401(a)(9)-9(b)). */
export const singleLife = (age: number): number => lookup(R.single, age, 120);

export interface RmdResult { required: boolean; startAge: number; divisor: number | null; amount: number; share: number; firstYear: number; deadlineNote: 'april1' | 'dec31' | 'none' }

/** Owner's RMD for the year he or she reaches `age`, on the December 31 balance of the year before. */
export function ownerRmd(balancePrevDec31: number, age: number, birthYear: number): RmdResult {
  const startAge = rmdStartAge(birthYear);
  const firstYear = birthYear + startAge;
  if (age < startAge) return { required: false, startAge, divisor: null, amount: 0, share: 0, firstYear, deadlineNote: 'none' };
  const divisor = uniformDivisor(age) as number;
  const amount = Math.max(0, balancePrevDec31) / divisor;
  return { required: true, startAge, divisor, amount, share: 1 / divisor, firstYear, deadlineNote: age === startAge ? 'april1' : 'dec31' };
}

/** Excise tax on a shortfall: 25%, or 10% when corrected within the correction window (IRC 4974). */
export const rmdExcise = (shortfall: number, corrected: boolean) => Math.max(0, shortfall) * (corrected ? R.excise_corrected : R.excise);

/** Projection of owner RMDs with a constant growth rate, from the first required year. */
export function rmdSchedule(balanceAtStart: number, startAge: number, years: number, growth: number) {
  const rows: Array<{ age: number; balance: number; divisor: number; rmd: number }> = [];
  let bal = balanceAtStart;
  for (let k = 0; k < years; k++) {
    const age = startAge + k, divisor = uniformDivisor(age) as number, rmd = bal / divisor;
    rows.push({ age, balance: bal, divisor, rmd });
    bal = (bal - rmd) * (1 + growth);
  }
  return rows;
}

/* ---------------------------------------------------------------- Inherited IRA */

/** 0 = designated beneficiary who is not eligible (most adult children); 1 = surviving spouse;
 *  2 = other eligible designated beneficiary (disabled, chronically ill, not more than 10 years younger);
 *  3 = minor child of the owner (life expectancy until 21, then 10 years). */
export type BeneficiaryKind = 0 | 1 | 2 | 3;
export interface InheritedInput {
  balancePrevDec31: number; kind: BeneficiaryKind; deathYear: number; year: number;
  /** Beneficiary's age on the birthday of the year after death. */
  benAgeYearAfterDeath: number;
  /** Owner's age at the birthday in the year of death. */
  ownerAgeAtDeath: number;
  /** Owner had reached the required beginning date (false for any Roth IRA). */
  afterRbd: boolean;
  ownerBirthYear?: number;
}
export interface InheritedResult { amount: number; divisor: number | null; method: 'none' | 'ten-year-final' | 'ten-year-annual' | 'life-expectancy' | 'spouse-recalc' | 'not-yet'; emptyBy: number | null; note: string }

/**
 * RMD of an inherited IRA for `year` under the 2024 final regulations (26 CFR 1.401(a)(9)-5(d) and -3(c)),
 * applicable from 2025. A spouse is modeled as staying a beneficiary (not rolling over). Non-recalculating
 * beneficiaries use the Single Life Table at their age in the year after death, minus 1 per year since.
 */
export function inheritedRmd(o: InheritedInput): InheritedResult {
  const k = o.year - o.deathYear; // 1 = first year after death
  const bal = Math.max(0, o.balancePrevDec31);
  const tenYearEnd = o.deathYear + 10;
  const benAgeNow = o.benAgeYearAfterDeath + (k - 1);
  if (k < 1) return { amount: 0, divisor: null, method: 'none', emptyBy: null, note: 'No beneficiary RMD in the year of death; the owner\'s own RMD for that year, if not taken, must still be paid out.' };
  // Owner's remaining life expectancy (death on or after the required beginning date): Single Life Table
  // at the owner's age in the year of death, minus 1 for each year after.
  const ownerLe = singleLife(o.ownerAgeAtDeath) - k;
  if (o.kind === 0) {
    if (o.year >= tenYearEnd) return { amount: bal, divisor: 1, method: 'ten-year-final', emptyBy: tenYearEnd, note: `Whole balance due by December 31, ${tenYearEnd}.` };
    if (!o.afterRbd) return { amount: 0, divisor: null, method: 'none', emptyBy: tenYearEnd, note: `No yearly minimum: empty the account by December 31, ${tenYearEnd}.` };
    const d = Math.max(singleLife(o.benAgeYearAfterDeath) - (k - 1), ownerLe);
    if (d <= 1) return { amount: bal, divisor: 1, method: 'ten-year-final', emptyBy: tenYearEnd, note: 'Life expectancy exhausted: whole balance due this year.' };
    return { amount: bal / d, divisor: d, method: 'ten-year-annual', emptyBy: tenYearEnd, note: `Annual minimum in years 1 to 9, then everything by December 31, ${tenYearEnd}.` };
  }
  if (o.kind === 3) {
    const reach21 = o.year - benAgeNow + 21; // year the child turns 21
    const end = reach21 + 10;
    if (o.year >= end) return { amount: bal, divisor: 1, method: 'ten-year-final', emptyBy: end, note: `Whole balance due by December 31, ${end}.` };
    // The life-expectancy payments begun before 21 continue in years 1 to 9 of the 10-year period.
    const d = Math.max(singleLife(o.benAgeYearAfterDeath) - (k - 1), o.afterRbd ? ownerLe : 0);
    return { amount: d <= 1 ? bal : bal / d, divisor: d <= 1 ? 1 : d, method: 'life-expectancy', emptyBy: end, note: `Life-expectancy payments until 21, then 10 more years: empty by December 31, ${end}.` };
  }
  if (o.kind === 1) {
    // Spouse as beneficiary: payments may wait until the year the owner would have reached the applicable age.
    const ownerBirth = o.ownerBirthYear ?? o.deathYear - o.ownerAgeAtDeath;
    const startYear = o.afterRbd ? o.deathYear + 1 : Math.max(o.deathYear + 1, ownerBirth + rmdStartAge(ownerBirth));
    if (o.year < startYear) return { amount: 0, divisor: null, method: 'not-yet', emptyBy: null, note: `Payments can wait until ${startYear}, the year the owner would have reached the RMD age.` };
    const d0 = singleLife(benAgeNow);
    const d = o.afterRbd ? Math.max(d0, ownerLe) : d0;
    return { amount: bal / d, divisor: d, method: 'spouse-recalc', emptyBy: null, note: 'Life expectancy recalculated each year from the Single Life Table.' };
  }
  // other eligible designated beneficiary
  const d0 = singleLife(o.benAgeYearAfterDeath) - (k - 1);
  const d = o.afterRbd ? Math.max(d0, ownerLe) : d0;
  if (d <= 1) return { amount: bal, divisor: 1, method: 'life-expectancy', emptyBy: o.year, note: 'Life expectancy exhausted: whole balance due this year.' };
  return { amount: bal / d, divisor: d, method: 'life-expectancy', emptyBy: null, note: 'Stretch over the beneficiary\'s life expectancy, reduced by 1 each year.' };
}

/* ---------------------------------------------------------------- Federal income tax 2026 */

/** 0 = single, 1 = married filing jointly, 2 = head of household. */
export type FilingStatus = 0 | 1 | 2;
const bounds = (s: FilingStatus) => (s === 1 ? T.joint : s === 2 ? T.hoh : T.single);
export const standardDeduction = (s: FilingStatus) => (s === 1 ? T.std.joint : s === 2 ? T.std.hoh : T.std.single);

/** Regular federal income tax on taxable income, 2026 rate schedules (Rev. Proc. 2025-32, section 1(j)). */
export function federalTax(taxable: number, s: FilingStatus): number {
  const b = bounds(s);
  let tax = 0, low = 0;
  const x = Math.max(0, taxable);
  for (let i = 0; i < T.rates.length; i++) {
    const high = i < b.length ? b[i] : Infinity;
    if (x > low) tax += (Math.min(x, high) - low) * T.rates[i];
    low = high;
  }
  return tax;
}
export function marginalRate(taxable: number, s: FilingStatus): number {
  const b = bounds(s);
  const x = Math.max(0, taxable);
  for (let i = 0; i < b.length; i++) if (x <= b[i]) return T.rates[i];
  return T.rates[T.rates.length - 1];
}
/** Room left in the current bracket (Infinity in the top one). */
export function bracketRoom(taxable: number, s: FilingStatus): number {
  const b = bounds(s);
  const x = Math.max(0, taxable);
  for (let i = 0; i < b.length; i++) if (x <= b[i]) return b[i] - x;
  return Infinity;
}

export interface RothResult { tax: number; effective: number; topRate: number; startRate: number; irmaaBefore: number; irmaaAfter: number; irmaaExtraYear: number; roomInBracket: number }
/** Extra federal tax caused by converting `amount`, and the IRMAA tier the higher MAGI would trigger two years later. */
export function rothConversion(taxableBefore: number, magiBefore: number, amount: number, s: FilingStatus): RothResult {
  const a = Math.max(0, amount);
  const tax = federalTax(taxableBefore + a, s) - federalTax(taxableBefore, s);
  const ist: IrmaaStatus = s === 1 ? 1 : 0;
  const before = irmaa(magiBefore, ist, s === 1 ? 2 : 1), after = irmaa(magiBefore + a, ist, s === 1 ? 2 : 1);
  return { tax, effective: a ? tax / a : 0, topRate: marginalRate(taxableBefore + a, s), startRate: marginalRate(taxableBefore + 0.01, s), irmaaBefore: before.tier, irmaaAfter: after.tier, irmaaExtraYear: after.yearly - before.yearly, roomInBracket: bracketRoom(taxableBefore, s) };
}

/* ---------------------------------------------------------------- HSA */

export interface HsaResult { limit: number; contribution: number; excess: number; incomeTaxSaved: number; ficaSaved: number; totalSaved: number }
/**
 * 2026 HSA limit (Rev. Proc. 2025-19) prorated by eligible months (Pub. 969: the limit is 0 from the first month of
 * Medicare), plus the $1,000 catch-up at 55, and the tax the contribution saves: income tax at the marginal rates given,
 * and the 7.65% employee FICA only when it goes through an employer cafeteria plan.
 */
export function hsa(o: { family: boolean; age55: boolean; months: number; contribution: number; fedRate: number; stateRate: number; payroll: boolean }): HsaResult {
  const m = Math.min(12, Math.max(0, Math.round(o.months)));
  const base = (o.family ? H.family : H.self) + (o.age55 ? H.catchup55 : 0);
  const limit = (base * m) / 12;
  const contribution = Math.min(Math.max(0, o.contribution), limit);
  const incomeTaxSaved = contribution * (Math.max(0, o.fedRate) + Math.max(0, o.stateRate));
  const ficaSaved = o.payroll ? contribution * H.fica_employee : 0;
  return { limit, contribution, excess: Math.max(0, o.contribution - limit), incomeTaxSaved, ficaSaved, totalSaved: incomeTaxSaved + ficaSaved };
}
/** Months of 2026 a person can contribute when Medicare Part A starts in `medicareMonth` (1-12, 0 = not in 2026). */
export const hsaMonthsBeforeMedicare = (medicareMonth: number) => (medicareMonth >= 1 && medicareMonth <= 12 ? medicareMonth - 1 : 12);

/* ---------------------------------------------------------------- COBRA */

export interface CobraResult { monthly: number; months: number; total: number; marketplaceTotal: number; difference: number; maxMonths: number }
/** COBRA cost: up to 102% of the plan cost, 150% in months 19 to 29 of a disability extension (DOL, IRC 4980B). */
export function cobraCost(o: { planMonthly: number; months: number; disability: boolean; marketplaceMonthly: number }): CobraResult {
  const maxMonths = o.disability ? C.months_disability : C.months_job;
  const months = Math.min(Math.max(0, Math.round(o.months)), maxMonths);
  const base = Math.max(0, o.planMonthly);
  let total = 0;
  for (let i = 1; i <= months; i++) total += base * (o.disability && i > C.months_job ? C.premium_disability : C.premium_max);
  const marketplaceTotal = Math.max(0, o.marketplaceMonthly) * months;
  return { monthly: base * C.premium_max, months, total, marketplaceTotal, difference: total - marketplaceTotal, maxMonths };
}
