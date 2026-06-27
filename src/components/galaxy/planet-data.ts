export interface Protocol {
  id: string;
  name: string;
  apy: number;
  tvl: string;
  risk: string;
  type: string;
  depositApy: number;
  borrowApy: number;
  updated: string;
}

export interface PlanetInfo {
  name: string;
  description: string;
  tvl: string;
  avgApy: string;
  protocolCount: number;
  protocols: Protocol[];
}

export const FALLBACK_PLANET_DATA: Record<string, PlanetInfo> = {
  USX: {
    name: 'USX',
    description: 'The stablecoin at the heart of Solstice. Overcollateralized, reliable, the foundation of every journey.',
    tvl: '$14.2M',
    avgApy: '1.33%',
    protocolCount: 3,
    protocols: [
      { id: 'usx-kamino', name: 'Kamino', apy: 1.33, tvl: '$12.4M', risk: 'A', type: 'Lending', depositApy: 1.33, borrowApy: 3.21, updated: '2m ago' },
      { id: 'usx-loopscale', name: 'Loopscale', apy: 1.62, tvl: '$1.2M', risk: 'C', type: 'Lending', depositApy: 1.62, borrowApy: 5.1, updated: '2m ago' },
      { id: 'usx-orca-usdc', name: 'Orca', apy: 0.73, tvl: '$13.8M', risk: 'B', type: 'Liquidity', depositApy: 0.73, borrowApy: 0, updated: '2m ago' },
    ],
  },
  eUSX: {
    name: 'eUSX',
    description: 'Enhanced USX. Delta-neutral yield from funding rate arbitrage. Yields move inverse to stSLX.',
    tvl: '$11.6M',
    avgApy: '0.03%',
    protocolCount: 2,
    protocols: [
      { id: 'eusx-kamino', name: 'Kamino', apy: 0.01, tvl: '$11.6M', risk: 'A', type: 'Vault', depositApy: 0.01, borrowApy: 0, updated: '2m ago' },
      { id: 'eusx-orca', name: 'Orca', apy: 0.03, tvl: '$6.6M', risk: 'C', type: 'Liquidity', depositApy: 0.03, borrowApy: 0, updated: '2m ago' },
    ],
  },
  SLX: {
    name: 'SLX',
    description: 'The governance token of Solstice. High energy, high volatility. The pulse of the ecosystem.',
    tvl: '$6.1M',
    avgApy: '405%',
    protocolCount: 2,
    protocols: [
      { id: 'slx-orca-sol', name: 'Orca', apy: 405, tvl: '$15.5K', risk: 'D', type: 'LP', depositApy: 405, borrowApy: 0, updated: '2m ago' },
      { id: 'slx-orca-usdc', name: 'Orca', apy: 0.55, tvl: '$100K', risk: 'C', type: 'LP', depositApy: 0.55, borrowApy: 0, updated: '2m ago' },
    ],
  },
  stSLX: {
    name: 'stSLX',
    description: 'Staked SLX. Ancient, patient. Yields run inverse to eUSX. The long game.',
    tvl: '$9.9M',
    avgApy: '0.45%',
    protocolCount: 1,
    protocols: [
      { id: 'stslx-kamino', name: 'Kamino', apy: 0.45, tvl: '$9.9M', risk: 'B', type: 'Staking', depositApy: 0.45, borrowApy: 0, updated: '2m ago' },
    ],
  },
};

export const CAPTAIN_PROTOCOL_LINES: Record<string, string> = {
  'usx-kamino': 'Kamino\'s USX lending — the safest harbor in the galaxy.',
  'usx-loopscale': 'Loopscale offers higher yield on USX, but less liquidity.',
  'usx-orca-usdc': 'USX-USDC on Orca — deep liquidity, steady returns.',
  'usx-orca-usdg': 'USDG-USX on Orca — stablecoin depth for USX.',
  'usx-raydium-usdc': 'USX-USDC on Raydium — concentrated liquidity.',
  'usx-kamino-usdg': 'USDG-USX vault on Kamino — automated rebalancing.',
  'eusx-kamino': 'eUSX vault on Kamino — delta-neutral, low maintenance.',
  'eusx-orca': 'eUSX-USX pool on Orca — tight spread, minimal impermanent loss.',
  'eusx-raydium': 'eUSX-USX on Raydium — alternative routing.',
  'slx-orca-sol': 'SLX-SOL on Orca — high yield, thin liquidity. Tread carefully.',
  'slx-orca-usdc': 'SLX-USDC — calmer waters for SLX exposure.',
  'stslx-kamino': 'stSLX staking — the patient path. Yields grow when eUSX compresses.',
};
