import type { Opportunity } from '../types';
import type { RouteConstraints, RiskPreference } from './constraints';
import { buildConstraints, isGradeWithinLimit } from './constraints';
import { buildGraph, findPaths, type OpportunityGraph, type GraphEdge } from './opportunity-graph';
import { scoreRoute, compareRoutes, type RouteScore } from './scorer';
import { simulateRoute, type SimulationResult } from './simulator';

export interface OptimizedRoute {
  id: string;
  name: string;
  description: string;
  path: string[];
  edges: GraphEdge[];
  score: RouteScore;
  simulation: SimulationResult;
  explanation: string[];
}

export interface OptimizerResult {
  routes: OptimizedRoute[];
  constraints: RouteConstraints;
  totalCandidates: number;
  totalValid: number;
}

export function optimize(
  opportunities: Opportunity[],
  startAsset: string,
  amount: number,
  riskPreference: RiskPreference,
): OptimizerResult {
  const constraints = buildConstraints(startAsset, amount, riskPreference);
  const graph = buildGraph(opportunities);
  const rawPaths = findPaths(graph, constraints.startAsset, constraints.maxSteps);

  const candidates: OptimizedRoute[] = [];

  for (const path of rawPaths) {
    const edges = resolveEdges(graph, path);
    if (!edges) continue;

    if (!meetsConstraints(edges, constraints)) continue;

    const score = scoreRoute(edges, riskPreference);
    const simulation = simulateRoute(path, edges);

    if (!simulation.valid) continue;

    const explanation = generateExplanation(path, edges, score, simulation, riskPreference);

    const routeName = deriveRouteName(path);

    candidates.push({
      id: `opt-${path.join('-').toLowerCase()}`,
      name: routeName,
      description: explanation[0] ?? '',
      path,
      edges,
      score,
      simulation,
      explanation,
    });
  }

  candidates.sort((a, b) => compareRoutes(a.score, b.score));

  return {
    routes: candidates.slice(0, 8),
    constraints,
    totalCandidates: rawPaths.length,
    totalValid: candidates.length,
  };
}

function resolveEdges(graph: OpportunityGraph, path: string[]): GraphEdge[] | null {
  const edges: GraphEdge[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const candidates = graph.edges.filter(e => e.from === from && e.to === to);

    if (candidates.length === 0) return null;

    const best = candidates.sort((a, b) => {
      if (b.apy !== a.apy) return b.apy - a.apy;
      return b.tvl - a.tvl;
    })[0];

    edges.push(best);
  }

  return edges;
}

function meetsConstraints(edges: GraphEdge[], constraints: RouteConstraints): boolean {
  for (const edge of edges) {
    if (edge.tvl > 0 && edge.tvl < constraints.minTvl) return false;
    if (!isGradeWithinLimit(edge.riskGrade, constraints.maxRiskGrade)) return false;
  }

  if (edges.length > constraints.maxSteps) return false;

  return true;
}

function deriveRouteName(path: string[]): string {
  const destination = path[path.length - 1];
  const via = path.length > 2 ? path[1] : null;

  if (destination.startsWith('PT-')) return `${destination} Fixed Yield`;
  if (via && destination !== via) return `${via} → ${destination}`;
  return `${destination} Route`;
}

function generateExplanation(
  path: string[],
  edges: GraphEdge[],
  score: RouteScore,
  simulation: SimulationResult,
  riskPreference: RiskPreference,
): string[] {
  const lines: string[] = [];

  const yieldEdges = edges.filter(e => e.apy > 0);
  const totalApy = simulation.cumulativeApy;

  if (totalApy > 10) {
    lines.push(`High yield route: ${totalApy.toFixed(1)}% combined APY across ${yieldEdges.length} protocol${yieldEdges.length > 1 ? 's' : ''}.`);
  } else if (totalApy > 1) {
    lines.push(`Balanced route: ${totalApy.toFixed(2)}% APY with ${simulation.cumulativeRisk} risk rating.`);
  } else {
    lines.push(`Conservative route: ${totalApy.toFixed(2)}% APY, prioritizing safety.`);
  }

  if (riskPreference === 'conservative') {
    lines.push(`Filtered for safety — only grade A-B protocols with strong liquidity.`);
  } else if (riskPreference === 'aggressive') {
    lines.push(`Optimized for yield — higher risk tolerance accepted.`);
  }

  if (score.diversificationBonus > 0) {
    const protocols = new Set(edges.filter(e => e.opportunity).map(e => e.opportunity!.source_id));
    lines.push(`Diversified across ${protocols.size} protocols, reducing single-point risk.`);
  }

  if (simulation.warnings.length > 0) {
    lines.push(`Warning: ${simulation.warnings[0]}`);
  }

  if (score.confidence >= 90) {
    lines.push(`High confidence: deep liquidity and proven protocols.`);
  } else if (score.confidence < 60) {
    lines.push(`Lower confidence — verify liquidity before executing.`);
  }

  return lines;
}
