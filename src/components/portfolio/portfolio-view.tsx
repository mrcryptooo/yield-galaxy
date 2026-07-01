'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useViewStore } from '@/stores/view-store';
import { useWalletStore } from '@/stores/wallet-store';
import { useOptimizerStore } from '@/stores/optimizer-store';
import { useJourneyStore } from '@/stores/journey-store';
import type { Opportunity } from '@/lib/types';
import type { OptimizedRoute } from '@/lib/optimizer/optimizer';
import { buildPortfolioIntelligence } from '@/lib/portfolio/analysis';
import { buildOwnedSymbolSet, computeAdaptiveStartStep } from '@/lib/wallet/adaptive-route';
import { optimize } from '@/lib/optimizer/optimizer';
import { buildGraph, type OpportunityGraph } from '@/lib/optimizer/opportunity-graph';
import { optimizedRouteToTemplate, generateCaptainLines } from '@/lib/dynamic-route-builder';
import { formatApy } from '@/lib/format';

const ASSET_COLORS: Record<string, string> = {
  SOL: '#9945FF', USDC: '#2775CA', USDT: '#26A17B',
  USX: '#F6A04D', eUSX: '#B8A8D8', SLX: '#14b8a6', stSLX: '#EAB0BE',
};

const PROTOCOL_LOGOS: Record<string, string> = {
  Kamino: '/assets/stations/kamino-station.webp',
  Loopscale: '/assets/stations/loopscale-station.png',
  Orca: '/assets/stations/orca-station.webp',
  Raydium: '/assets/stations/raydium-station.png',
  Exponent: '/assets/stations/exponent-station.png',
};

