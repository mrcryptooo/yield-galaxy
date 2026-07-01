// Presentational-only mission narration: estimated time + "why it matters"
// for each (route, action) pair, shown in the Mission Panel's current-step
// detail strip. Sits alongside CAPTAIN_JOURNEY_LINES (route-templates.ts) —
// same shape, different purpose — so the Journey Engine's data stays
// untouched while the Mission Panel gets richer per-step storytelling.
interface StepMeta {
  estimate: string;
  reason: string;
}

export const MISSION_STEP_META: Record<string, Record<string, StepMeta>> = {
  'deposit-usx': {
    acquire: { estimate: '1 minute', reason: 'USDC is the universal entry point into Solstice.' },
    swap: { estimate: '2 minutes', reason: 'USX is required before any Solstice yield strategy.' },
    navigate: { estimate: '30 seconds', reason: 'Kamino currently offers the strongest USX lending market.' },
    deposit: { estimate: '1 minute', reason: 'This is where your yield actually starts accruing.' },
  },
  'lending-usx': {
    acquire: { estimate: '1 minute', reason: 'You need USX on hand before the lending loop can begin.' },
    navigate: { estimate: '30 seconds', reason: 'Kamino hosts the collateral market for this loop.' },
    deposit: { estimate: '1 minute', reason: 'Collateral unlocks your borrowing power.' },
    borrow: { estimate: '1 minute', reason: 'Borrowing against your own collateral is how the loop leverages yield.' },
    loop: { estimate: '1 minute', reason: 'Redepositing compounds your exposure — and your yield.' },
  },
  'yield-eusx': {
    acquire: { estimate: '1 minute', reason: 'USX is the base asset eUSX is built from.' },
    convert: { estimate: '2 minutes', reason: 'eUSX earns via delta-neutral funding rate arbitrage.' },
    navigate: { estimate: '30 seconds', reason: 'Kamino is where eUSX deposits go to work.' },
    deposit: { estimate: '1 minute', reason: 'This step increases yield exposure — and it moves inverse to stSLX.' },
  },
  'lp-slx': {
    acquire: { estimate: '1 minute', reason: 'SLX is the volatile half of this liquidity pair.' },
    navigate: { estimate: '30 seconds', reason: "Orca hosts the SLX-SOL pool with the deepest liquidity." },
    lp: { estimate: '2 minutes', reason: 'This step increases yield, but also increases impermanent loss exposure.' },
    harvest: { estimate: '1 minute', reason: 'Collecting fees locks in what the pool has already earned.' },
  },
  'pt-usx': {
    acquire: { estimate: '1 minute', reason: 'USX is what gets locked into the Principal Token.' },
    navigate: { estimate: '30 seconds', reason: "Kamino's Exponent markets host PT-USX." },
    mint: { estimate: '2 minutes', reason: 'Minting locks in a fixed rate — no more, no less, until maturity.' },
    hold: { estimate: 'Until maturity', reason: 'Patience is the entire strategy here. No further action needed.' },
  },
  'stake-slx': {
    acquire: { estimate: '1 minute', reason: 'SLX is required before it can be staked.' },
    stake: { estimate: '2 minutes', reason: 'Staking converts SLX into stSLX — the long-term, patient position.' },
    navigate: { estimate: '30 seconds', reason: 'Kamino accepts stSLX deposits for additional yield.' },
    deposit: { estimate: '1 minute', reason: 'This stacks lending yield on top of your staking rewards.' },
  },
};

// Real missions come from the optimizer (`opt-...` ids), not the static
// templates above — so the per-route table almost never matches. This
// generic, action-keyed table (actions are shared across every route) is
// the fallback that actually fires for dynamic missions, so "Estimated
// Time" and "Reason" stay meaningful instead of collapsing to a placeholder.
const GENERIC_ACTION_META: Record<string, StepMeta> = {
  acquire: { estimate: '1 minute', reason: 'The starting asset for this route.' },
  swap: { estimate: '2 minutes', reason: 'Converts into the asset this route is built on.' },
  convert: { estimate: '2 minutes', reason: 'Converts into the position this route is built on.' },
  stake: { estimate: '2 minutes', reason: 'Locks the asset into a staked position.' },
  navigate: { estimate: '30 seconds', reason: 'Docks at the protocol handling the next step.' },
  deposit: { estimate: '1 minute', reason: 'This is where the position starts earning yield.' },
  borrow: { estimate: '1 minute', reason: 'Borrows against posted collateral to extend the loop.' },
  loop: { estimate: '1 minute', reason: 'Redeposits to compound the position.' },
  lp: { estimate: '2 minutes', reason: 'Provides liquidity — increases yield and impermanent-loss exposure.' },
  mint: { estimate: '2 minutes', reason: 'Locks in a fixed rate until maturity.' },
  hold: { estimate: 'Until maturity', reason: 'No further action needed — the position runs itself.' },
  harvest: { estimate: '1 minute', reason: 'Collects the yield the position has already earned.' },
};

export function getStepMeta(routeId: string, action: string): StepMeta {
  return (
    MISSION_STEP_META[routeId]?.[action] ??
    GENERIC_ACTION_META[action] ?? { estimate: '1 minute', reason: 'Part of completing this route.' }
  );
}

// Objective 4 (Narrative Missions): rename the objective headline into an
// adventure/fuel framing without touching route logic, node order, or the
// per-step Captain line (which already names the real protocol/asset and
// is shown right underneath as the detail line). The last node in any
// route is always relabeled "Collect Rewards" — the payoff moment — no
// matter which underlying action it technically is.
export function getNarrativeLabel(action: string, celestialKey: string, index: number, total: number): string {
  if (index === total - 1) return 'Collect Rewards';
  switch (action) {
    case 'acquire': return 'Acquire Fuel';
    case 'swap':
    case 'convert': return 'Convert Fuel';
    case 'stake': return 'Stake Fuel';
    case 'navigate': return `Reach ${celestialKey}`;
    case 'deposit': return 'Enter Solstice';
    case 'borrow': return 'Leverage Position';
    case 'loop': return 'Compound Position';
    case 'lp': return 'Fuel the Reserves';
    case 'mint': return 'Lock In Fuel';
    case 'hold': return 'Hold Position';
    case 'harvest': return 'Collect Rewards';
    default: return `${action} at ${celestialKey}`;
  }
}
