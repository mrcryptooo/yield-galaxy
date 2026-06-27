import { SOLSTICE_PROJECTS } from './constants';
import type { DefiLlamaPool, APYHistoryPoint } from './types';

const POOLS_URL = 'https://yields.llama.fi/pools';
const CHART_URL = 'https://yields.llama.fi/chart';

const SOLSTICE_TOKENS = new Set(['USX', 'EUSX', 'SLX', 'STSLX']);

const MIN_TVL = 5_000;

function isSolsticeRelevant(pool: DefiLlamaPool): boolean {
  if (pool.tvlUsd < MIN_TVL) return false;

  const tokens = pool.symbol.toUpperCase().split('-').map((t) => t.trim());
  const meta = (pool.poolMeta ?? '').toLowerCase();

  if (tokens.some((t) => SOLSTICE_TOKENS.has(t))) return true;
  if (meta.includes('solstice')) return true;

  if (tokens[0]?.startsWith('PT') || tokens[0]?.startsWith('YT')) {
    const underlying = tokens[0]
      .replace(/^(PT|YT)-?/i, '')
      .split('-')[0]
      .trim();
    if (SOLSTICE_TOKENS.has(underlying)) return true;
  }

  return false;
}

export async function fetchSolsticePools(): Promise<DefiLlamaPool[]> {
  const res = await fetch(POOLS_URL, {
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`DefiLlama /pools returned ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();
  if (!json.data || !Array.isArray(json.data)) {
    throw new Error('DefiLlama /pools response missing data array');
  }

  const pools: DefiLlamaPool[] = json.data;
  const projectSet = new Set<string>(SOLSTICE_PROJECTS);

  return pools.filter(
    (p) =>
      p.chain === 'Solana' &&
      projectSet.has(p.project) &&
      isSolsticeRelevant(p)
  );
}

export async function fetchPoolHistory(
  poolId: string
): Promise<APYHistoryPoint[]> {
  const res = await fetch(`${CHART_URL}/${encodeURIComponent(poolId)}`, {
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`DefiLlama /chart/${poolId} returned ${res.status}`);
  }

  const json = await res.json();
  if (!json.data || !Array.isArray(json.data)) {
    return [];
  }

  return json.data.map((d: Record<string, unknown>) => ({
    timestamp: d.timestamp as string,
    apy: (d.apy as number) ?? 0,
    tvlUsd: (d.tvlUsd as number) ?? 0,
  }));
}
