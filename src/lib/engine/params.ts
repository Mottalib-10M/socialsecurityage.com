/** Typed access to `src/data/params-2026.json`: every legal value of the site is read from here. */
import raw from '../../data/params-2026.json';

export type SourceKey = keyof typeof raw.sources;
export interface Source { url: string; label: { en: string }; read: string }
export interface FraRow { from: number; years: number; months: number }

export interface Params {
  year: number; retrieved_at: string; valid_from: string; valid_to: string;
  series: { awi: Record<string, number>; bend_points: Record<string, number[]>; taxable_max: Record<string, number>; cola: Record<string, number> };
  pia: { factors: number[]; computation_years: number };
  family_max: { factors: number[] };
  cola_2026: { pct: number; effective: string; payable: string; cpiw_q3_2024: number; cpiw_q3_2025: number };
  taxable_max_2026: number;
  payroll: { oasdi_employee: number; oasdi_employer: number; oasdi_self_employed: number; hi_employee: number; hi_self_employed: number; se_net_factor: number; se_min_net: number; addl_medicare_single: number; addl_medicare_joint: number };
  earnings_test: { lower_annual: number; lower_monthly: number; higher_annual: number; higher_monthly: number; lower_withhold: number; higher_withhold: number };
  credits: { qc_amount: number; max_per_year: number; needed_retirement: number };
  reduction: { worker_first36: number; worker_after36: number; spouse_first36: number; spouse_after36: number; widow_max: number; widow_earliest_age: number };
  drc: { monthly_born_after_1942: number; stop_age: number };
  fra_retirement: FraRow[]; fra_survivor: FraRow[];
  family: { spouse_max: number; child_of_retired: number; child_survivor: number; widow_full: number; widow_limit: number; divorce_marriage_years: number; divorce_independent_years: number; widow_marriage_months: number; widow_remarriage_age: number; lump_sum_death: number };
  taxation: { base1: Record<'single' | 'joint' | 'separate_together', number>; base2: Record<'single' | 'joint' | 'separate_together', number>; rate1: number; rate2: number; nonresident_share: number; nonresident_rate: number;
    senior_deduction: { amount: number; years: string; phaseout_single: number; phaseout_joint: number; age: number }; withholding_options: number[] };
  medicare: { part_b_2026: number; part_b_2025: number; part_b_deductible_2026: number };
  stats_aug_2026: { retired_worker_avg: number; spouse_avg: number; widow_avg: number; retired_workers_thousands: number; released: string };
  max_benefit_2026: { age62: number; age65: number; age66: number; age67: number; age70: number; aime62: number; pia62: number };
  ssa_examples_2026: { caseA: { born: number; aime: number; pia: number; benefit62: number; earnings_1986: number; factor_1986: number; indexed_1986: number }; caseB: { born: number; aime: number; pia: number; benefit_fra: number } };
  ssfa: { signed: string; public_law: string; bill: string; applies_after: string; payments_sent: number; payments_total_billion: number };
  payment_days: { days_1_10: number; days_11_20: number; days_21_31: number; legacy_day: number; legacy_before: string };
  claiming: { retroactive_months: number; withdraw_within_months: number };
  sources: Record<SourceKey, Source>;
}

export const P = raw as unknown as Params;

/** Last year with a published AWI (2024) and the parameter year (2026). */
export const LAST_AWI_YEAR = Math.max(...Object.keys(P.series.awi).map(Number));
export const LAST_BP_YEAR = Math.max(...Object.keys(P.series.bend_points).map(Number));
export const LAST_COLA_YEAR = Math.max(...Object.keys(P.series.cola).map(Number));
export const awi = (y: number) => P.series.awi[String(y)];
export const bendPoints = (y: number) => P.series.bend_points[String(Math.min(y, LAST_BP_YEAR))];
export const taxableMax = (y: number) => P.series.taxable_max[String(Math.min(Math.max(y, 1951), P.year))];
export const cola = (y: number) => P.series.cola[String(y)] ?? 0;
