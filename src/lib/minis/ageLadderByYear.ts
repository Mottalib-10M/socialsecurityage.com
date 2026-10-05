import { fraRetirement, fraSurvivor, monthAttaining } from '../engine/ss';
import { P } from '../engine/params';
import { ageText, yearOptions, mid } from './_kit';
/** Retirement-age guide: the five ages that matter, turned into calendar years for one birth year. */
export default () => ({
  title: 'Every Social Security age for your birth year',
  cta: 'Exact months from your birth date',
  inputs: [{ id: 'y', label: 'Year of birth', def: 1964, options: yearOptions(1955, 2006) }],
  run: ({ y }: Record<string, number>) => {
    const b = mid(y), f = fraRetirement(y), s = fraSurvivor(y);
    const yr = (m: number) => String(monthAttaining(b, m).y);
    return { head: ['Full retirement age', `${ageText(f.total)} (in ${yr(f.total)})`] as [string, string],
      rows: [['Earliest retirement check, 62 and 1 month', yr(62 * 12 + 1)], [`Widow(er) benefits from ${P.reduction.widow_earliest_age}`, `${yr(P.reduction.widow_earliest_age * 12)}, full at ${ageText(s.total)}`], [`Medicare at ${P.extra.medicare_age.first_eligible}`, yr(P.extra.medicare_age.first_eligible * 12)], [`Delayed credits stop at ${P.drc.stop_age}`, yr(P.drc.stop_age * 12)]] as [string, string][],
      note: 'Years shown for a mid-year birthday. Born on January 1? Use the year before.' };
  },
});
