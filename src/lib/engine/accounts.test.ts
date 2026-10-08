/**
 * Reference cases for the Medicare and retirement-account engine. Sources read on 2026-10-08:
 * CMS 2026 Parts A and B fact sheet (IRMAA tables), 26 CFR 1.401(a)(9)-9 (life tables) and its own example,
 * Rev. Proc. 2025-32 (2026 tax tables, "plus" amounts), Rev. Proc. 2025-19 (HSA), DOL COBRA FAQs.
 */
import { describe, it, expect } from 'vitest';
import { irmaa, irmaaTier, rmdStartAge, uniformDivisor, singleLife, ownerRmd, rmdExcise, inheritedRmd, federalTax, marginalRate, rothConversion, hsa, hsaMonthsBeforeMedicare, cobraCost } from './accounts';

describe('IRMAA 2026 (CMS fact sheet, 2024 MAGI)', () => {
  it('single bounds are inclusive', () => { expect(irmaaTier(109000, 0)).toBe(0); expect(irmaaTier(109001, 0)).toBe(1); expect(irmaaTier(205000, 0)).toBe(3); expect(irmaaTier(499999, 0)).toBe(4); expect(irmaaTier(500000, 0)).toBe(5); });
  it('joint bounds', () => { expect(irmaaTier(218000, 1)).toBe(0); expect(irmaaTier(274001, 1)).toBe(2); expect(irmaaTier(750000, 1)).toBe(5); });
  it('married filing separately, living together: $0, $446.30, $487.00', () => { expect(irmaa(109000, 2).partB).toBe(0); expect(irmaa(109001, 2).partB).toBe(446.3); expect(irmaa(390999, 2).partD).toBe(83.3); expect(irmaa(391000, 2).partB).toBe(487); });
  it('tier 3 single: Part B $527.50 total, Part D +$60.40', () => { const r = irmaa(180000, 0); expect(r.totalB).toBeCloseTo(527.5, 2); expect(r.partD).toBe(60.4); expect(r.yearly).toBeCloseTo((324.6 + 60.4) * 12, 2); });
  it('next threshold and room', () => { const r = irmaa(100000, 0); expect(r.nextAt).toBe(109001); expect(r.roomBelowNext).toBe(9000); });
});

describe('RMD tables (26 CFR 1.401(a)(9)-9)', () => {
  it('applicable age: 73 for 1951-1959, 75 from 1960', () => { expect(rmdStartAge(1953)).toBe(73); expect(rmdStartAge(1959)).toBe(73); expect(rmdStartAge(1960)).toBe(75); });
  it('Uniform Lifetime Table: 73 -> 26.5, 75 -> 24.6, 120+ -> 2.0', () => { expect(uniformDivisor(73)).toBe(26.5); expect(uniformDivisor(75)).toBe(24.6); expect(uniformDivisor(125)).toBe(2); expect(uniformDivisor(70)).toBeNull(); });
  it('Single Life Table: 76 -> 14.1 (regulation example), 0 -> 84.6', () => { expect(singleLife(76)).toBe(14.1); expect(singleLife(0)).toBe(84.6); });
  it('$500,000 at 73 -> $18,867.92', () => { const r = ownerRmd(500000, 73, 1953); expect(r.amount).toBeCloseTo(18867.92, 2); expect(r.deadlineNote).toBe('april1'); });
  it('born 1961 at 73: nothing required yet', () => expect(ownerRmd(500000, 73, 1961).required).toBe(false));
  it('excise 25% or 10%', () => { expect(rmdExcise(10000, false)).toBe(2500); expect(rmdExcise(10000, true)).toBe(1000); });
});

