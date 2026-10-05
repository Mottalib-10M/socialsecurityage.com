/**
 * Reference cases: the engine must reproduce SSA's own published 2026 examples to the dime.
 * Sources (read 2026-10-05): ssa.gov/oact/progdata/retirebenefit1.html and retirebenefit2.html
 * (cases A and B), ssa.gov/oact/cola/examplemax.html (maximum-taxable earners), 20 CFR 404.410
 * and 404.313 examples, IRS Publication 915 Worksheet 1, SSA "Receiving benefits while working".
 */
import { describe, it, expect } from 'vitest';
import { P, taxableMax } from './params';
import { computePia, benefitAtAge, fraRetirement, fraSurvivor, effectiveBirth, spousalBenefit, survivorBenefit, earningsTest, taxableBenefits, selfEmploymentTax, creditsFor, familyMaximum, paymentDay, breakEvenMonths, projectCareer, piaFromAime, monthAttaining, workerReduction } from './ss';

const caseA: Record<number, number> = { 1986: 16196, 1987: 17283, 1988: 18191, 1989: 18971, 1990: 19909, 1991: 20715, 1992: 21850, 1993: 22107, 1994: 22770, 1995: 23755, 1996: 24994, 1997: 26533, 1998: 28007, 1999: 29657, 2000: 31392, 2001: 32238, 2002: 32660, 2003: 33558, 2004: 35224, 2005: 36621, 2006: 38419, 2007: 40281, 2008: 41330, 2009: 40826, 2010: 41914, 2011: 43354, 2012: 44839, 2013: 45544, 2014: 47298, 2015: 49085, 2016: 49783, 2017: 51651, 2018: 53677, 2019: 55848, 2020: 57590, 2021: 62889, 2022: 66421, 2023: 69560, 2024: 73133, 2025: 75868 };
const maxFrom = (y0: number, y1: number) => Object.fromEntries(Array.from({ length: y1 - y0 + 1 }, (_, i) => [y0 + i, 1e7]));

describe('SSA case A (born 1964, retires at 62 in 2026)', () => {
  const r = computePia({ y: 1964, m: 6, d: 15 }, caseA);
  it('AIME 5,825', () => expect(r.aime).toBe(P.ssa_examples_2026.caseA.aime));
  it('indexes to the 2024 AWI with the 2026 bend points', () => { expect(r.indexYear).toBe(2024); expect(r.bend).toEqual([1286, 7749]); });
  it('1986 indexing factor 4.0323 as published', () => expect(r.rows.find((x) => x.year === 1986)!.factor.toFixed(4)).toBe('4.0323'));
  it('PIA $2,609.80', () => expect(r.pia).toBeCloseTo(P.ssa_examples_2026.caseA.pia, 2));
  it('benefit at 62 (60 months early) $1,826', () => expect(benefitAtAge(r.pia, 62 * 12, 67 * 12).benefit).toBe(P.ssa_examples_2026.caseA.benefit62));
});

describe('SSA case B (born 1959, maximum earnings 1986-2025)', () => {
  const r = computePia({ y: 1959, m: 6, d: 15 }, maxFrom(1986, 2025));
  it('AIME 11,463 with 2021 bend points', () => { expect(r.aime).toBe(P.ssa_examples_2026.caseB.aime); expect(r.bend).toEqual([996, 6002]); });
  it('PIA $4,152.40 after the 2021-2025 COLAs', () => expect(r.pia).toBeCloseTo(P.ssa_examples_2026.caseB.pia, 2));
  it('$4,152 at FRA 66 and 10 months', () => expect(benefitAtAge(r.pia, fraRetirement(1959).total, fraRetirement(1959).total).benefit).toBe(4152));
  it('$4,207 at 67 (2 months of credits), SSA max table', () => expect(benefitAtAge(r.pia, 67 * 12, fraRetirement(1959).total).benefit).toBe(P.max_benefit_2026.age67));
});

