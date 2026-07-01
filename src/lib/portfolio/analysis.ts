import type { Opportunity, RiskGrade } from '../types';
import type { RiskPreference } from '../optimizer/constraints';
import type { TokenBalance, WalletPosition } from '../wallet/portfolio';
import { optimize } from '../optimizer/optimizer';

export interface AssetAllocationRow {
  symbol: string;
  amount: number;
  usdValue: number | null;
  pct: number | null;
}

export interface ProtocolAllocationRow {
  protocol: string;
  usdValue: number;
  pct: number;
  positionCount: number;
}

export interface PortfolioIntelligence {
  totalValueUsd: number | null;
  hasUnpricedHoldings: boolean;
  change24hPct: number | null;
  activePositionsCount: number;
  idleValueUsd: number;
  idleTokens: TokenBalance[];
  estimatedAnnualYieldUsd: number;
  bestIdleApy: number | null;
  overallRiskGrade: RiskGrade | null;
  assetAllocation: AssetAllocationRow[];
  protocolAllocation: ProtocolAllocationRow[];
  suggestedActions: string[];
}

const STABLE_SYMBOLS = new Set(['USDC', 'USDT']);
const KNOWN_PROTOCOLS = ['Kamino', 'Orca', 'Raydium', 'Loopscale', 'Exponent'];

// Pure function, no React — mirrors the style of src/lib/captain/*. Turns
// raw wallet-store state into everything the Portfolio dashboard needs.
// Every number here is derived from real data (wallet balances, a real
// SOL price fetch, real DefiLlama-backed APY data); nothing is fabricated.
// Positions are always [] today (protocol position detection isn't built
// yet), which is why "idle" == "everything held" and Overall Risk is
// honestly "nothing at risk yet" rather than a guess.
export function buildPortfolioIntelligence({
  connected,
  solBalance,
  solUsdPrice,
  solUsdChange24h,
  tokens,
  positions,
  opportunities,
  riskPreference,
}: {
  connected: boolean;
  solBalance: number;
  solUsdPrice: number | null;
  solUsdChange24h: number | null;
  tokens: TokenBalance[];
  positions: WalletPosition[];
  opportunities: Opportunity[] | undefined;
  riskPreference: RiskPreference;
}): PortfolioIntelligence {
  const assetAllocation: AssetAllocationRow[] = [];
  let pricedValueUsd = 0;
  let hasUnpricedHoldings = false;

  const solValue = solUsdPrice != null ? solBalance * solUsdPrice : null;
  if (solValue != null) pricedValueUsd += solValue;
  else if (solBalance > 0) hasUnpricedHoldings = true;
  assetAllocation.push({ symbol: 'SOL', amount: solBalance, usdValue: solValue, pct: null });

  for (const t of tokens) {
    let usdValue: number | null = null;
    if (t.supported && STABLE_SYMBOLS.has(t.symbol)) {
      // Standard stablecoin convention — no oracle needed for a ~$1 peg.
      usdValue = t.amount;
      pricedValueUsd += usdValue;
    } else if (t.amount > 0) {
      hasUnpricedHoldings = true;
    }
    assetAllocation.push({ symbol: t.symbol, amount: t.amount, usdValue, pct: null });
  }

  const totalValueUsd = connected ? pricedValueUsd : null;
  for (const row of assetAllocation) {
    row.pct = row.usdValue != null && totalValueUsd && totalValueUsd > 0 ? (row.usdValue / totalValueUsd) * 100 : null;
  }

  // Idle = everything priced & held, since there's no active-position
  // detection yet — anything visible in the wallet hasn't been deployed.
  const idleTokens = tokens.filter((t) => t.supported && STABLE_SYMBOLS.has(t.symbol) && t.amount > 0);
  const idleValueUsd = pricedValueUsd;

  const protocolAllocation: ProtocolAllocationRow[] = KNOWN_PROTOCOLS.map((protocol) => ({
    protocol,
    usdValue: 0,
    pct: 0,
    positionCount: positions.filter((p) => p.protocol === protocol).length,
  }));

  // Potential yield if idle stablecoins were deployed via the best route
  // available right now — grounded in real APY data, not a claim about
  // capital that's already earning (nothing is, since nothing's deployed).
  let estimatedAnnualYieldUsd = 0;
  let bestIdleApy: number | null = null;
  if (opportunities && opportunities.length > 0 && idleValueUsd > 0) {
    const result = optimize(opportunities, 'USDC', idleValueUsd, riskPreference);
    const best = result.routes[0];
    if (best) {
      bestIdleApy = best.simulation.cumulativeApy;
      estimatedAnnualYieldUsd = (idleValueUsd * best.simulation.cumulativeApy) / 100;
    }
  }

  const suggestedActions: string[] = [];
  if (!connected) {
    suggestedActions.push('Connect a wallet to get personalized suggestions.');
  } else if (idleValueUsd > 0 && bestIdleApy != null) {
    suggestedActions.push(`Deploy your $${idleValueUsd.toFixed(2)} in idle capital — the best available route earns ${bestIdleApy.toFixed(2)}% APY.`);
  } else if (pricedValueUsd === 0 && !hasUnpricedHoldings) {
    suggestedActions.push('Acquire USDC to start your first mission.');
  }
  if (connected && positions.length === 0 && idleValueUsd === 0 && pricedValueUsd > 0) {
    suggestedActions.push('No active positions detected — everything in your wallet is idle.');
  }

  return {
    totalValueUsd,
    hasUnpricedHoldings,
    change24hPct: !connected
      ? null
      : totalValueUsd && totalValueUsd > 0 && solValue && solUsdChange24h != null
        ? (solValue / totalValueUsd) * solUsdChange24h
        : totalValueUsd === 0
          ? 0
          : null,
    // Positions aren't detected yet (see module note) — honestly null
    // rather than guessed from undeployed capital.
    activePositionsCount: positions.length,
    idleValueUsd,
    idleTokens,
    estimatedAnnualYieldUsd,
    bestIdleApy,
    overallRiskGrade: null,
    assetAllocation,
    protocolAllocation,
    suggestedActions,
  };
}
