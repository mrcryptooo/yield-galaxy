import type { RouteTemplate } from './route-engine';

export const ROUTE_TEMPLATES: RouteTemplate[] = [
  {
    id: 'deposit-usx',
    name: 'Deposit USX',
    description: 'Acquire USX and deposit into Kamino lending.',
    steps: [
      { label: 'Acquire USDC', type: 'action', celestialKey: 'USX', action: 'acquire' },
      { label: 'Swap to USX', type: 'planet', celestialKey: 'USX', action: 'swap' },
      { label: 'Dock at Kamino', type: 'station', celestialKey: 'Kamino', action: 'navigate' },
      { label: 'Deposit USX', type: 'action', celestialKey: 'Kamino', action: 'deposit' },
    ],
  },
  {
    id: 'lending-usx',
    name: 'USX Lending Loop',
    description: 'Deposit USX, borrow against it, redeposit for leveraged yield.',
    steps: [
      { label: 'Acquire USX', type: 'planet', celestialKey: 'USX', action: 'acquire' },
      { label: 'Dock at Kamino', type: 'station', celestialKey: 'Kamino', action: 'navigate' },
      { label: 'Deposit Collateral', type: 'action', celestialKey: 'Kamino', action: 'deposit' },
      { label: 'Borrow USX', type: 'action', celestialKey: 'Kamino', action: 'borrow' },
      { label: 'Redeposit', type: 'action', celestialKey: 'Kamino', action: 'loop' },
    ],
  },
  {
    id: 'yield-eusx',
    name: 'eUSX Yield',
    description: 'Enter delta-neutral eUSX position for steady yield.',
    steps: [
      { label: 'Acquire USX', type: 'planet', celestialKey: 'USX', action: 'acquire' },
      { label: 'Convert to eUSX', type: 'planet', celestialKey: 'eUSX', action: 'convert' },
      { label: 'Dock at Kamino', type: 'station', celestialKey: 'Kamino', action: 'navigate' },
      { label: 'Deposit eUSX', type: 'action', celestialKey: 'Kamino', action: 'deposit' },
    ],
  },
  {
    id: 'lp-slx',
    name: 'SLX Liquidity',
    description: 'Provide SLX-SOL liquidity on Orca for high yield.',
    steps: [
      { label: 'Acquire SLX', type: 'planet', celestialKey: 'SLX', action: 'acquire' },
      { label: 'Dock at Orca', type: 'station', celestialKey: 'Orca', action: 'navigate' },
      { label: 'Provide Liquidity', type: 'action', celestialKey: 'Orca', action: 'lp' },
      { label: 'Collect Fees', type: 'action', celestialKey: 'Orca', action: 'harvest' },
    ],
  },
  {
    id: 'pt-usx',
    name: 'PT-USX Fixed Yield',
    description: 'Lock USX into a Principal Token for guaranteed fixed yield.',
    steps: [
      { label: 'Acquire USX', type: 'planet', celestialKey: 'USX', action: 'acquire' },
      { label: 'Dock at Kamino', type: 'station', celestialKey: 'Kamino', action: 'navigate' },
      { label: 'Mint PT-USX', type: 'moon', celestialKey: 'PT-USX', action: 'mint' },
      { label: 'Hold to Maturity', type: 'action', celestialKey: 'PT-USX', action: 'hold' },
    ],
  },
  {
    id: 'stake-slx',
    name: 'Stake SLX',
    description: 'Stake SLX for long-term yield. The patient path.',
    steps: [
      { label: 'Acquire SLX', type: 'planet', celestialKey: 'SLX', action: 'acquire' },
      { label: 'Stake to stSLX', type: 'planet', celestialKey: 'stSLX', action: 'stake' },
      { label: 'Dock at Kamino', type: 'station', celestialKey: 'Kamino', action: 'navigate' },
      { label: 'Deposit stSLX', type: 'action', celestialKey: 'Kamino', action: 'deposit' },
    ],
  },
];

// Captain-as-narrator: every step gets a unique line explaining what's
// happening and why, not just a status update. Written to be read aloud
// during the (now slower) dwell pause at each destination.
export const CAPTAIN_JOURNEY_LINES: Record<string, Record<string, string>> = {
  'deposit-usx': {
    acquire: "You'll start with USDC before entering the Solstice ecosystem.",
    swap: 'USX is the gateway asset for this route — everything else builds on it.',
    navigate: 'Kamino currently offers the safest lending opportunity for USX.',
    deposit: 'Deposited. Your USX is now earning — welcome to Solstice.',
  },
  'lending-usx': {
    acquire: "USX first — you can't loop what you don't hold.",
    navigate: "Kamino's lending markets are where this loop lives.",
    deposit: 'Collateral in. This unlocks your borrowing power.',
    borrow: "Borrowing against your own collateral — that's how the loop leverages yield.",
    loop: 'Redeposited. Your exposure just compounded — and so did your yield.',
  },
  'yield-eusx': {
    acquire: 'USX is the raw material eUSX is built from.',
    convert: 'eUSX trades stability for a delta-neutral funding-rate strategy.',
    navigate: 'Kamino is where eUSX deposits go to work.',
    deposit: 'This step increases yield, but also increases exposure — and it moves inverse to stSLX.',
  },
  'lp-slx': {
    acquire: 'SLX is the volatile half of this pair — high energy, high reward.',
    navigate: 'Orca holds the deepest SLX-SOL liquidity in the sector.',
    lp: 'Providing liquidity now — this increases yield but also your impermanent loss exposure.',
    harvest: 'Fees collected. That locks in what the pool has already earned.',
  },
  'pt-usx': {
    acquire: 'USX is what gets locked into the Principal Token.',
    navigate: "Kamino's Exponent markets host PT-USX.",
    mint: 'Minted. Your rate is now fixed until maturity — no surprises either way.',
    hold: 'Hold to maturity. The waiting is the entire strategy from here.',
  },
  'stake-slx': {
    acquire: 'SLX first, before it can be staked.',
    stake: 'Staked into stSLX — the long game begins.',
    navigate: "Kamino accepts stSLX deposits for a second layer of yield.",
    deposit: 'Deposited. Staking rewards and lending yield, stacked.',
  },
};
