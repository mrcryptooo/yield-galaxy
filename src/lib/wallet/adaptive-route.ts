import type { RouteStepDef } from '../route-engine';
import type { TokenBalance } from './portfolio';

const ASSET_ACTIONS = new Set(['acquire', 'swap', 'convert', 'stake']);

// Real wallet holdings the route's leading steps could already satisfy.
// Only tracked, supported balances count — untracked tokens (see tokens.ts)
// can never trigger a skip, since we have no real balance for them.
export function buildOwnedSymbolSet(tokens: TokenBalance[], solBalance: number): Set<string> {
  const owned = new Set<string>();
  if (solBalance > 0) owned.add('SOL');
  for (const t of tokens) {
    if (t.supported && t.amount > 0) owned.add(t.symbol);
  }
  return owned;
}

// Mission Integration (Phase 14): if the wallet already holds the asset a
// leading step would acquire/convert/stake into, that step (and any purely
// procedural "navigate/dock" step right after it) is skipped, so the
// mission starts from the first objective the wallet can't already satisfy.
// Route order/logic itself is untouched — this only changes which index a
// freshly-launched ActiveRoute starts on.
export function computeAdaptiveStartStep(steps: RouteStepDef[], owned: Set<string>): number {
  let skipTo = 0;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (!ASSET_ACTIONS.has(step.action)) break;
    const produced = step.assetSymbol ?? step.celestialKey;
    if (produced && owned.has(produced)) {
      skipTo = i + 1;
    } else {
      break;
    }
  }
  if (steps[skipTo]?.action === 'navigate') {
    skipTo += 1;
  }
  return Math.min(skipTo, steps.length - 1);
}
