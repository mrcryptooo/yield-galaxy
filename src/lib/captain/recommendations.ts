import type { OptimizerResult, OptimizedRoute } from '../optimizer/optimizer';

export interface Recommendation {
  primary: OptimizedRoute;
  alternative: OptimizedRoute | null;
  whyPrimary: string;
  whyNotAlternative: string | null;
  tradeoff: string;
}

export function recommend(result: OptimizerResult): Recommendation | null {
  if (result.routes.length === 0) return null;

  const primary = result.routes[0];
  const alternative = result.routes.length > 1 ? result.routes[1] : null;

  const whyPrimary = explainChoice(primary, result);
  const whyNotAlternative = alternative ? explainRejection(primary, alternative) : null;

  const tradeoff = alternative
    ? describeTradeoff(primary, alternative)
    : 'No comparable alternative found.';

  return { primary, alternative, whyPrimary, whyNotAlternative, tradeoff };
}

function explainChoice(route: OptimizedRoute, result: OptimizerResult): string {
  const parts: string[] = [];

  if (route.score.total >= 70) {
    parts.push('strong composite score');
  }

  if (route.score.confidence >= 85) {
    parts.push('high confidence');
  }

  if (route.simulation.cumulativeRisk === 'A' || route.simulation.cumulativeRisk === 'B') {
    parts.push('low risk profile');
  }

  if (route.simulation.stepResults.length <= 3) {
    parts.push('simple execution');
  }

  if (route.score.diversificationBonus > 0) {
    parts.push('protocol diversification');
  }

  if (parts.length === 0) {
    return `Best available from ${result.totalValid} valid routes.`;
  }

  return `Selected for ${parts.join(', ')}.`;
}

function explainRejection(primary: OptimizedRoute, alternative: OptimizedRoute): string {
  const scoreDiff = primary.score.total - alternative.score.total;
  const apyDiff = primary.simulation.cumulativeApy - alternative.simulation.cumulativeApy;

  if (scoreDiff > 15) {
    return `${alternative.name} scores ${scoreDiff} points lower overall.`;
  }

  if (apyDiff < 0 && scoreDiff > 0) {
    return `${alternative.name} has higher APY but worse risk-adjusted score.`;
  }

  if (primary.score.confidence > alternative.score.confidence + 10) {
    return `${alternative.name} has lower confidence — less proven liquidity.`;
  }

  return `${alternative.name} is viable but marginally lower composite score.`;
}

function describeTradeoff(primary: OptimizedRoute, alternative: OptimizedRoute): string {
  const pApy = primary.simulation.cumulativeApy;
  const aApy = alternative.simulation.cumulativeApy;

  if (aApy > pApy * 1.5) {
    return `${alternative.name} offers ${aApy.toFixed(1)}% APY vs ${pApy.toFixed(1)}%, but with higher risk.`;
  }

  if (primary.simulation.stepResults.length < alternative.simulation.stepResults.length) {
    return `${alternative.name} requires more steps (${alternative.simulation.stepResults.length} vs ${primary.simulation.stepResults.length}).`;
  }

  return `Both routes are competitive — ${alternative.name} is a reasonable alternative.`;
}
