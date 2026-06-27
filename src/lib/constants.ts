export const SOLSTICE_PROJECTS = [
  'kamino-lend',
  'kamino-liquidity',
  'raydium-amm',
  'orca-dex',
  'loopscale',
] as const;

export type SolsticeProject = (typeof SOLSTICE_PROJECTS)[number];

export const SOURCE_DISPLAY_NAMES: Record<string, string> = {
  'kamino-lend': 'Kamino',
  'kamino-liquidity': 'Kamino',
  'raydium-amm': 'Raydium',
  'orca-dex': 'Orca',
  'loopscale': 'Loopscale',
};

export const PROTOCOL_RISK: Record<string, number> = {
  'raydium-amm': 10,
  'orca-dex': 12,
  'kamino-lend': 15,
  'kamino-liquidity': 15,
  'loopscale': 28,
};

export const STRATEGY_RISK: Record<string, number> = {
  staking: 5,
  lending: 10,
  pt: 12,
  vault: 15,
  lp: 25,
  yt: 35,
};

export const RISK_GRADE_THRESHOLDS = [
  { max: 25, grade: 'A' as const },
  { max: 40, grade: 'B' as const },
  { max: 55, grade: 'C' as const },
  { max: 70, grade: 'D' as const },
] as const;

export const PLANET_TOKENS = ['USX', 'eUSX', 'SLX', 'stSLX'] as const;
