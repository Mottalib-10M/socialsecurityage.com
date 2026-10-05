import { definePage } from '../../lib/page-types';
import { P } from '../../lib/engine/params';

const $ = (n: number, d = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const A = P.ssa_examples_2026.caseA;

export default definePage({
  id: 'benefits-calculator',
  group: 'tools',
  order: 10,
  tool: 'record',
  related: ['aime', 'average-wage-index', 'fewer-than-35-years', 'when-to-claim', 'how-much-will-i-get'],
  sources: ['ssaRetireExample', 'ssaAwi', 'ssaCbb', 'cfr404_211', 'cfr404_802', 'frNotice2026'],
  en: {
    slug: 'social-security-benefits-calculator',
    nav: 'Earnings-record calculator',
    card: 'Paste the earnings from your SSA statement and get your AIME, your PIA and the check at each age.',
    title: 'Social Security Benefits Calculator 2026: Paste Your Record',
    description: `Social Security benefits calculator for 2026: paste the earnings from your SSA statement, see each year indexed, your AIME, PIA and the check from 62 to 70.`,
    h1: 'Social Security benefits calculator from your own earnings record',
    intro: 'The closest you can get to the SSA computation without logging in: your real years of pay, indexed one by one.',
    resume: `Paste the "Taxed Social Security earnings" column of your earnings record, one year per line, and the calculator redoes what the SSA does with it in 2026. Each year before the year you turn 60 is multiplied by the national average wage index of that year divided by the index of the year worked, earnings above the year's taxable maximum are dropped, the best 35 years are averaged over 420 months and the result goes through the bend points of the year you turn 62. On the SSA's own 2026 example, a worker born in ${A.born} with a record from 1986 to 2025, the calculator returns the published AIME of ${$(A.aime)}, a PIA of ${$(A.pia, 2)} and ${$(A.benefit62)} a month at 62. Future years can be added at today's pay until the age you plan to stop working.`,
    faqs: [
      { q: 'Where do I find my earnings record?', a: 'Sign in to my Social Security on ssa.gov and open Earnings Record: it lists, for every year since your first job, the earnings taxed for Social Security and those taxed for Medicare. Copy the Social Security column. Your yearly Social Security Statement shows the same table on its last page.' },
      { q: 'One year on my record looks too low. What should I do?', a: 'Compare it with your W-2 forms or tax return for that year. The SSA can correct a record using pay stubs, W-2s or tax returns. The regulations set a time limit of 3 years, 3 months and 15 days after the year concerned (20 CFR 404.802); past it, a correction is possible only in the cases the rules list. Enter the corrected figure here to see what the fix is worth per month.' },
      { q: 'Why does my total of 35 years include zeros?', a: 'If your record has fewer than 35 years of earnings, the missing years count as zero in the average, which lowers the AIME by the same proportion. The result card shows how many zeros remain in your best 35 years, and adding future working years at today\'s pay shows how fast they are replaced.' },
      { q: 'Should I enter Medicare earnings or Social Security earnings?', a: `Social Security earnings. Medicare taxes apply to all pay, so above the taxable maximum (${$(P.taxable_max_2026)} in 2026) the two columns differ. The calculator caps any year above that year's maximum anyway, so pasting the Medicare column for a high earner changes nothing, but it would mislead you about which years count.` },
    ],
    body: (h) => `
<h2>What the calculator reads and what it does with it</h2>
<p>Lines like "1998 23,400", "1998: $23,400" or "1998;23400" all work. A repeated year keeps the last value. Years before 1951 are ignored because the formula starts in 1951. Future years, from the year after your last entry to the year before the age you stop working, receive the pay you enter, in today's dollars. Your date of birth sets three things: the year your earnings are indexed to (the year you turn 60), the formula year (the year you turn 62) and your ${h.a('full-retirement-age', 'full retirement age')}.</p>
<p>The ledger under the result shows each year: the earnings counted, the indexing factor read from the ${h.src('ssaAwi', 'national average wage index series')}, the indexed amount and whether it is one of the 35 that count. The factor for a year is always 1 from the year you turn 60, which is why late-career raises count at face value. The rules are those of ${h.src('cfr404_211', '20 CFR 404.211')}.</p>
<h2>Three checks worth doing with your record</h2>
<ol>
<li><strong>A missing or low year.</strong> A gap you do not remember, or a year that looks a few thousand dollars short, may be an employer reporting error. Raise it with the SSA, documents in hand.</li>
<li><strong>Your weakest counted year.</strong> The lowest year still inside the top 35 is the one another year of work would replace. If it is a zero or a part-time year, working one more year adds noticeably more than if all 35 years are already strong.</li>
<li><strong>The bracket you are in.</strong> If your AIME is above the second ${h.a('bend-points', 'bend point')}, extra earnings feed the 15% bracket and move the PIA slowly.</li>
</ol>
<h2>Limits</h2>
<p>The tool does not handle disability periods, which the SSA can exclude, nor the child-care dropout years used only for disability. It ignores the special minimum benefit for very long low-wage careers. For a career rebuilt from a single salary instead of a record, use the ${h.a('home', 'quick calculator on the home page')}.</p>`,
  },
});
