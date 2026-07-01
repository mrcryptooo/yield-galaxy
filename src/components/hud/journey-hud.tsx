'use client';

import { useEffect } from 'react';
import { useJourneyStore } from '@/stores/journey-store';
import type { PlanetInfo } from '@/components/galaxy/planet-data';
import { formatApy } from '@/lib/format';

export function JourneyHud({ planetData }: { planetData: Record<string, PlanetInfo> }) {
  const activeRoute = useJourneyStore((s) => s.activeRoute);
  const playing = useJourneyStore((s) => s.playing);
  const completed = useJourneyStore((s) => s.completed);
  const togglePlaying = useJourneyStore((s) => s.togglePlaying);
  const endJourney = useJourneyStore((s) => s.endJourney);

  useEffect(() => {
    if (!completed) return;
    const timeout = setTimeout(() => endJourney(), 6000);
    return () => clearTimeout(timeout);
  }, [completed, endJourney]);

  if (!activeRoute) return null;

  const current = activeRoute.nodes[activeRoute.currentStep];
  const planetInfo = planetData[current.celestialKey];
  const bestProtocol = planetInfo?.protocols[0];

  return (
    <div className="glass-panel-strong" style={{
      position: 'fixed',
      bottom: '32px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 15,
      pointerEvents: 'none',
      animation: 'fadeIn 0.8s ease-out',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      padding: '18px 26px',
    }}>
      {/* Mission header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '2px' }}>
        <span style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em',
          color: 'rgba(246,160,77,0.5)',
          fontFamily: 'var(--font-geist-mono), monospace',
        }}>
          MISSION
        </span>
        <span style={{
          fontSize: 'var(--fs-title)', fontWeight: 600,
          letterSpacing: '0.02em',
          color: 'rgba(246,160,77,0.95)',
          textShadow: '0 0 20px rgba(246,160,77,0.25)',
        }}>
          {activeRoute.template.name}
        </span>
      </div>

      {/* Objectives — completed get an animated checkmark, current is
          highlighted and glowing, future objectives remain visually locked */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0px',
      }}>
        {activeRoute.nodes.map((node, i) => {
          const isCompleted = i < activeRoute.currentStep || completed;
          const isCurrent = i === activeRoute.currentStep && !completed;
          const isLocked = i > activeRoute.currentStep && !completed;
          return (
            <div key={node.id} style={{ display: 'flex', alignItems: 'flex-start' }}>
              {/* Objective marker */}
              <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '76px',
              }}>
                <div style={{
                  width: isCurrent ? '26px' : '20px',
                  height: isCurrent ? '26px' : '20px',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isCompleted
                    ? 'rgba(246,160,77,0.22)'
                    : isCurrent
                      ? 'rgba(246,160,77,0.16)'
                      : 'rgba(245,240,235,0.04)',
                  border: isCurrent
                    ? '2px solid rgba(246,160,77,0.85)'
                    : isCompleted
                      ? '1px solid rgba(246,160,77,0.4)'
                      : '1px solid rgba(245,240,235,0.1)',
                  boxShadow: isCurrent
                    ? '0 0 16px rgba(246,160,77,0.5), 0 0 30px rgba(246,160,77,0.2)'
                    : isCompleted
                      ? '0 0 8px rgba(246,160,77,0.2)'
                      : 'none',
                  transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
                  animation: isCompleted ? 'fadeIn 0.5s ease-out' : undefined,
                }}>
                  {isCompleted ? (
                    <span style={{ fontSize: '12px', color: 'rgba(246,160,77,0.95)', fontWeight: 700 }}>✓</span>
                  ) : isLocked ? (
                    <span style={{ fontSize: '9px', color: 'rgba(245,240,235,0.2)' }}>🔒</span>
                  ) : (
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: 'rgba(246,160,77,0.9)', display: 'block',
                    }} />
                  )}
                </div>
                {/* Label below */}
                <span style={{
                  marginTop: '8px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  fontSize: isCurrent ? '13px' : '11px',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  letterSpacing: '0.03em',
                  color: isCurrent
                    ? 'rgba(246,160,77,0.95)'
                    : isCompleted
                      ? 'rgba(245,240,235,0.6)'
                      : 'rgba(245,240,235,0.22)',
                  fontWeight: isCurrent ? 700 : 500,
                  transition: 'all 0.6s ease',
                }}>
                  {node.label}
                </span>
              </div>

              {/* Connector line */}
              {i < activeRoute.nodes.length - 1 && (
                <div style={{
                  width: '28px',
                  height: '2px',
                  marginTop: '13px',
                  background: isCompleted
                    ? 'rgba(246,160,77,0.4)'
                    : 'rgba(245,240,235,0.08)',
                  transition: 'background 0.8s ease',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current step info + controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginTop: '14px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(246,160,77,0.1)',
        width: '100%',
        justifyContent: 'center',
        pointerEvents: 'auto',
      }}>

        {/* Live data */}
        {bestProtocol && !completed && (
          <>
            <MiniStat label="APY" value={formatApy(bestProtocol.apy)} />
            <MiniStat label="TVL" value={bestProtocol.tvl} />
            <MiniStat label="RISK" value={bestProtocol.risk} />
          </>
        )}

        {completed && (
          <span style={{
            fontSize: 'var(--fs-caption)', fontWeight: 600,
            letterSpacing: '0.06em',
            color: 'rgba(246,160,77,0.9)',
            fontFamily: 'var(--font-geist-mono), monospace',
          }}>
            MISSION COMPLETE
          </span>
        )}

        {/* Controls */}
        {!completed && (
          <button
            onClick={togglePlaying}
            style={{
              background: 'rgba(246,160,77,0.08)',
              border: '1px solid rgba(246,160,77,0.24)',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '11px', fontWeight: 600,
              fontFamily: 'var(--font-geist-mono), monospace',
              letterSpacing: '0.08em',
              color: 'rgba(245,240,235,0.75)',
              cursor: 'pointer',
            }}
          >
            {playing ? 'PAUSE' : 'PLAY'}
          </button>
        )}

        <button
          onClick={endJourney}
          style={{
            background: 'none',
            border: '1px solid rgba(245,240,235,0.12)',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '11px', fontWeight: 600,
            fontFamily: 'var(--font-geist-mono), monospace',
            letterSpacing: '0.08em',
            color: 'rgba(245,240,235,0.4)',
            cursor: 'pointer',
          }}
        >
          ESC
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span style={{
        fontSize: '10px', fontWeight: 600,
        letterSpacing: '0.1em',
        color: 'rgba(246,160,77,0.5)',
        fontFamily: 'var(--font-geist-mono), monospace',
      }}>
        {label}
      </span>
      {' '}
      <span style={{
        fontSize: 'var(--fs-caption)',
        fontWeight: 500,
        color: 'rgba(245,240,235,0.75)',
        fontFamily: 'var(--font-geist-mono), monospace',
      }}>
        {value}
      </span>
    </span>
  );
}
