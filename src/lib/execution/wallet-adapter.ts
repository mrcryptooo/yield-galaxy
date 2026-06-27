export interface WalletAdapter {
  connected: boolean;
  publicKey: string | null;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signTransaction(tx: UnsignedTransaction): Promise<SignedTransaction>;
  signAllTransactions(txs: UnsignedTransaction[]): Promise<SignedTransaction[]>;
}

export interface UnsignedTransaction {
  instructions: TransactionInstruction[];
  feePayer: string;
  recentBlockhash: string | null;
}

export interface SignedTransaction {
  signature: string;
  serialized: Uint8Array;
}

export interface TransactionInstruction {
  programId: string;
  keys: { pubkey: string; isSigner: boolean; isWritable: boolean }[];
  data: Uint8Array;
}

export class MockWalletAdapter implements WalletAdapter {
  connected = false;
  publicKey: string | null = null;

  async connect(): Promise<void> {
    this.connected = true;
    this.publicKey = 'Mock11111111111111111111111111111111111111111';
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.publicKey = null;
  }

  async signTransaction(_tx: UnsignedTransaction): Promise<SignedTransaction> {
    await delay(800);
    return {
      signature: generateMockSignature(),
      serialized: new Uint8Array(0),
    };
  }

  async signAllTransactions(txs: UnsignedTransaction[]): Promise<SignedTransaction[]> {
    const results: SignedTransaction[] = [];
    for (const tx of txs) {
      results.push(await this.signTransaction(tx));
    }
    return results;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateMockSignature(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let sig = '';
  for (let i = 0; i < 88; i++) {
    sig += chars[Math.floor(Math.random() * chars.length)];
  }
  return sig;
}

export function createWalletAdapter(): WalletAdapter {
  return new MockWalletAdapter();
}