describe('SSA maximum-taxable earners, January 2026', () => {
  it('age 62 and 1 month: AIME 14,358, PIA 4,216.90, $2,969', () => {
    const r = computePia({ y: 1963, m: 12, d: 15 }, maxFrom(1986, 2025));
    expect(r.eligibilityYear).toBe(2025);
    const r2 = computePia({ y: 1964, m: 1, d: 15 }, maxFrom(1986, 2025));
    expect(r2.aime).toBe(P.max_benefit_2026.aime62);
    expect(r2.pia).toBeCloseTo(P.max_benefit_2026.pia62, 2);
    expect(benefitAtAge(r2.pia, 62 * 12 + 1, 67 * 12).benefit).toBe(P.max_benefit_2026.age62);
    expect(r.aime).toBeGreaterThan(0);
  });
  it('age 70 (born January 1956): $5,181', () => {
    const r = computePia({ y: 1956, m: 1, d: 15 }, maxFrom(1978, 2025));
    expect(benefitAtAge(r.pia, 70 * 12, fraRetirement(1956).total).benefit).toBe(P.max_benefit_2026.age70);
  });
  it('age 66 (born January 1960): $3,752', () => {
    const r = computePia({ y: 1960, m: 1, d: 15 }, maxFrom(1982, 2025));
    expect(benefitAtAge(r.pia, 66 * 12, 67 * 12).benefit).toBe(P.max_benefit_2026.age66);
  });
  it('age 65 (born January 1961): $3,467', () => {
    const r = computePia({ y: 1961, m: 1, d: 15 }, maxFrom(1983, 2025));
    expect(benefitAtAge(r.pia, 65 * 12, 67 * 12).benefit).toBe(P.max_benefit_2026.age65);
  });
});

describe('ages', () => {
  it('FRA table 20 CFR 404.409(a)', () => {
    expect(fraRetirement(1954).total).toBe(66 * 12); expect(fraRetirement(1955).total).toBe(66 * 12 + 2);
    expect(fraRetirement(1959).total).toBe(66 * 12 + 10); expect(fraRetirement(1960).total).toBe(67 * 12); expect(fraRetirement(1975).total).toBe(67 * 12);
  });
  it('survivor FRA lags two years (404.409(b))', () => { expect(fraSurvivor(1956).total).toBe(66 * 12); expect(fraSurvivor(1960).total).toBe(66 * 12 + 8); expect(fraSurvivor(1962).total).toBe(67 * 12); });
  it('born on January 1 counts as the previous year', () => { expect(effectiveBirth({ y: 1960, m: 1, d: 1 })).toEqual({ y: 1959, m: 12 }); expect(effectiveBirth({ y: 1960, m: 5, d: 1 })).toEqual({ y: 1960, m: 4 }); });
  it('month of FRA for someone born 15 March 1960 is March 2027', () => expect(monthAttaining({ y: 1960, m: 3, d: 15 }, 67 * 12)).toEqual({ y: 2027, m: 3 }));
});

describe('reductions and credits', () => {
  it('SSA table: 62 with FRA 67 keeps 70%, with FRA 66 keeps 75%', () => { expect(1 - workerReduction(60)).toBeCloseTo(0.70, 6); expect(1 - workerReduction(48)).toBeCloseTo(0.75, 6); });
  it('CFR 404.410(a) example: $980.50 PIA, 44 months early -> $751.70', () => expect(benefitAtAge(980.5, 0, 44).benefitExact).toBeCloseTo(751.7, 2));
  it('70 with FRA 67 adds 24%', () => expect(benefitAtAge(1000, 70 * 12, 67 * 12).benefit).toBe(1240));
  it('no credit after 70', () => expect(benefitAtAge(1000, 72 * 12, 67 * 12).benefit).toBe(1240));
  it('CFR 404.410(b) example: spouse benefit $412.40, 28 months early -> $332.20', () => {
    const s = spousalBenefit(824.8, 0, 0, 28); expect(s.reducedExcess).toBeCloseTo(332.2, 2);
  });
  it('SSA spouse example: PIA $1,600, 36 months early -> $600', () => expect(spousalBenefit(1600, 0, 31 * 12, 34 * 12).total).toBe(600));
  it('spouse at 62 with FRA 67 gets 32.5% of the worker PIA', () => expect(spousalBenefit(2000, 0, 62 * 12, 67 * 12).total).toBe(650));
  it('own PIA above half the worker PIA: no spousal top-up', () => expect(spousalBenefit(2000, 1200, 67 * 12, 67 * 12).onlyOwn).toBe(true));
  it('child in care removes the spouse reduction', () => expect(spousalBenefit(2000, 0, 62 * 12, 67 * 12, true).total).toBe(1000));
});

