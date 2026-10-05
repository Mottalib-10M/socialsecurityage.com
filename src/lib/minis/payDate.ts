import { paymentDay } from '../engine/ss';
import { P } from '../engine/params';
import { yearOptions } from './_kit';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const HOL: string[] = P.extra.payment_calendar.federal_holidays_2026;
/** 20 CFR 404.1807(c)(6): back to the first earlier day that is not a weekend or Federal holiday. */
const shift = (m: number, d: number) => { let x = d; for (;;) { const dt = new Date(Date.UTC(2026, m - 1, x)); const iso = dt.toISOString().slice(0, 10); const wd = dt.getUTCDay(); if (wd !== 0 && wd !== 6 && !HOL.includes(iso)) return dt; x -= 1; } };
const fmt = (dt: Date) => `${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dt.getUTCDay()]}, ${MONTHS[dt.getUTCMonth()]} ${dt.getUTCDate()}`;
/** Payment date in a month of 2026 by the insured worker's day of birth. */
export default () => ({
  title: 'Your 2026 payment date',
  cta: 'Estimate the amount of the check',
  inputs: [
    { id: 'm', label: 'Month of 2026', def: 11, options: MONTHS.map((l, i) => ({ value: String(i + 1), label: l })) },
    { id: 'd', label: 'Day of birth of the insured worker', def: 7, options: yearOptions(1, 31) },
  ],
  run: ({ m, d }: Record<string, number>) => {
    const day = paymentDay(2026, m, d), rank = d <= 10 ? 'second' : d <= 20 ? 'third' : 'fourth';
    const pay = shift(m, day), legacy = shift(m, P.payment_days.legacy_day);
    return { head: ['Payment date', fmt(pay)] as [string, string],
      rows: [['Rule applied', `${rank} Wednesday of the month`], ['If you filed before May 1997 or also get SSI', fmt(legacy)], ['Benefit paid that day is for', MONTHS[(m + 10) % 12]]] as [string, string][],
      note: 'A Federal holiday or weekend moves the date to the business day before.' };
  },
});
