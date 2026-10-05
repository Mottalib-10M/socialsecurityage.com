import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { paymentDay } from '../../lib/engine/ss';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOL: string[] = P.extra.payment_calendar.federal_holidays_2026;
/** 20 CFR 404.1807(c)(6): a day that is a Saturday, Sunday or Federal holiday moves to the first earlier day that is not. */
const pay = (m: number, d: number) => { let x = d; for (;;) { const dt = new Date(Date.UTC(2026, m - 1, x)); const wd = dt.getUTCDay(); if (wd !== 0 && wd !== 6 && !HOL.includes(dt.toISOString().slice(0, 10))) return dt; x -= 1; } };
const short = (dt: Date) => `${DAYS[dt.getUTCDay()].slice(0, 3)} ${MONTHS[dt.getUTCMonth()].slice(0, 3)} ${dt.getUTCDate()}`;
const moved = (m: number, d: number) => pay(m, d).getUTCDate() !== d;
const PD = P.payment_days;
const nov2 = pay(11, paymentDay(2026, 11, 5));
const shifted3 = Array.from({ length: 12 }, (_, i) => i + 1).filter((m) => moved(m, PD.legacy_day));

export default definePage({
  id: 'payment-schedule',
  group: 'claiming',
  order: 90,
  mini: 'payDate',
  related: ['how-much-will-i-get', 'cola-2026', 'medicare-part-b', 'living-abroad', 'claiming-at-62'],
  sources: ['cfr404_1807', 'opmHolidays', 'frNotice2026'],
  en: {
    slug: 'social-security-payment-schedule',
    nav: 'Payment schedule 2026',
    card: 'Second, third or fourth Wednesday by the worker\'s day of birth, or the 3rd of the month: every 2026 date, holiday shifts included.',
    title: 'Social Security Payment Schedule 2026: Every Date, by Group',
    description: 'Social Security payment schedule 2026: born 1st to 10th, paid the 2nd Wednesday; 11th to 20th, the 3rd; 21st to 31st, the 4th; older or SSI cases, the 3rd.',
    h1: 'The 2026 Social Security payment schedule',
    intro: 'Your payment day was fixed the day your claim was approved. It depends on one date of birth, and it is not always your own.',
    resume: `Social Security pays retirement benefits on a Wednesday chosen by the day of the month on which the insured worker was born, under 20 CFR 404.1807: born on the 1st to the 10th, the second Wednesday of each month; the 11th to the 20th, the third Wednesday; the 21st to the 31st, the fourth Wednesday. Spouses and children paid on that worker's record get the same day, set by the worker's birth date, not their own. Four groups are paid on the 3rd of the month instead: records with an application filed before May 1, 1997, people who also receive Supplemental Security Income, beneficiaries living in a foreign country, and people whose state pays their Medicare premium. When the day falls on a weekend or a Federal holiday, payment comes on the business day before; in 2026 that moves the November payment for the second-Wednesday group to ${DAYS[nov2.getUTCDay()]}, November ${nov2.getUTCDate()}, because November 11 is Veterans Day. Each payment covers the month before: the check of January 2026 is the benefit for December 2025.`,
    faqs: [
      { q: 'My husband was born on the 25th and I was born on the 4th. When am I paid on his record?', a: `On the fourth Wednesday, his day. 20 CFR 404.1807 assigns the same payment day to everyone receiving benefits on a given worker's record, based on the day of the month on which that worker was born. If you also have a benefit on your own record, the rules for people entitled on two records apply.` },
      { q: 'Why did my first check arrive a month after my benefits started?', a: `Because Social Security pays in arrears. Each payment is for the month before, so a benefit that starts in July 2026 is first paid in August 2026, on your assigned day. The same lag explains why the ${P.cola_2026.pct}% increase, effective for December 2025, first appeared in the January 2026 payment.` },
      { q: 'I moved abroad. Will my payment day change?', a: `It can. For records with an application filed after April 30, 1997, residence in a foreign country moves everyone on the record to the 3rd of the month, under paragraph (c)(3) of 20 CFR 404.1807. The SSA notifies you in writing when it changes your payment day for that reason.` },
      { q: 'Can I choose a different payment day?', a: `No. Once assigned, the day "will not be changed" except in the cases the regulation lists: SSI, foreign residence, a state paying your Medicare premium, entitlement on another record. A birthday on the 10th or the 11th makes a full week of difference, but the rule offers no option.` },
      { q: 'What happens when the payment day is a holiday?', a: `You are paid on the first earlier day that is not a Saturday, Sunday or Federal legal holiday (20 CFR 404.1807(c)(6)). In 2026 only one Wednesday payment is affected, November 11, Veterans Day. Payments due on the 3rd move more often, ${shifted3.length} times in 2026, because the 3rd regularly falls on a weekend.` },
    ],
    body: (h) => {
      const rows = MONTHS.map((name, i) => {
        const m = i + 1;
        const c = (d: number) => { const dt = pay(m, d); return moved(m, d) ? `<strong>${short(dt)}</strong>` : short(dt); };
        return [name, MONTHS[(i + 11) % 12], c(PD.legacy_day), c(paymentDay(2026, m, 5)), c(paymentDay(2026, m, 15)), c(paymentDay(2026, m, 25))];
      });
      return `
<h2>Every 2026 payment date</h2>
${h.table(['Paid in', 'Benefit for', '3rd of month group', 'Born 1st to 10th', 'Born 11th to 20th', 'Born 21st to 31st'], rows, 'Dates moved for a weekend or Federal holiday are in bold (20 CFR 404.1807(c)(6); Federal holidays from OPM)', ['l', 'l', 'l', 'l', 'l', 'l'])}
<p>Dates come from the rule in ${h.src('cfr404_1807', '20 CFR 404.1807')} applied to the 2026 calendar, with the ${h.src('opmHolidays', 'Federal holidays published by OPM')}. A payment day that falls on a Saturday, Sunday or Federal holiday is moved to the first preceding day that is not one.</p>

<h2>Which column is yours</h2>
<h3>The Wednesday groups</h3>
<p>For records whose first application was filed after April 30, 1997, payments are spread over three Wednesdays. The date that counts is the day of the month on which the <strong>insured worker</strong> was born, the person whose earnings record pays the benefit:</p>
<ul>
<li>1st to 10th: second Wednesday;</li>
<li>11th to 20th: third Wednesday;</li>
<li>21st to 31st: fourth Wednesday.</li>
</ul>
<p>Only the day counts, not the month or the year: a worker born on March 10 is paid on the second Wednesday, one born on March 11 a week later. A retired worker is paid on their own birth date. A spouse, a child, a widow or a widower paid on that worker's record is paid on the worker's birth date, because the regulation assigns "the same payment day for all individuals who receive benefits on the earnings record of a particular insured individual."</p>
<h3>The 3rd of the month</h3>
<p>Four situations put a whole record on the 3rd:</p>
<ol>
<li>anyone on the record became entitled on an application filed before May 1, 1997: the record stays on the 3rd, including people who join it later;</li>
<li>someone on the record also receives Supplemental Security Income, or has income deemed to an SSI recipient;</li>
<li>someone on the record lives in a foreign country;</li>
<li>a state pays the Medicare premium of someone on the record.</li>
</ol>
<p>Cases 2 to 4 apply to records with applications filed after April 30, 1997, and the SSA notifies the beneficiaries in writing when it moves them. People living outside the United States can read our ${h.a('living-abroad', 'page on benefits abroad')}.</p>

<h2>Paid the month after</h2>
<p>Each payment is for the previous month. Two consequences surprise new retirees:</p>
<ul>
<li>the first payment arrives the month after the first month of entitlement, so someone entitled from June 2026 is paid first in July;</li>
<li>a cost-of-living adjustment effective for December shows up in January, as the ${P.cola_2026.pct}% did in January 2026 according to the ${h.src('frNotice2026', 'SSA notice')};</li>
</ul>

<h2>The ${shifted3.length} moves of the 3rd in 2026</h2>
<p>The Wednesday groups almost never move, since a Wednesday cannot be a weekend: in 2026 the only shift is November 11, Veterans Day. The 3rd of the month moves whenever it falls on a Saturday or Sunday, or on a Federal holiday, as on July 3, when Independence Day is observed. In 2026 that happens in ${shifted3.map((m) => MONTHS[m - 1]).join(', ').replace(/, ([^,]+)$/, ' and $1')}. In each case the money arrives earlier, never later.</p>

<h2>If a payment is missing</h2>
<p>The regulation has the SSA certify each recurring payment "for delivery on or before" the assigned day, so a payment is never scheduled after it. If a deposit is missing, the bank's posting record and the SSA's own payment history are the two places to look; the SSA can be reached at 1-800-772-1213. The ${h.a('how-much-will-i-get', 'amount you can expect')} and the ${h.a('medicare-part-b', 'Medicare premium deducted')} each have their own pages.</p>`;
    },
  },
});
