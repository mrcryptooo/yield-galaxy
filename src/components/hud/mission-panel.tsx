'use client';

import { useEffect, useState } from 'react';
import { useJourneyStore } from '@/stores/journey-store';
import type { PlanetInfo } from '@/components/galaxy/planet-data';
import { formatApy } from '@/lib/format';

// Cinematic Mission Panel (Task 3) — lives ONLY in the bottom shell panel,
// never floating inside the galaxy. Space-mission-console styling: animated
// checkmarks for completed steps, a glowing current step, locked future
// steps, and a reward badge that lights up on completion. Fully replaces the
// old journey-hud.tsx timeline.
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
  const planetInfo = planetData[current.celestialKey];
  const bestProtocol = planetInfo?.protocols[0];

  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '28px' }}>
      {/* Mission title */}
      <div style={{ minWidth: '150px' }}>
        <div style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em',
          color: 'rgba(246,160,77,0.5)', marginBottom: '4px',
        }}>
          MISSION
        </div>
        <div style={{
          fontSize: 'var(--fs-title)', fontWeight: 600, letterSpacing: '0.02em',
          color: 'rgba(246,160,77,0.95)',
          textShadow: '0 0 20px rgba(246,160,77,0.25)',
        }}>
          {activeRoute.template.name}
        </div>
      </div>

      <div style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(246,160,77,0.12)' }} />

      {/* Objectives */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, overflowX: 'auto' }}>
        {activeRoute.nodes.map((node, i) => {
          const isCompleted = i < activeRoute.currentStep || completed;
          const isCurrent = i === activeRoute.currentStep && !completed;
          const isLocked = i > activeRoute.currentStep && !completed;
          return (
            <div key={node.id} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '84px' }}>
                <div style={{
                  width: isCurrent ? '28px' : '22px',
                  height: isCurrent ? '28px' : '22px',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isCompleted ? 'rgba(246,160,77,0.22)' : isCurrent ? 'rgba(246,160,77,0.16)' : 'rgba(245,240,235,0.04)',
                  border: isCurrent ? '2px solid rgba(246,160,77,0.9)' : isCompleted ? '1px solid rgba(246,160,77,0.4)' : '1px solid rgba(245,240,235,0.1)',
                  boxShadow: isCurrent ? '0 0 18px rgba(246,160,77,0.55), 0 0 32px rgba(246,160,77,0.2)' : isCompleted ? '0 0 8px rgba(246,160,77,0.2)' : 'none',
                  transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
                  animation: isCompleted ? 'fadeIn var(--dur-slow) var(--ease-premium) both' : undefined,
                }}>
                  {isCompleted ? (
                    <span style={{ fontSize: '13px', color: 'rgba(246,160,77,0.95)', fontWeight: 700 }}>✓</span>
                  ) : isCurrent ? (
                    <span style={{ fontSize: '12px', color: 'rgba(246,160,77,0.95)' }}>►</span>
                  ) : (
                    <span style={{ fontSize: '10px', color: 'rgba(245,240,235,0.25)' }}>○</span>
                  )}
                </div>
                <span style={{
                  marginTop: '8px', textAlign: 'center', whiteSpace: 'nowrap',
                  fontSize: isCurrent ? '13px' : '11px',
                  fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '0.03em',
                  color: isCurrent ? 'rgba(246,160,77,0.95)' : isCompleted ? 'rgba(245,240,235,0.6)' : 'rgba(245,240,235,0.22)',
                  fontWeight: isCurrent ? 700 : 500,
                  transition: 'all 0.6s ease',
                }}>
                  {node.label}
                </span>
                {isCurrent && bestProtocol && (
                  <span style={{ fontSize: '10px', color: 'rgba(246,160,77,0.5)', marginTop: '1px' }}>
                    {formatApy(bestProtocol.apy)} · {bestProtocol.risk}
                  </span>
                )}
                {isLocked && (
                  <span style={{ fontSize: '9px', color: 'rgba(245,240,235,0.15)', marginTop: '1px' }}>LOCKED</span>
                )}
              </div>
              {i < activeRoute.nodes.length - 1 && (
                <div style={{
                  width: '24px', height: '2px', marginTop: '-14px',
                  background: isCompleted ? 'rgba(246,160,77,0.4)' : 'rgba(245,240,235,0.08)',
                  transition: 'background 0.8s ease',
                }} />
              )}
            </div>
          );
        })}
      </div>

      <div style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(246,160,77,0.12)' }} />

      {/* Reward + controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', minWidth: '140px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 12px', borderRadius: '999px',
          background: badgeLit ? 'rgba(246,160,77,0.16)' : 'rgba(245,240,235,0.04)',
          border: badgeLit ? '1px solid rgba(246,160,77,0.5)' : '1px solid rgba(245,240,235,0.1)',
          boxShadow: badgeLit ? '0 0 16px rgba(246,160,77,0.4)' : 'none',
          transition: 'all 0.6s ease',
        }}>
          <span style={{ fontSize: '13px' }}>{badgeLit ? '🏅' : '○'}</span>
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
            color: badgeLit ? 'rgba(246,160,77,0.95)' : 'rgba(245,240,235,0.3)',
          }}>
            EXPLORER BADGE
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
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
    </div>
  );
}
