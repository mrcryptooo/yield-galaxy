import type { GraphEdge } from './opportunity-graph';
import type { RiskGrade } from '../types';
import { riskGradeToNumber } from './constraints';

export interface SimulationResult {
  valid: boolean;
  cumulativeApy: number;
  cumulativeRisk: RiskGrade;
  estimatedTimeMinutes: number;
  stepResults: StepResult[];
  warnings: string[];
}

export interface StepResult {
  nodeId: string;
  action: string;
  apy: number;
  tvl: number;
  riskGrade: RiskGrade;
  estimatedMinutes: number;
}

const ACTION_TIME_ESTIMATES: Record<string, number> = {
  swap: 0.5,
  convert: 0.5,
  stake: 1,
  deposit: 1,
  borrow: 1,
  lp: 2,
  mint: 1,
  hold: 0,
  navigate: 0.5,
  loop: 2,
  harvest: 1,
};

export function simulateRoute(
  path: string[],
  edges: GraphEdge[],
): SimulationResult {
  const warnings: string[] = [];
  const stepResults: StepResult[] = [];
  let cumulativeApy = 0;
  let worstRisk = 1;
  let totalMinutes = 0;

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    const targetNode = path[i + 1];

    if (edge.tvl > 0 && edge.tvl < 50_000) {
      warnings.push(`Low liquidity at ${targetNode}: $${Math.round(edge.tvl).toLocaleString()}`);
    }

    if (edge.apy > 500) {
      warnings.push(`Unusually high APY at ${targetNode}: ${edge.apy.toFixed(1)}% — verify sustainability`);
    }

    const riskNum = riskGradeToNumber(edge.riskGrade);
    if (riskNum > worstRisk) worstRisk = riskNum;

    const minutes = ACTION_TIME_ESTIMATES[edge.action] ?? 1;
    totalMinutes += minutes;

    if (edge.apy > 0) {
      cumulativeApy += edge.apy;
    }

    stepResults.push({
      nodeId: targetNode,
      action: edge.action,
      apy: edge.apy,
      tvl: edge.tvl,
      riskGrade: edge.riskGrade,
      estimatedMinutes: minutes,
    });
  }

  const riskGrades: RiskGrade[] = ['A', 'B', 'C', 'D', 'F'];
  const cumulativeRisk = riskGrades[Math.min(worstRisk - 1, 4)];

  const valid = stepResults.length > 0 && warnings.filter(w => w.includes('Low liquidity')).length < stepResults.length;

  return {
    valid,
    cumulativeApy: Math.round(cumulativeApy * 100) / 100,
    cumulativeRisk,
    estimatedTimeMinutes: totalMinutes,
    stepResults,
    warnings,
  };
}
