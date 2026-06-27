export type StepStatus =
  | 'pending'
  | 'simulating'
  | 'ready'
  | 'executing'
  | 'confirmed'
  | 'failed'
  | 'cancelled';

export interface ExecutionStep {
  index: number;
  action: string;
  protocol: string;
  asset: string;
  celestialKey: string;
  status: StepStatus;
  estimatedGasLamports: number;
  estimatedDurationMs: number;
  expectedOutput: string;
  riskGrade: string;
  txHash: string | null;
  error: string | null;
  startedAt: number | null;
  completedAt: number | null;
}

export interface ExecutionPlan {
  routeId: string;
  routeName: string;
  steps: ExecutionStep[];
  totalEstimatedGas: number;
  totalEstimatedDurationMs: number;
  status: 'idle' | 'simulating' | 'ready' | 'executing' | 'completed' | 'failed' | 'cancelled';
  currentStep: number;
  createdAt: number;
}

export function createExecutionPlan(
  routeId: string,
  routeName: string,
  steps: Omit<ExecutionStep, 'status' | 'txHash' | 'error' | 'startedAt' | 'completedAt'>[],
): ExecutionPlan {
  return {
    routeId,
    routeName,
    steps: steps.map((s) => ({
      ...s,
      status: 'pending',
      txHash: null,
      error: null,
      startedAt: null,
      completedAt: null,
    })),
    totalEstimatedGas: steps.reduce((sum, s) => sum + s.estimatedGasLamports, 0),
    totalEstimatedDurationMs: steps.reduce((sum, s) => sum + s.estimatedDurationMs, 0),
    status: 'idle',
    currentStep: 0,
    createdAt: Date.now(),
  };
}

export function isTerminal(status: StepStatus): boolean {
  return status === 'confirmed' || status === 'failed' || status === 'cancelled';
}

export function isPlanComplete(plan: ExecutionPlan): boolean {
  return plan.steps.every((s) => s.status === 'confirmed');
}

export function isPlanFailed(plan: ExecutionPlan): boolean {
  return plan.steps.some((s) => s.status === 'failed');
}
