import type { Opportunity } from '../types';
import { SOURCE_DISPLAY_NAMES } from '../constants';
import { formatTvl, formatApy } from '../format';

export interface Insight {
  type: 'observation' | 'warning' | 'opportunity';
  text: string;
  severity: 'info' | 'caution' | 'alert';
}

export function generateInsights(opportunities: Opportunity[]): Insight[] {
  const insights: Insight[] = [];
  if (opportunities.length === 0) return insights;

  const planets = opportunities.filter(o => o.celestial_type === 'planet');

  // TVL concentration
  const bodyTvl: Record<string, number> = {};
  for (const o of planets) {
    bodyTvl[o.celestial_body] = (bodyTvl[o.celestial_body] ?? 0) + o.tvl;
  }
  const totalTvl = Object.values(bodyTvl).reduce((s, v) => s + v, 0);
  for (const [body, tvl] of Object.entries(bodyTvl)) {
    const share = totalTvl > 0 ? tvl / totalTvl : 0;
    if (share > 0.5) {
      insights.push({
        type: 'observation',
        text: `${body} holds ${(share * 100).toFixed(0)}% of ecosystem TVL (${formatTvl(tvl)}).`,
        severity: 'info',
      });
    }
  }

  // Unusually high APY
  for (const o of opportunities) {
    if (o.total_apy > 500) {
      const protocol = SOURCE_DISPLAY_NAMES[o.source_id] ?? o.source_id;
      insights.push({
        type: 'warning',
        text: `${o.symbol} on ${protocol} shows ${formatApy(o.total_apy)} — verify sustainability.`,
        severity: 'caution',
      });
    }
  }

  // Low liquidity pools
  const lowTvl = opportunities.filter(o => o.tvl > 0 && o.tvl < 50_000);
  if (lowTvl.length > 0) {
    insights.push({
      type: 'warning',
      text: `${lowTvl.length} pool${lowTvl.length > 1 ? 's' : ''} with TVL below $50K — thin liquidity.`,
      severity: 'caution',
    });
  }

  // Protocol diversity
  const protocolSet = new Set(opportunities.map(o => SOURCE_DISPLAY_NAMES[o.source_id] ?? o.source_id));
  if (protocolSet.size >= 4) {
    insights.push({
      type: 'observation',
      text: `${protocolSet.size} protocols active — healthy ecosystem diversity.`,
      severity: 'info',
    });
  }

  // Best opportunity
  const best = [...opportunities].sort((a, b) => b.score - a.score)[0];
  if (best) {
    const protocol = SOURCE_DISPLAY_NAMES[best.source_id] ?? best.source_id;
    insights.push({
      type: 'opportunity',
      text: `Top opportunity: ${best.symbol} on ${protocol} — score ${best.score}, ${formatApy(best.total_apy)}.`,
      severity: 'info',
    });
  }

  // PT markets
  const ptPools = opportunities.filter(o => o.strategy === 'pt');
  if (ptPools.length > 0) {
    insights.push({
      type: 'observation',
      text: `${ptPools.length} PT market${ptPools.length > 1 ? 's' : ''} available for fixed yield.`,
      severity: 'info',
    });
  }

  // Yield compression detection
  const lendingPools = planets.filter(o => o.strategy === 'lending');
  const avgLendingApy = lendingPools.length > 0
    ? lendingPools.reduce((s, o) => s + o.total_apy, 0) / lendingPools.length
    : 0;
  if (avgLendingApy < 1 && lendingPools.length > 0) {
    insights.push({
      type: 'observation',
      text: `Lending yields compressed — average ${formatApy(avgLendingApy)}. Consider LP or PT strategies.`,
      severity: 'info',
    });
  }

  return insights;
}