describe('Inherited IRA (2024 final regulations)', () => {
  it('regulation example: 76-year-old beneficiary, 2 years later -> 12.1', () => {
    const r = inheritedRmd({ balancePrevDec31: 121000, kind: 2, deathYear: 2025, year: 2028, benAgeYearAfterDeath: 76, ownerAgeAtDeath: 70, afterRbd: false });
    expect(r.divisor).toBeCloseTo(12.1, 5); expect(r.amount).toBeCloseTo(10000, 2);
  });
  it('adult child, owner died before RBD: no yearly minimum, all by year 10', () => {
    const r = inheritedRmd({ balancePrevDec31: 300000, kind: 0, deathYear: 2025, year: 2027, benAgeYearAfterDeath: 50, ownerAgeAtDeath: 70, afterRbd: false });
    expect(r.amount).toBe(0); expect(r.emptyBy).toBe(2035);
  });
  it('adult child, owner died after RBD: 36.2 the first year, then minus 1', () => {
    const a = inheritedRmd({ balancePrevDec31: 362000, kind: 0, deathYear: 2025, year: 2026, benAgeYearAfterDeath: 50, ownerAgeAtDeath: 80, afterRbd: true });
    expect(a.divisor).toBeCloseTo(36.2, 5); expect(a.amount).toBeCloseTo(10000, 2);
    const b = inheritedRmd({ balancePrevDec31: 100000, kind: 0, deathYear: 2025, year: 2035, benAgeYearAfterDeath: 50, ownerAgeAtDeath: 80, afterRbd: true });
    expect(b.amount).toBe(100000);
  });
  it('spouse can wait for the owner\'s RMD age when death was before the RBD', () => {
    const r = inheritedRmd({ balancePrevDec31: 200000, kind: 1, deathYear: 2025, year: 2026, benAgeYearAfterDeath: 66, ownerAgeAtDeath: 68, afterRbd: false });
    expect(r.method).toBe('not-yet'); expect(r.amount).toBe(0);
  });
});

describe('2026 federal tax (Rev. Proc. 2025-32 "plus" amounts)', () => {
  it('single at $105,700: $17,966', () => expect(federalTax(105700, 0)).toBeCloseTo(17966, 2));
  it('joint at $403,550: $82,048', () => expect(federalTax(403550, 1)).toBeCloseTo(82048, 2));
  it('joint at $768,700: $206,583.50', () => expect(federalTax(768700, 1)).toBeCloseTo(206583.5, 2));
  it('head of household at $201,750: $39,207', () => expect(federalTax(201750, 2)).toBeCloseTo(39207, 2));
  it('single over $640,600: $192,979.25 at the bound', () => expect(federalTax(640600, 0)).toBeCloseTo(192979.25, 2));
  it('marginal rate', () => { expect(marginalRate(50000, 0)).toBe(0.12); expect(marginalRate(100801, 1)).toBe(0.22); });
  it('Roth conversion of $50,000 on $80,000 joint taxable: 12% then 22%', () => { const r = rothConversion(80000, 112200, 50000, 1); expect(r.tax).toBeCloseTo(20800 * 0.12 + 29200 * 0.22, 2); expect(r.topRate).toBe(0.22); });
});

describe('HSA 2026 and COBRA', () => {
  it('limits $4,400 / $8,750, catch-up $1,000', () => { expect(hsa({ family: false, age55: false, months: 12, contribution: 99999, fedRate: 0, stateRate: 0, payroll: false }).limit).toBe(4400); expect(hsa({ family: true, age55: true, months: 12, contribution: 0, fedRate: 0, stateRate: 0, payroll: false }).limit).toBe(9750); });
  it('Medicare from July: 6 eligible months, family 55+ = $4,875', () => { expect(hsaMonthsBeforeMedicare(7)).toBe(6); expect(hsa({ family: true, age55: true, months: 6, contribution: 9750, fedRate: 0.22, stateRate: 0, payroll: true }).excess).toBe(4875); });
  it('COBRA 102%, 150% after month 18 with a disability extension', () => { expect(cobraCost({ planMonthly: 1000, months: 18, disability: false, marketplaceMonthly: 0 }).total).toBeCloseTo(18360, 2); expect(cobraCost({ planMonthly: 1000, months: 29, disability: true, marketplaceMonthly: 0 }).total).toBeCloseTo(18360 + 11 * 1500, 2); });
});
