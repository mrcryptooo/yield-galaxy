import type { ExecutionStep } from './execution-state';
import type { UnsignedTransaction } from './wallet-adapter';
import type { RouteNode } from '../route-engine';
import type { GraphEdge } from '../optimizer/opportunity-graph';
import { SOURCE_DISPLAY_NAMES } from '../constants';

const GAS_ESTIMATES: Record<string, number> = {
  swap: 15_000,
  convert: 12_000,
  deposit: 10_000,
  borrow: 12_000,
  stake: 10_000,
  lp: 20_000,
  mint: 15_000,
  navigate: 5_000,
  hold: 0,
  loop: 25_000,
  harvest: 10_000,
  acquire: 5_000,
};

const DURATION_ESTIMATES: Record<string, number> = {
  swap: 3_000,
  convert: 3_000,
  deposit: 2_000,
  borrow: 2_000,
  stake: 2_000,
  lp: 4_000,
  mint: 3_000,
  navigate: 1_000,
  hold: 0,
  loop: 5_000,
  harvest: 2_000,
  acquire: 1_000,
};

export function buildExecutionSteps(
  nodes: RouteNode[],
  edges: GraphEdge[],
): Omit<ExecutionStep, 'status' | 'txHash' | 'error' | 'startedAt' | 'completedAt'>[] {
  return nodes.map((node, i) => {
    const edge = i > 0 ? edges[i - 1] : null;
    const action = edge?.action ?? node.action;
    const protocol = edge?.opportunity
      ? SOURCE_DISPLAY_NAMES[edge.opportunity.source_id] ?? edge.opportunity.source_id
      : node.celestialKey;

    return {
      index: i,
      action,
      protocol,
      asset: node.celestialKey,
      celestialKey: node.celestialKey,
      estimatedGasLamports: GAS_ESTIMATES[action] ?? 10_000,
      estimatedDurationMs: DURATION_ESTIMATES[action] ?? 2_000,
      expectedOutput: describeOutput(action, node.celestialKey, edge),
      riskGrade: edge?.riskGrade ?? 'B',
    };
  });
}

function describeOutput(action: string, asset: string, _edge: GraphEdge | null): string {
  if (action === 'swap' || action === 'acquire') return `Receive ${asset}`;
  if (action === 'convert') return `Receive ${asset}`;
  if (action === 'deposit') return `Position in ${asset}`;
  if (action === 'borrow') return `Borrowed ${asset}`;
  if (action === 'stake') return `Staked ${asset}`;
  if (action === 'lp') return `LP position on ${asset}`;
  if (action === 'mint') return `Minted ${asset}`;
  if (action === 'hold') return `Holding ${asset}`;
  if (action === 'harvest') return `Collected rewards`;
  return `Completed ${action}`;
}

export function buildUnsignedTransaction(
  step: ExecutionStep,
  feePayer: string,
): UnsignedTransaction {
  return {
    instructions: [
      {
        programId: `${step.protocol}Program11111111111111111111111111`,
        keys: [
          { pubkey: feePayer, isSigner: true, isWritable: true },
          { pubkey: `${step.asset}Vault1111111111111111111111111111111`, isSigner: false, isWritable: true },
        ],
        data: new Uint8Array([0]),
      },
    ],
    feePayer,
    recentBlockhash: null,
  };
}
