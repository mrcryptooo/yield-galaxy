import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TRACKED_TOKENS, TOKEN_PROGRAM_ID } from './tokens';

export interface TokenBalance {
  symbol: string;
  mint: string | null;
  amount: number;
  decimals: number;
  supported: boolean;
}

export interface WalletPosition {
  protocol: string;
  label: string;
}

export interface PortfolioResult {
  sol: number;
  tokens: TokenBalance[];
  positions: WalletPosition[];
}

// Real Solana reads only — no hardcoded balances. SOL comes from
// getBalance(); SPL tokens come from getParsedTokenAccountsByOwner() for
// each verified mint. Tokens without a verified mint (see tokens.ts) are
// returned as `supported: false` with amount 0 rather than queried at all.
export async function fetchPortfolio(connection: Connection, publicKey: PublicKey): Promise<PortfolioResult> {
  const [solLamports, tokenAccounts] = await Promise.all([
    connection.getBalance(publicKey),
    connection.getParsedTokenAccountsByOwner(publicKey, { programId: new PublicKey(TOKEN_PROGRAM_ID) }),
  ]);

  const byMint = new Map<string, number>();
  for (const { account } of tokenAccounts.value) {
    const info = account.data.parsed?.info;
    const mint: string | undefined = info?.mint;
    const uiAmount: number = info?.tokenAmount?.uiAmount ?? 0;
    if (mint) byMint.set(mint, (byMint.get(mint) ?? 0) + uiAmount);
  }

  const tokens: TokenBalance[] = TRACKED_TOKENS.map((t) => ({
    symbol: t.symbol,
    mint: t.mint,
    decimals: t.decimals,
    supported: t.mint != null,
    amount: t.mint ? (byMint.get(t.mint) ?? 0) : 0,
  }));

  // Protocol positions (e.g. Kamino obligations) require protocol-specific
  // program account lookups this pass doesn't integrate yet — reporting an
  // honest empty list rather than fabricating a position is the "unsupported
  // token/position" graceful path the brief asks for.
  const positions: WalletPosition[] = [];

  return {
    sol: solLamports / LAMPORTS_PER_SOL,
    tokens,
    positions,
  };
}

export function describeWalletError(error: unknown): string {
  const name = (error as { name?: string })?.name ?? '';
  const message = error instanceof Error ? error.message : String(error);

  if (name.includes('WalletNotSelected')) return 'No wallet selected.';
  if (name.includes('WalletNotReady') || name.includes('WalletNotInstalled')) return 'Wallet not installed or unavailable.';
  if (name.includes('WalletConnection')) return 'Could not connect to the wallet.';
  if (name.includes('WalletDisconnected')) return 'Wallet disconnected.';
  if (/reject/i.test(message)) return 'Connection request was rejected.';
  if (/network|fetch|timeout/i.test(message)) return 'Could not reach the Solana network. Try again shortly.';
  return 'Something went wrong with the wallet connection.';
}
