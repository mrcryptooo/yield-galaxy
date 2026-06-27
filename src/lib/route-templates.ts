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

export const CAPTAIN_JOURNEY_LINES: Record<string, Record<string, string>> = {
  'deposit-usx': {
    acquire: 'We begin with USDC. The universal currency.',
    swap: 'Converting to USX — Solstice\'s stablecoin.',
    navigate: 'Setting course for Kamino.',
    deposit: 'USX deposited. Yield is now flowing.',
  },
  'lending-usx': {
    acquire: 'Acquiring USX for the lending loop.',
    navigate: 'Approaching Kamino\'s lending markets.',
    deposit: 'Collateral deposited. Borrowing power activated.',
    borrow: 'USX borrowed against your collateral.',
    loop: 'Looped. Leveraged yield engaged.',
  },
  'yield-eusx': {
    acquire: 'Starting with USX.',
    convert: 'Converting to eUSX — delta-neutral yield.',
    navigate: 'Heading to Kamino.',
    deposit: 'eUSX deposited. Yield flows inverse to stSLX.',
  },
  'lp-slx': {
    acquire: 'Acquiring SLX. High energy token.',
    navigate: 'Docking at Orca\'s liquidity pools.',
    lp: 'Liquidity provided. Fees are accumulating.',
    harvest: 'Collecting trading fees. Yield harvested.',
  },
  'pt-usx': {
    acquire: 'Starting with USX.',
    navigate: 'Approaching Kamino\'s yield markets.',
    mint: 'Minting PT-USX. Fixed yield locked.',
    hold: 'Hold to maturity. Guaranteed return.',
  },
  'stake-slx': {
    acquire: 'Acquiring SLX for staking.',
    stake: 'Staking SLX. The patient path begins.',
    navigate: 'Setting course for Kamino.',
    deposit: 'stSLX deposited. Long-term yield engaged.',
  },
};
