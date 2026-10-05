import { definePage } from '../../lib/page-types';
import { P, bendPoints } from '../../lib/engine/params';
import { benefitAtAge, fraRetirement, fraSurvivor } from '../../lib/engine/ss';

const Y = 1964;
const fra = fraRetirement(Y);
const bp = bendPoints(Y + 62);
const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const A = P.ssa_examples_2026.caseA;

export default definePage({
  id: 'born-1964',
  group: 'birthyear',
  order: 1964,
  mini: 'fraByYear',
  related: ['born-1963', 'born-1965-later', 'bend-points', 'claiming-at-62', 'full-retirement-age'],
  sources: ['frNotice2026', 'ssaRetireExample', 'cfr404_409', 'cfr404_410'],
  en: {
    slug: 'social-security-born-in-1964',
    nav: 'Born in 1964',
    card: 'You turn 62 in 2026: the first cohort under the 2026 formula, with full retirement age at 67 in 2031.',
    title: 'Born in 1964: Social Security at 62 in 2026, Full Age 67',
    description: `Born in 1964: you turn 62 in 2026, so the 2026 bend points (${$(bp[0])}, ${$(bp[1])}) set your PIA. Full retirement age 67 in 2031; 70% of the PIA at 62, 124% at 70.`,
    h1: 'Social Security if you were born in 1964',
    intro: 'The 2026 formula is written for you: you are the cohort that becomes eligible this year.',
    resume: `If you were born in 1964 (from January 2, 1964 to January 1, 1965), you become eligible for retirement benefits in 2026, so your primary insurance amount uses the 2026 bend points, ${$(bp[0])} and ${$(bp[1])}, and your earnings are indexed to the 2024 national average wage index, ${P.series.awi['2024'].toLocaleString('en-US')}. Your full retirement age is 67, reached in 2031. Starting at 62 keeps 70% of the PIA after 60 months of reduction; waiting to 70, in 2034, raises it to 124%. The SSA's own 2026 example is a worker born in 1964: an AIME of ${$(A.aime)} gives a PIA of ${$(A.pia, 2)} and ${$(A.benefit62)} a month at 62. No COLA applies to your PIA before the one announced for December 2026, because COLAs only start in the year you turn 62.`,
    faqs: [
      { q: 'Born in 1964, when is the earliest month I can be paid?', a: 'You must be 62 for the whole month. Born on the 1st or 2nd of a month, that is your birthday month of 2026; born later in the month, it is the following month. Payment for a month arrives the next month, so a person born on June 15, 1964 can be entitled from July 2026 and receive the first check in August.' },
      { q: 'Does the 2.8% COLA for 2026 apply to people born in 1964?', a: `No. The ${P.cola_2026.pct}% increase effective December 2025 applies to people who were eligible before 2026. For you, eligibility starts in 2026, so the first increase you can receive is the one effective December 2026, even if you wait years to claim: COLAs from 62 onward are added whatever your start age.` },
      { q: 'If I keep working until 67, which years will count?', a: 'Every year counts at face value from 2024, the year you turned 60, so a raise at 63 or 65 is not shrunk by indexing. If a new year beats one of your 35 best, the SSA recomputes the benefit each year automatically, including after you start benefits.' },
      { q: 'When does my survivor full retirement age arrive?', a: `Survivor benefits follow their own table, two years behind: for people born in 1964 it is ${fraSurvivor(Y).years}, the same 67 as for retirement. A widow or widower born in 1964 can start survivor benefits at 60, in 2024 or later, at 71.5% of the deceased's benefit.` },
    ],
    body: (h) => {
      const pia = 2000;
      const rows = [62, 63, 64, 65, 66, 67, 68, 69, 70].map((a) => { const r = benefitAtAge(pia, a * 12 + (a === 62 ? 1 : 0), fra.total); return [a === 62 ? '62 and 1 month' : String(a), String(Y + a), h.pct(r.factor), h.usd(r.benefit)]; });
      return `
<h2>The first cohort on the 2026 formula</h2>
<p>Everyone born in 1964 shares the same formula year, 2026, and the same indexing year, 2024. That has a practical consequence: two people born in 1963 and 1964 with the same career are computed with different bend points, ${h.usd(bendPoints(2025)[0])} against ${h.usd(bp[0])} for the first one, and the 1963 cohort also received the ${P.cola_2026.pct}% COLA of December 2025. Our ${h.a('bend-points', 'bend points page')} shows how much the formula year moves a PIA.</p>
<p>The ${h.src('ssaRetireExample', 'SSA\'s 2026 calculation example')} uses precisely a worker born in 1964 retiring at 62 in 2026. Its earnings of ${h.usd(P.ssa_examples_2026.caseA.earnings_1986)} in 1986 are multiplied by ${P.ssa_examples_2026.caseA.factor_1986} to reach ${h.usd(P.ssa_examples_2026.caseA.indexed_1986)} in 2024 wages, and so on for each year. Our engine reproduces that example to the dime, which is the best test there is for a 1964 birth.</p>
<h2>Your calendar</h2>
${h.table(['Start at', 'Year', 'Share of PIA', `If your PIA is ${h.usd(pia)}`], rows, 'Born in 1964: full retirement age 67. Amounts before COLAs from 2026 onward', ['l', 'l', 'r', 'r'])}
<p>Medicare starts at 65, in 2029, whether or not you have started Social Security; delaying benefits does not delay the Medicare enrollment window. Until 2031 the ${h.a('earnings-test', 'earnings test')} applies if you work while collecting: in the calendar year you turn 67 the higher limit applies to earnings before your birthday month.</p>
<h2>What a 1964 birth does not change</h2>
<p>The reduction rules for starting early, 5/9 of 1% per month for the first 36 months and 5/12 beyond (${h.src('cfr404_410', '20 CFR 404.410')}), and the delayed credit of 2/3 of 1% per month are the same for every cohort born from 1960 onward. Being born on January 1, 1965 puts you in this group too: the SSA counts you as born in 1964. For the exact month you reach each age, use the ${h.a('full-retirement-age', 'full retirement age calculator')}.</p>`;
    },
  },
});
