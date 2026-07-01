'use client';

import { useEffect, useState } from 'react';
import { useJourneyStore } from '@/stores/journey-store';
import type { PlanetInfo } from '@/components/galaxy/planet-data';
import { CAPTAIN_JOURNEY_LINES } from '@/lib/route-templates';
import { getStepMeta } from '@/lib/mission-narration';
import { formatApy } from '@/lib/format';

// Cinematic Mission Panel — the ONLY mission interface anywhere in the app.
// The galaxy itself draws nothing mission-related (no labels, no trails, no
// floating text) — the camera flies there, this panel tells the story: what
// the step is, what Captain says about it, how long it takes, and why it
// matters. Completed steps animate, the current step glows, future steps
// stay locked.
export function MissionPanel({ planetData }: { planetData: Record<string, PlanetInfo> }) {
  const activeRoute = useJourneyStore((s) => s.activeRoute);
  const playing = useJourneyStore((s) => s.playing);
  const completed = useJourneyStore((s) => s.completed);
  const togglePlaying = useJourneyStore((s) => s.togglePlaying);
  const endJourney = useJourneyStore((s) => s.endJourney);
  const [badgeLit, setBadgeLit] = useState(false);

  useEffect(() => {
    if (!completed) { setBadgeLit(false); return; }
    const t = setTimeout(() => setBadgeLit(true), 400);
    const end = setTimeout(() => endJourney(), 6000);
    return () => { clearTimeout(t); clearTimeout(end); };
  }, [completed, endJourney]);

  if (!activeRoute) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', justifyContent: 'center' }}>
        <div style={{
          width: '10px', height: '10px', borderRadius: '50%',
          background: 'rgba(245,240,235,0.15)',
        }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em',
            color: 'rgba(245,240,235,0.3)', marginBottom: '2px',
          }}>
            NO ACTIVE MISSION
          </div>
          <div style={{ fontSize: 'var(--fs-caption)', color: 'rgba(245,240,235,0.45)' }}>
            Find a route in the right panel to begin a mission.
          </div>
        </div>
      </div>
    );
  }

  const current = activeRoute.nodes[activeRoute.currentStep];

  // Route-wide best yield, so the reward strip reflects the whole mission,
  // not just whatever the camera happens to be looking at right now.
  const routeBest = activeRoute.nodes.reduce<{ apy: number; risk: string } | null>((best, node) => {
    const info = planetData[node.celestialKey];
    const proto = info?.protocols[0];
    if (!proto) return best;
    return !best || proto.apy > best.apy ? { apy: proto.apy, risk: proto.risk } : best;
  }, null);

  const dynamicLines = activeRoute.template._captainLines;
  const staticLines = CAPTAIN_JOURNEY_LINES[activeRoute.template.id];
  const currentLine = dynamicLines?.[current.action] ?? staticLines?.[current.action];
  const meta = getStepMeta(activeRoute.template.id, current.action);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Header row: mission title (left) + reward strip (right) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(246,160,77,0.5)' }}>
            MISSION
          </span>
          <span style={{
            fontSize: 'var(--fs-title)', fontWeight: 600, letterSpacing: '0.02em',
            color: 'rgba(246,160,77,0.95)', textShadow: '0 0 20px rgba(246,160,77,0.25)',
          }}>
            {activeRoute.template.name}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {routeBest && (
            <>
              <MiniStat label="EST. APY" value={formatApy(routeBest.apy)} />
              <MiniStat label="RISK" value={routeBest.risk} />
            </>
          )}
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
            onClick={endJourney}
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

      <div style={{ height: '1px', background: 'rgba(246,160,77,0.12)' }} />

      <div style={{ display: 'flex', alignItems: 'stretch', gap: '20px', flex: 1 }}>
        {/* Step tracker */}
        <div style={{ display: 'flex', alignItems: 'flex-start', overflowX: 'auto' }}>
          {activeRoute.nodes.map((node, i) => {
            const isCompleted = i < activeRoute.currentStep || completed;
            const isCurrent = i === activeRoute.currentStep && !completed;
            return (
              <div key={node.id} style={{ display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '78px' }}>
                  <div style={{
                    width: isCurrent ? '26px' : '20px',
                    height: isCurrent ? '26px' : '20px',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isCompleted ? 'rgba(246,160,77,0.22)' : isCurrent ? 'rgba(246,160,77,0.16)' : 'rgba(245,240,235,0.04)',
                    border: isCurrent ? '2px solid rgba(246,160,77,0.9)' : isCompleted ? '1px solid rgba(246,160,77,0.4)' : '1px solid rgba(245,240,235,0.1)',
                    boxShadow: isCurrent ? '0 0 18px rgba(246,160,77,0.55), 0 0 32px rgba(246,160,77,0.2)' : isCompleted ? '0 0 8px rgba(246,160,77,0.2)' : 'none',
                    transition: 'all var(--dur-slow) var(--ease-premium)',
                    animation: isCompleted ? 'fadeIn var(--dur-slow) var(--ease-premium) both' : undefined,
                  }}>
                    {isCompleted ? (
                      <span style={{ fontSize: '12px', color: 'rgba(246,160,77,0.95)', fontWeight: 700 }}>✓</span>
                    ) : isCurrent ? (
                      <span style={{ fontSize: '11px', color: 'rgba(246,160,77,0.95)' }}>►</span>
                    ) : (
                      <span style={{ fontSize: '9px', color: 'rgba(245,240,235,0.25)' }}>○</span>
                    )}
                  </div>
                  <span style={{
                    marginTop: '6px', textAlign: 'center', whiteSpace: 'nowrap',
                    fontSize: isCurrent ? '12px' : '10px',
                    fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '0.03em',
                    color: isCurrent ? 'rgba(246,160,77,0.95)' : isCompleted ? 'rgba(245,240,235,0.6)' : 'rgba(245,240,235,0.22)',
                    fontWeight: isCurrent ? 700 : 500,
                    transition: 'color var(--dur-slow) var(--ease-premium)',
                  }}>
                    {node.label}
                  </span>
                  <span style={{
                    fontSize: '8px', fontWeight: 600, letterSpacing: '0.1em', marginTop: '2px',
                    color: isCurrent ? 'rgba(246,160,77,0.4)' : 'rgba(245,240,235,0.15)',
                  }}>
                    {isCompleted ? 'DONE' : isCurrent ? 'CURRENT' : 'LOCKED'}
                  </span>
                </div>
                {i < activeRoute.nodes.length - 1 && (
                  <div style={{
                    width: '18px', height: '2px', marginTop: '12px',
                    background: isCompleted ? 'rgba(246,160,77,0.4)' : 'rgba(245,240,235,0.08)',
                    transition: 'background var(--dur-slow) var(--ease-premium)',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(246,160,77,0.1)' }} />

        {/* Current-step story: what Captain says, how long, and why it matters */}
        <div key={current.id} style={{
          flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center',
          animation: 'fadeIn var(--dur-slow) var(--ease-premium) both',
        }}>
          {completed ? (
            <div style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'rgba(246,160,77,0.9)' }}>
              Mission complete — nice work, Explorer.
            </div>
          ) : (
            <>
              {currentLine && (
                <div style={{ fontSize: 'var(--fs-caption)', lineHeight: '1.5', color: 'rgba(245,240,235,0.75)' }}>
                  <span style={{ color: 'rgba(246,160,77,0.6)', fontWeight: 600 }}>Captain: </span>
                  {currentLine}
                </div>
              )}
              <div style={{ display: 'flex', gap: '18px' }}>
                <span style={{ fontSize: '11px', color: 'rgba(245,240,235,0.4)' }}>
                  <span style={{ color: 'rgba(246,160,77,0.5)', fontWeight: 600 }}>Estimated: </span>{meta.estimate}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(245,240,235,0.4)' }}>
                <span style={{ color: 'rgba(246,160,77,0.5)', fontWeight: 600 }}>Reason: </span>{meta.reason}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(246,160,77,0.5)' }}>{label}</div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(245,240,235,0.85)', fontFamily: 'var(--font-geist-mono), monospace' }}>{value}</div>
    </div>
  );
}
