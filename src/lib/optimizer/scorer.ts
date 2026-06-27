import type { GraphEdge } from './opportunity-graph';
import { riskGradeToNumber } from './constraints';
import type { RiskPreference } from './constraints';

export interface RouteScore {
  total: number;
  apyScore: number;
  tvlScore: number;
  riskScore: number;
  complexityPenalty: number;
  diversificationBonus: number;
  confidence: number;
}

const WEIGHTS = {
  apy:             0.35,
  tvl:             0.20,
  risk:            0.25,
  complexity:      0.10,
  diversification: 0.10,
} as const;

const RISK_PREFERENCE_MULTIPLIERS: Record<RiskPreference, { apyMult: number; riskMult: number }> = {
  conservative: { apyMult: 0.7, riskMult: 1.4 },
  moderate:     { apyMult: 1.0, riskMult: 1.0 },
  aggressive:   { apyMult: 1.3, riskMult: 0.6 },
};

export function scoreRoute(
  edges: GraphEdge[],
  riskPreference: RiskPreference,
): RouteScore {
  if (edges.length === 0) {
    return { total: 0, apyScore: 0, tvlScore: 0, riskScore: 0, complexityPenalty: 0, diversificationBonus: 0, confidence: 0 };
  }

  const mult = RISK_PREFERENCE_MULTIPLIERS[riskPreference];

  const yieldEdges = edges.filter(e => e.apy > 0);
  const cumulativeApy = yieldEdges.reduce((s, e) => s + e.apy, 0);
  const apyScore = Math.min(100, (Math.log10(Math.max(cumulativeApy, 0.01) + 1) / Math.log10(101)) * 100) * mult.apyMult;

  const tvls = yieldEdges.map(e => e.tvl).filter(t => t > 0);
  const minTvl = tvls.length > 0 ? Math.min(...tvls) : 0;
  const tvlScore = minTvl > 0
    ? Math.min(100, (Math.log10(minTvl) / Math.log10(100_000_000)) * 100)
    : 0;

  const riskValues = edges.filter(e => e.riskGrade).map(e => riskGradeToNumber(e.riskGrade));
  const worstRisk = riskValues.length > 0 ? Math.max(...riskValues) : 3;
  const avgRisk = riskValues.length > 0 ? riskValues.reduce((s, r) => s + r, 0) / riskValues.length : 3;
  const riskScore = Math.max(0, 100 - (avgRisk * 15 + worstRisk * 5)) * mult.riskMult;

  const stepCount = edges.length;
  const complexityPenalty = Math.min(30, (stepCount - 2) * 8);

  const uniqueProtocols = new Set(edges.filter(e => e.opportunity).map(e => e.opportunity!.source_id));
  const diversificationBonus = Math.min(20, (uniqueProtocols.size - 1) * 8);

  const total = Math.round(
    apyScore * WEIGHTS.apy +
    tvlScore * WEIGHTS.tvl +
    riskScore * WEIGHTS.risk -
    complexityPenalty * WEIGHTS.complexity +
    diversificationBonus * WEIGHTS.diversification
  );

  const tvlConfidence = minTvl > 1_000_000 ? 1.0 : minTvl > 100_000 ? 0.8 : 0.5;
  const stepConfidence = stepCount <= 3 ? 1.0 : stepCount <= 5 ? 0.85 : 0.7;
  const riskConfidence = worstRisk <= 2 ? 1.0 : worstRisk <= 3 ? 0.8 : 0.6;
  const confidence = Math.round(tvlConfidence * stepConfidence * riskConfidence * 100);

  return {
    total: Math.max(0, Math.min(100, total)),
    apyScore: Math.round(apyScore),
    tvlScore: Math.round(tvlScore),
    riskScore: Math.round(riskScore),
    complexityPenalty: Math.round(complexityPenalty),
    diversificationBonus: Math.round(diversificationBonus),
    confidence,
  };
}

export function compareRoutes(a: RouteScore, b: RouteScore): number {
  if (a.total !== b.total) return b.total - a.total;
  return b.confidence - a.confidence;
}