describe('survivors', () => {
  it('CFR 404.410(c) example: $785.70, 16 of 64 months -> $729.70', () => {
    const s = survivorBenefit({ deceasedPia: 785.7, deceasedClaimMonths: null, deceasedFraMonths: 0, survivorClaimMonths: 64 * 12, survivorFraMonths: 65 * 12 + 4 });
    expect(s.reduced).toBeCloseTo(729.7, 2);
  });
  it('at 60 a survivor gets 71.5%', () => {
    const s = survivorBenefit({ deceasedPia: 2000, deceasedClaimMonths: null, deceasedFraMonths: 67 * 12, survivorClaimMonths: 60 * 12, survivorFraMonths: 67 * 12 });
    expect(s.benefit).toBe(1430);
  });
  it('RIB-LIM: deceased claimed at 62 (70%), survivor at FRA gets 82.5% of PIA', () => {
    const s = survivorBenefit({ deceasedPia: 2000, deceasedClaimMonths: 62 * 12, deceasedFraMonths: 67 * 12, survivorClaimMonths: 67 * 12, survivorFraMonths: 67 * 12 });
    expect(s.limited).toBe(true); expect(s.benefit).toBe(1650);
  });
  it('delayed credits pass to the survivor', () => {
    const s = survivorBenefit({ deceasedPia: 2000, deceasedClaimMonths: 70 * 12, deceasedFraMonths: 67 * 12, survivorClaimMonths: 67 * 12, survivorFraMonths: 67 * 12 });
    expect(s.benefit).toBe(2480);
  });
});

describe('earnings test 2026 (SSA examples)', () => {
  it('under FRA all year: $800 a month, $33,400 earned -> $4,460 withheld', () => { const r = earningsTest(800, 33400, 'before'); expect(r.withheld).toBe(4460); expect(r.kept).toBe(5140); });
  it('FRA in August: $66,000 before FRA -> $280 withheld', () => { const r = earningsTest(800, 66000, 'fraYear', 7); expect(r.withheld).toBeCloseTo(280, 6); expect(r.kept).toBeCloseTo(5320, 6); });
});

describe('taxation of benefits (IRS Pub. 915)', () => {
  it('Pub. 915 example: $1,500 benefits, $17,700 other income, single -> 0 taxable', () => expect(taxableBenefits(1500, 17700, 'single').taxable).toBe(0));
  it('single, $24,000 benefits and $30,000 other income -> 85% tier', () => {
    const r = taxableBenefits(24000, 30000, 'single'); // PI 42,000: 0.85*(42,000-34,000)=6,800 + min(12,000, 4,500)=4,500 -> 11,300
    expect(r.taxable).toBeCloseTo(11300, 6); expect(r.tier).toBe(85);
  });
  it('joint, PI between $32,000 and $44,000 -> half the excess', () => expect(taxableBenefits(30000, 22000, 'joint').taxable).toBeCloseTo(2500, 6));
  it('never more than 85% of benefits', () => expect(taxableBenefits(30000, 500000, 'joint').taxable).toBeCloseTo(25500, 6));
});

describe('payroll, credits, family maximum, calendar', () => {
  it('2026 base $184,500 and $1,890 per credit', () => { expect(taxableMax(2026)).toBe(184500); expect(creditsFor(7560)).toBe(4); expect(creditsFor(7559)).toBe(3); });
  it('self-employment: 92.35% then 15.3%', () => { const r = selfEmploymentTax(50000); expect(r.base).toBeCloseTo(46175, 6); expect(r.total).toBeCloseTo(46175 * 0.153, 6); });
  it('family maximum formula 2026 (150/272/134/175%)', () => expect(familyMaximum(2000, 2026)).toBeCloseTo(floor10(1.5 * 1643 + 2.72 * (2000 - 1643)), 6));
  it('payment day: born the 15th -> third Wednesday (January 2026: the 21st)', () => expect(paymentDay(2026, 1, 15)).toBe(21));
  it('break-even 62 vs 70 near 80 and a half when 70 pays 24/70 more', () => {
    const m = breakEvenMonths({ start: 62 * 12, benefit: 700 }, { start: 70 * 12, benefit: 1240 })!; expect(m / 12).toBeCloseTo(80.37, 1);
  });
  it('career projection follows the AWI', () => { const c = projectCareer({ y: 1970, m: 6, d: 15 }, 69846.57, 22, 62); expect(c[2024]).toBe(69847); expect(c[1992]).toBe(22935); });
  it('PIA formula on the 2026 bend points', () => expect(piaFromAime(10000)).toBeCloseTo(floor10(0.9 * 1286 + 0.32 * (7749 - 1286) + 0.15 * (10000 - 7749)), 6));
});
function floor10(x: number) { return Math.floor(x * 10 + 1e-9) / 10; }
