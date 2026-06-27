import type { Opportunity, RiskGrade } from '../types';
import type { OptimizedRoute } from '../optimizer/optimizer';
import { SOURCE_DISPLAY_NAMES } from '../constants';

export interface RiskAssessment {
  overall: RiskGrade;
  protocolRisk: { protocol: string; grade: RiskGrade }[];
  concentrationRisk: 'low' | 'moderate' | 'high';
  complexityRisk: 'low' | 'moderate' | 'high';
  liquidityRisk: 'low' | 'moderate' | 'high';
  summary: string;
}

export function assessRouteRisk(route: OptimizedRoute): RiskAssessment {
  const yieldEdges = route.edges.filter(e => e.opportunity);

  // Protocol risk
  const protoMap = new Map<string, RiskGrade>();
  for (const e of yieldEdges) {
    const name = SOURCE_DISPLAY_NAMES[e.opportunity!.source_id] ?? e.opportunity!.source_id;
    const existing = protoMap.get(name);
    if (!existing || gradeVal(e.riskGrade) > gradeVal(existing)) {
      protoMap.set(name, e.riskGrade);
    }
  }
  const protocolRisk = [...protoMap.entries()].map(([protocol, grade]) => ({ protocol, grade }));

  // Concentration
  const uniqueProtocols = protoMap.size;
  const concentrationRisk: RiskAssessment['concentrationRisk'] =
    uniqueProtocols >= 3 ? 'low' : uniqueProtocols >= 2 ? 'moderate' : 'high';

  // Complexity
  const steps = route.simulation.stepResults.length;
  const complexityRisk: RiskAssessment['complexityRisk'] =
    steps <= 3 ? 'low' : steps <= 5 ? 'moderate' : 'high';

  // Liquidity
  const minTvl = Math.min(...yieldEdges.filter(e => e.tvl > 0).map(e => e.tvl), Infinity);
  const liquidityRisk: RiskAssessment['liquidityRisk'] =
    minTvl > 1_000_000 ? 'low' : minTvl > 100_000 ? 'moderate' : 'high';

  const overall = route.simulation.cumulativeRisk;

  const parts: string[] = [];
  if (concentrationRisk === 'high') parts.push('single-protocol exposure');
  if (complexityRisk === 'high') parts.push('high execution complexity');
  if (liquidityRisk === 'high') parts.push('thin liquidity');
  if (parts.length === 0) parts.push('within acceptable parameters');

  const summary = `Risk grade ${overall}: ${parts.join(', ')}.`;

  return { overall, protocolRisk, concentrationRisk, complexityRisk, liquidityRisk, summary };
}

export function assessOpportunityRisk(opportunity: Opportunity): string {
  const warnings: string[] = [];
  if (opportunity.tvl < 50_000) warnings.push('low liquidity');
  if (opportunity.total_apy > 500) warnings.push('extreme APY');
  if (opportunity.risk_grade === 'D' || opportunity.risk_grade === 'F') warnings.push('high protocol risk');
  if (opportunity.il_risk === 'high') warnings.push('significant IL risk');

  if (warnings.length === 0) return 'No elevated risks detected.';
  return `Caution: ${warnings.join(', ')}.`;
}

function gradeVal(g: RiskGrade): number {
  return { A: 1, B: 2, C: 3, D: 4, F: 5 }[g];
}
