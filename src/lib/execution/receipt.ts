export interface TransactionReceipt {
  txHash: string;
  protocol: string;
  action: string;
  asset: string;
  status: 'success' | 'failed';
  feeLamports: number;
  durationMs: number;
  timestamp: number;
  blockSlot: number | null;
}

export interface ExecutionReceipt {
  routeId: string;
  routeName: string;
  transactions: TransactionReceipt[];
  totalFeeLamports: number;
  totalDurationMs: number;
  status: 'success' | 'partial' | 'failed';
  startedAt: number;
  completedAt: number;
}

export function buildReceipt(
  routeId: string,
  routeName: string,
  transactions: TransactionReceipt[],
  startedAt: number,
): ExecutionReceipt {
  const completedAt = Date.now();
  const totalFeeLamports = transactions.reduce((s, t) => s + t.feeLamports, 0);
  const totalDurationMs = completedAt - startedAt;

  const allSuccess = transactions.every((t) => t.status === 'success');
  const anySuccess = transactions.some((t) => t.status === 'success');
  const status: ExecutionReceipt['status'] = allSuccess ? 'success' : anySuccess ? 'partial' : 'failed';

  return {
    routeId,
    routeName,
    transactions,
    totalFeeLamports,
    totalDurationMs,
    status,
    startedAt,
    completedAt,
  };
}
