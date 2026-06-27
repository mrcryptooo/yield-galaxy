import type { Opportunity, RiskGrade } from '../types';
import type { OptimizedRoute } from '../optimizer/optimizer';
import type { OptimizerResult } from '../optimizer/optimizer';
import { SOURCE_DISPLAY_NAMES } from '../constants';

export interface RouteAnalysis {
  headline: string;
  summary: string;
  warnings: string[];
  advantages: string[];
  disadvantages: string[];
  confidence: number;
  confidenceReason: string;
  risk: RiskGrade;
  riskExplanation: string;
  nextStep: string;
  reason: string;
}

export function analyzeRoute(
  route: OptimizedRoute,
  allRoutes: OptimizerResult,
  _opportunities: Opportunity[],
): RouteAnalysis {
  const warnings: string[] = [];
  const advantages: string[] = [];
  const disadvantages: string[] = [];

  const { simulation, score } = route;

  // Headline
  const headline = simulation.cumulativeApy > 10
    ? `High-yield route: ${simulation.cumulativeApy.toFixed(1)}% APY`
    : simulation.cumulativeApy > 1
      ? `Balanced route: ${simulation.cumulativeApy.toFixed(2)}% APY`
      : `Conservative position: ${simulation.cumulativeApy.toFixed(2)}% APY`;

  // Warnings from simulation
  for (const w of simulation.warnings) {
    warnings.push(w);
  }

  // TVL concentration
  const yieldEdges = route.edges.filter(e => e.opportunity);
  const protocols = new Set(yieldEdges.map(e => SOURCE_DISPLAY_NAMES[e.opportunity!.source_id] ?? e.opportunity!.source_id));
  if (protocols.size === 1) {
    warnings.push(`Single protocol exposure: all yield from ${[...protocols][0]}.`);
  }

  // Low confidence
  if (score.confidence < 60) {
    warnings.push('Low confidence — limited liquidity or high protocol risk.');
  }

  // PT maturity
  const ptEdges = route.edges.filter(e => e.strategy === 'pt');
  if (ptEdges.length > 0) {
    warnings.push('Contains PT position — yield is locked until maturity.');
  }

  // Advantages
  if (score.tvlScore > 70) advantages.push('Deep liquidity across all steps.');
  if (score.riskScore > 60) advantages.push('Low protocol risk profile.');
  if (score.diversificationBonus > 0) advantages.push(`Diversified across ${protocols.size} protocols.`);
  if (simulation.stepResults.length <= 3) advantages.push('Simple execution — few steps required.');
  if (simulation.cumulativeRisk === 'A') advantages.push('Highest safety rating.');

  // Disadvantages
  if (score.complexityPenalty > 15) disadvantages.push('Complex route — multiple transactions required.');
  if (simulation.cumulativeRisk === 'D' || simulation.cumulativeRisk === 'F') {
    disadvantages.push('Elevated risk — verify position carefully.');
  }
  const lowTvlEdges = yieldEdges.filter(e => e.tvl > 0 && e.tvl < 500_000);
  if (lowTvlEdges.length > 0) disadvantages.push('Some steps have limited liquidity.');

  // Confidence
  const confidence = score.confidence;
  const confidenceParts: string[] = [];
  if (score.tvlScore > 60) confidenceParts.push('deep liquidity');
  if (score.riskScore > 50) confidenceParts.push('proven protocols');
  if (simulation.stepResults.length <= 4) confidenceParts.push('simple execution');
  if (confidenceParts.length === 0) confidenceParts.push('moderate data quality');
  const confidenceReason = `${confidence}% — ${confidenceParts.join(', ')}.`;

  // Risk
  const risk = simulation.cumulativeRisk;
  const worstEdge = yieldEdges.sort((a, b) => gradeValue(b.riskGrade) - gradeValue(a.riskGrade))[0];
  const riskExplanation = worstEdge
    ? `Overall ${risk}. Highest risk at ${SOURCE_DISPLAY_NAMES[worstEdge.opportunity?.source_id ?? ''] ?? worstEdge.opportunity?.source_id ?? 'unknown'} (${worstEdge.riskGrade}).`
    : `Overall ${risk}.`;

  // Next step recommendation
  const firstStep = route.path[1] ?? route.path[0];
  const nextStep = `Begin by acquiring ${firstStep}.`;

  // Why this route
  const betterCount = allRoutes.routes.filter(r => r.score.total > route.score.total).length;
  const reason = betterCount === 0
    ? 'This is the highest-scoring route for your risk preference.'
    : `Ranked #${betterCount + 1} of ${allRoutes.totalValid} valid routes.`;

  // Summary
  const summary = [
    `${simulation.stepResults.length} steps, ~${simulation.estimatedTimeMinutes.toFixed(0)} minutes.`,
    `Expected yield: ${simulation.cumulativeApy.toFixed(2)}%.`,
    `Risk: ${risk}. Confidence: ${confidence}%.`,
  ].join(' ');

  return {
    headline,
    summary,
    warnings,
    advantages,
    disadvantages,
    confidence,
    confidenceReason,
    risk,
    riskExplanation,
    nextStep,
    reason,
  };
}

function gradeValue(grade: RiskGrade): number {
  const map: Record<RiskGrade, number> = { A: 1, B: 2, C: 3, D: 4, F: 5 };
  return map[grade];
}
