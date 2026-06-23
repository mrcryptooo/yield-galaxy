// ============================================================
// Yield Galaxy — Core Types
// ============================================================

// --- Database row types ---

export interface Source {
  id: string;
  name: string;
  url: string;
  icon_url: string | null;
  risk_base: number;
  created_at: string;
}

export interface Opportunity {
  id: string;
  source_id: string;
  name: string;
  symbol: string;
  token_a: string;
  token_b: string | null;
  chain: string;
  strategy: Strategy;
  base_apy: number;
  reward_apy: number;
  total_apy: number;
  tvl: number;
  risk_grade: RiskGrade;
  score: number;
  celestial_type: CelestialType;
  celestial_body: string;
  pool_url: string | null;
  pool_meta: string | null;
  il_risk: ILRisk;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  source?: Source;
}

export interface Snapshot {
  id: number;
  opportunity_id: string;
  total_apy: number;
  base_apy: number;
  reward_apy: number;
  tvl: number;
  score: number | null;
  risk_grade: RiskGrade | null;
  granularity: SnapshotGranularity;
  recorded_at: string;
}

// --- Enum-like unions ---

export type Strategy = 'lending' | 'lp' | 'staking' | 'vault' | 'pt' | 'yt';
export type RiskGrade = 'A' | 'B' | 'C' | 'D' | 'F';
export type CelestialType = 'planet' | 'moon' | 'station';
export type ILRisk = 'none' | 'low' | 'medium' | 'high';
export type SnapshotGranularity = 'raw' | 'hourly' | 'daily';
export type SortField = 'score' | 'total_apy' | 'tvl' | 'risk_grade';
export type SortOrder = 'asc' | 'desc';

// --- DefiLlama raw pool shape ---

export interface DefiLlamaPool {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number | null;
  apyBase: number | null;
  apyReward: number | null;
  underlyingTokens: string[] | null;
  poolMeta: string | null;
  url: string | null;
}

// --- API response envelope ---

export interface ApiResponse<T> {
  data: T;
  meta: {
    count: number;
    updated_at: string;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

// --- APY history point (from DefiLlama chart) ---

export interface APYHistoryPoint {
  timestamp: string;
  apy: number;
  tvlUsd: number;
}

// --- Cron ingest result ---

export interface IngestResult {
  pools_fetched: number;
  opportunities_upserted: number;
  snapshots_inserted: number;
  duration_ms: number;
}