function formatUsd(n: number | null): string {
  if (n == null) return '—';
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export function PortfolioView({ opportunities }: { opportunities?: Opportunity[] }) {
  const mode = useViewStore((s) => s.mode);
  const setMode = useViewStore((s) => s.setMode);

  const connected = useWalletStore((s) => s.connected);
  const walletName = useWalletStore((s) => s.walletName);
  const publicKey = useWalletStore((s) => s.publicKey);
  const solBalance = useWalletStore((s) => s.balances.sol);
  const solUsdPrice = useWalletStore((s) => s.solUsdPrice);
  const solUsdChange24h = useWalletStore((s) => s.solUsdChange24h);
  const tokens = useWalletStore((s) => s.tokens);
  const positions = useWalletStore((s) => s.positions);
  const lastRefresh = useWalletStore((s) => s.lastRefresh);
  const loading = useWalletStore((s) => s.loading);

  const riskPreference = useOptimizerStore((s) => s.riskPreference);
  const startJourney = useJourneyStore((s) => s.startJourney);

  const intel = useMemo(
    () => buildPortfolioIntelligence({
      connected, solBalance, solUsdPrice, solUsdChange24h, tokens, positions, opportunities, riskPreference,
    }),
    [connected, solBalance, solUsdPrice, solUsdChange24h, tokens, positions, opportunities, riskPreference]
  );

  const missionOpportunities = useMemo(() => {
    if (!connected || !opportunities || opportunities.length === 0) return null;
    const amount = intel.idleValueUsd > 0 ? intel.idleValueUsd : 1000;
    const graph = buildGraph(opportunities);
    const result = optimize(opportunities, 'USDC', amount, riskPreference);
    return { graph, routes: result.routes.slice(0, 3) };
  }, [connected, opportunities, riskPreference, intel.idleValueUsd]);

  const launchMission = (route: OptimizedRoute, graph: OpportunityGraph) => {
    const template = optimizedRouteToTemplate(route, graph);
    template._captainLines = generateCaptainLines(route, graph);
    template._meta = { apy: route.simulation.cumulativeApy, risk: route.simulation.cumulativeRisk, score: route.score.total };
    const owned = buildOwnedSymbolSet(tokens, solBalance);
    startJourney(template, computeAdaptiveStartStep(template.steps, owned));
    setMode('galaxy');
  };

  if (mode !== 'portfolio') return null;

  return (
    <div className="no-scrollbar" style={{
      position: 'absolute', inset: 0,
      background: 'rgba(8,11,20,0.88)',
      backdropFilter: 'blur(24px)',
      borderRadius: 'var(--panel-radius)',
      overflow: 'auto',
      padding: '32px 32px 40px',
      animation: 'fadeIn var(--dur-base) var(--ease-premium) both',
    }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto 24px' }}>
        <h1 style={{
          fontSize: 'var(--fs-hero)', fontWeight: 600, letterSpacing: '0.02em',
          color: 'rgba(246,160,77,0.9)', textShadow: '0 0 30px rgba(246,160,77,0.15)',
          margin: '0 0 6px',
        }}>
          Your Galaxy
        </h1>
        <p style={{ fontSize: 'var(--fs-body)', fontWeight: 400, letterSpacing: '0.01em', color: 'rgba(245,240,235,0.55)', margin: 0 }}>
          {connected ? 'A live intelligence view of your own position in the Solstice ecosystem.' : 'Connect a wallet to turn the galaxy into your own.'}
        </p>
      </div>

      {!connected ? (
        <div className="glass-card" style={{ maxWidth: '1180px', margin: '0 auto', padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>◈</div>
          <div style={{ fontSize: 'var(--fs-title)', fontWeight: 600, color: 'rgba(250,246,242,0.9)', marginBottom: '6px' }}>
            No wallet connected
          </div>
          <div style={{ fontSize: 'var(--fs-body)', color: 'rgba(245,240,235,0.5)' }}>
            Use CONNECT WALLET in the top bar — Phantom, Backpack, or Solflare — to see your real balances, positions, and personalized missions here.
          </div>
        </div>
      ) : (
        <>
          {/* Top stat strip */}
          <div style={{
            maxWidth: '1180px', margin: '0 auto 18px',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px',
          }}>
            <StatTile label="Total Portfolio Value" value={formatUsd(intel.totalValueUsd)} sub={intel.hasUnpricedHoldings ? 'excludes untracked tokens' : undefined} />
            <StatTile
              label="24h Change"
              value={intel.change24hPct != null ? `${intel.change24hPct >= 0 ? '+' : ''}${intel.change24hPct.toFixed(2)}%` : '—'}
              accent={intel.change24hPct != null && intel.change24hPct >= 0}
            />
            <StatTile label="Active Positions" value={String(intel.activePositionsCount)} />
            <StatTile label="Idle Assets" value={formatUsd(intel.idleValueUsd)} />
            <StatTile label="Est. Annual Yield" value={formatUsd(intel.estimatedAnnualYieldUsd)} sub={intel.bestIdleApy != null ? `at ${formatApy(intel.bestIdleApy)} if deployed` : undefined} />
            <StatTile label="Overall Risk" value={intel.overallRiskGrade ?? '—'} sub={intel.overallRiskGrade == null ? 'no active positions' : undefined} />
            <StatTile label="Wallet Address" value={publicKey ? shortAddress(publicKey) : '—'} mono />
            <StatTile label="Connected Wallet" value={walletName ?? '—'} />
          </div>

          {/* Cards */}
          <div style={{
            maxWidth: '1180px', margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '14px',
          }}>
            {/* Wallet Summary */}
            <Card title="Wallet Summary">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Row label="Wallet" value={walletName ?? '—'} />
                <Row label="Address" value={publicKey ?? '—'} mono small />
                <Row label="SOL Balance" value={`${solBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL`} />
                <Row label="SOL Price" value={solUsdPrice != null ? formatUsd(solUsdPrice) : 'unavailable'} />
                <Row label="Last Refreshed" value={lastRefresh ? new Date(lastRefresh).toLocaleTimeString() : '—'} />
                <Row label="Status" value={loading ? 'Refreshing…' : 'Live'} />
              </div>
            </Card>

            {/* Asset Allocation */}
            <Card title="Asset Allocation">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {intel.assetAllocation.map((row) => (
                  <div key={row.symbol} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                      background: ASSET_COLORS[row.symbol] ?? 'rgba(245,240,235,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 700, color: '#0A0E1A',
                    }}>
                      {row.symbol[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--fs-caption)', fontWeight: 600, color: 'rgba(245,240,235,0.85)' }}>{row.symbol}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(245,240,235,0.4)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                        {row.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 'var(--fs-caption)', fontWeight: 600, color: 'rgba(245,240,235,0.85)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                        {row.usdValue != null ? formatUsd(row.usdValue) : 'untracked'}
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(246,160,77,0.5)' }}>
                        {row.pct != null ? `${row.pct.toFixed(1)}%` : '—'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Protocol Allocation */}
            <Card title="Protocol Allocation" subtitle="Position tracking per protocol isn't available yet — shown as a placeholder until it is.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {intel.protocolAllocation.map((row) => (
                  <div key={row.protocol} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, overflow: 'hidden',
                      background: 'rgba(246,160,77,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {PROTOCOL_LOGOS[row.protocol] ? (
                        <Image src={PROTOCOL_LOGOS[row.protocol]} alt={row.protocol} width={22} height={22} style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(246,160,77,0.7)' }}>{row.protocol[0]}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, fontSize: 'var(--fs-caption)', fontWeight: 600, color: 'rgba(245,240,235,0.8)' }}>{row.protocol}</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 'var(--fs-caption)', fontWeight: 600, color: 'rgba(245,240,235,0.6)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                        {formatUsd(row.usdValue)} · {row.pct.toFixed(0)}%
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(245,240,235,0.35)' }}>
                        {row.positionCount} position{row.positionCount === 1 ? '' : 's'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Active Positions */}
            <Card title="Active Positions">
              {positions.length === 0 ? (
                <EmptyState text="No active positions yet. Once you deposit into a protocol, it shows up here." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {positions.map((p, i) => (
                    <div key={`${p.protocol}-${i}`} style={{
                      padding: '10px', borderRadius: '10px', background: 'rgba(245,240,235,0.03)',
                      border: '1px solid rgba(245,240,235,0.06)',
                    }}>
                      <div style={{ fontSize: 'var(--fs-caption)', fontWeight: 600, color: 'rgba(245,240,235,0.85)' }}>{p.protocol}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(245,240,235,0.5)', marginTop: '2px' }}>{p.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Idle Assets */}
            <Card title="Idle Assets">
              {intel.idleTokens.length === 0 ? (
                <EmptyState text="Nothing idle right now — either your wallet is empty, or everything is already deployed." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {intel.idleTokens.map((t) => (
                    <Row key={t.symbol} label={t.symbol} value={`${t.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${formatUsd(t.amount)})`} />
                  ))}
                </div>
              )}
            </Card>

            {/* Suggested Actions */}
            <Card title="Suggested Actions" subtitle="Recommendations only — nothing here executes a transaction.">
              {intel.suggestedActions.length === 0 ? (
                <EmptyState text="Nothing to suggest right now — your portfolio looks balanced." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {intel.suggestedActions.map((action, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '8px', alignItems: 'flex-start',
                      fontSize: 'var(--fs-caption)', lineHeight: '1.4', color: 'rgba(245,240,235,0.75)',
                    }}>
                      <span style={{ color: 'rgba(246,160,77,0.6)' }}>→</span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Mission Opportunities */}
            <Card title="Mission Opportunities" subtitle="Real routes from the optimizer, sized to your idle capital.">
              {!missionOpportunities || missionOpportunities.routes.length === 0 ? (
                <EmptyState text="Run FIND ROUTES in the right panel once yield data is loaded." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {missionOpportunities.routes.map((route) => (
                    <div key={route.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                      padding: '10px', borderRadius: '10px', background: 'rgba(245,240,235,0.03)',
                      border: '1px solid rgba(245,240,235,0.06)',
                    }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 'var(--fs-caption)', fontWeight: 600, color: 'rgba(245,240,235,0.85)' }}>{route.name}</div>
                        <div style={{ fontSize: '10px', color: 'rgba(246,160,77,0.55)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                          {formatApy(route.simulation.cumulativeApy)} · RISK:{route.simulation.cumulativeRisk} · SC:{route.score.total}
                        </div>
                      </div>
                      <button
                        onClick={() => launchMission(route, missionOpportunities.graph)}
                        style={{
                          flexShrink: 0, background: 'rgba(246,160,77,0.1)', border: '1px solid rgba(246,160,77,0.28)',
                          borderRadius: '8px', padding: '7px 12px', cursor: 'pointer',
                          fontSize: '10px', fontWeight: 600, fontFamily: 'var(--font-geist-mono), monospace',
                          letterSpacing: '0.06em', color: 'rgba(246,160,77,0.9)',
                        }}
                      >
                        LAUNCH
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function StatTile({ label, value, sub, accent, mono }: { label: string; value: string; sub?: string; accent?: boolean; mono?: boolean }) {
  return (
    <div className="glass-card" style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(246,160,77,0.5)', textTransform: 'uppercase', marginBottom: '6px' }}>
        {label}
      </div>
      <div style={{
        fontSize: 'var(--fs-value)', fontWeight: 600,
        color: accent ? 'rgba(120,220,150,0.9)' : 'rgba(250,246,242,0.92)',
        fontFamily: mono ? 'var(--font-geist-mono), monospace' : undefined,
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '10px', color: 'rgba(245,240,235,0.4)', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="glass-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <div style={{ fontSize: 'var(--fs-body)', fontWeight: 600, letterSpacing: '0.02em', color: 'rgba(246,160,77,0.85)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: '10px', color: 'rgba(245,240,235,0.4)', marginTop: '3px' }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, mono, small }: { label: string; value: string; mono?: boolean; small?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
      <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(245,240,235,0.4)', textTransform: 'uppercase' }}>{label}</span>
      <span style={{
        fontSize: small ? '10px' : 'var(--fs-caption)', fontWeight: 600, color: 'rgba(245,240,235,0.85)',
        fontFamily: mono ? 'var(--font-geist-mono), monospace' : undefined,
        textAlign: 'right', wordBreak: 'break-all',
      }}>
        {value}
      </span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{
      padding: '20px', textAlign: 'center', borderRadius: '10px',
      background: 'rgba(245,240,235,0.02)', border: '1px dashed rgba(245,240,235,0.1)',
      fontSize: 'var(--fs-caption)', color: 'rgba(245,240,235,0.4)', lineHeight: '1.5',
    }}>
      {text}
    </div>
  );
}
