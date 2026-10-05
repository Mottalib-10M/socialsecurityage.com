/**
 * Mini-calculator registry (RECETTE §9.3): one file per topic in `lib/minis/<kind>.ts`, loaded here.
 * Each file exports `default`: () => MiniSpec and calls the engine (lib/engine), never a second formula.
 */
import type { MiniSpec } from './mini-types';
type Factory = (l?: string) => MiniSpec;
const mods = import.meta.glob<{ default: Factory }>(['./minis/*.ts', '!./minis/_*.ts'], { eager: true });
export const MINIS: Record<string, Factory> = Object.fromEntries(Object.entries(mods).map(([f, m]) => [f.split('/').pop()!.replace(/\.ts$/, ''), m.default]));
export function getSpec(kind: string, _lang?: string): MiniSpec {
  const f = MINIS[kind];
  if (!f) throw new Error(`Unknown mini-calculator: ${kind} (create src/lib/minis/${kind}.ts)`);
  return f();
}
