import type { OptimizedRoute } from '../optimizer/optimizer';
import type { RouteNode } from '../route-engine';
import type { GraphEdge } from '../optimizer/opportunity-graph';
import { buildExecutionSteps } from './transaction-builder';
import { createExecutionPlan, type ExecutionPlan, type ExecutionStep } from './execution-state';
import { simulateExecution, type SimulationResult } from './simulation';
import { executeQueue, type TransactionCallback } from './transaction-queue';
import { buildReceipt, type ExecutionReceipt } from './receipt';
import type { WalletAdapter } from './wallet-adapter';

export interface ExecutionContext {
  plan: ExecutionPlan;
  simulation: SimulationResult | null;
  receipt: ExecutionReceipt | null;
  wallet: WalletAdapter;
}

export function createPlanFromRoute(
  route: OptimizedRoute,
  nodes: RouteNode[],
  edges: GraphEdge[],
): ExecutionPlan {
  const steps = buildExecutionSteps(nodes, edges);
  return createExecutionPlan(route.id, route.name, steps);
}

export function simulatePlan(
  plan: ExecutionPlan,
  walletBalanceLamports: number,
): SimulationResult {
  return simulateExecution(plan.steps, walletBalanceLamports);
}

export async function executePlan(
  plan: ExecutionPlan,
  wallet: WalletAdapter,
  onStepUpdate: (stepIndex: number, step: ExecutionStep) => void,
  onPlanUpdate: (status: ExecutionPlan['status']) => void,
): Promise<ExecutionReceipt> {
  if (!wallet.connected) {
    await wallet.connect();
  }

  const startedAt = Date.now();
  onPlanUpdate('executing');

  const callback: TransactionCallback = (stepIndex, event, receipt, error) => {
    const step = plan.steps[stepIndex];
    if (!step) return;

    switch (event) {
      case 'signing':
        step.status = 'executing';
        step.startedAt = Date.now();
        break;
      case 'submitted':
        break;
      case 'confirmed':
        step.status = 'confirmed';
        step.completedAt = Date.now();
        step.txHash = receipt?.txHash ?? null;
        break;
      case 'failed':
        step.status = 'failed';
        step.completedAt = Date.now();
        step.error = error ?? 'Transaction failed';
        break;
    }

    onStepUpdate(stepIndex, { ...step });
  };

  const receipts = await executeQueue(plan.steps, wallet, callback);

  const allConfirmed = plan.steps.every((s) => s.status === 'confirmed');
  onPlanUpdate(allConfirmed ? 'completed' : 'failed');

  return buildReceipt(plan.routeId, plan.routeName, receipts, startedAt);
}

export function generateExecutionSpeech(
  event: 'simulation_complete' | 'execution_started' | 'step_confirmed' | 'step_failed' | 'execution_complete' | 'execution_failed',
  context: { stepAction?: string; stepAsset?: string; routeName?: string; error?: string },
): string {
  switch (event) {
    case 'simulation_complete':
      return 'Simulation complete. All steps verified.';
    case 'execution_started':
      return `Executing ${context.routeName ?? 'route'}. Stand by.`;
    case 'step_confirmed':
      return `${capitalize(context.stepAction ?? 'Step')} confirmed at ${context.stepAsset ?? 'protocol'}.`;
    case 'step_failed':
      return `${capitalize(context.stepAction ?? 'Step')} failed${context.error ? ': ' + context.error : ''}. Route halted.`;
    case 'execution_complete':
      return `${context.routeName ?? 'Route'} executed successfully.`;
    case 'execution_failed':
      return `Execution failed${context.error ? ': ' + context.error : ''}. Review positions.`;
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
