import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';
import { fraRetirement, fraSurvivor, benefitAtAge, spouseReduction, monthAttaining, effectiveBirth } from '../../lib/engine/ss';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const age = (m: number) => { const y = Math.floor(m / 12), mo = m % 12; return mo ? `${y} and ${mo} month${mo > 1 ? 's' : ''}` : `${y}`; };
const pc = (x: number) => `${Math.round(x * 1000) / 10}%`;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const f60 = fraRetirement(1960), f59 = fraRetirement(1959), f55 = fraRetirement(1955);
const at62 = (y: number) => benefitAtAge(1000, 62 * 12, fraRetirement(y).total).factor;
const sp62 = (y: number) => P.family.spouse_max * (1 - spouseReduction(fraRetirement(y).total - 62 * 12));
// Worked dates: born March 1, 1960 is treated as born in February 1960; born January 1, 1960 as born in 1959.
const mar1 = monthAttaining({ y: 1960, m: 3, d: 1 }, f60.total), mar2 = monthAttaining({ y: 1960, m: 3, d: 2 }, f60.total);
const jan1 = effectiveBirth({ y: 1960, m: 1, d: 1 });
const jan1Fra = fraRetirement(jan1.y), jan1At = monthAttaining({ y: 1960, m: 1, d: 1 }, jan1Fra.total);

