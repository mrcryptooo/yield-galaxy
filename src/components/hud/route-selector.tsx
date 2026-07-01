'use client';

import { useCallback } from 'react';
import { useJourneyStore } from '@/stores/journey-store';
import { useOptimizerStore } from '@/stores/optimizer-store';
import { useCaptainStore } from '@/stores/captain-store';
import { optimize } from '@/lib/optimizer/optimizer';
import { buildGraph } from '@/lib/optimizer/opportunity-graph';
import { optimizedRouteToTemplate, generateCaptainLines } from '@/lib/dynamic-route-builder';
import { buildBriefing } from '@/lib/captain/summary';
import { formatApy } from '@/lib/format';
import type { Opportunity } from '@/lib/types';
import type { OptimizedRoute } from '@/lib/optimizer/optimizer';

const RISK_LABELS: Record<string, string> = {
  conservative: 'SAFE',
  moderate: 'BALANCED',
  aggressive: 'MAX YIELD',
};

export function RouteSelector({ opportunities }: { opportunities?: Opportunity[] }) {
  const activeRoute = useJourneyStore((s) => s.activeRoute);
  const startJourney = useJourneyStore((s) => s.startJourney);

  const result = useOptimizerStore((s) => s.result);
  const graph = useOptimizerStore((s) => s.graph);
  const riskPreference = useOptimizerStore((s) => s.riskPreference);
  const setRiskPreference = useOptimizerStore((s) => s.setRiskPreference);
  const setResult = useOptimizerStore((s) => s.setResult);

  const setBriefing = useCaptainStore((s) => s.setBriefing);

  const runOptimizer = useCallback(() => {
    if (!opportunities || opportunities.length === 0) return;
    const g = buildGraph(opportunities);
    const res = optimize(opportunities, 'USDC', 1000, riskPreference);
    setResult(res, g);
    const brief = buildBriefing(opportunities, res);
    setBriefing(brief);
  }, [opportunities, riskPreference, setResult, setBriefing]);

  const launchRoute = useCallback((route: OptimizedRoute) => {
    if (!graph) return;
    const template = optimizedRouteToTemplate(route, graph);
    const captainLines = generateCaptainLines(route, graph);
    // Inject dynamic captain lines into the route template for the journey
    template._captainLines = captainLines;
    startJourney(template);
  }, [graph, startJourney]);

  if (activeRoute) return null;

  // Lives inside <RightRail> (safe layout system) — no longer self-positioned.
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '8px',
      pointerEvents: 'none',
      width: '100%',
      maxHeight: '40vh',
      overflowY: 'auto',
      borderTop: '1px solid rgba(246,160,77,0.1)',
      paddingTop: '14px',
    }}>
      <span className="hud-label" style={{ marginBottom: '2px' }}>
        Routes
      </span>

      {/* Risk preference toggle */}
      <div style={{
        display: 'flex', gap: '6px', pointerEvents: 'auto', marginBottom: '4px',
      }}>
        {(['conservative', 'moderate', 'aggressive'] as const).map((pref) => (
          <button
            key={pref}
            onClick={() => { setRiskPreference(pref); }}
            style={{
              background: riskPreference === pref ? 'rgba(246,160,77,0.14)' : 'none',
              border: riskPreference === pref ? '1px solid rgba(246,160,77,0.35)' : '1px solid rgba(245,240,235,0.1)',
              borderRadius: '6px',
              padding: '4px 9px',
              fontSize: '10px', fontWeight: 600,
              fontFamily: 'var(--font-geist-mono), monospace',
              letterSpacing: '0.08em',
              color: riskPreference === pref ? 'rgba(246,160,77,0.9)' : 'rgba(245,240,235,0.4)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {RISK_LABELS[pref]}
          </button>
        ))}
      </div>

      {/* Optimize button */}
      <button
        onClick={runOptimizer}
        style={{
          background: 'rgba(246,160,77,0.1)',
          border: '1px solid rgba(246,160,77,0.28)',
          borderRadius: '8px',
          padding: '7px 14px',
          fontSize: 'var(--fs-caption)', fontWeight: 600,
          fontFamily: 'var(--font-geist-mono), monospace',
          letterSpacing: '0.08em',
          color: 'rgba(246,160,77,0.9)',
          cursor: 'pointer',
          pointerEvents: 'auto',
          marginBottom: '4px',
          transition: 'background 0.2s ease',
        }}
      >
        {result ? 'RE-OPTIMIZE' : 'FIND ROUTES'}
      </button>

      {/* Results */}
      {result && (
        <>
          <span style={{
            fontSize: '10px', fontWeight: 500,
            fontFamily: 'var(--font-geist-mono), monospace',
            letterSpacing: '0.08em',
            color: 'rgba(245,240,235,0.35)',
            marginBottom: '2px',
          }}>
            {result.totalValid}/{result.totalCandidates} VALID
          </span>

          {result.routes.slice(0, 5).map((route) => (
            <button
              key={route.id}
              onClick={() => launchRoute(route)}
              style={{
                background: 'none',
                border: 'none',
                borderTop: '1px solid rgba(246,160,77,0.08)',
                padding: '6px 0',
                width: '100%',
                textAlign: 'right',
                cursor: 'pointer',
                pointerEvents: 'auto',
              }}
            >
              <div style={{
                fontSize: 'var(--fs-caption)',
                fontWeight: 500,
                letterSpacing: '0.02em',
                color: 'rgba(245,240,235,0.75)',
              }}>
                {route.name}
              </div>
              <div style={{
                fontSize: '10px',
                fontWeight: 500,
                fontFamily: 'var(--font-geist-mono), monospace',
                letterSpacing: '0.05em',
                color: 'rgba(246,160,77,0.5)',
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end',
                marginTop: '2px',
              }}>
                <span>{formatApy(route.simulation.cumulativeApy)}</span>
                <span>RISK:{route.simulation.cumulativeRisk}</span>
                <span>SC:{route.score.total}</span>
              </div>
            </button>
          ))}
        </>
      )}
    </div>
  );
}
