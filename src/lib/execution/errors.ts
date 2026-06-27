export class ExecutionError extends Error {
  constructor(
    message: string,
    public readonly code: ExecutionErrorCode,
    public readonly step: number,
    public readonly recoverable: boolean,
  ) {
    super(message);
    this.name = 'ExecutionError';
  }
}

export type ExecutionErrorCode =
  | 'SIMULATION_FAILED'
  | 'INSUFFICIENT_BALANCE'
  | 'SLIPPAGE_EXCEEDED'
  | 'WALLET_REJECTED'
  | 'WALLET_DISCONNECTED'
  | 'TRANSACTION_FAILED'
  | 'TRANSACTION_TIMEOUT'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export function isRecoverable(code: ExecutionErrorCode): boolean {
  return code === 'NETWORK_ERROR' || code === 'TRANSACTION_TIMEOUT';
}
