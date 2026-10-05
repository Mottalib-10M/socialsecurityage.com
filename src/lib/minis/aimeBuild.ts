import { computePia, projectCareer } from '../engine/ss';
import { usd, yearOptions, mid } from './_kit';
/** AIME from a birth year and a steady pay in today's dollars (career from 22 to 62). */
export default () => ({
  title: 'Build your AIME from a steady career',
  cta: 'Enter your real earnings year by year',
  inputs: [
    { id: 's', label: 'Yearly pay in today\'s dollars', def: 60000, unit: '$', max: 1000000 },
    { id: 'y', label: 'Year of birth', def: 1964, options: yearOptions(1950, 2006) },
  ],
  run: ({ s, y }: Record<string, number>) => {
    const r = computePia(mid(y), projectCareer(mid(y), s, 22, 62));
    return { head: ['AIME (rounded down to $1)', usd(r.aime)] as [string, string],
      rows: [['Indexing year (you turn 60)', String(r.indexYear)], ['Sum of the 35 best indexed years', usd(r.top)], ['Divided by', '420 months'], ['PIA from this AIME', usd(r.pia, 2)]] as [string, string][],
      note: 'Each year capped at its taxable maximum; years from the indexing year on count at face value.' };
  },
});
