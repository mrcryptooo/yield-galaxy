import type { RiskGrade } from '../types';

export type RiskPreference = 'conservative' | 'moderate' | 'aggressive';

export interface RouteConstraints {
  startAsset: string;
  amount: number;
  riskPreference: RiskPreference;
  maxSteps: number;
  minTvl: number;
  maxRiskGrade: RiskGrade;
}

const RISK_GRADE_ORDER: Record<RiskGrade, number> = {
  A: 1, B: 2, C: 3, D: 4, F: 5,
};

const PREFERENCE_LIMITS: Record<RiskPreference, { maxGrade: RiskGrade; minTvl: number; maxSteps: number }> = {
  conservative: { maxGrade: 'B', minTvl: 1_000_000, maxSteps: 4 },
  moderate:     { maxGrade: 'C', minTvl: 100_000,   maxSteps: 5 },
  aggressive:   { maxGrade: 'D', minTvl: 10_000,    maxSteps: 6 },
};

export function buildConstraints(
  startAsset: string,
  amount: number,
  riskPreference: RiskPreference,
): RouteConstraints {
  const limits = PREFERENCE_LIMITS[riskPreference];
  return {
    startAsset,
    amount,
    riskPreference,
    maxSteps: limits.maxSteps,
    minTvl: limits.minTvl,
    maxRiskGrade: limits.maxGrade,
  };
}

export function isGradeWithinLimit(grade: RiskGrade, limit: RiskGrade): boolean {
  return RISK_GRADE_ORDER[grade] <= RISK_GRADE_ORDER[limit];
}

export function riskGradeToNumber(grade: RiskGrade): number {
  return RISK_GRADE_ORDER[grade];
}
