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

export function getStepMeta(routeId: string, action: string): StepMeta {
  return MISSION_STEP_META[routeId]?.[action] ?? { estimate: '1 minute', reason: 'Part of completing this route.' };
}
