import type { Opportunity } from './types';
import { formatApy, formatTvl } from './format';

export interface Insight {
  id: string;
  type: 'best' | 'momentum' | 'alert' | 'tip';
  icon: string;
  title: string;
  body: string;
  opportunityId?: string;
}

/**
 * Captain Whiskers Lite — rule-based insights.
 * No LLM, no API calls. Pure data analysis.
 */
export function generateInsights(opportunities: Opportunity[]): Insight[] {
  if (opportunities.length === 0) return [];

  const active = opportunities.filter((o) => o.is_active && o.total_apy !== null);
  const insights: Insight[] = [];

  // 1. Best opportunity by score
  const best = [...active].sort((a, b) => b.score - a.score)[0];
  if (best) {
    insights.push({
      id: 'best-score',
      type: 'best',
      icon: '🐱',
      title: 'Top Opportunity',
      body: `${best.symbol} on ${best.source?.name ?? best.source_id} — score ${best.score}, risk ${best.risk_grade}, ${formatApy(best.total_apy)} APY with ${formatTvl(best.tvl)} TVL. ${best.risk_grade === 'A' ? 'Low-risk pick.' : best.risk_grade === 'B' ? 'Solid risk profile.' : 'Higher risk — check the details.'}`,
      opportunityId: best.id,
    });
  }

  // 2. Best risk-adjusted (highest score with grade A or B)
  const safeOptions = active.filter((o) => o.risk_grade === 'A' || o.risk_grade === 'B');
  const bestSafe = safeOptions.sort((a, b) => b.total_apy - a.total_apy)[0];
  if (bestSafe && bestSafe.id !== best?.id) {
    insights.push({
      id: 'best-safe',
      type: 'best',
      icon: '🛡️',
      title: 'Safest Yield',
      body: `${bestSafe.symbol} — ${formatApy(bestSafe.total_apy)} APY at risk grade ${bestSafe.risk_grade}. ${formatTvl(bestSafe.tvl)} liquidity. The most fuel per unit of risk.`,
      opportunityId: bestSafe.id,
    });
  }

  // 3. Highest raw APY
  const highestApy = [...active].sort((a, b) => b.total_apy - a.total_apy)[0];
  if (highestApy && highestApy.id !== best?.id) {
    const warning = highestApy.tvl < 50_000
      ? ' Caution: thin liquidity.'
      : highestApy.risk_grade === 'D' || highestApy.risk_grade === 'F'
      ? ' Elevated risk — proceed with caution.'
      : '';
    insights.push({
      id: 'highest-apy',
      type: 'momentum',
      icon: '🔥',
      title: 'Highest Fuel Yield',
      body: `${highestApy.symbol} is producing ${formatApy(highestApy.total_apy)} — the highest in the galaxy.${warning}`,
      opportunityId: highestApy.id,
    });
  }

  // 4. PT opportunity callout
  const pts = active.filter((o) => o.strategy === 'pt');
  if (pts.length > 0) {
    const bestPt = pts.sort((a, b) => b.tvl - a.tvl)[0];
    insights.push({
      id: 'pt-available',
      type: 'tip',
      icon: '◎',
      title: 'Fixed Rate Available',
      body: `${bestPt.symbol} offers a fixed-rate position with ${formatTvl(bestPt.tvl)} liquidity. Locks in a guaranteed return regardless of market conditions.`,
      opportunityId: bestPt.id,
    });
  }

  // 5. Yield concentration warning
  const totalTvl = active.reduce((s, o) => s + o.tvl, 0);
  const largestByTvl = [...active].sort((a, b) => b.tvl - a.tvl)[0];
  if (largestByTvl && totalTvl > 0) {
    const pct = Math.round((largestByTvl.tvl / totalTvl) * 100);
    if (pct > 40) {
      insights.push({
        id: 'concentration',
        type: 'alert',
        icon: '⚠️',
        title: 'Liquidity Concentration',
        body: `${pct}% of Solstice TVL is concentrated in ${largestByTvl.symbol}. Diversifying across assets reduces exposure to single-pool risk.`,
        opportunityId: largestByTvl.id,
      });
    }
  }

  // 6. Low-APY bodies with high TVL (possible yield compression)
  const highTvlLowApy = active.filter((o) => o.tvl > 1_000_000 && o.total_apy < 0.5 && o.strategy !== 'pt');
  if (highTvlLowApy.length >= 2) {
    insights.push({
      id: 'compression',
      type: 'alert',
      icon: '📉',
      title: 'Yield Compression',
      body: `${highTvlLowApy.length} pools with $1M+ TVL are yielding under 0.5%. High liquidity is diluting returns — consider PT positions to lock in current rates before further compression.`,
    });
  }

  // 7. Galaxy summary
  const planets = active.filter((o) => o.celestial_type === 'planet').length;
  const moons = active.filter((o) => o.celestial_type === 'moon').length;
  const avgApy = active.reduce((s, o) => s + o.total_apy, 0) / active.length;
  insights.push({
    id: 'summary',
    type: 'tip',
    icon: '✦',
    title: 'Galaxy Status',
    body: `${active.length} active opportunities across ${planets} planets and ${moons} moons. Average fuel yield: ${formatApy(avgApy)}. Total mass: ${formatTvl(totalTvl)}.`,
  });

  return insights;
}
