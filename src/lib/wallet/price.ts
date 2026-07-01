// Real, public, unauthenticated market data — the only source for SOL's USD
// value anywhere in the app. No fabricated/assumed price: if this fetch
// fails, callers get `null` and must show an honest "price unavailable"
// state rather than guessing.
export interface SolPrice {
  usd: number;
  usd24hChange: number;
}

export async function fetchSolPrice(): Promise<SolPrice | null> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true',
      { signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const usd = json?.solana?.usd;
    const usd24hChange = json?.solana?.usd_24h_change;
    if (typeof usd !== 'number') return null;
    return { usd, usd24hChange: typeof usd24hChange === 'number' ? usd24hChange : 0 };
  } catch {
    return null;
  }
}