export default definePage({
  id: 'full-retirement-age',
  group: 'tools',
  order: 30,
  tool: 'fra',
  related: ['retirement-age', 'when-to-claim', 'claiming-at-62', 'survivor-calculator', 'born-1964'],
  sources: ['cfr404_409', 'ssaNra', 'ssaEarlyRetire', 'cfr404_410', 'ssaWhileWorking'],
  en: {
    slug: 'full-retirement-age',
    nav: 'Full retirement age',
    card: `67 for anyone born in 1960 or later, earlier before that, and a separate table for widows and widowers.`,
    title: `Full Retirement Age 2026: Table by Birth Year, to the Month`,
    description: `Full retirement age is 67 for people born in 1960 or later, ${age(f59.total)} for 1959. 2026 table by birth year, the January 1 rule and the survivor table.`,
    h1: 'Full retirement age by birth year, to the exact month',
    intro: 'Enter your birth date and the tool gives the month you reach full retirement age, with the separate age that applies to survivor benefits.',
    resume: `Full retirement age is ${age(f60.total)} for everyone born in 1960 or later. It was 66 for people born from 1943 to 1954 and rose two months per birth year in between: ${age(f55.total)} for 1955 up to ${age(f59.total)} for 1959, as set by 20 CFR 404.409(a). Two calendar quirks decide which row is yours. The SSA considers that you reach an age the day before your birthday, so someone born on January 1 belongs to the previous year's row, and someone born on the 1st of any month reaches each age one month earlier than the birth month suggests. Survivor benefits follow a second table, 404.409(b), that runs two years behind: 66 for widows and widowers born from 1945 to 1956, 67 only from 1962. Starting retirement benefits at 62 keeps ${pc(at62(1960))} of the full amount for a full retirement age of 67, and ${pc(at62(1954))} for one of 66.`,
    faqs: [
      { q: 'I was born on January 1, 1960. Is my full retirement age 67?', a: `No. The SSA treats a January 1 birthday as a birth in the previous year, so you use the 1959 row: ${age(jan1Fra.total)}, reached in ${MONTHS[jan1At.m - 1]} ${jan1At.y}. The rule comes from the way ages are counted in 20 CFR 404.409: you attain an age on the day before your birthday.` },
      { q: 'Is there a full retirement age of 68 for people born after 1960?', a: `No. The table in 20 CFR 404.409(a), in the eCFR version current to October 1, 2026, stops at ${age(f60.total)} for everyone born in 1960 or later, including people born in the 1970s, 1980s and 1990s. Only a new law could add a later age. The tool reads the regulation as it stands and will change if the table does.` },
      { q: 'Is full retirement age the same for a spouse benefit?', a: `Yes. Spouse benefits use the retirement table in 404.409(a), so a spouse born in 1960 or later gets the full 50% of the worker's PIA only from 67. At 62 the spouse gets ${pc(sp62(1960))} of the worker's PIA, because the spouse reduction is steeper: 25/36 of 1% a month for the first 36 months.` },
      { q: 'Why does my widow benefit become full before my retirement benefit?', a: `Because the survivor table runs two years behind. A widow born in 1960 reaches survivor full retirement age at ${age(fraSurvivor(1960).total)} but retirement full retirement age at ${age(f60.total)}. Between the two, she can take an unreduced survivor benefit while her own retirement benefit keeps growing.` },
      { q: 'Does working past full retirement age still reduce my checks?', a: `No. From the month you reach full retirement age, earnings no longer cause any withholding, whatever you earn. In the calendar year you reach it, the 2026 limit of ${$(P.earnings_test.higher_annual)} applies only to pay earned in the months before that month.` },
    ],
    body: (h) => {
      const years = [1954, 1955, 1956, 1957, 1958, 1959, 1960];
      const rows = years.map((y) => { const f = fraRetirement(y); return [y === 1954 ? '1943 to 1954' : y === 1960 ? '1960 and later' : String(y), age(f.total), String(f.total - 62 * 12), h.pct(at62(y)), h.pct(sp62(y))]; });
      const sYears = [1956, 1957, 1958, 1959, 1960, 1961, 1962];
      const srows = sYears.map((y) => { const s = fraSurvivor(y); return [y === 1956 ? '1945 to 1956' : y === 1962 ? '1962 and later' : String(y), age(s.total), String(s.total - P.reduction.widow_earliest_age * 12), h.pct(1 - P.reduction.widow_max)]; });
      return `
<h2>Retirement and spouse table</h2>
${h.table(['Born in', 'Full retirement age', 'Months from 62', 'Worker at 62', 'Spouse at 62'], rows, 'Share of the PIA paid at exactly 62 (most people can start at 62 and 1 month at the earliest)', ['l', 'l', 'r', 'r', 'r'])}
<p>The percentages follow ${h.src('cfr404_410', '20 CFR 404.410')}: a worker loses 5/9 of 1% for each of the first 36 months before full retirement age and 5/12 of 1% for each month beyond, a spouse 25/36 of 1% and then 5/12 of 1%. The ${h.src('ssaEarlyRetire', 'SSA\'s reduction table')} lists the same values. Because a later full retirement age means more months between 62 and that age, each two-month step in the table costs a little under one percentage point at 62.</p>

<h2>The day-before-your-birthday rule</h2>
<p>The law counts you as reaching an age on the day before your birthday. For most people this changes nothing. For two groups it moves the calendar by a month or a year:</p>
<ul>
<li><strong>Born on the 1st of a month.</strong> You attain each age on the last day of the previous month, so you are treated as born in that previous month. Someone born on March 1, 1960 reaches 67 in ${MONTHS[mar1.m - 1]} ${mar1.y}; someone born on March 2 reaches it in ${MONTHS[mar2.m - 1]} ${mar2.y}.</li>
<li><strong>Born on January 1.</strong> You are treated as born in December of the previous year, so you take the previous year's row. A January 1, 1960 birthday gets ${age(jan1Fra.total)}, not ${age(f60.total)}.</li>
</ul>
<p>The tool applies both rules to the date you enter and shows the calendar month, which is what matters for a claim and for the end of the earnings test.</p>

<h2>Survivor table: two years behind</h2>
${h.table(['Born in', 'Survivor full retirement age', 'Months from 60', 'Widow(er) at 60'], srows, '20 CFR 404.409(b): full retirement age for widow(er) benefits', ['l', 'l', 'r', 'r'])}
<p>The survivor schedule in ${h.src('cfr404_409', '20 CFR 404.409(b)')} has the same two-month steps, shifted by two birth years. At 60, the earliest age for a non-disabled widow or widower, the benefit is cut by ${h.pct(P.reduction.widow_max)} whatever the birth year: the reduction is spread over the months between 60 and survivor full retirement age, so a longer span means a smaller monthly cut, not a bigger total one. The ${h.src('ssaWhileWorking', 'SSA uses the retirement table')}, not the survivor one, to apply the earnings test to survivors.</p>

<h2>What changes on the day you reach it</h2>
<p>Full retirement age is the point where three rules switch. Your own benefit equals your PIA with no reduction. The earnings test stops, and any months withheld before are credited back through a recomputation. And from that month, each month without a check earns a delayed retirement credit of 2/3 of 1%, up to 70. It is not the age at which Medicare starts, which stays at ${P.extra.medicare_age.first_eligible} for everyone. The ${h.src('ssaNra', 'SSA\'s normal retirement age page')} shows where the schedule started: ${age(fraRetirement(1937).total)} for anyone born in 1937 or earlier, then two more months for each birth year. How it fits with 62, 70 and the survivor ages is laid out in the ${h.a('retirement-age', 'retirement age guide')}, and the ${h.a('when-to-claim', 'break-even tool')} compares starts on either side of it.</p>`;
    },
  },
});
