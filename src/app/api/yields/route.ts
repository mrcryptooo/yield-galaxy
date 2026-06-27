import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchSolsticePools } from '@/lib/defillama';
import { computeRiskGrade, computeScores } from '@/lib/scoring';
import { mapPool } from '@/lib/celestial-map';
import { SOURCE_DISPLAY_NAMES } from '@/lib/constants';
import type { SortField, SortOrder, CelestialType, Strategy, RiskGrade, Opportunity } from '@/lib/types';

export const dynamic = 'force-dynamic';

let liveCache: { data: Opportunity[]; ts: number } | null = null;
const CACHE_TTL_MS = 60_000;

const VALID_SORTS: SortField[] = ['score', 'total_apy', 'tvl', 'risk_grade'];
const VALID_ORDERS: SortOrder[] = ['asc', 'desc'];
const VALID_TYPES: CelestialType[] = ['planet', 'moon', 'station'];
const VALID_STRATEGIES: Strategy[] = ['lending', 'lp', 'staking', 'vault', 'pt', 'yt'];
const VALID_GRADES: RiskGrade[] = ['A', 'B', 'C', 'D', 'F'];

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const sortRaw = params.get('sort');
  const sort: SortField = sortRaw && VALID_SORTS.includes(sortRaw as SortField)
    ? (sortRaw as SortField)
    : 'score';

  const orderRaw = params.get('order');
  const order: SortOrder = orderRaw && VALID_ORDERS.includes(orderRaw as SortOrder)
    ? (orderRaw as SortOrder)
    : 'desc';

  const celestialType = params.get('type');
  const strategy = params.get('strategy');
  const riskGrade = params.get('risk');
  const search = params.get('q');

  if (celestialType && !VALID_TYPES.includes(celestialType as CelestialType)) {
    return Response.json(
      { error: { code: 'INVALID_PARAM', message: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` } },
      { status: 400 }
    );
  }
  if (strategy && !VALID_STRATEGIES.includes(strategy as Strategy)) {
    return Response.json(
      { error: { code: 'INVALID_PARAM', message: `Invalid strategy. Must be one of: ${VALID_STRATEGIES.join(', ')}` } },
      { status: 400 }
    );
  }
  if (riskGrade && !VALID_GRADES.includes(riskGrade as RiskGrade)) {
    return Response.json(
      { error: { code: 'INVALID_PARAM', message: `Invalid risk. Must be one of: ${VALID_GRADES.join(', ')}` } },
      { status: 400 }
    );
  }

  let opportunities = await fetchFromSupabase(sort, order);

  if (!opportunities || opportunities.length === 0) {
    opportunities = await fetchLiveFromDefiLlama();
  }

  if (!opportunities) {
    return Response.json(
      { error: { code: 'NO_DATA', message: 'Unable to fetch yield data' } },
      { status: 502 }
    );
  }

  let filtered = opportunities;
  if (celestialType) filtered = filtered.filter(o => o.celestial_type === celestialType);
  if (strategy) filtered = filtered.filter(o => o.strategy === strategy);
  if (riskGrade) filtered = filtered.filter(o => o.risk_grade === riskGrade);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(o =>
      o.symbol.toLowerCase().includes(q) ||
      o.name.toLowerCase().includes(q) ||
      o.celestial_body.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => {
    const m = order === 'desc' ? -1 : 1;
    if (sort === 'score') return (a.score - b.score) * m;
    if (sort === 'total_apy') return (a.total_apy - b.total_apy) * m;
    if (sort === 'tvl') return (a.tvl - b.tvl) * m;
    if (sort === 'risk_grade') return a.risk_grade.localeCompare(b.risk_grade) * m;
    return 0;
  });

  return Response.json({
    data: filtered,
    meta: {
      count: filtered.length,
      updated_at: filtered[0]?.updated_at ?? new Date().toISOString(),
    },
  });
}

async function fetchFromSupabase(sort: SortField, order: SortOrder): Promise<Opportunity[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*, source:sources(*)')
      .eq('is_active', true)
      .order(sort, { ascending: order === 'asc' })
      .limit(100);

    if (error || !data || data.length === 0) return null;
    return data as Opportunity[];
  } catch {
    return null;
  }
}

async function fetchLiveFromDefiLlama(): Promise<Opportunity[] | null> {
  if (liveCache && Date.now() - liveCache.ts < CACHE_TTL_MS) {
    return liveCache.data;
  }

  try {
    const pools = await fetchSolsticePools();
    if (pools.length === 0) return null;

    const now = new Date().toISOString();
    const mapped = pools.map((pool) => {
      const celestial = mapPool(pool);
      const totalApy = pool.apy ?? 0;
      const baseApy = pool.apyBase ?? 0;
      const rewardApy = pool.apyReward ?? 0;
      const rg = computeRiskGrade(pool.project, pool.tvlUsd, celestial.strategy);
      const protocol = SOURCE_DISPLAY_NAMES[pool.project] ?? pool.project;
      const tokens = pool.symbol.split('-').map((t) => t.trim());

      return {
        id: pool.pool,
        source_id: pool.project,
        name: `${pool.symbol} ${celestial.strategy.charAt(0).toUpperCase() + celestial.strategy.slice(1)} — ${protocol}`,
        symbol: pool.symbol,
        token_a: tokens[0] ?? pool.symbol,
        token_b: tokens.length > 1 ? tokens.slice(1).join('-') : null,
        chain: pool.chain,
        strategy: celestial.strategy,
        base_apy: round(baseApy),
        reward_apy: round(rewardApy),
        total_apy: round(totalApy),
        tvl: round(pool.tvlUsd),
        risk_grade: rg,
        score: 50,
        celestial_type: celestial.celestial_type,
        celestial_body: celestial.celestial_body,
        pool_url: pool.url ?? null,
        pool_meta: pool.poolMeta ?? null,
        il_risk: celestial.il_risk,
        is_active: true,
        created_at: now,
        updated_at: now,
        source: {
          id: pool.project,
          name: protocol,
          url: '',
          icon_url: null,
          risk_base: 20,
          created_at: now,
        },
      } satisfies Opportunity;
    });

    const scores = computeScores(
      mapped.map((m) => ({ totalApy: m.total_apy, riskGrade: m.risk_grade, tvl: m.tvl }))
    );
    for (let i = 0; i < mapped.length; i++) {
      mapped[i].score = scores[i];
    }

    liveCache = { data: mapped, ts: Date.now() };
    return mapped;
  } catch {
    return null;
  }
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}
