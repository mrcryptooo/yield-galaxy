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

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      right: '16px',
      transform: 'translateY(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '6px',
      zIndex: 10,
      pointerEvents: 'none',
    }}>
      <span className="hud-label" style={{ marginBottom: '4px', marginRight: '2px' }}>
        ROUTES
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
              background: 'none',
              border: riskPreference === pref ? '1px solid rgba(246,160,77,0.2)' : '1px solid rgba(245,240,235,0.05)',
              borderRadius: '3px',
              padding: '2px 6px',
              fontSize: '7px',
              fontFamily: 'var(--font-geist-mono), monospace',
              letterSpacing: '0.1em',
              color: riskPreference === pref ? 'rgba(246,160,77,0.5)' : 'rgba(245,240,235,0.15)',
              cursor: 'pointer',
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
          background: 'none',
          border: '1px solid rgba(246,160,77,0.12)',
          borderRadius: '4px',
          padding: '4px 10px',
          fontSize: '8px',
          fontFamily: 'var(--font-geist-mono), monospace',
          letterSpacing: '0.1em',
          color: 'rgba(246,160,77,0.4)',
          cursor: 'pointer',
          pointerEvents: 'auto',
          marginBottom: '6px',
        }}
      >
        {result ? 'RE-OPTIMIZE' : 'FIND ROUTES'}
      </button>

      {/* Results */}
      {result && (
        <>
          <span style={{
            fontSize: '7px',
            fontFamily: 'var(--font-geist-mono), monospace',
            letterSpacing: '0.1em',
            color: 'rgba(245,240,235,0.12)',
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
                padding: '3px 0',
                textAlign: 'right',
                cursor: 'pointer',
                pointerEvents: 'auto',
              }}
            >
              <div style={{
                fontSize: '9px',
                fontWeight: 400,
                letterSpacing: '0.03em',
                color: 'rgba(245,240,235,0.35)',
                textShadow: '0 0 8px rgba(0,0,0,0.5)',
              }}>
                {route.name}
              </div>
              <div style={{
                fontSize: '7px',
                fontFamily: 'var(--font-geist-mono), monospace',
                letterSpacing: '0.08em',
                color: 'rgba(246,160,77,0.2)',
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end',
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
