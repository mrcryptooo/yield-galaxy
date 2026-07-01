'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useJourneyStore } from '@/stores/journey-store';
import { useOptimizerStore } from '@/stores/optimizer-store';
import { useWalletStore } from '@/stores/wallet-store';
import type { PlanetInfo } from '@/components/galaxy/planet-data';
import type { Opportunity } from '@/lib/types';
import type { RiskPreference } from '@/lib/optimizer/constraints';
import type { RouteTemplate } from '@/lib/route-engine';
import { CAPTAIN_JOURNEY_LINES } from '@/lib/route-templates';
import { getStepMeta, getNarrativeLabel } from '@/lib/mission-narration';
import { formatApy, timeAgo } from '@/lib/format';
import { optimize } from '@/lib/optimizer/optimizer';
import { buildGraph } from '@/lib/optimizer/opportunity-graph';
import { optimizedRouteToTemplate, generateCaptainLines } from '@/lib/dynamic-route-builder';

const DISCOVERY_AMOUNT = 1000;
const BADGE_LIGHT_MS = 400;
const SCAN_START_MS = 2400;
const NEXT_LAUNCH_MS = 6200;
const IDLE_RESCAN_MS = 7000;

// Finds the next best route the moment a mission completes, so Mission
// Control never goes idle (Objective 2 — Continuous Discovery). Reuses the
// exact same optimizer + dynamic-route-builder pipeline the Route Selector
// uses to launch a route by hand; nothing about route logic changes.
function findNextRoute(
  opportunities: Opportunity[] | undefined,
  riskPreference: RiskPreference,
  excludeIds: string[],
): RouteTemplate | null {
  if (!opportunities || opportunities.length === 0) return null;
  const graph = buildGraph(opportunities);
  const result = optimize(opportunities, 'USDC', DISCOVERY_AMOUNT, riskPreference);
  const pick = result.routes.find((r) => !excludeIds.includes(r.id)) ?? result.routes[0];
  if (!pick) return null;

  const template = optimizedRouteToTemplate(pick, graph);
  template._captainLines = generateCaptainLines(pick, graph);
  template._meta = {
    apy: pick.simulation.cumulativeApy,
    risk: pick.simulation.cumulativeRisk,
    score: pick.score.total,
  };
  return template;
}

