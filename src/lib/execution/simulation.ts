import type { ExecutionStep } from './execution-state';

export interface SimulationResult {
  valid: boolean;
  steps: StepSimulation[];
  totalFeeLamports: number;
  totalDurationMs: number;
  warnings: string[];
}

export interface StepSimulation {
  index: number;
  action: string;
  estimatedSlippage: number;
  estimatedFee: number;
  balanceSufficient: boolean;
  warning: string | null;
}

export function simulateExecution(
  steps: ExecutionStep[],
  walletBalance: number,
): SimulationResult {
  const warnings: string[] = [];
  const stepSims: StepSimulation[] = [];
  let remainingBalance = walletBalance;
  let totalFee = 0;
  let totalDuration = 0;

  for (const step of steps) {
    const fee = step.estimatedGasLamports;
    const slippage = estimateSlippage(step.action);

    remainingBalance -= fee;
    const balanceSufficient = remainingBalance >= 0;

    if (!balanceSufficient) {
      warnings.push(`Insufficient balance at step ${step.index + 1}: ${step.action} ${step.asset}`);
    }

    if (slippage > 0.02) {
      warnings.push(`High slippage expected at step ${step.index + 1}: ${(slippage * 100).toFixed(1)}%`);
    }

    if (step.action === 'lp' || step.action === 'loop') {
      warnings.push(`Step ${step.index + 1} (${step.action}) involves complex multi-instruction transaction.`);
    }

    const warning = !balanceSufficient
      ? 'Insufficient balance for gas'
      : slippage > 0.05
        ? 'Extreme slippage risk'
        : null;

    stepSims.push({
      index: step.index,
      action: step.action,
      estimatedSlippage: slippage,
      estimatedFee: fee,
      balanceSufficient,
      warning,
    });

    totalFee += fee;
    totalDuration += step.estimatedDurationMs;
  }

  const valid = stepSims.every((s) => s.balanceSufficient) && warnings.filter((w) => w.includes('Insufficient')).length === 0;

  return {
    valid,
    steps: stepSims,
    totalFeeLamports: totalFee,
    totalDurationMs: totalDuration,
    warnings,
  };
}

function estimateSlippage(action: string): number {
  const slippageMap: Record<string, number> = {
    swap: 0.005,
    convert: 0.002,
    deposit: 0,
    borrow: 0,
    stake: 0,
    lp: 0.01,
    mint: 0.003,
    navigate: 0,
    hold: 0,
    loop: 0.015,
    harvest: 0,
    acquire: 0.005,
  };
  return slippageMap[action] ?? 0.005;
}
