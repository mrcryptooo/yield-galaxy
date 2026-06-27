import type { Opportunity } from '../types';
import type { OptimizerResult } from '../optimizer/optimizer';
import { generateInsights, type Insight } from './insights';
import { recommend, type Recommendation } from './recommendations';
import { analyzeRoute, type RouteAnalysis } from './analysis';
import { assessRouteRisk, type RiskAssessment } from './risk';
import {
  speechFromAnalysis,
  speechFromRecommendation,
  speechForJourneyStep,
  speechForCompletion,
  speechForIdle,
  speechFromInsight,
  type CaptainSpeech,
} from './speech';

export interface CaptainBriefing {
  speech: CaptainSpeech;
  analysis: RouteAnalysis | null;
  risk: RiskAssessment | null;
  recommendation: Recommendation | null;
  insights: Insight[];
  idleSpeech: CaptainSpeech;
}

export function buildBriefing(
  opportunities: Opportunity[],
  optimizerResult: OptimizerResult | null,
): CaptainBriefing {
  const insights = generateInsights(opportunities);
  const topInsight = insights[0] ?? null;
  const idleSpeech = speechForIdle(opportunities.length, topInsight);

  if (!optimizerResult || optimizerResult.routes.length === 0) {
    return {
      speech: idleSpeech,
      analysis: null,
      risk: null,
      recommendation: null,
      insights,
      idleSpeech,
    };
  }

  const rec = recommend(optimizerResult);
  const topRoute = optimizerResult.routes[0];
  const analysis = analyzeRoute(topRoute, optimizerResult, opportunities);
  const risk = assessRouteRisk(topRoute);

  const speech = rec
    ? speechFromRecommendation(rec)
    : speechFromAnalysis(analysis);

  return { speech, analysis, risk, recommendation: rec, insights, idleSpeech };
}

export function getJourneyStepSpeech(
  stepLabel: string,
  stepAction: string,
  apy: number,
  riskGrade: string,
): CaptainSpeech {
  return speechForJourneyStep(stepLabel, stepAction, apy, riskGrade);
}

export function getCompletionSpeech(routeName: string, cumulativeApy: number): CaptainSpeech {
  return speechForCompletion(routeName, cumulativeApy);
}

export function getInsightSpeech(insights: Insight[], index: number): CaptainSpeech | null {
  const insight = insights[index];
  if (!insight) return null;
  return speechFromInsight(insight);
}