// Cinematic Mission Panel — the ONLY mission interface anywhere in the app.
// The galaxy itself draws nothing mission-related (no labels, no trails, no
// floating text) — the camera flies there, this panel tells the story. It
// now behaves as a live command center rather than a static stepper: it
// always shows status/current/next/briefing/time/APY/risk/score/reward,
// it never goes idle (completing a mission rolls straight into scanning for
// the next one), and when nothing is active it shows a live discovery
// dashboard instead of an empty panel.
export function MissionPanel({
  planetData,
  opportunities,
}: {
  planetData: Record<string, PlanetInfo>;
  opportunities?: Opportunity[];
}) {
  const activeRoute = useJourneyStore((s) => s.activeRoute);
  const playing = useJourneyStore((s) => s.playing);
  const completed = useJourneyStore((s) => s.completed);
  const togglePlaying = useJourneyStore((s) => s.togglePlaying);
  const endJourney = useJourneyStore((s) => s.endJourney);
  const startJourney = useJourneyStore((s) => s.startJourney);
  const riskPreference = useOptimizerStore((s) => s.riskPreference);
  const walletConnected = useWalletStore((s) => s.connected);
  const walletTokens = useWalletStore((s) => s.tokens);
  const walletSol = useWalletStore((s) => s.balances.sol);

  const [badgeLit, setBadgeLit] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const recentRouteIds = useRef<string[]>([]);

  // Always read the freshest data/preference at fire-time inside the
  // completion timers below, without re-triggering the effect (and its
  // timers) every time react-query refreshes `opportunities`.
  const latest = useRef({ opportunities, riskPreference });
  useEffect(() => {
    latest.current = { opportunities, riskPreference };
  }, [opportunities, riskPreference]);

  useEffect(() => {
    if (!completed) { setBadgeLit(false); setDiscovering(false); return; }
    if (activeRoute) {
      recentRouteIds.current = [...recentRouteIds.current, activeRoute.template.id].slice(-3);
    }
    const lightBadge = setTimeout(() => setBadgeLit(true), BADGE_LIGHT_MS);
    const startScan = setTimeout(() => setDiscovering(true), SCAN_START_MS);
    const launchNext = setTimeout(() => {
      const next = findNextRoute(latest.current.opportunities, latest.current.riskPreference, recentRouteIds.current);
      if (next) startJourney(next);
      else endJourney();
    }, NEXT_LAUNCH_MS);
    return () => { clearTimeout(lightBadge); clearTimeout(startScan); clearTimeout(launchNext); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  // Discovery Mode (Objective 3): only ticks while no mission is active, so
  // the panel keeps "scanning" instead of sitting empty between missions.
  const [scanTick, setScanTick] = useState(0);
  const [lastScanAt, setLastScanAt] = useState(() => new Date().toISOString());
  const [, forceClock] = useState(0);

  useEffect(() => {
    if (activeRoute) return;
    const rescan = setInterval(() => {
      setScanTick((t) => t + 1);
      setLastScanAt(new Date().toISOString());
    }, IDLE_RESCAN_MS);
    const clock = setInterval(() => forceClock((t) => t + 1), 1000);
    return () => { clearInterval(rescan); clearInterval(clock); };
  }, [activeRoute]);

  const discovery = useMemo(() => {
    if (activeRoute) return null;
    if (!opportunities || opportunities.length === 0) return null;
    const result = optimize(opportunities, 'USDC', DISCOVERY_AMOUNT, riskPreference);
    const protocolsScanned = new Set(opportunities.map((o) => o.source_id)).size;
    const bestYieldApy = opportunities.reduce((max, o) => Math.max(max, o.total_apy), 0);
    const bestRoute = result.routes[0];
    return {
      protocolsScanned,
      poolsAnalyzed: opportunities.length,
      candidateRoutes: result.totalValid,
      bestYieldApy,
      briefing: bestRoute
        ? `Best opportunity right now: ${bestRoute.name} — ${formatApy(bestRoute.simulation.cumulativeApy)} APY, risk ${bestRoute.simulation.cumulativeRisk}.`
        : `Scanning ${opportunities.length} pools across ${protocolsScanned} protocols for the next opportunity...`,
    };
    // scanTick is a deliberate extra dependency — it forces a fresh "scan"
    // pass (and Last Scan timestamp) on a timer even if the data is unchanged.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoute, opportunities, riskPreference, scanTick]);

  if (!activeRoute) {
    return <DiscoveryDashboard discovery={discovery} lastScanAt={lastScanAt} />;
  }

  const current = activeRoute.nodes[activeRoute.currentStep];
  const next = !completed ? activeRoute.nodes[activeRoute.currentStep + 1] : undefined;
  const total = activeRoute.nodes.length;

  // Route-wide stats: prefer the optimizer's own numbers for this exact
  // route (`_meta`), falling back to a best-protocol-among-nodes estimate
  // for the (now unused) static templates that never carried `_meta`.
  const routeBest = activeRoute.nodes.reduce<{ apy: number; risk: string } | null>((best, node) => {
    const info = planetData[node.celestialKey];
    const proto = info?.protocols[0];
    if (!proto) return best;
    return !best || proto.apy > best.apy ? { apy: proto.apy, risk: proto.risk } : best;
  }, null);
  const meta = activeRoute.template._meta;
  const routeApy = meta?.apy ?? routeBest?.apy;
  const routeRisk = meta?.risk ?? routeBest?.risk;
  const routeScore = meta?.score;
  const expectedReward = routeApy != null ? (DISCOVERY_AMOUNT * routeApy) / 100 : null;

  const dynamicLines = activeRoute.template._captainLines;
  const staticLines = CAPTAIN_JOURNEY_LINES[activeRoute.template.id];
  const currentLine = dynamicLines?.[current.action] ?? staticLines?.[current.action];
  const stepMeta = getStepMeta(activeRoute.template.id, current.action);
  const currentHeadline = getNarrativeLabel(current.action, current.celestialKey, activeRoute.currentStep, total);
  const nextHeadline = next ? getNarrativeLabel(next.action, next.celestialKey, activeRoute.currentStep + 1, total) : null;

  const status = discovering ? 'SCANNING' : completed ? 'MISSION COMPLETE' : 'IN PROGRESS';

  // Real wallet balance for the asset this step is about — only shown for
  // the "acquiring/holding an asset" family of actions, and only ever real
  // data: no wallet connected or an untracked token both render an honest
  // fallback line instead of a fabricated number.
  const ASSET_STEP_ACTIONS = new Set(['acquire', 'swap', 'convert', 'stake']);
  let availableLine: string | null = null;
  if (!completed && !discovering && current.assetSymbol && ASSET_STEP_ACTIONS.has(current.action)) {
    if (!walletConnected) {
      availableLine = 'Connect a wallet to see your available balance.';
    } else if (current.assetSymbol === 'SOL') {
      availableLine = `${walletSol.toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL`;
    } else {
      const token = walletTokens.find((t) => t.symbol === current.assetSymbol);
      if (!token || !token.supported) {
        availableLine = `${current.assetSymbol} balance not tracked yet`;
      } else if (token.amount > 0) {
        availableLine = `${token.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${token.symbol}`;
      } else {
        availableLine = `No ${current.assetSymbol} available`;
      }
    }
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Header row: mission status/title (left) + live stats + controls (right) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(246,160,77,0.5)' }}>
            {status}
          </span>
          <span style={{
            fontSize: 'var(--fs-title)', fontWeight: 600, letterSpacing: '0.02em',
            color: 'rgba(246,160,77,0.95)', textShadow: '0 0 20px rgba(246,160,77,0.25)',
          }}>
            {activeRoute.template.name}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {routeApy != null && <MiniStat label="EST. APY" value={formatApy(routeApy)} />}
          {routeRisk && <MiniStat label="RISK" value={routeRisk} />}
          {routeScore != null && <MiniStat label="SCORE" value={String(routeScore)} />}
          {expectedReward != null && <MiniStat label="REWARD" value={`+$${expectedReward.toFixed(2)}/yr`} />}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 12px', borderRadius: '999px',
            background: badgeLit ? 'rgba(246,160,77,0.16)' : 'rgba(245,240,235,0.04)',
            border: badgeLit ? '1px solid rgba(246,160,77,0.5)' : '1px solid rgba(245,240,235,0.1)',
            boxShadow: badgeLit ? '0 0 16px rgba(246,160,77,0.4)' : 'none',
            transition: 'all var(--dur-slow) var(--ease-premium)',
          }}>
            <span style={{ fontSize: '13px' }}>{badgeLit ? '🏅' : '○'}</span>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: badgeLit ? 'rgba(246,160,77,0.95)' : 'rgba(245,240,235,0.3)' }}>
              EXPLORER BADGE
            </span>
          </div>
          {!completed && (
            <button
              onClick={togglePlaying}
              style={{
                background: 'rgba(246,160,77,0.08)', border: '1px solid rgba(246,160,77,0.24)',
                borderRadius: '6px', padding: '5px 12px', cursor: 'pointer',
                fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-geist-mono), monospace',
                letterSpacing: '0.08em', color: 'rgba(245,240,235,0.75)',
              }}
            >
              {playing ? 'PAUSE' : 'PLAY'}
            </button>
          )}
          <button
            onClick={() => { recentRouteIds.current = []; endJourney(); }}
            style={{
              background: 'none', border: '1px solid rgba(245,240,235,0.12)',
              borderRadius: '6px', padding: '5px 10px', cursor: 'pointer',
              fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-geist-mono), monospace',
              letterSpacing: '0.08em', color: 'rgba(245,240,235,0.4)',
            }}
          >
            ESC
          </button>
        </div>
      </div>

      {/* Progress bar — animates as the mission advances, not a static rail */}
      <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(245,240,235,0.06)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '2px',
          width: `${((activeRoute.currentStep + (completed ? 1 : 0.5)) / total) * 100}%`,
          background: 'linear-gradient(90deg, rgba(246,160,77,0.5), rgba(246,160,77,0.95))',
          boxShadow: '0 0 10px rgba(246,160,77,0.5)',
          transition: `width var(--dur-slow) var(--ease-premium)`,
        }} />
      </div>

      {/* Command center: only the CURRENT objective dominates. Completed and
          future objectives shrink to minimal dots on either side — every
          node stays mounted the whole mission, so flipping isCompleted/
          isCurrent animates size/glow smoothly instead of swapping DOM. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
        {/* Completed trail — minimal, shrunk */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {activeRoute.nodes.map((node, i) => {
            const isCompleted = i < activeRoute.currentStep || completed;
            const isCurrent = i === activeRoute.currentStep && !completed;
            if (isCurrent) return null;
            return (
              <div
                key={node.id}
                title={node.label}
                style={{
                  width: isCompleted ? '9px' : '5px',
                  height: isCompleted ? '9px' : '5px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: isCompleted ? 'rgba(246,160,77,0.6)' : 'rgba(245,240,235,0.12)',
                  boxShadow: isCompleted ? '0 0 6px rgba(246,160,77,0.35)' : 'none',
                  transition: 'all var(--dur-slow) var(--ease-premium)',
                }}
              />
            );
          })}
        </div>

        {/* Dominant current objective — the only thing with real visual weight */}
        <div key={current.id} style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: '16px',
          animation: 'fadeIn var(--dur-slow) var(--ease-premium) both',
        }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: completed ? 'rgba(246,160,77,0.28)' : 'rgba(246,160,77,0.14)',
            border: discovering ? '2px solid rgba(246,160,77,0.4)' : '2px solid rgba(246,160,77,0.9)',
            borderTopColor: discovering ? 'rgba(246,160,77,0.95)' : undefined,
            boxShadow: '0 0 24px rgba(246,160,77,0.6), 0 0 44px rgba(246,160,77,0.25)',
            animation: discovering ? 'missionSpin 1s linear infinite' : undefined,
            transition: 'all var(--dur-slow) var(--ease-premium)',
          }}>
            {!discovering && (
              <span style={{ fontSize: '20px', color: 'rgba(246,160,77,0.95)' }}>{completed ? '✓' : '►'}</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
            <div style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.16em',
              color: 'rgba(246,160,77,0.5)',
            }}>
              {discovering ? 'SCANNING FOR NEXT OPPORTUNITY' : completed ? 'MISSION COMPLETE' : 'CURRENT OBJECTIVE'}
            </div>
            <div style={{
              fontSize: 'var(--fs-title)', fontWeight: 700, letterSpacing: '0.01em',
              color: 'rgba(250,246,242,0.95)', textShadow: '0 0 20px rgba(246,160,77,0.2)',
            }}>
              {discovering ? 'Scanning the ecosystem...' : completed ? 'Nice work, Explorer.' : currentHeadline}
            </div>
            {discovering ? (
              <div style={{ fontSize: 'var(--fs-caption)', lineHeight: '1.4', color: 'rgba(245,240,235,0.7)' }}>
                <span style={{ color: 'rgba(246,160,77,0.6)', fontWeight: 600 }}>Captain: </span>
                Excellent work. Scanning the ecosystem for another opportunity...
              </div>
            ) : completed ? (
              <div style={{ fontSize: 'var(--fs-caption)', color: 'rgba(245,240,235,0.6)' }}>
                Excellent work. Your route has been completed successfully.
              </div>
            ) : (
              <>
                {currentLine && (
                  <div style={{ fontSize: 'var(--fs-caption)', lineHeight: '1.4', color: 'rgba(245,240,235,0.7)' }}>
                    <span style={{ color: 'rgba(246,160,77,0.6)', fontWeight: 600 }}>Captain: </span>
                    {currentLine}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(245,240,235,0.4)' }}>
                    <span style={{ color: 'rgba(246,160,77,0.5)', fontWeight: 600 }}>Estimated: </span>{stepMeta.estimate}
                  </span>
                  <span style={{ fontSize: '10px', color: 'rgba(245,240,235,0.4)' }}>
                    <span style={{ color: 'rgba(246,160,77,0.5)', fontWeight: 600 }}>Reason: </span>{stepMeta.reason}
                  </span>
                </div>
                {availableLine && (
                  <div style={{ fontSize: '10px', color: 'rgba(245,240,235,0.4)' }}>
                    <span style={{ color: 'rgba(246,160,77,0.5)', fontWeight: 600 }}>Available: </span>{availableLine}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Next objective preview — compact, stays out of the current step's way */}
        {nextHeadline && !completed && !discovering && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '2px',
            padding: '6px 14px', borderRadius: '10px', flexShrink: 0,
            background: 'rgba(245,240,235,0.03)', border: '1px solid rgba(245,240,235,0.07)',
            transition: 'all var(--dur-slow) var(--ease-premium)',
          }}>
            <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(245,240,235,0.3)' }}>
              NEXT OBJECTIVE
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(245,240,235,0.55)' }}>
              {nextHeadline}
            </span>
          </div>
        )}

        {/* Upcoming trail — minimal, stays out of the way */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {activeRoute.nodes.map((node, i) => {
            const isLocked = i > activeRoute.currentStep && !completed;
            if (!isLocked) return null;
            return (
              <div
                key={node.id}
                title={node.label}
                style={{
                  width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(245,240,235,0.1)',
                  transition: 'all var(--dur-slow) var(--ease-premium)',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface DiscoveryData {
  protocolsScanned: number;
  poolsAnalyzed: number;
  candidateRoutes: number;
  bestYieldApy: number;
  briefing: string;
}

// Discovery Mode (Objective 3): what Mission Control shows when no mission
// is active. Never an empty panel — always a live-feeling scan readout.
function DiscoveryDashboard({ discovery, lastScanAt }: { discovery: DiscoveryData | null; lastScanAt: string }) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'rgba(246,160,77,0.8)',
            boxShadow: '0 0 10px rgba(246,160,77,0.6)',
            animation: 'missionPulse 1.6s ease-in-out infinite',
          }} />
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(246,160,77,0.5)' }}>
            STATUS
          </span>
          <span style={{
            fontSize: 'var(--fs-title)', fontWeight: 600, letterSpacing: '0.02em',
            color: 'rgba(246,160,77,0.95)', textShadow: '0 0 20px rgba(246,160,77,0.25)',
          }}>
            SCANNING
          </span>
        </div>
        <span style={{ fontSize: '10px', color: 'rgba(245,240,235,0.35)', fontFamily: 'var(--font-geist-mono), monospace' }}>
          LAST SCAN — {timeAgo(lastScanAt)}
        </span>
      </div>

      <div style={{ fontSize: 'var(--fs-caption)', lineHeight: '1.4', color: 'rgba(245,240,235,0.7)' }}>
        <span style={{ color: 'rgba(246,160,77,0.6)', fontWeight: 600 }}>Captain: </span>
        {discovery ? discovery.briefing : 'Booting scanners — waiting on live data before I can recommend a route.'}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flex: 1 }}>
        <MiniStat align="left" label="PROTOCOLS SCANNED" value={discovery ? String(discovery.protocolsScanned) : '—'} />
        <MiniStat align="left" label="POOLS ANALYZED" value={discovery ? String(discovery.poolsAnalyzed) : '—'} />
        <MiniStat align="left" label="CANDIDATE ROUTES" value={discovery ? String(discovery.candidateRoutes) : '—'} />
        <MiniStat align="left" label="BEST YIELD" value={discovery ? formatApy(discovery.bestYieldApy) : '—'} />
      </div>
    </div>
  );
}

function MiniStat({ label, value, align = 'right' }: { label: string; value: string; align?: 'left' | 'right' }) {
  return (
    <div style={{ textAlign: align }}>
      <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(246,160,77,0.5)' }}>{label}</div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(245,240,235,0.85)', fontFamily: 'var(--font-geist-mono), monospace' }}>{value}</div>
    </div>
  );
}
