// Known SPL token mints for the Portfolio Layer. Only mints we can verify
// with high confidence against a canonical, well-published source are
// included here — this app talks to real wallets on real mainnet, so a
// wrong address is a real-money mistake, not a cosmetic bug.
//
// USX / eUSX / SLX / stSLX are real Solstice Finance tokens (the DeFiLlama
// pool data this app already ingests references them), but their mint
// addresses could not be verified against an authoritative source from this
// environment (docs.solstice.finance blocked automated fetching). Rather
// than guess — a wrong stablecoin-shaped address is exactly the kind of
// mistake that must never ship — they're left unregistered here and the
// Portfolio service reports them as `supported: false` until a verified
// address is added from an authoritative source (Solstice's own SDK/API,
// not a search-engine result).
export interface TrackedToken {
  symbol: string;
  mint: string | null;
  decimals: number;
}

export const TRACKED_TOKENS: TrackedToken[] = [
  { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
  { symbol: 'USDT', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 },
  { symbol: 'USX', mint: null, decimals: 6 },
  { symbol: 'eUSX', mint: null, decimals: 6 },
  { symbol: 'SLX', mint: null, decimals: 6 },
  { symbol: 'stSLX', mint: null, decimals: 6 },
];

export const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
