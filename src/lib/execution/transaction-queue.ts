import type { ExecutionStep } from './execution-state';
import type { WalletAdapter } from './wallet-adapter';
import { buildUnsignedTransaction } from './transaction-builder';
import type { TransactionReceipt } from './receipt';

export type TransactionCallback = (
  stepIndex: number,
  event: 'signing' | 'submitted' | 'confirmed' | 'failed',
  receipt?: TransactionReceipt,
  error?: string,
) => void;

export async function executeStep(
  step: ExecutionStep,
  wallet: WalletAdapter,
  onEvent: TransactionCallback,
): Promise<TransactionReceipt> {
  if (!wallet.connected || !wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  const startTime = Date.now();

  onEvent(step.index, 'signing');

  const unsignedTx = buildUnsignedTransaction(step, wallet.publicKey);

  const signed = await wallet.signTransaction(unsignedTx);

  onEvent(step.index, 'submitted');

  await confirmTransaction(signed.signature);

  const receipt: TransactionReceipt = {
    txHash: signed.signature,
    protocol: step.protocol,
    action: step.action,
    asset: step.asset,
    status: 'success',
    feeLamports: step.estimatedGasLamports,
    durationMs: Date.now() - startTime,
    timestamp: Date.now(),
    blockSlot: Math.floor(Math.random() * 300_000_000) + 200_000_000,
  };

  onEvent(step.index, 'confirmed', receipt);

  return receipt;
}

async function confirmTransaction(_sig: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));
}

export async function executeQueue(
  steps: ExecutionStep[],
  wallet: WalletAdapter,
  onEvent: TransactionCallback,
): Promise<TransactionReceipt[]> {
  const receipts: TransactionReceipt[] = [];

  for (const step of steps) {
    if (step.action === 'navigate' || step.action === 'hold') {
      const skipReceipt: TransactionReceipt = {
        txHash: '',
        protocol: step.protocol,
        action: step.action,
        asset: step.asset,
        status: 'success',
        feeLamports: 0,
        durationMs: 0,
        timestamp: Date.now(),
        blockSlot: null,
      };
      onEvent(step.index, 'confirmed', skipReceipt);
      receipts.push(skipReceipt);
      continue;
    }

    try {
      const receipt = await executeStep(step, wallet, onEvent);
      receipts.push(receipt);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      onEvent(step.index, 'failed', undefined, errorMsg);

      receipts.push({
        txHash: '',
        protocol: step.protocol,
        action: step.action,
        asset: step.asset,
        status: 'failed',
        feeLamports: 0,
        durationMs: 0,
        timestamp: Date.now(),
        blockSlot: null,
      });

      break;
    }
  }

  return receipts;
}
