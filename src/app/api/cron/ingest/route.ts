import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchSolsticePools } from '@/lib/defillama';
import { computeRiskGrade, computeScores } from '@/lib/scoring';
import { mapPool } from '@/lib/celestial-map';
import { SOURCE_DISPLAY_NAMES } from '@/lib/constants';
import type { IngestResult } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return Response.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid cron secret' } },
        { status: 401 }
      );
    }
  }

  const start = Date.now();

  // 1. Fetch from DefiLlama
  let pools;
  try {
    pools = await fetchSolsticePools();
  } catch (err) {
    return Response.json(
      { error: { code: 'UPSTREAM_ERROR', message: (err as Error).message } },
      { status: 502 }
    );
  }

  if (pools.length === 0) {
    return Response.json(
      { error: { code: 'NO_DATA', message: 'DefiLlama returned 0 Solstice pools' } },
      { status: 502 }
    );
  }

  // 2. Map, normalize, and compute risk grades
  const mapped = pools.map((pool) => {
    const celestial = mapPool(pool);
    const totalApy = pool.apy ?? 0;
    const baseApy = pool.apyBase ?? 0;
    const rewardApy = pool.apyReward ?? 0;
    const riskGrade = computeRiskGrade(pool.project, pool.tvlUsd, celestial.strategy);
    const protocol = SOURCE_DISPLAY_NAMES[pool.project] ?? pool.project;
    const tokens = pool.symbol.split('-').map((t) => t.trim());

    return {
      id: pool.pool,
      source_id: pool.project,
      name: `${pool.symbol} ${capitalize(celestial.strategy)} — ${protocol}`,
      symbol: pool.symbol,
      token_a: tokens[0] ?? pool.symbol,
      token_b: tokens.length > 1 ? tokens.slice(1).join('-') : null,
      chain: pool.chain,
      strategy: celestial.strategy,
      base_apy: round(baseApy),
      reward_apy: round(rewardApy),
      total_apy: round(totalApy),
      tvl: round(pool.tvlUsd),
      risk_grade: riskGrade,
      score: 50, // placeholder — computed in batch below
      celestial_type: celestial.celestial_type,
      celestial_body: celestial.celestial_body,
      pool_url: pool.url ?? null,
      pool_meta: pool.poolMeta ?? null,
      il_risk: celestial.il_risk,
      is_active: true,
      updated_at: new Date().toISOString(),
    };
  });

  // 3. Compute scores (requires full batch for percentile ranking)
  const scores = computeScores(
    mapped.map((m) => ({
      totalApy: m.total_apy,
      riskGrade: m.risk_grade as 'A' | 'B' | 'C' | 'D' | 'F',
      tvl: m.tvl,
    }))
  );
  for (let i = 0; i < mapped.length; i++) {
    mapped[i].score = scores[i];
  }

  // 4. Mark opportunities NOT in this batch as inactive
  const activeIds = mapped.map((m) => m.id);
  const { error: deactivateError } = await supabaseAdmin
    .from('opportunities')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .not('id', 'in', `(${activeIds.map((id) => `"${id}"`).join(',')})`);

  if (deactivateError) {
    console.error('Deactivation error:', deactivateError.message);
  }

  // 5. Upsert opportunities
  const { error: upsertError } = await supabaseAdmin
    .from('opportunities')
    .upsert(mapped, { onConflict: 'id' });

  if (upsertError) {
    return Response.json(
      { error: { code: 'UPSERT_ERROR', message: upsertError.message } },
      { status: 500 }
    );
  }

  // 6. Insert snapshots (append-only, includes score + risk_grade)
  const snapshots = mapped.map((m) => ({
    opportunity_id: m.id,
    total_apy: m.total_apy,
    base_apy: m.base_apy,
    reward_apy: m.reward_apy,
    tvl: m.tvl,
    score: m.score,
    risk_grade: m.risk_grade,
  }));

  const { error: snapError } = await supabaseAdmin
    .from('snapshots')
    .insert(snapshots);

  if (snapError) {
    console.error('Snapshot insert error:', snapError.message);
  }

  const result: IngestResult = {
    pools_fetched: pools.length,
    opportunities_upserted: mapped.length,
    snapshots_inserted: snapError ? 0 : snapshots.length,
    duration_ms: Date.now() - start,
  };

  return Response.json({ data: result });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}
