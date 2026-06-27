import type { RouteAnalysis } from './analysis';
import type { Insight } from './insights';
import type { RiskAssessment } from './risk';
import type { Recommendation } from './recommendations';
import type { CaptainState } from '@/stores/journey-store';

export interface CaptainSpeech {
  text: string;
  tone: 'neutral' | 'confident' | 'cautious' | 'alert' | 'celebratory';
  suggestedState: CaptainState;
}

export function speechFromAnalysis(analysis: RouteAnalysis): CaptainSpeech {
  if (analysis.warnings.length > 2) {
    return {
      text: `Proceed with caution. ${analysis.warnings[0]}`,
      tone: 'cautious',
      suggestedState: 'alert',
    };
  }

  if (analysis.confidence >= 85 && analysis.advantages.length > 0) {
    return {
      text: `${analysis.headline}. ${analysis.advantages[0]}`,
      tone: 'confident',
      suggestedState: 'talking',
    };
  }

  return {
    text: analysis.headline,
    tone: 'neutral',
    suggestedState: 'talking',
  };
}

export function speechFromRecommendation(rec: Recommendation): CaptainSpeech {
  const primary = rec.primary;

  if (primary.score.confidence >= 90) {
    return {
      text: `I recommend ${primary.name}. ${rec.whyPrimary}`,
      tone: 'confident',
      suggestedState: 'talking',
    };
  }

  if (rec.alternative && primary.score.total - rec.alternative.score.total < 5) {
    return {
      text: `Two strong options. ${rec.tradeoff}`,
      tone: 'neutral',
      suggestedState: 'thinking',
    };
  }

  return {
    text: `Best route: ${primary.name}. ${rec.whyPrimary}`,
    tone: 'neutral',
    suggestedState: 'talking',
  };
}

export function speechFromInsight(insight: Insight): CaptainSpeech {
  const stateMap: Record<Insight['severity'], CaptainState> = {
    info: 'talking',
    caution: 'alert',
    alert: 'alert',
  };
  const toneMap: Record<Insight['severity'], CaptainSpeech['tone']> = {
    info: 'neutral',
    caution: 'cautious',
    alert: 'alert',
  };
  return {
    text: insight.text,
    tone: toneMap[insight.severity],
    suggestedState: stateMap[insight.severity],
  };
}

export function speechFromRisk(assessment: RiskAssessment): CaptainSpeech {
  if (assessment.overall === 'A') {
    return { text: assessment.summary, tone: 'confident', suggestedState: 'talking' };
  }
  if (assessment.overall === 'D' || assessment.overall === 'F') {
    return { text: assessment.summary, tone: 'alert', suggestedState: 'alert' };
  }
  return { text: assessment.summary, tone: 'neutral', suggestedState: 'talking' };
}

export function speechForJourneyStep(
  stepLabel: string,
  stepAction: string,
  apy: number,
  risk: string,
): CaptainSpeech {
  if (stepAction === 'deposit' && apy > 0) {
    return {
      text: `${stepLabel}. Current yield: ${apy.toFixed(2)}%.`,
      tone: 'confident',
      suggestedState: 'talking',
    };
  }
  if (stepAction === 'lp') {
    return {
      text: `${stepLabel}. Monitor impermanent loss.`,
      tone: 'cautious',
      suggestedState: 'talking',
    };
  }
  if (stepAction === 'mint') {
    return {
      text: `${stepLabel}. Fixed yield locked in.`,
      tone: 'confident',
      suggestedState: 'talking',
    };
  }
  if (risk === 'D' || risk === 'F') {
    return {
      text: `${stepLabel}. Elevated risk — proceed carefully.`,
      tone: 'cautious',
      suggestedState: 'alert',
    };
  }
  return {
    text: `${stepLabel}.`,
    tone: 'neutral',
    suggestedState: 'talking',
  };
}

export function speechForCompletion(routeName: string, cumulativeApy: number): CaptainSpeech {
  if (cumulativeApy > 10) {
    return {
      text: `${routeName} complete. ${cumulativeApy.toFixed(1)}% yield secured.`,
      tone: 'celebratory',
      suggestedState: 'success',
    };
  }
  return {
    text: `Route complete. Position established.`,
    tone: 'confident',
    suggestedState: 'success',
  };
}

export function speechForIdle(poolCount: number, topInsight: Insight | null): CaptainSpeech {
  if (topInsight) {
    return {
      text: topInsight.text,
      tone: topInsight.severity === 'caution' ? 'cautious' : 'neutral',
      suggestedState: 'talking',
    };
  }
  return {
    text: `Exploring Solstice Galaxy. ${poolCount} destinations detected.`,
    tone: 'neutral',
    suggestedState: 'idle',
  };
}
