import {
  PROTOCOL_RISK,
  STRATEGY_RISK,
  RISK_GRADE_THRESHOLDS,
} from './constants';
import type { RiskGrade, Strategy } from './types';

/**
 * Compute risk grade from protocol identity, TVL, and strategy type.
 * Calibrated for the Solstice universe (~16 opportunities, $5K-$14M TVL range).
 */
export function computeRiskGrade(
  project: string,
  tvl: number,
  strategy: Strategy
): RiskGrade {
  let raw = 0;

  raw += PROTOCOL_RISK[project] ?? 35;

  // TVL tiers calibrated for Solstice ecosystem scale
  if (tvl > 10_000_000) raw += 0;
  else if (tvl > 1_000_000) raw += 8;
  else if (tvl > 100_000) raw += 18;
  else raw += 30;

  raw += STRATEGY_RISK[strategy] ?? 20;

  for (const { max, grade } of RISK_GRADE_THRESHOLDS) {
    if (raw <= max) return grade;
  }
  return 'F';
}

/**
 * Compute opportunity scores for a batch of opportunities.
 * Score 0-100: 45% yield + 25% TVL + 30% risk-adjusted base.
 *
 * APY is capped at 100% for percentile ranking to prevent
 * outlier pools from dominating. TVL is log-scaled so $10M
 * scores proportionally higher than $10K without being linear.
 */
export function computeScores(
  opportunities: { totalApy: number; riskGrade: RiskGrade; tvl: number }[]
): number[] {
  const n = opportunities.length;
  if (n === 0) return [];

  // Yield: percentile rank on APY capped at 100%
  const cappedApys = opportunities.map((o) => Math.min(o.totalApy, 100));
  const sortedCapped = opportunities
    .map((o, i) => ({ apy: cappedApys[i], idx: i }))
    .sort((a, b) => a.apy - b.apy);

  const yieldPct = new Array<number>(n);
  for (let rank = 0; rank < n; rank++) {
    yieldPct[sortedCapped[rank].idx] = n > 1 ? (rank / (n - 1)) * 100 : 50;
  }

  // TVL: log-scaled, normalized to 0-100
  const tvlLogs = opportunities.map((o) => Math.log10(Math.max(o.tvl, 1000)));
  const tvlMin = Math.min(...tvlLogs);
  const tvlMax = Math.max(...tvlLogs);
  const tvlRange = tvlMax - tvlMin || 1;

  const riskBonus: Record<RiskGrade, number> = {
    A: 15,
    B: 8,
    C: 0,
    D: -8,
    F: -15,
  };

  return opportunities.map((o, i) => {
    const yieldComp = yieldPct[i] * 0.45;
    const tvlComp = ((tvlLogs[i] - tvlMin) / tvlRange) * 100 * 0.25;
    const riskComp = (50 + riskBonus[o.riskGrade]) * 0.30;
    const score = Math.round(yieldComp + tvlComp + riskComp);
    return Math.max(0, Math.min(100, score));
  });
}
