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
    <div style={{
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
    }}>
      {/* Timeline */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0px',
      }}>
        {activeRoute.nodes.map((node, i) => {
          const isCompleted = i < activeRoute.currentStep || completed;
          const isCurrent = i === activeRoute.currentStep && !completed;
          return (
            <div key={node.id} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Node dot */}
              <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <div style={{
                  width: isCurrent ? '10px' : '6px',
                  height: isCurrent ? '10px' : '6px',
                  borderRadius: '50%',
                  background: isCompleted
                    ? 'rgba(246,160,77,0.6)'
                    : isCurrent
                      ? 'rgba(246,160,77,0.9)'
                      : 'rgba(245,240,235,0.12)',
                  boxShadow: isCurrent
                    ? '0 0 12px rgba(246,160,77,0.4), 0 0 24px rgba(246,160,77,0.15)'
                    : isCompleted
                      ? '0 0 6px rgba(246,160,77,0.15)'
                      : 'none',
                  transition: 'all 0.6s ease',
                }} />
                {/* Label below */}
                <span style={{
                  position: 'absolute',
                  top: '14px',
                  whiteSpace: 'nowrap',
                  fontSize: '7px',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  letterSpacing: '0.06em',
                  color: isCurrent
                    ? 'rgba(246,160,77,0.6)'
                    : isCompleted
                      ? 'rgba(245,240,235,0.3)'
                      : 'rgba(245,240,235,0.1)',
                  fontWeight: isCurrent ? 500 : 300,
                  transition: 'all 0.6s ease',
                }}>
                  {node.label}
                </span>
              </div>

              {/* Connector line */}
              {i < activeRoute.nodes.length - 1 && (
                <div style={{
                  width: '32px',
                  height: '1px',
                  background: isCompleted
                    ? 'rgba(246,160,77,0.25)'
                    : 'rgba(245,240,235,0.06)',
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
        marginTop: '10px',
        pointerEvents: 'auto',
      }}>
        {/* Route name */}
        <span style={{
          fontSize: '8px',
          letterSpacing: '0.1em',
          color: 'rgba(246,160,77,0.3)',
          fontFamily: 'var(--font-geist-mono), monospace',
        }}>
          {activeRoute.template.name.toUpperCase()}
        </span>

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
            fontSize: '8px',
            letterSpacing: '0.08em',
            color: 'rgba(246,160,77,0.5)',
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
              background: 'none',
              border: '1px solid rgba(246,160,77,0.1)',
              borderRadius: '4px',
              padding: '3px 8px',
              fontSize: '8px',
              fontFamily: 'var(--font-geist-mono), monospace',
              letterSpacing: '0.1em',
              color: 'rgba(245,240,235,0.3)',
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
            border: 'none',
            padding: '3px 6px',
            fontSize: '8px',
            fontFamily: 'var(--font-geist-mono), monospace',
            letterSpacing: '0.1em',
            color: 'rgba(245,240,235,0.15)',
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
        fontSize: '6px',
        letterSpacing: '0.12em',
        color: 'rgba(246,160,77,0.2)',
        fontFamily: 'var(--font-geist-mono), monospace',
      }}>
        {label}
      </span>
      {' '}
      <span style={{
        fontSize: '9px',
        fontWeight: 300,
        color: 'rgba(245,240,235,0.35)',
        fontFamily: 'var(--font-geist-mono), monospace',
      }}>
        {value}
      </span>
    </span>
  );
}
